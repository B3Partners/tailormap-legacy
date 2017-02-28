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
 * @description Flamingo ArcServer layer class 
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 **/
Ext.define("viewer.viewercontroller.flamingo.FlamingoArcServerLayer",{
    extend: "viewer.viewercontroller.flamingo.FlamingoArcLayer",
    /**
     * @constructor 
     */
    constructor: function(config){
        viewer.viewercontroller.flamingo.FlamingoArcServerLayer.superclass.constructor.call(this, config);
        this.initConfig(config);
        this.type=viewer.viewercontroller.controller.Layer.ARCSERVER_TYPE;
        return this;
    },
    
    getTagName: function(){
        return "LayerArcServer";
    },
    setQuery : function (filter){
        var cql = filter != null ? filter.getCQL() : "";        
        if(cql != ""){
            var me = this;
            var f = function(ids,colName) { 
                // Hack: An empty query returns all the features
                var query = "-1";
                if(ids.length != 0) {
                    query = colName + " IN(" + ids.join(",") + ")";
                }
                me.map.getFrameworkMap().callMethod(me.getFrameworkId(),"setDefinitionQuery", query,me.config.options.name);
                setTimeout (function(){
                    me.reload();
                }, 500);
            };
            var util = Ext.create("viewer.ArcQueryUtil");
            util.cqlToArcFIDS(cql,this.appLayerId,f, function(msg) { me.getViewerController().logger.error(msg); });
        }else{
            this.map.getFrameworkMap().callMethod(this.getFrameworkId(),"setDefinitionQuery",null,this.config.options.name);
            this.reload();
        }
    }    
});
