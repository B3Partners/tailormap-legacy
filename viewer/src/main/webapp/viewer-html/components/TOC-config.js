/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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

Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",
    form: null,
    constructor: function (parentid,config){
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentid,config);
        if(config == undefined || config == null){
            config = new Object();
        }
        /* backwards compatible of the toggle layers button configuration*/
        if (config.showToggleAllLayers!==undefined){
            config.showAllLayersOn=config.showToggleAllLayers;
            config.showAllLayersOff=config.showToggleAllLayers;
        }
        var me=this;
        this.form = new Ext.form.FormPanel({
            url: 'Home/SubmitForm',
            frame: false,
            title: 'Configureer dit component',
            bodyPadding: me.formPadding,
            defaults: {
                anchor: '100%'
            },
            width: me.formWidth,
            items: [{
                xtype: 'textfield',
                fieldLabel: 'Naam',
                name: 'title',
                value: config.title,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: 'Kaarten en kaartlaaggroepen krijgen een vinkvak',
                inputValue: true,
                name: 'groupCheck',
                checked: config.groupCheck!==undefined? config.groupCheck : true,
                value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: 'Kaartlagen krijgen een vinkvak',
                inputValue: true,
                name: 'layersChecked',
                checked: config.layersChecked!==undefined? config.layersChecked: true,
                value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: 'Achtergrondkaarten tonen',
                inputValue: true,
                name: 'showBaselayers',
                checked: config.showBaselayers!==undefined? config.showBaselayers: true,
                value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: 'Algemeen icoon voor kaartlaag tonen',
                inputValue: true,
                name: 'showLeafIcon',
                checked: config.showLeafIcon!==undefined? config.showLeafIcon:true,
                value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: 'Algemeen icoon voor kaart(groep) tonen',
                inputValue: true,
                name: 'showNodeIcon',
                checked: config.showNodeIcon!==undefined? config.showNodeIcon:true,
                value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'textfield',
                fieldLabel: 'Zoom naar schaal tekst',
                name: 'zoomToScaleText',
                value: config.zoomToScaleText? config.zoomToScaleText:"Zoom to scale",
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: 'Bij opstarten boom openklappen',
                inputValue: true,
                name: 'expandOnStartup',
                checked: config.expandOnStartup!==undefined? config.expandOnStartup:true,
                value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: 'Aangezette kaarten openklappen',
                inputValue: false,
                name: 'expandOnEnabledLayer',
                checked: config.expandOnEnabledLayer!==undefined? config.expandOnEnabledLayer:false,
                value: false,
                labelWidth:me.labelWidth
            },{
                xtype: 'container',
                layout: {
                    type : 'hbox'
                },
                items: [
                    {
                        xtype: 'checkbox',
                        fieldLabel: 'Toon knop voor aan/uit zetten van alle layers',
                        name: 'showAllLayersOn',
                        inputValue: true,
                        checked: config.showAllLayersOn!==undefined? config.showAllLayersOn:false,
                        value: true,
                        labelWidth: me.labelWidth,
                        boxLabel: 'Toon \'alles aan\' knop'
                    },{
                        xtype: 'checkbox',
                        name: 'showAllLayersOff',
                        inputValue: true,
                        checked: config.showAllLayersOff!==undefined? config.showAllLayersOff:false,
                        value: true,
                        boxLabel: 'Toon \'alles uit\' knop',
                        style: {
                            marginLeft: "20px"
                        }
                    }
                ]
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Tekst voor knop om alle layers aan te zetten',
                name: 'toggleAllLayersOnText',
                value: config.toggleAllLayersOnText? config.toggleAllLayersOnText:"All layers on",
                labelWidth:me.labelWidth
            },{
                xtype: 'textfield',
                fieldLabel: 'Tekst voor knop om alle layers uit te zetten',
                name: 'toggleAllLayersOffText',
                value: config.toggleAllLayersOffText? config.toggleAllLayersOffText:"All layers off",
                labelWidth:me.labelWidth
            },{
                xtype: 'radiogroup',
                vertical: true,
                fieldLabel: 'Na het opstarten moet de eerste keer klikken er voor zorgen dat de kaartlagen',
                name: "initToggleAllLayers",
                labelWidth: me.labelWidth,
                items: [{
                    boxLabel: 'Aan gaan',
                    name: 'initToggleAllLayers',
                    inputValue: true,
                    checked: me.configObject.initToggleAllLayers
                },{
                    boxLabel: 'Uit gaan',
                    name: 'initToggleAllLayers',
                    inputValue: false,
                    checked: !me.configObject.initToggleAllLayers
                }]
            }],
            renderTo: parentid
        });
    }
});
