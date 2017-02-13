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
 * DataSelectionChecker
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.DataSelectionChecker",{
    config:{
        viewerController:null
    },
    constructor: function (conf){ 
        this.initConfig(conf);
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING,this.init,this);
    },
    init : function (){
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED,this.layerVisibilityChanged,this);    
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.layerVisibilityChanged,this);    
    },
    layerVisibilityChanged : function (map,object){
        var me = this;
        var layer = object.layer;
        var appLayer= this.config.viewerController.getAppLayerById(layer.appLayerId);
        if(appLayer && appLayer.checked){
            this.hasLayerDataSelectionAttributes(appLayer, function (hasSelectableAttributes){
                if(!hasSelectableAttributes){
                    setTimeout(function(){
                        me.config.viewerController.setLayerVisible(appLayer,false)
                    }, 100);
                }
            });
        }
    },
    hasLayerDataSelectionAttributes : function(appLayer,callBack){       
        if(appLayer){
            var featureService = this.config.viewerController.getAppLayerFeatureService(appLayer);
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
     * @return true/false False when layer will not be visible, true when layer will be visible
     */
    checkAppLayerForDataselection : function ( appLayer){
        var selectableAttributes = this.hasSelectableAttributes(appLayer);
        if( selectableAttributes >= 0 && (appLayer.filter == undefined || appLayer.filter == null)){
            var layerName = appLayer.alias || appLayer.layerName;
            var dsArray = this.config.viewerController.getComponentsByClassName("viewer.components.DataSelection");
            if( dsArray.length == 0){
                this.config.viewerController.logger.warning( 'Dataselectiemodule niet beschikbaar, kaartlaag "' + layerName + '" kan niet weergegeven worden.');
                return false;
            }else{
                var appLayerConfigured = false;
                for( var j = 0 ; j < dsArray.length ; j++){
                    var ds = dsArray[j];
                    var me = appLayer;
                    if(ds.allLayers || ds.hasAppLayerConfigured(appLayer)){
                        appLayerConfigured = true;
                        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_FILTER_ACTIVATED,function (filter,layer){
                            if(me.serviceId == layer.serviceId && me.layerName == layer.layerName){
                                this.config.viewerController.setLayerVisible(me, true);
                                ds.removeForcedLayer(appLayer);

                            }
                        },this);
                        if(selectableAttributes == 1){
                            ds.applyFilterWithDefaults();
                            return true;
                        }else{
                            ds.showAndForceLayer(appLayer);
                        }
                        ds.selectAppLayer(appLayer);
                    }
                }
                if(!appLayerConfigured){
                    this.config.viewerController.logger.warning( 'Kaartlaag "' + layerName+'" niet geconfigureerd bij een dataselectiecomponent.');
                    return false;
                }else{
                    return false;
                }
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
                if(appLayer.attributes[i].defaultValue){
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