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
 */
/**/

Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",
    filterableCheckboxes:null,
    constructor: function (parentId, configObject, configPage) {
        var sliders = [];
        var title = "";
        if(configObject.sliders != null) sliders = configObject.sliders;
        if(configObject.title != null) title = configObject.title;
        if(configObject.layers != null) {
            transparencySlider_layersArrayIndexesToAppLayerIds(configObject);
        }
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
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
                fieldLabel: i18next.t('viewer_components_customconfiguration_241'),
                name: 'title',
                value: title,
                labelWidth: 275,
                width: 500
            },{
                xtype: 'container',
                flex: 1,
                layout: 'fit',
                id: 'selectionGridContainer'
            },{
                    xtype: 'checkbox',
                    name: 'sliderForUserAdded',
                    id: 'sliderForUserAdded',
                    checked: this.configObject.sliderForUserAdded,
                    inputValue: true,
                    boxLabel: i18next.t('viewer_components_customconfiguration_242'),                    
                    listeners:{
                        change: {                    
                            fn: function(el,newValue,oldValue,eOpts){
                                if (newValue){
                                    Ext.getCmp('sliderForUserAddedText').setDisabled(false);
                                    Ext.getCmp('sliderForUserAddedInitTransparency').setDisabled(false);
                                }else{
                                    Ext.getCmp('sliderForUserAddedText').setDisabled(true);
                                    Ext.getCmp('sliderForUserAddedInitTransparency').setDisabled(true);
                                }
                            },
                            scope: this
                        }
                    }
            },{
                xtype: 'container',
                layout: {
                    type: 'hbox'
                },
                items:[{
                    xtype: 'textfield',
                    id: 'sliderForUserAddedText',
                    style:{
                        marginLeft: "100px"
                    },
                    disabled: this.configObject.sliderForUserAdded ? !this.configObject.sliderForUserAdded : true,
                    fieldLabel: i18next.t('viewer_components_customconfiguration_243'),
                    name: 'sliderForUserAddedText',
                    labelWidth: 70,
                    value: this.configObject.sliderForUserAddedText ? this.configObject.sliderForUserAddedText: i18next.t('viewer_components_customconfiguration_359')
                },{
                    xtype: 'textfield',
                    id: 'sliderForUserAddedInitTransparency',
                    style:{
                        marginLeft: "10px"
                    },
                    disabled: this.configObject.sliderForUserAdded ? !this.configObject.sliderForUserAdded : true,
                    fieldLabel: i18next.t('viewer_components_customconfiguration_244'),
                    name: 'sliderForUserAddedInitTransparency',
                    labelWidth: 150,
                    value: this.configObject.sliderForUserAddedInitTransparency ? this.configObject.sliderForUserAddedInitTransparency: 0
                }]
            }
            ],
            renderTo: parentId
        });
        filterableCheckboxes = Ext.create('Ext.ux.b3p.SelectionGrid', {
            requestUrl: this.getContextpath() + "/action/componentConfigList",
            requestParams: {
                appId: this.getApplicationId(),
                layerlist:true
            },
            renderTo: 'selectionGridContainer',
            sliders: sliders
        });
        
    },
    getConfiguration: function(){
        var config = new Object();
        config.title = Ext.getCmp('componentTransparencyTitle').getValue();
        config.sliders = filterableCheckboxes.getSliders();
   
        transparencySlider_appLayerIdsToLayersArrayIndexes(config);
        
        config.sliderForUserAdded = Ext.getCmp('sliderForUserAdded').getValue();
        config.sliderForUserAddedText = Ext.getCmp('sliderForUserAddedText').getValue();
        config.sliderForUserAddedInitTransparency = Ext.getCmp('sliderForUserAddedInitTransparency').getValue(true);
        if(isNaN(config.sliderForUserAddedInitTransparency)){
            config.sliderForUserAddedInitTransparency=0;
        }
        return config;
    }
});