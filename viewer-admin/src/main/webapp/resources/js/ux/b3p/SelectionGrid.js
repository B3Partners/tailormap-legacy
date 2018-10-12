/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *

Class for creating a list with filterable checkboxes
Usage example: 
Ext.onReady(function(){
    var filterableCheckboxes = Ext.create('Ext.ux.b3p.FilterableCheckboxes', {
        requestUrl: someURL,
        renderTo: 'test',
        checked: [10,11,12,13]
    });

    // To get the checked boxes:
    filterableCheckboxes.getChecked();
});

Params:
requestUrl (required): the URL to fetch the JSON array width data using Ajax
requestParams (optional): jsonObject with extra params for Ajax call
renderTo (required): HTML ID of container to which component can be rendered
valueField (optional): Fieldname in JSON object in JSON array which holds the "value" field of the checkbox (default = id)
titleField (optional): Fieldname in JSON object in JSON array which holds the "label" field of the checkbox (default = title)
sliders (optional): Array with sliders ({id:1, name:'Slider 1', initialTransparency: 75, selectedLayers:[]})

 * 
 */

Ext.define('Ext.ux.b3p.SelectionGrid', {
        
    requestUrl: '',
    requestParams: {},
    createSliderUrl: '',
    renderTo: '',
    valueField: 'id',
    titleField: 'alias',
    sliders: [],

    constructor: function(config) {
        Ext.apply(this, config || {});
        if(this.sliders == null){
            this.sliders = [];
        }
        if(this.requestUrl != '' && this.renderTo != '') {
            this.getList();
        }
    },
    
    render: function() {
        var me = this;
        var layers = '';
        var counter = 0;
        Ext.Array.each(me.itemList, function(item) {
            item['htmlId'] = Ext.id();
            var oddclass = '';
            if(counter++%2==1) oddclass = ' row_odd'
            layers += (me.createDivContainer(item['htmlId'], item[me.titleField], oddclass));
        });
        var sliderHeaders = document.createElement('div');
        sliderHeaders.id = 'sliderheader-container';
        Ext.Array.each(me.sliders, function(slider) {
            sliderHeaders.appendChild(me.createSliderHeader(slider.id, slider.name));
        });
        var wrap = document.createElement('div');
        wrap.appendChild(sliderHeaders);
        var fields = [{
            xtype:'panel',
            width: '100%',
            layout: 'hbox',
            items: [{
                xtype: 'textfield',
                width: 200,
                labelWidth: 50,
                name: 'filterField',
                fieldLabel: i18next.t('viewer_admin_selectiongrid_0'),
                enableKeyEvents: true,
                listeners: {
                    keyup: function(textfield, e, eOpts) {
                        e.stopPropagation();
                        var filtervalue = textfield.getValue();
                        if(filtervalue == '') {
                            me.setLayersVisible(layers, true);
                        } else {
                            var regexp = new RegExp(filtervalue, "i");
                            Ext.Array.each(me.itemList, function(item) {
                                me.setLayerVisible(item.htmlId, (regexp.test(item[me.titleField]) ? 'block' : 'none'));
                            });
                        }
                    }
                }
            },
            {
                xtype:'container',
                flex: 1,
                html: wrap.innerHTML
            }],
            tbar: [
                "->",
                {
                    xtype:'button',
                    text: i18next.t('viewer_admin_selectiongrid_1'),
                    listeners: {
                        click: function() {
                            me.appendNewSlider();
                        }
                    }
                }
            ]
        }, {
            xtype:'container',
            autoScroll: true,
            html: layers,
            flex: 1,
            width: '100%',
            border: 1
        }];
        var panel = Ext.create('Ext.panel.Panel', {
            items: fields,
            height: '100%',
            width: '100%',
            layout: 'vbox',
            bbar: [{
                xtype: 'textfield',
                id: 'sliderName',
                width: 400,
                labelAlign: 'top',
                name: 'sliderName',
                fieldLabel: i18next.t('viewer_admin_selectiongrid_2')
            },{
                xtype: 'textfield',
                id: 'sliderTransparency',
                width: 150,
                labelAlign: 'top',
                name: 'sliderTransparency',
                fieldLabel: i18next.t('viewer_admin_selectiongrid_3')
            },{
                xtype: 'button',
                id: 'sliderSaveButton',
                text: i18next.t('viewer_admin_selectiongrid_4'),
                disabled: true,
                listeners: {
                    click: function() {
                        Ext.Array.each(me.sliders, function(slider) {
                            if(slider.id == me.currentSlider.id) {
                                slider.name = Ext.getCmp('sliderName').getValue();
                                slider.initialTransparency = parseInt(Ext.getCmp('sliderTransparency').getValue());
                                me.adjustSliderHeader(slider.id,slider.name);
                            }
                        });
                    }
                }
            },{
                xtype: 'button',
                id: 'sliderRemoveButton',
                text: i18next.t('viewer_admin_selectiongrid_5'),
                disabled: true,
                listeners: {
                    click: function() {
                        Ext.Array.each(me.sliders, function(slider) {
                            if(slider.id == me.currentSlider.id) {
                                me.removeSlider(slider.id);
                                me.resetSliderForm();
                            }
                        });
                    }
                }
            }]
        });
        Ext.getCmp(me.renderTo).add(panel);
        if(me.sliders.length > 0) {
            me.appendSliders();
            me.initHeaders();
            me.setSliderForm(me.sliders[0].id);
            me.initSelection();
        }
    },
    
    getList: function() {
        var me = this;
        Ext.Ajax.request({ 
            url: me.requestUrl, 
            params: me.requestParams, 
            success: function ( result, request ) {
                me.itemList = Ext.JSON.decode(result.responseText);
                me.render();
            },
            failure: function() {
                Ext.MessageBox.alert(i18next.t('viewer_admin_selectiongrid_6'), i18next.t('viewer_admin_selectiongrid_7'));
            }
        });
    },
    
    setSliderForm: function(sliderid) {
        var me = this;
        Ext.Array.each(me.sliders, function(slider) {
            if(slider.id == sliderid) {
                me.currentSlider = slider;
            }
        });
        Ext.getCmp('sliderName').setValue(me.currentSlider.name);
        Ext.getCmp('sliderTransparency').setValue(me.currentSlider.initialTransparency);
        Ext.getCmp('sliderSaveButton').setDisabled(false);
        Ext.getCmp('sliderRemoveButton').setDisabled(false);
    },
    
    resetSliderForm : function(){
        Ext.getCmp('sliderName').setValue("");
        Ext.getCmp('sliderTransparency').setValue("");
        Ext.getCmp('sliderSaveButton').setDisabled(true);
        Ext.getCmp('sliderRemoveButton').setDisabled(true);
    },
    
    appendNewSlider: function() {
        var me = this;
        var sliderid = (me.sliders.length + 1);
        var slidername = 'Slider ' + sliderid;
        me.sliders.push({
            id: sliderid,
            name: slidername,
            initialTransparency: 75,
            selectedLayers: []
        });
        Ext.Array.each(me.itemList, function(layer) {
            me.appendSliderToContainer(layer.htmlId, sliderid, layer.id);
        });
        document.getElementById('sliderheader-container').appendChild(me.createSliderHeader(sliderid, slidername));
        me.initHeader(sliderid);
        me.setSliderForm(sliderid);
    },
    
    appendSliders: function() {
        var me = this;
        Ext.Array.each(me.sliders, function(slider) {
            Ext.Array.each(me.itemList, function(layer) {
                me.appendSliderToContainer(layer.htmlId, slider.id, layer.id);
            });
        });
    },
    
    removeSlider: function(sliderid) {
        var me = this;
        var newsliders = [];
        Ext.Array.each(me.sliders, function(slider) {
            if(slider.id != sliderid) {
                newsliders.push(slider);
            } else {
                Ext.fly('sliderheader' + sliderid).remove();
                Ext.Array.each(me.itemList, function(layer) {
                    Ext.fly('sliderbox-' + layer.id + '_' + sliderid).remove();
                });
            }
        });
        me.sliders = newsliders;
    },
    
    createDivContainer: function(id, name, oddclass) {
        // Using ordinairy HTML, Ext objects are too slow when having large numbers
        return '<div id="container-' + id + '" class="main-slider-container' + oddclass + '">' + 
                    '<div class="label">' + name + '</div>' + 
                    '<div class="slider-container" id="slider-container-' + id + '"></div>' +
                    '<div style="clear: both;"></div>' +
               '</div>';
    },
    
    createSliderContainer: function(sliderid, layerid) {
        var input = document.createElement('input');
            input.type = "radio";
            input.id = 'sliderbox-input-' + layerid + '_' + sliderid;
            input.name = 'layer-' + layerid;
            input.value = sliderid;
        var divobject = document.createElement('div');
            divobject.className = 'sliderbox';
            divobject.id = 'sliderbox-' + layerid + '_' + sliderid;
            divobject.appendChild(input);
        return divobject;
    },
    
    createSliderHeader: function(sliderid, slidername) {
        var span = document.createElement('span');
            span.className = 'sliderheader';
            span.id = 'sliderheader-link-' + sliderid;
            span.style.textDecoration = 'underline';
            span.style.cursor = 'pointer';
            span.innerHTML = slidername;
        var divobject = document.createElement('div');
            divobject.className = 'sliderheader';
            divobject.id = 'sliderheader' + sliderid;
            divobject.appendChild(span);
        return divobject;
    },
    
    adjustSliderHeader : function (sliderid, slidername){
        var span = document.getElementById('sliderheader-link-' + sliderid);
        span.innerHTML = slidername;
    },
    
    initSelection: function() {
        var me = this;
        Ext.Array.each(me.sliders, function(slider) {
            Ext.Array.each(me.itemList, function(layer) {
                if(Ext.Array.contains(slider.selectedLayers, layer.id)) {
                    document.getElementById('sliderbox-input-' + layer.id + '_' + slider.id).checked = true;
                }
            });
        });
    },
    
    initHeaders: function() {
        var me = this;
        Ext.Array.each(me.sliders, function(slider) {
            me.initHeader(slider.id);
        });
    },
    
    initHeader: function(sliderid) {
        var me = this;
        Ext.get('sliderheader-link-' + sliderid).on('click', function() {
            me.setSliderForm(sliderid);
        });
    },
    
    appendSliderToContainer: function(containerid, sliderid, layerid) {
        var me = this;
        var containerdiv = document.getElementById('slider-container-' + containerid);
        containerdiv.appendChild(me.createSliderContainer(sliderid, layerid));
    },
    
    setLayersVisible: function(layers, visible) {
        var me = this;
        var visibletxt = 'block';
        if(!visible) visibletxt = 'none';
        Ext.Array.each(me.itemList, function(item) {
            me.setLayerVisible(item.htmlId, visibletxt)
        });
    },
    
    setLayerVisible: function(checkboxid, visibletxt) {
        document.getElementById('container-' + checkboxid).style.display = visibletxt;
    },
    
    getSliders: function() {
        var me = this;
        var sliders = [];
        Ext.Array.each(me.sliders, function(slider) {
            slider.selectedLayers = [];
            Ext.Array.each(me.itemList, function(layer) {
                if(document.getElementById('sliderbox-input-' + layer.id + '_' + slider.id).checked) {
                    slider.selectedLayers.push(layer.id);
                }
            });
            sliders.push(slider);
        });
        return sliders;
    }
    
});