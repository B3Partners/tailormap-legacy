/* 
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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
 * DataSelectionChecker
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.DataSelectionChecker",{
    config:{
        viewerController:null
    },
    constructor: function (conf){        
        this.initConfig(conf);
        
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING,this.init,this);
    },
    init : function (){
        this.viewerController.mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED,this.layerVisibilityChanged,this);    
    },
    layerVisibilityChanged : function (map,object){
        var layer = object.layer;
        var appLayer= this.viewerController.getAppLayerById(layer.appLayerId);
        var vis = object.visible;
        if(vis){
            this.hasLayerDataSelectionAttributes(layer.serviceId, layer.options.name, function (hasSelectableAttributes){
                if(!hasSelectableAttributes){
                    setTimeout(function(){this.viewerController.setLayerVisible(appLayer,false)}, 100);
                }else{
                    var a = 0;
                }
            });
        }
    },
    hasLayerDataSelectionAttributes : function(serviceId, layerName,callBack){
        var appLayer = this.viewerController.getAppLayer(serviceId, layerName);
        
        if(appLayer){
            var featureService = this.viewerController.getAppLayerFeatureService(appLayer);
            if(appLayer != null){
                var me = this;
                // check if featuretype was loaded
                if(appLayer.attributes == undefined) {
                    featureService.loadAttributes(appLayer, function(attributes) {
                        callBack(me.checkAppLayerForDataselection(appLayer),me);
                    });
                } else {
                    callBack(this.checkAppLayerForDataselection(appLayer),me);
                }
            }else{
                return callBack(true,me);
            }
        }else{
            return callBack(true,me);
        }
    },
    /**
     * Check the appLayer for DataSelection
     * @param appLayer the applayer that needs to be checked
     * @return true/false    
     */
    checkAppLayerForDataselection : function ( appLayer){
        var selectableAttributes = this.hasSelectableAttributes(appLayer);
        if( selectableAttributes >= 0 && (appLayer.filter == undefined || appLayer.filter == null)){
            var dsArray = this.viewerController.getComponentsByClassName("viewer.components.DataSelection");
            if( dsArray.length == 0){
                Ext.Msg.alert('Mislukt', 'Dataselectiemodule niet beschikbaar, kaartlaag kan niet weergegeven worden.');
                return true;
            }else{
                for( var j = 0 ; j < dsArray.length ; j++){
                    var ds = dsArray[j];
                    ds.showAndForceLayer(appLayer.serviceId + "_" + appLayer.layerName);
                    var me = appLayer;
                    this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_FILTER_ACTIVATED,function (filter,layer){
                        if(me.serviceId == layer.serviceId && me.layerName == layer.layerName){
                            this.viewerController.setLayerVisible(me, true);
                            ds.removeForcedLayer(layer.serviceId +"_"+ layer.layerName);
                            var nodeId = "layer-" + appLayer.id;
                            var node = this.panel.getRootNode().findChild("id",nodeId,true);
                            node.set('checked', true);
                            this.setTriState(node);
                            
                        }
                    },this);
                    /* TODO add functionality to select a layer in the layerselector, so the filter can be applied to the layer when all attributes have defaults
                     *if(selectableAttributes == 1){
                        ds.applyFilter();
                    }*/
                }
                return false;
            }
        }else{
            return true;
        }
    },
    hasSelectableAttributes : function (appLayer){
        // -1: no selectable attributes, 0: has selectable attributes but not all have defaults, 1: has selectable attributes and all have defaults
        var selectableAttributes = -1;
        for ( var i = 0 ; i < appLayer.attributes.length; i++){
            if(appLayer.attributes[i].selectable){
                if(appLayer.attributes[i].defaultValue != undefined){
                    selectableAttributes = 1;
                }else{
                    selectableAttributes = 0;
                    break;
                }
            }
        }
        return selectableAttributes;
    }
});