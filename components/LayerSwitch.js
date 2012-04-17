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
/**
 * LayerSwitch component
 * Creates a LayerSwitch component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.LayerSwitch",{
    extend: "viewer.components.Component",
    container: null,
    states:null,
    layers:null,
    levels:null,
    prev:null,
    appLayers:null,
    button:null,
    config: {
        top:null,
        left:null
    },
    constructor: function (conf){        
        viewer.components.LayerSwitch.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        this.loadComponent();
        return this;
    },
    loadComponent : function (){
        var p = Ext.get(this.div).parent();
        var pid = p.id;
        this.loadLayers();
        
        this.button = Ext.create('Ext.button.Cycle', {
            showText: true,
            renderTo:  pid,
           // width: "100%",
            top:  '30px',
            style: {
                marginBottom: '10px'
            },
            floating: true,
            menu: {
                id: 'view-type-menu',
                items: this.states
            },
            listeners:{
                change:{
                    fn: this.layerChanged,
                    scope: this
                }
            }
        });
        this.button.setPosition(Ext.JSON.decode(this.left),Ext.JSON.decode(this.top));
    },
    loadLayers : function(){
        this.layers = new Array();
        this.levels = this.viewerController.app.levels;
        this.appLayers = this.viewerController.app.appLayers;
        var backgroundRoot;
        // Find root background
        for ( var i in this.levels){
            var level = this.levels[i];
            if(level.name == "Achtergrond"){
                backgroundRoot = level;
                break;
            }
        }
        this.states = new Array();
        this.addLevel(backgroundRoot);
        
    },
    addLevel : function (level){
        if(level.name != "Achtergrond"){
            this.states.push({
                text: level.name,
                iconCls: 'view-html'
            });
        }
        if(level.layers){
            if(this.layers[level.name] == undefined ){
                this.layers[level.name] = new Array();
            }
            this.addLayers(level.layers,level)
        }
        if(level.children){
            for(var i = 0 ; i < level.children.length ;i++){
                var l = this.levels[level.children[i]];
                this.addLevel(l);
            }
        }
    },
    addLayers : function (layers, level){
        for( var i = 0 ; i < layers.length ;i++){
            var appLayerObj = this.appLayers[layers[i]];
            this.layers[level.name].push( {
                serviceId : appLayerObj.serviceId,
                layerName : appLayerObj.layerName
            });
        }
    },
    layerChanged : function (button, active){
        var levelName = active.text;
        var layers = this.layers[levelName];
        this.setLayersActive(layers, true);
        if(this.prev != null){
            this.setLayersActive(this.prev,false);
        }
        this.prev = layers;
    },
    setLayersActive : function (layerArray, visible){
         for( var i = 0 ; i < layerArray.length ;i++){
            var layerObj = layerArray[i];
            this.viewerController.setLayerVisible(layerObj.serviceId, layerObj.layerName, visible);
        }
    },
    getExtComponents: function() {
        return [this.button];
    }
});
