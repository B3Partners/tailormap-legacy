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
 * HTML component
 * Creates an Angular AttributeList component
 * @author <a href="mailto:eddy.scheper@aris.nl">Eddy Scheper</a>
 */
Ext.define ("viewer.components.NgAttributeList",{
    extend: "viewer.components.Component",
    container: null,
    config: {
        html: "",
        title: "",
        loadScripts: false
    },
    constructor: function (conf){        
        this.initConfig(conf);
		viewer.components.NgAttributeList.superclass.constructor.call(this, this.config);
        var me = this;
        this.renderButton({
            handler: function() {
                // var deferred = me.createDeferred();
                me.div.setAttribute("showwindow","");
                // return deferred.promise;
            },
            //text: "me.config.title",
            text: "Angular AttributeList",
            //icon: "",
            tooltip: "Angular AttributeList",
            label: ""
        });
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED,
            this.initialize,this);
        return this;
    },
    // Voor het icon.
    getBaseClass : function() {
        return "viewercomponentsAttributeList";
    },
    initialize: function(){
        // Create form div.
        this.div = document.createElement("tailormap-attributelist-form");
        // Add to body.
        document.body.appendChild(this.div);
        //console.log(this.div);
    },
    getExtComponents: function() {
        return [ this.container.getId() ];
    }
});
