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
checked (optional): Array with values of the checkboxes which need to be pre-selected
renderLabel (optional): Function to render label. Must return text which renders as label. Arguments for the function are id, name
labelClick (optional): Function to catch clicking on the label to execute custom function
 * 
 */

Ext.define('Ext.ux.b3p.FilterableCheckboxes', {
        
    requestUrl: '',
    requestParams: {},
    renderTo: '',
    parentContainer: null,
    valueField: 'id',
    titleField: 'label',
    checked: [],
    // optional function which should return text to render the label
    renderLabel: null,
    // optional function which is called when a label is clicked
    labelClick: null,
    //function called when layers are received, must return the same layers or a subset
    layerFilter: null,
    /**
     * Creates a list of layers as filterable checkboxes.
     * @param config.requestUrl the url that returns the layers
     * @param config.requestParam a object that has te request params that are sent to the .requestUrl
     * @param config.renderTo the DOM element that is used to render to
     * @param config.parentContainer the Ext container to add to (configure this or renderTo setting)
     * @param config.valueField the field that is used for value in the checkboxes (from the layers)
     * @param config.titleField the field that is used for title in the checkboxes (from the layers)
     * @param config.checked a list of values that need to be checked when initialized
     * @param config.layerFilter a function that is called when the layers are returned by the .requestUrl
     *            function is called with list of layers as param and needs to return (a subset) list of layer objects
     *            Components can implement this function to do some extra filtering.
     */
    constructor: function(config) {
        Ext.apply(this, config || {});
        if(this.requestUrl != '' && (this.renderTo != '' || this.parentContainer)) {
            this.getList();
        }
    },
    
    render: function() {
        var me = this;
        var checkboxContainerId = Ext.id();
        var checkboxes = '<div id="' + checkboxContainerId + '">';
        Ext.Array.each(me.itemList, function(item) {
            item['htmlId'] = Ext.id();
            checkboxes += (me.createCheckbox(item['htmlId'], item[me.valueField], item[me.titleField]));
        });
        checkboxes += '</div>';

        // var containerId = Ext.id();
        var fields = [{
            xtype:'container',
            width: '100%',
            items: [{
                xtype: 'textfield',
                name: 'filterField',
                fieldLabel: i18next.t('viewer_admin_filterablecheckboxes_0'),
                enableKeyEvents: true,
                listeners: {
                    keyup: function(textfield, e, eOpts) {
                        e.stopPropagation();
                        var filtervalue = textfield.getValue();
                        if(filtervalue == '') {
                            me.setCheckBoxesVisible(checkboxes, true);
                        } else {
                            var regexp = new RegExp(filtervalue, "i");
                            Ext.Array.each(me.itemList, function(item) {
                                me.setCheckboxVisible(item.htmlId, (regexp.test(item[me.titleField]) ? 'block' : 'none'));
                            });
                        }
                    }
                }
            }]
        }, {
            xtype:'container',
            // itemId: containerId,
            autoScroll: true,
            html: checkboxes,
            border: 0,
            flex: 1,
            width: '100%',
            style: {
                border: '0px'
            }
        }];
        var container = Ext.create('Ext.container.Container', {
            items: fields,
            height: '100%',
            width: '100%',
            layout: 'vbox'
        });
        if(me.parentContainer) {
            me.parentContainer.add(container);
        } else {
            Ext.getCmp(me.renderTo).add(container);
        }
        me.setChecked();
        // Add click listener to checkboxes if configured
        if(me.labelClick !== null) {
            var checkboxcontainer = document.getElementById(checkboxContainerId);
            function handleClick(e) {
                var target = e.target || e.srcElement || window.event.target || window.event.srcElement;
                me.labelClick(e, target);
            }
            if (checkboxcontainer.addEventListener) {
                checkboxcontainer.addEventListener('click', handleClick, false);
            } else if (checkboxcontainer.attachEvent)  { // legacy IE
                checkboxcontainer.attachEvent('onclick', handleClick);
            }
        }
    },
    
    getList: function() {
        var me = this;
        me.itemList = [];
        Ext.Ajax.request({ 
            url: me.requestUrl, 
            params: me.requestParams,
            timeout:120000,
            success: function ( result, request ) {
                me.itemList = Ext.JSON.decode(result.responseText);
                if (me.layerFilter){
                    me.itemList=me.layerFilter.call(this,me.itemList);
                }
                for(i in me.itemList) {
                    if(!me.itemList.hasOwnProperty(i)) {
                        continue;
                    }
                    var applicationLayer = me.itemList[i];
                    applicationLayer.label = applicationLayer.alias || applicationLayer.layerName;
                }
                me.render();
            },
            failure: function() {
                Ext.MessageBox.alert(i18next.t('viewer_admin_filterablecheckboxes_1'), i18next.t('viewer_admin_filterablecheckboxes_2'));
            }
        });
    },
    
    createCheckbox: function(id, value, name) {
        // Using ordinairy HTML checkboxes, Ext checkboxes are too slow when having large numbers
        var label = name;
        if(this.renderLabel !== null) {
            label = this.renderLabel(id, name);
        }
        return '<div id="' + id + '"><input type="checkbox" id="checkbox-' + id + '" value="' + value + '" /> <label for="checkbox-' + id + '">' + label + '</label></div>';
    },
    
    setCheckBoxesVisible: function(checkboxes, visible) {
        var me = this;
        var visibletxt = 'block';
        if(!visible) visibletxt = 'none';
        Ext.Array.each(me.itemList, function(item) {
            me.setCheckboxVisible(item.htmlId, visibletxt);
        });
    },
    
    setCheckboxVisible: function(checkboxid, visibletxt) {
        document.getElementById(checkboxid).style.display = visibletxt;
    },
            
    resetChecked: function(checked) {
        this.checked = checked;
        this.setChecked();
    },
    
    setChecked: function() {
        var me = this;
        Ext.Array.each(me.itemList, function(item) {
            if(Ext.Array.contains(me.checked, item[me.valueField])) {
                document.getElementById('checkbox-' + item.htmlId).checked = true;
            } else {
                document.getElementById('checkbox-' + item.htmlId).checked = false;
            }
        });
    },
    
    getChecked: function() {
        var me = this;
        var checked = [];
        Ext.Array.each(me.itemList, function(item) {
            if(document.getElementById('checkbox-' + item.htmlId).checked) {
                checked.push(item[me.valueField]);
            }
        });
        return checked;
    }
    
});