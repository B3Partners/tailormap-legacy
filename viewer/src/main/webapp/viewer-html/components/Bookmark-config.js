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
/**
 * Custom configuration object for Buffer configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration", {
    extend: "viewer.components.SelectionWindowConfig",
    constructor: function (parentId, configObject, configPage) {
        if (configObject === null){
            configObject = {};
        }
        configObject.showLabelconfig = true;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        var checkboxLabelWidth= 55;
        this.form.add([
            {
                xtype: 'checkbox',
                fieldLabel: i18next.t('viewer_components_customconfiguration_9'),
                name: 'copyBookmarkForWorkversion',
                labelWidth:this.labelWidth,
                inputValue: false,
                checked: this.configObject.copyBookmarkForWorkversion !== undefined ? this.configObject.copyBookmarkForWorkversion : false,
                style: {
                    marginRight: "90px"
               }
            },
            {
                xtype: 'label',
                text: i18next.t('viewer_components_customconfiguration_10'),
                style: { 
                    fontWeight: 'bold'
                }
            },{
                xtype: 'container',
                layout : {
                    type: 'table',
                    columns: 3
                },
                items: [{
                        xtype: 'checkbox',
                        boxLabel: i18next.t('viewer_components_customconfiguration_11'),
                        name: 'showFullUrl',
                        //value: true,
                        inputValue: true,
                        checked: this.configObject.showFullUrl !== undefined ? this.configObject.showFullUrl : true,
                        style: {
                            marginRight: "90px"
                        }
                },{
                        xtype: 'checkbox',
                        boxLabel: i18next.t('viewer_components_customconfiguration_12'),
                        name: 'showShortUrl',
                        value: true,
                        //inputValue: true,
                        checked: this.configObject.showShortUrl !== undefined ? this.configObject.showShortUrl : true,
                        style: {
                            marginRight: "90px"
                        }
                }]
            },{
                        xtype: 'checkbox',
                        boxLabel: i18next.t('viewer_components_customconfiguration_13'),
                        name: 'showLabels',
                        //value: true,
                        inputValue: true,
                        checked: this.configObject.showLabels !== undefined ? this.configObject.showLabels : true,
                        style: {
                            marginRight: "90px"
                        }
                },{
                xtype: 'label',
                text: i18next.t('viewer_components_customconfiguration_14'),
                style: {
                    fontWeight: 'bold'
                }
            },{
                xtype : 'container',
                layout : {
                    type: 'table',
                    columns: 3
                },
                items: [
                    {
                        xtype: 'checkbox',
                        boxLabel: i18next.t('viewer_components_customconfiguration_15'),
                        name: 'shareEmail',
                        /*columnWidth : 0.5,*/
                        //value: true,
                        inputValue: true,
                        checked: this.configObject.shareEmail != undefined ? this.configObject.shareEmail : false,
                        style: {
                            marginRight: "90px"
                        }
                    },{
                        xtype: 'checkbox',
                        boxLabel: i18next.t('viewer_components_customconfiguration_16'),
                        name: 'shareTwitter',
                        /*columnWidth : 0.5,*/
                        //value: true,
                        inputValue: true,
                        checked: this.configObject.shareTwitter != undefined ? this.configObject.shareTwitter : false,
                        labelWidth: checkboxLabelWidth,
                        style: {
                            marginRight: "90px"
                        }
                    },{
                        xtype: 'checkbox',
                        boxLabel: i18next.t('viewer_components_customconfiguration_17'),
                        name: 'shareLinkedIn',
                        /*columnWidth : 0.5,*/
                        //value: true,
                        inputValue: true,
                        checked: this.configObject.shareLinkedIn != undefined ? this.configObject.shareLinkedIn : false,
                        style: {
                            marginRight: "90px"
                        }
                    },{
                        xtype: 'checkbox',
                        boxLabel: i18next.t('viewer_components_customconfiguration_18'),
                        name: 'shareGooglePlus',
                        /*columnWidth : 0.5,*/
                        //value: true,
                        inputValue: true,
                        checked: this.configObject.shareGooglePlus != undefined ? this.configObject.shareGooglePlus : false,
                        style: {
                            marginRight: "90px"
                        }
                    },{
                        xtype: 'checkbox',
                        boxLabel: i18next.t('viewer_components_customconfiguration_19'),
                        name: 'shareFacebook',
                        /*columnWidth : 0.5,*/
                        //value: true,
                        inputValue: true,
                        checked: this.configObject.shareFacebook != undefined ? this.configObject.shareFacebook : false,
                        style: {
                            marginRight: "90px"
                        }
                    }
                ]
            },{
                xtype: 'textfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_20'),
                name: 'shareTitle',
                value: this.configObject.shareTitle != undefined ? this.configObject.shareTitle : i18next.t('viewer_components_customconfiguration_272'),
                labelWidth:this.labelWidth,
                width: 700
            },{
                xtype: 'textareafield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_21'),
                name: 'shareText',
                grow: true,
                value: this.configObject.shareText != undefined ? this.configObject.shareText : i18next.t('viewer_components_customconfiguration_273'),
                labelWidth:this.labelWidth,
                width: 700
            }
        ]);
    },
    getDefaultValues: function() {
        return {
            details: {
                minWidth: 450,
                minHeight: 250
            }
        }
    }
});

