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
 * @class
 * @constructor
 * @description The class for controls
 * @param id The id of the tool
 * @param frameworkObject The frameworkspecific object, to store as a reference
 * @param type The type of tool to be created
 */
Ext.define("viewer.viewercontroller.controller.Tool",{
    extend: "Ext.util.Observable",
    statics:{
        // The different types of tools
        NAVIGATION_HISTORY         : 1,
        ZOOMIN_BOX                 : 2,
        ZOOMOUT_BOX                : 3,
        ZOOMOUT_BUTTON             : 6,
        ZOOM                       : 7,
        PAN                        : 4,
        SUPERPAN                   : 5,
        GET_FEATURE_INFO           : 10,
        MEASURELINE               : 11,
        MEASUREAREA               : 12,
        ZOOM_BAR                   : 13,
        DEFAULT                    : 15,

        PREVIOUS_EXTENT            : 19,
        NEXT_EXTENT                : 20,
        FULL_EXTENT                : 21,
        MAP_CLICK                  : 22,
        //toggle
        TOGGLE                     : 23,
        //button
        BUTTON                     : 24,
        //only one tool can be active, other are disabled
        MAP_TOOL                   : 25
    },
    tool: null,
    mapComponent: null,
    events: null,
    blocksDefaultTool:null,
    config :{
        id: null,
        frameworkObject: null,
        visible: true,
        type: null,
        tooltip:null,
        iconUrl_up: null,
        iconUrl_over: null,
        iconUrl_sel:null,
        iconUrl_dis:null,
        viewerController:null
    },

    constructor: function (config){
        this.initConfig(config);
        viewer.viewercontroller.controller.Tool.superclass.constructor.call(this, this.config);
        this.events = [];
        this.blocksDefaultTool = true;
        return this;
    },
    /**
     * Returns the framework object
     * @deprecated use getFrameworkObject
     */
    getFrameworkTool : function(){ 
        return this.frameworkObject;
    },
    getFrameworkObject: function() {
        return this.frameworkObject;
    },
    /**
     *Must set the visibility of the tool.
     */
    setToolVisible : function(){
        Ext.Error.raise({msg: "Tool.setVisible() not implemented! Must be implemented in sub-class"});
    },

    fire : function (event,options){
        this.fireEvent(event,this,options);
    },

    isActive : function(){
        Ext.Error.raise({msg: "Tool.isActive() not implemented! Must be implemented in sub-class"});
    },
    /**
     * Activate tool
     * must be implemented
     */
    activate: function(){
        Ext.Error.raise({msg: "Tool.activate() not implemented! Must be implemented in sub-class"});
    },
    /**
     * Deactivate tool
     * must be implemented
     */
    deactivate: function(){
        Ext.Error.raise({msg: "Tool.deactivate() not implemented! Must be implemented in sub-class"});
    },
    getVisible : function(){
        return this.config.visible;
    }
});
