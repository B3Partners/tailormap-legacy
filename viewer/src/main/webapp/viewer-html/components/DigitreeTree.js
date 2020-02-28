/*
 * Copyright (C) 2020 B3Partners B.V.
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
 * Custom configuration object for AttributeList configuration
 * @author Martijn van der Struijk
 */
Ext.define("viewer.components.DigitreeTree", {
    extend: "viewer.components.Component",
    div: null,
    toolMapClick: null,
    formConfigs: null,
    digitreeBeheerConfig: null,
    config: {
        layers: [],
        configUrl: null
    },
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.DigitreeTree.superclass.constructor.call(this, this.config);
        var me = this;

        this.getDigitreeConfig();

        this.renderButton({
            handler: function() {
                var deferred = me.createDeferred();
                me.showWindow();

                return deferred.promise;
            },
            text: "me.config.title"
        });

        this.toolMapClick =  this.config.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.MAP_CLICK,
            id: this.config.name + "toolMapClick",
            handler:{
                fn: this.mapClicked,
                scope:this
            },
            viewerController: this.config.viewerController
        });
        this.toolMapClick.activateTool();

        this.initialize();

        return this;
    },

    initialize: function() {
        this.div = document.createElement("flamingo-digitree-popup");
        //this.div.setAttribute("config", JSON.stringify(this.formConfigs));
        //this.div.setAttribute("application", this.config.viewerController.app.id);
        document.body.appendChild(this.div);
    },

    getDigitreeConfig: function() {
        Ext.Ajax.request({
            url: "/digitree-beheer/Api.action?getConfig=",
            scope: this,
            success: function(result) {
                const text = result.responseText;
                const response = Ext.JSON.decode(text);
                this.digitreeBeheerConfig = response;
            },
            failure: function(result) {
                this.config.viewerController.logger.error(result);
            }
        });
    },

    mapClicked: function () {
        console.log("Map clicked");
    },

    showWindow: function () {
        this.div.setAttribute("openDialog","joehoe");
    }

});