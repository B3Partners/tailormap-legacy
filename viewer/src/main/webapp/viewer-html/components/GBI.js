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
/* global Ext */

/**
 * GBI component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.components.GBI", {
    extend: "viewer.components.Component",
    div: null,
    config: {
    },
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.GBI.superclass.constructor.call(this, this.config);
        var me = this;
        this.renderButton({
            handler: function() {
                var deferred = me.createDeferred();
                me.showWindow();
             
                return deferred.promise;
            },
            text: "me.config.title",
        });
        this.div = document.createElement("flamingo-wegvak-popup");
        this.div.addEventListener('wanneerPopupClosed', function(evt){
            console.log("wanneerPopupClosed", evt.detail);
        });
        document.body.appendChild(this.div);
        return this;
    }  ,
    showWindow: function(){
        this.resolveDeferred();
        this.div.setAttribute("popup-open", "true");
    }
});