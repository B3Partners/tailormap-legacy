/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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

/* global Ext, i18next */

Ext.define("viewer.AppLoader", {

    config: {
        appId: "",
        app: {},
        debugMode: false,
        user: null,
        viewerType: "openlayers",
        loginUrl: "",
        logoutUrl: "",
        viewerController: null,
        contextPath: "",
        absoluteURIPrefix: "",
        actionbeanUrl:null
    },

    /**
     * Create an AppLoader object. Automatically loads an application
     * @param {Object} config
     */
    constructor: function(config) {
        this.initConfig(config);
        this.exposeGlobalVariables();
    },

    reloadApplication: function(appConfig) {
        /*
          TODO:
          Find a way to properly destroy an application to restart,
          this will probably involve implementing a destroy function for each component
        */
        // if(this.config.viewerController) {
        //     this.config.viewerController.destroyComponents();
        //     this.config.viewerController.destroy();
        //     delete this.config.viewerController;
        //     var wrapper = document.body;
        //     var elements = document.querySelectorAll("body > *");
        //     for(var i = 0; i < elements.length; i++) {
        //         if(elements[i].id && (elements[i].id === "appLoader" || elements[i].id === "loadwrapper")) {
        //             continue;
        //         }
        //         if(elements[i].tagName.toUpperCase() === "SCRIPT") {
        //             continue;
        //         }
        //         wrapper.removeChild(elements[i]);
        //     }
        //     this.config.viewerController = null;
        //     var newWrapper = document.createElement('div');
        //     newWrapper.id = "wrapper";
        //     document.body.appendChild(newWrapper);
        // }
        // if(appConfig) {
        //     this.config.appId = appConfig.id;
        //     this.config.app = appConfig;
        //     this.loadApplication(appConfig);
        // }
    },

    /**
     * Retrieve the configuration for the current application and process it.
     */
    loadApplication: function() {
        var failureFunction = function(){
            alert("Cannot retrieve config");
        };
        Ext.Ajax.request({
            url: Ext.String.urlAppend(this.config.actionbeanUrl, "t=" + (new Date()).getTime()),
            scope:this,
            timeout: 120000,
            params: {
                application: this.config.appId
            },
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);

                if(response.success) {
                    this.processAppConfig(Ext.JSON.decode(response.config));
                } else {
                    if(failureFunction !== undefined) {
                        failureFunction(response.error);
                    }
                }
            },
            failure: function(result) {
                if(failureFunction !== undefined) {
                    failureFunction(i18next.t('viewer_apploader_0') + result.status + " " + result.statusText + ": " + result.responseText);
                }
            }
        });
    },

    /**
     * Load a Flamingo application (create styles, load ViewerController
     * @param {Object} appConfig
     */
    processAppConfig: function(appConfig){
        if(appConfig.title || appConfig.name) {
            document.title = appConfig.title || appConfig.name;
        }
        this.createApplicationStyle(appConfig);
        Ext.onReady(function() {
            this.loadViewerController(appConfig);
        }, this);
    },

    /**
     * Get the value for a couple of variables ("viewerController", "appId", "user", "contextPath", "absoluteURIPrefix")
     * @param string varName
     * @returns {*}
     */
    get: function(varName) {
        var safeVariables = ["viewerController", "appId", "user", "contextPath", "absoluteURIPrefix"];
        if(this.config.debugMode) {
            safeVariables.push("app");
        }
        if(Ext.Array.indexOf(safeVariables, varName) === -1) {
            return;
        }
        return this.config[varName];
    },

    /**
     * Expose a couple of variables to the global scope for legacy fallback
     */
    exposeGlobalVariables: function() {
        this.exposeVariable(this.config.appId, "appId", !this.config.debugMode);
        this.exposeVariable(this.config.user, "user", !this.config.debugMode);
        this.exposeVariable(this.config.contextPath, "contextPath", !this.config.debugMode);
        this.exposeVariable(this.config.absoluteURIPrefix, "absoluteURIPrefix", !this.config.debugMode);
        // For the login and logout functions we do not show a warning since the documentation promotes the usage of these functions
        this.exposeVariable(this.login.bind(this), "login", /*hideLog*/true);
        this.exposeVariable(this.logout.bind(this), "logout", /*hideLog*/true);
    },

    /**
     * Expose the variable to the global scope. When a variable is used we show a warning in the console log
     * to notify the developer to switch to requesting a variable trough the AppLoader component
     *
     * @param {*} variable
     * @param {string} name
     * @param {boolean} hideLog
     */
    exposeVariable: function(variable, name, hideLog) {
        var warningMessage = i18next.t('viewer_apploader_1');
        Object.defineProperty(window, name, {
            get: function() {
                if(console.warn && !hideLog) console.warn(warningMessage.replace(/\[var\]/ig, name));
                return variable;
            }
        });
    },

    /**
     * Redirect to login page
     */
    login: function() {
        window.location.href = this.config.loginUrl;
    },

    /**
     * Redirect to logout page
     */
    logout: function() {
        var details = this.config.viewerController.app.details;
        if(details.returnAfterLogout && "true" === details.returnAfterLogout) {
            window.location.href = this.config.logoutAndReturnUrl;
        } else {
            window.location.href = this.config.logoutUrl;
        }
    },

    /**
     * Event handler is called when ViewerController is done loading
     */
    viewerControllerLoaded: function() {
        setTimeout((function() {
            document.getElementById("appLoader").className += " hide";
            this.updateLoginInfo();
            console.log('viewerControllerLoaded');
            const event = new Event('viewerControllerReady');
            window.dispatchEvent(event);
        }).bind(this), 0);
    },

    /**
     * Is a user is logged in and there are certain elements on the page, these are updated as required
     */
    updateLoginInfo: function() {
        if(!this.config.user) {
            return;
        }
        var link = document.getElementById("loginLink");
        if(link) {
            link.innerHTML = i18next.t('viewer_apploader_2');
            link.onclick = this.logout.bind(this);
        }
        var info = document.getElementById("loginInfo");
        if(info) {
            info.innerHTML = i18next.t('viewer_apploader_3') + "<b>" + this.config.user.name + "</b>";
        }
    },

    /**
     * Load the ViewerController component
     */
    loadViewerController: function(appConfig) {
        var listeners = {
            // Cannot use viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING for property name here
            "ON_COMPONENTS_FINISHED_LOADING": this.viewerControllerLoaded.bind(this)
        };
        var mapConfig = {};
        if (this.config.viewerType === "flamingo"){
            mapConfig.swfPath = this.config.contextPath + "/flamingo/flamingo.swf";
        }
        this.config.viewerController = new viewer.viewercontroller.ViewerController(this.config.viewerType, null, appConfig, listeners, mapConfig);
        this.exposeVariable(this.config.viewerController, "viewerController", !this.config.debugMode);
        // IOS fix, see http://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
        // This is especially an issue when loading Flamingo in an iframe
        document.getElementById(this.config.viewerController.getWrapperId()).addEventListener('touchstart', function(){});
    },

    /**
     * Create the application specific styles
     * @param {Object} appConfig
     */
    createApplicationStyle: function(appConfig) {
        if(!appConfig.details) {
            return;
        }
        var globalLayout = appConfig.details.globalLayout ? Ext.JSON.decode(appConfig.details.globalLayout) : {};
        Ext.create("viewer.AppStyle", {
            steunkleur1: appConfig.details.steunkleur1,
            steunkleur2: appConfig.details.steunkleur2,
            font: appConfig.details.font,
            globalLayout: globalLayout
        });
    }

});
