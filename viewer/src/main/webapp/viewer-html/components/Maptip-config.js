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
 * Custom configuration object for Maptip configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    form: null,
    constructor: function (parentId, configObject, configPage) {

        configObject.layerFilter=this.layerFilter;
        configObject.showLabelconfig = false;
        
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);        
        this.checkPanelHeight = 210;
        this.form.add([{
            xtype: 'textfield',
            fieldLabel: i18next.t('maptip_config_0'),
            name: 'maptipdelay',
            /*columnWidth : 0.5,*/
            value: this.configObject.maptipdelay !== undefined ? this.configObject.maptipdelay : 500,
            labelWidth:this.labelWidth
        },{
            xtype: 'textfield',
            fieldLabel: i18next.t('maptip_config_1'),
            name: 'moreLink',
            /*columnWidth : 0.5,*/
            value: this.configObject.moreLink !== undefined ? this.configObject.moreLink : 'Meer',
            labelWidth:this.labelWidth
        },{
            xtype: 'textfield',
            fieldLabel: i18next.t('maptip_config_2'),
            name: 'height',
            /*columnWidth : 0.5,*/
            value: this.configObject.height !== undefined ? this.configObject.height : 300,
            labelWidth:this.labelWidth
        },{
            xtype: 'textfield',
            fieldLabel: i18next.t('maptip_config_3'),
            name: 'width',
            /*columnWidth : 0.5,*/
            value: this.configObject.width !== undefined ? this.configObject.width : 300,
            labelWidth:this.labelWidth
        },{
            xtype: 'textfield',
            fieldLabel: i18next.t('maptip_config_4'),
            name: 'heightDescription',
            value: this.configObject.heightDescription != undefined ? this.configObject.heightDescription : "",
            labelWidth: this.labelWidth
        },{
            xtype: 'checkbox',
            fieldLabel: i18next.t('maptip_config_5'),
            name: 'detailHideNullValues',
            id: 'detailHideNullValues',
            inputValue: true,
            checked: this.configObject.detailHideNullValues !== undefined ? this.configObject.detailHideNullValues : false,
            labelWidth:this.labelWidth
        },{
            xtype: 'label',
            text: i18next.t('maptip_config_6'),
            style: {
                fontWeight: 'bold'
            }
        },{
            xtype : 'container',
            layout : {
                type: 'table',
                columns: 2,
                
            },
            items: [
                {
                    xtype: 'checkbox',
                    fieldLabel: i18next.t('maptip_config_7'),
                    name: 'detailShowTitle',
                    /*columnWidth : 0.5,*/
                    value: true,
                    inputValue: true,
                    checked: this.configObject.detailShowTitle != undefined ? this.configObject.detailShowTitle : true,
                    labelWidth:this.labelWidth,
                    style: {
                        marginRight: "90px"
                    }
                },{
                    xtype: 'checkbox',
                    fieldLabel: i18next.t('maptip_config_8'),
                    name: 'detailShowImage',
                    /*columnWidth : 0.5,*/
                    value: true,
                    inputValue: true,
                    checked: this.configObject.detailShowImage != undefined ? this.configObject.detailShowImage : true,
                    labelWidth:this.labelWidth
                },{
                    xtype: 'checkbox',
                    fieldLabel: i18next.t('maptip_config_9'),
                    name: 'detailShowDesc',
                    /*columnWidth : 0.5,*/
                    value: true,
                    inputValue: true,
                    checked: this.configObject.detailShowDesc != undefined ? this.configObject.detailShowDesc : true,
                    labelWidth:this.labelWidth,
                    style: {
                        marginRight: "90px"
                    }
                },{
                    xtype: 'checkbox',
                    fieldLabel: i18next.t('maptip_config_10'),
                    name: 'detailShowAttr',
                    /*columnWidth : 0.5,*/
                    value: true,
                    inputValue: true,
                    checked: this.configObject.detailShowAttr != undefined ? this.configObject.detailShowAttr : true,
                    labelWidth:this.labelWidth
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
    getDefaultValues: function() {
        return {
            details: {
                minWidth: 400,
                minHeight: 250
            }
        }
    }
});

