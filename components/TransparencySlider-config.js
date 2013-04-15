/* 
 * Copyright (C) 2012 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**/

Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",
    filterableCheckboxes:null,
    constructor: function (parentid,config){
        var sliders = [];
        var title = "";
        if(config != null) {
            if(config.sliders != null) sliders = config.sliders;
            if(config.title != null) title = config.title;
        }else{
            config={};
        }
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentid,config);
        this.container = Ext.create('Ext.container.Container', {
            width: 765,
            height: 490,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'textfield',
                id: 'componentTransparencyTitle',
                fieldLabel: 'Titel',
                name: 'title',
                value: title,
                labelWidth: 275,
                width: 500
            },{
                xtype: 'container',
                flex: 1,
                html: '<div id="selectionGridContainer" style="width: 100%; height: 100%;"></div>'
            },{
                xtype: 'container',
                layout: {
                    type: 'hbox'
                },
                style: {
                    marginTop: '5px'
                },
                items:[{
                    xtype: 'checkbox',
                    name: 'sliderForUserAdded',
                    id: 'sliderForUserAdded',
                    checked: config.sliderForUserAdded,
                    inputValue: true,
                    boxLabel: 'Voeg slider toe voor door gebruiker toegevoegde kaarten',
                    listeners:{
                        change: {                    
                            fn: function(el,newValue,oldValue,eOpts){
                                if (newValue){
                                    Ext.getCmp('userAddedSliderText').setDisabled(false);
                                }else{
                                    Ext.getCmp('userAddedSliderText').setDisabled(true);
                                }
                            },
                            scope: this
                        }
                    }
                },{
                    xtype: 'textfield',
                    id: 'userAddedSliderText',
                    style:{
                        marginLeft: "100px"
                    },
                    disabled: config.sliderForUserAdded ? !config.sliderForUserAdded : true,
                    fieldLabel: 'Tekst',
                    name: 'userAddedSliderText',
                    labelWidth: 50,
                    value: config.userAddedSliderText ? config.userAddedSliderText: "Overige"
                }]
            }
            ],
            renderTo: 'config'
        });
        filterableCheckboxes = Ext.create('Ext.ux.b3p.SelectionGrid', {
            requestUrl: contextPath+"/action/componentConfigLayerList",
            requestParams: {
                appId:applicationId
            },
            renderTo: 'selectionGridContainer',
            sliders: sliders
        });
        
    },
    getConfiguration: function(){
        var config = new Object();
        config.title = Ext.getCmp('componentTransparencyTitle').getValue();
        config.sliders = filterableCheckboxes.getSliders();
        
        config.sliderForUserAdded = Ext.getCmp('sliderForUserAdded').getValue();
        config.userAddedSliderText = Ext.getCmp('userAddedSliderText').getValue();
        
        return config;
    }
});