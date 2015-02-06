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
/**
 * Superclass for the classes that create configuration elements for a component.
 */
Ext.define("viewer.components.ConfigObject",{
    parentId: null,
    configObject: null,
    formWidth: 750,
    labelWidth: 300,
    formPadding: 5,
    //options for checkboxes
    checkBoxes: null,
    checkPanel: null,
    checkPanelHeight: 300,
    form: null,
    //URL for getting Layers
    requestPath: contextPath+"/action/componentConfigLayerList",
    constructor: function (parentId,configObject){
        this.parentId=parentId;
        this.configObject=configObject;
        if (configObject==null || configObject==undefined){
            this.configObject=new Object();
        }
    },
    /**
     * Must return the configuration that is set by the user.
     * 
     */
    getConfiguration: function(){
        var config=new Object();        
        if (this.checkBoxes!=null){
            config.layers=this.checkBoxes.getChecked();  
        }
        Ext.apply(config,this.getValuesFromContainer(this.form));
        return config;
    },
    /**
     * Get the item values of the given container.
     */
    getValuesFromContainer: function(container){
        var config=new Object();
        for( var i = 0 ; i < container.items.length ; i++){
            //if its a radiogroup get the values with the function and apply the values to the config.
            if ("radiogroup"==container.items.get(i).xtype){
                Ext.apply(config, container.items.get(i).getValue());       
            }else if("htmleditor"==container.items.get(i).xtype) {
                config[container.items.get(i).getName()] = container.items.get(i).getValue();
            }else if ("container"==container.items.get(i).xtype || "checkboxgroup"==container.items.get(i).xtype){
                Ext.apply(config,this.getValuesFromContainer(container.items.get(i)));
            }else if (container.items.get(i).name!=undefined)
                config[container.items.get(i).name] = container.items.get(i).value;
        }
        return config;
    },
    /**
     *Create a layer list with checkboxes.
     *@param checkedIds a array of id's that need to be checked at init.
     *@param requestParams the params that are send with the ajax request.
     */
    createCheckBoxes: function (checkedIds,requestParams){
        if (requestParams==undefined || requestParams==null){
            requestParams=new Object();
        }
        //add the application id that needs to be send with the ajax
        requestParams.appId=applicationId;
        
        if (checkedIds==undefined)
            checkedIds=[];
        //create the formpanel
        var me=this;                
        this.checkPanel=Ext.create("Ext.form.FormPanel",{
            title: "Selecteer de kaartlagen waarop deze tool van toepassing is",
            id: "layerListContainer",
            style: {
                marginTop: "10px"
            },
            layout: 'fit',
            frame: false,
            bodyPadding: me.formPadding,
            width: me.formWidth,
            height: me.checkPanelHeight,
            renderTo: this.parentId
        });        
        this.checkBoxes=Ext.create("Ext.ux.b3p.FilterableCheckboxes",{
            requestUrl: me.requestPath,
            requestParams: requestParams,
            renderTo: "layerListContainer",
            checked: checkedIds,
            layerFilter: me.configObject.layerFilter
        });   
    }
});

