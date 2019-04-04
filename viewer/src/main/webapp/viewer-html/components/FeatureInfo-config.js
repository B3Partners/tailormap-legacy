/* 
 * Copyright (C) 2013 B3Partners B.V.
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
/**
 * Custom configuration object for FeatureInfo configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.FeatureInfoConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    form: null,
    hideBalloonSettings: false,
    constructor: function (parentId, configObject, configPage) {
        if (configObject===undefined || configObject===null){
            configObject={};
        }
        configObject.layerFilter=this.layerFilter;
        
        viewer.components.FeatureInfoConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        
        this.checkPanelHeight=270;
        
        this.form.add([{
            xtype: 'textfield',
            fieldLabel: i18next.t('featureinfo_config_0'),
            name: 'moreLink',
            value: this.configObject.moreLink !== undefined ? this.configObject.moreLink : i18next.t('featureinfo_config_1'),
            labelWidth:this.labelWidth
        }]);
        if (!this.hideBalloonSettings) {
            this.form.add([{
                xtype: 'textfield',
                fieldLabel: i18next.t('featureinfo_config_2'),
                name: 'height',
                value: this.configObject.height !== undefined ? this.configObject.height : 300,
                labelWidth:this.labelWidth
            },{
                xtype: 'textfield',
                fieldLabel: i18next.t('featureinfo_config_3'),
                name: 'width',
                value: this.configObject.width !== undefined ? this.configObject.width : 300,
                labelWidth:this.labelWidth
            },{
                xtype: 'textfield',
                fieldLabel: i18next.t('featureinfo_config_4'),
                name: 'heightDescription',
                value: this.configObject.heightDescription !== undefined ? this.configObject.heightDescription : "",
                labelWidth: this.labelWidth
            }]);
        }
        this.form.add([
        {
            xtype: 'numberfield',
            fieldLabel: i18next.t('featureinfo_config_5'),
            name: 'clickRadius',
            value: this.configObject.clickRadius !== undefined ? this.configObject.clickRadius : 4,
            labelWidth:this.labelWidth,
            style: {
                marginRight: "70px"
            }
        },{
            xtype: 'checkbox',
            fieldLabel: i18next.t('featureinfo_config_6'),
            name: 'spinnerWhileIdentify',
            inputValue: true,
            checked: this.configObject.spinnerWhileIdentify !== undefined ? this.configObject.spinnerWhileIdentify : false,
            labelWidth:this.labelWidth
        },
        {
            xtype: 'checkbox',
            fieldLabel: i18next.t('featureinfo_config_7'),
            name: 'detailHideNullValues',
            id: 'detailHideNullValues',
            inputValue: true,
            checked: this.configObject.detailHideNullValues !== undefined ? this.configObject.detailHideNullValues : false,
            labelWidth:this.labelWidth
        },
        {
            xtype : 'fieldset',
            collapsible: true,
            collapsed: true,
            title: i18next.t('featureinfo_config_8'),
            layout : {
                type: 'table',
                columns: 2,
                
            },
            items: [
                {
                    xtype: 'checkbox',
                    fieldLabel: i18next.t('featureinfo_config_9'),
                    name: 'detailShowTitle',
                    id: 'detailShowTitle',
                    inputValue: true,
                    checked: this.configObject.detailShowTitle !== undefined ? this.configObject.detailShowTitle : true,
                    labelWidth:this.labelWidth,
                    style: {
                        marginRight: "40px"
                    }
                },{
                    xtype: 'checkbox',
                    fieldLabel: i18next.t('featureinfo_config_10'),
                    name: 'detailShowImage',
                    id: 'detailShowImage',
                    inputValue: true,
                    checked: this.configObject.detailShowImage !== undefined ? this.configObject.detailShowImage : true,
                    labelWidth:this.labelWidth
                },{
                    xtype: 'checkbox',
                    fieldLabel: i18next.t('featureinfo_config_11'),
                    name: 'detailShowDesc',
                    id: 'detailShowDesc',
                    inputValue: true,
                    checked: this.configObject.detailShowDesc !== undefined ? this.configObject.detailShowDesc : true,
                    labelWidth:this.labelWidth,
                    style: {
                        marginRight: "40px"
                    }
                },{
                    xtype: 'checkbox',
                    fieldLabel: i18next.t('featureinfo_config_12'),
                    name: 'detailShowAttr',
                    id: 'detailShowAttr',
                    inputValue: true,
                    checked: this.configObject.detailShowAttr !== undefined ? this.configObject.detailShowAttr : true,
                    labelWidth:this.labelWidth
                }, {
                    xtype: 'checkbox',
                    fieldLabel: i18next.t('featureinfo_config_13'),
                    name: 'detailHideGeomAttr',
                    id: 'detailHideGeomAttr',
                    inputValue: true,
                    checked: this.configObject.detailHideGeomAttr !== undefined ? this.configObject.detailHideGeomAttr : true,
                    labelWidth: this.labelWidth
                }
            ]
        } 
        ]);
        this.createCheckBoxes(this.configObject.layers,{});
        
    },
    layerFilter: function(layers){
        var filteredLayers=[];
        for (var i in layers){
            if(!layers.hasOwnProperty(i)) {
                continue;
            }
            var l = layers[i];
            //check if layer has something to show in the maptip
            if (l && l.details !=undefined &&
                (!Ext.isEmpty(l.details["summary.description"]) ||
                    !Ext.isEmpty(l.details["summary.image"]) ||
                    !Ext.isEmpty(l.details["summary.link"]) ||
                    !Ext.isEmpty(l.details["summary.title"]))){
                filteredLayers.push(l);
            }
        }
        return filteredLayers;
    },
    getConfiguration : function(){
        var config = this.callParent(arguments);
        config.detailShowTitle = Ext.getCmp("detailShowTitle").getValue();
        config.detailShowImage = Ext.getCmp("detailShowImage").getValue();
        config.detailShowDesc = Ext.getCmp("detailShowDesc").getValue();
        config.detailShowAttr = Ext.getCmp("detailShowAttr").getValue();
        config.detailHideNullValues = Ext.getCmp("detailHideNullValues").getValue();
        config.detailHideGeomAttr = Ext.getCmp("detailHideGeomAttr").getValue();
        return config;
    }
});

