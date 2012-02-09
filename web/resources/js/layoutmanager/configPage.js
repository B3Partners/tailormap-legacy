/* 
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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
var propertyGrid;
var customConfiguration;

if(metadata.configSource != undefined) {
    createLayoutTab();
    Ext.onReady(function(){
        customConfiguration= new Ext.create("viewer.components.CustomConfiguration","config", configObject);
    });
} else {
    Ext.onReady(function() {

        var source = configObject;

        if(source == null && metadata.extPropertyGridConfigs) {
            /* set source to from component metadata  (default config) */
            source = metadata.extPropertyGridConfigs.source;
        }
        if(source != null) {
            var propertyNames = {};
            if(metadata.extPropertyGridConfigs && metadata.extPropertyGridConfigs.propertyNames) {
                propertyNames = metadata.extPropertyGridConfigs.propertyNames;
            }
            console.log(source,propertyNames);
            propertyGrid = Ext.create('Ext.grid.property.Grid', {
                title: 'Pas de instellingen aan',
                width: 300,
                renderTo: "config",
                source: source,
                propertyNames: propertyNames
            });
        }
    });
}
var layoutForm;
function createLayoutTab(){
    var labelWidth = 300;
    layoutForm = new Ext.form.FormPanel({
        frame: false,
        width: 480,
        border: 0,
        items: [{
            xtype:'fieldset',
            columnWidth: 0.5,
            title: 'Vensterpositie',
            collapsible: false,
            defaultType: 'textfield',
            layout: 'anchor',
            items:[
            {
                xtype: 'radiogroup',
                columns: 1,
                vertical: true,
                labelWidth:350,
                items: [
                {
                    boxLabel: 'Gecentreerd', 
                    name: 'position', 
                    inputValue: 'center' , 
                    checked: true
                },
                {
                    boxLabel: 'Vaste Positie', 
                    name: 'position', 
                    inputValue: 'fixed',
                    listeners:{
                        change:function(el) {
                            if(this.getValue()==true){
                                Ext.getCmp('x').show();
                                Ext.getCmp('y').show();
                            }else{
                                Ext.getCmp('x').hide();
                                Ext.getCmp('y').hide();
                            }
                        }
                    }
                }
                ]
            },
            {
                xtype: 'textfield',
                fieldLabel: 'x',
                id: "x",
                name: 'x',
                value: "",
                hidden : true,
                labelWidth:100
            },
            { 
                xtype: 'textfield',
                fieldLabel: 'y',
                id: "y",
                name: 'y',
                value: "",
                hidden : true,
                labelWidth:100
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Gebruiker kan de positie van de popup aanpassen',
                inputValue: true,
                name: 'changeablePosition',
                checked: true,
                value: true,
                labelWidth:labelWidth
            }]
        },
        { 
            xtype:'fieldset',
            columnWidth: 0.5,
            title: 'Venstergrootte',
            collapsible: false,
            defaultType: 'textfield',
            layout: 'anchor',
            items:[{
                xtype: 'textfield',
                fieldLabel: 'Breedte',
                name: 'width',
                value: "",
                labelWidth:100
            },
            { 
                xtype: 'textfield',
                fieldLabel: 'Hoogte',
                name: 'Height',
                value: "",
                labelWidth:100
            },{
                xtype: 'checkbox',
                fieldLabel: 'Gebruiker kan de grootte van de popup aanpassen',
                inputValue: true,
                name: 'changeableSize',
                checked: true,
                value: true,
                labelWidth:labelWidth
            }]
        }],
        
        renderTo: "layout"//(2)
    });      
}

function getConfig() {
    var config;
    if(metadata.configSource != undefined){
        config = customConfiguration.getConfiguration();
    }else{
        config = propertyGrid.getSource();
    }
    
    var configFormObject = Ext.get("configObject");
    configFormObject.dom.value = JSON.stringify(config);
}

Ext.onReady(function() {
    Ext.select('.tabdiv', true).removeCls('tabdiv').addCls('x-hide-display');   
    var tabs = [];
    tabs = [{
        contentEl:'config', 
        title: 'Configuratie'
    },{
        contentEl:'rights', 
        title: 'Rechten'
    }];
    if(metadata.type != undefined && metadata.type != "popup"){
        tabs.push({
            contentEl:'layout', 
            title: 'Layout'
        });
    }
    Ext.createWidget('tabpanel', {
        renderTo: 'tabs',
        width: '100%',
        height: '100%',
        activeTab: 0,
        defaults :{
            bodyPadding: 10
        },
        layoutOnTabChange: true,
        items: tabs,
        bbar: ["->", {
            xtype: 'button',
            text: 'Opslaan',
            iconCls: 'savebutton-icon',
            listeners: {
                click: function() {
                    getConfig();
                    var layout = new Object();
                    for( var i = 0 ; i < layoutForm.items.length ; i++){
                        var items = layoutForm.items.get(i);
                        for ( var j = 0 ; j < items.items.length ; j ++){
                            layout[items.items.get(j).name] = items.items.get(j).value;
                        }
                    }
                    var layoutFormObject = Ext.get("componentLayout");
                    layoutFormObject.dom.value = JSON.stringify(layout);
                    
                    document.getElementById('configForm').submit();
                }
            }
        }]
    });
});