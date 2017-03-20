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
                fieldLabel: 'Bookmark kopieëren bij werkversie',
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
                text: 'Toon de links',
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
                        boxLabel: 'Volledige link',
                        name: 'showFullUrl',
                        //value: true,
                        inputValue: true,
                        checked: this.configObject.showFullUrl !== undefined ? this.configObject.showFullUrl : true,
                        style: {
                            marginRight: "90px"
                        }
                },{
                        xtype: 'checkbox',
                        boxLabel: 'Compacte link',
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
                        boxLabel: 'Laat labels zien voor velden',
                        name: 'showLabels',
                        //value: true,
                        inputValue: true,
                        checked: this.configObject.showLabels !== undefined ? this.configObject.showLabels : true,
                        style: {
                            marginRight: "90px"
                        }
                },{
                xtype: 'label',
                text: 'Toon \'deel\' knoppen in venster',
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
                        boxLabel: 'E-mail',
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
                        boxLabel: 'Twitter',
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
                        boxLabel: 'LinkedIn',
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
                        boxLabel: 'Google+',
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
                        boxLabel: 'Facebook',
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
                fieldLabel: 'Default \'deel tekst\' titel',
                name: 'shareTitle',
                value: this.configObject.shareTitle != undefined ? this.configObject.shareTitle : "Sharing",
                labelWidth:this.labelWidth,
                width: 700
            },{
                xtype: 'textareafield',
                fieldLabel: 'Default \'deel tekst\'',
                name: 'shareText',
                grow: true,
                value: this.configObject.shareText != undefined ? this.configObject.shareText : "I'd like to share this with #FlamingoMC: ",
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

