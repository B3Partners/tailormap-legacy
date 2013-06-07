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
var propertyGrid;
var customConfiguration;
var layoutForm;
Ext.onReady(function(){
    createLayoutTab();
    if(metadata.configSource != undefined) {
        customConfiguration= new Ext.create("viewer.components.CustomConfiguration","config", configObject);
    } else {
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
            /* 
             * Check if all source config items exist in the metadata source items,
             * sometimes other items like isPopup would show up in the property grid,
             * because they are added to the configuration automatically, while these
             * are not configurable options. All configurable options should be in the
             * metadata source items
             */
            var extConfigSource = {};
            if(metadata.extPropertyGridConfigs && metadata.extPropertyGridConfigs.source) {
                Ext.applyIf(source, metadata.extPropertyGridConfigs.source);
                Ext.Object.each(source, function(key, value) {
                    if(metadata.extPropertyGridConfigs.source.hasOwnProperty(key)) {
                        extConfigSource[key] = value;
                    }
                });
            } else {
                extConfigSource = source;
            }
            propertyGrid = Ext.create('Ext.grid.property.Grid', {
                title: 'Pas de instellingen aan',
                renderTo: "config",
                hideHeaders:true,
                nameColumnWidth: 300,
                source: extConfigSource,
                propertyNames: propertyNames
            });
        }
    
    }
});
function createLayoutTab(){
    if(details == undefined || details == null){
        details = {
            changeablePosition: "true",
            changeableSize: "true"
        };
    }
    var labelWidth = 300;
    var centerChecked = details.position == "center";
    var fixedChecked = details.position == "fixed";
    
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
                name: 'position', 
                columns: 1,
                vertical: true,
                value: details.position,
                labelWidth:350,
                items: [
                {
                    boxLabel: 'Gecentreerd', 
                    name: 'position', 
                    inputValue: 'center' , 
                    checked: centerChecked
                },
                {
                    boxLabel: 'Vaste Positie', 
                    name: 'position', 
                    checked: fixedChecked,
                    inputValue: 'fixed',
                    listeners:{
                        change:function(el) {
                            toggleXY(this.getValue());
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
                value: details.x,
                hidden : true,
                labelWidth:100
            },
            { 
                xtype: 'textfield',
                fieldLabel: 'y',
                id: "y",
                name: 'y',
                value: details.y,
                hidden : true,
                labelWidth:100
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Gebruiker kan de positie van de popup aanpassen',
                inputValue: true,
                name: 'changeablePosition',
                checked: "true" == details.changeablePosition,
                value: "true" == details.changeablePosition,
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
                value: details.width,
                labelWidth:100
            },
            { 
                xtype: 'textfield',
                fieldLabel: 'Hoogte',
                name: 'height',
                value: details.height,
                labelWidth:100
            },{
                xtype: 'checkbox',
                fieldLabel: 'Gebruiker kan de grootte van de popup aanpassen',
                inputValue: true,
                name: 'changeableSize',
                value: "true" == details.changeableSize,
                checked: "true" == details.changeableSize,
                labelWidth:labelWidth
            }]
        }],
        
        renderTo: "layout"//(2)
    });      
    if(fixedChecked){
        toggleXY(true);
    }
}

function toggleXY(show){
    if(show){
        Ext.getCmp('x').show();
        Ext.getCmp('y').show();
    }else{
        Ext.getCmp('x').hide();
        Ext.getCmp('y').hide();
    }
}

function save(){ 
    if(metadata.configSource != undefined){
        var config = customConfiguration.getConfiguration();
        continueSave(config);
    }else{
        // Hackhackhack
        if(Ext.isIE8){
            propertyGrid.addListener("propertychange",getPropertyGridConfig,this);
            var btn = Ext.get('saveConfigButton');
            btn.focus();
        }else{
            getPropertyGridConfig();            
        }
    }
}

function getPropertyGridConfig(){
    var config = propertyGrid.getSource();
    continueSave(config);
}

function continueSave(config){
    if(metadata.type != undefined && metadata.type == "popup"){
        config.isPopup = true;
        var layout = new Object();
        for( var i = 0 ; i < layoutForm.items.length ; i++){
            var fieldSetItems = layoutForm.items.get(i);
            for ( var j = 0 ; j < fieldSetItems.items.length ; j ++){
                var item = fieldSetItems.items.get(j);
                if(item.name != undefined){
                    if(Ext.isObject(item.getValue())){
                        layout[item.name] = item.getValue().position;  
                    }else{
                        if (item.getValue()!=""){
                            layout[item.name] = item.getValue();
                        }
                    }
                }
            }
        }
        var layoutFormObject = Ext.get("componentLayout");
        layoutFormObject.dom.value =  JSON.stringify(layout);
    }else{
        config.isPopup = false;
    }
                    
    var configFormObject = Ext.get("configObject");
    configFormObject.dom.value = JSON.stringify(config);
    document.getElementById('configForm').submit();
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
    if(metadata.type != undefined && metadata.type == "popup"){
        tabs.push({
            contentEl:'layout', 
            title: 'Layout'
        });
    }
    Ext.widget('tabpanel', {
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
            text: 'Annuleren',
            id: 'cancalConfigButton',
            iconCls: 'cancelbutton-icon',
            listeners: {
                click: function() {
                    window.location.reload();
                }
            }
        }, {
            xtype: 'button',
            text: 'Opslaan',
            id: 'saveConfigButton',
            iconCls: 'savebutton-icon',
            listeners: {
                click: function() {
                    save();
                }
            }
        }]
    });
});