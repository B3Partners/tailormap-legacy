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
        this.div.setAttribute("config", JSON.stringify(this.getConfig()));
        document.body.appendChild(this.div);
        return this;
    }  ,
    showWindow: function(){
        this.div.setAttribute("feature-clicked", JSON.stringify(this.getData()));
        this.resolveDeferred();
    },
    getData: function(){
        return {
            id: '16',
            featureType: "Planning",
            featureSource: 'orakel',
            attributes: [
              {
                key: 'id',
                value: '123'
              },{
                key: 'type',
                value: 'WEGOPBREKING'
              },{
                key: 'naam',
                value: 'Bob de Bouwer'
              }
            ]
          };
    },

    getConfig: function () {
        return {config: {
                '16': // featureTypeId
                        {
                            fields: [
                                {
                                    key: 'id',
                                    type: 'textfield'
                                },
                                {
                                    key: 'naam',
                                    type: 'textfield'
                                }, {
                                    key: 'type',
                                    type: 'combo'
                                }
                            ],
                            tabs: 12,
                            name: "Wegvakkuh"
                        }
            }
        };
    }
});