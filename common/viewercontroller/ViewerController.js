/*JavaScript interface class file*/

/**
 * ViewerController
 * @class 
 * @constructor
 * @param viewerType The type of the viewer: flamingo/openlayers/etc..
 * @param mapId The id of the div in which the map has to be shown.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.viewercontroller.ViewerController",{
    constructor: function(viewerType,mapId,app){
        this.viewerType = viewerType;
        this.mc = null;
        this.mapComponent = null;
        this.mapDivId = mapId;
        this.components = new Array();
        this.app = app;
    },
    init : function (){
        this.mapOptions = {};
        if (this.viewerType== "flamingo"){
            this.mapComponent=new viewer.viewercontroller.FlamingoMapComponent(this.mapDivId); // aanpassen aan id van div
        }/*else if (this.viewerType=="openlayers"){
        this.mapComponent= new OpenLayersController();
        this.mapOptions = {
            projection: new OpenLayers.Projection("EPSG:28992"),
            allOverlays: true,
            units :'m',
            resolutions: [512,256,128,64,32,16,8,4,2,1,0.5,0.25,0.125],
            controls : [new OpenLayers.Control.Navigation({
                zoomBoxEnabled: true
            }),new OpenLayers.Control.ArgParser()],
            events: []            
        };
    }*/
    
        //   this.mapOptions.maxExtent =  new viewer.viewercontroller.controller.Extent(10000, 304000,280000,620000);
    
        this.mapComponent.initEvents();
        // Convenience accessor for the mapComponent
        this.mc = this.mapComponent;
    },
    createMap : function(opts){
        var a= 0;
        for (var key in opts){
            this.mapOptions[key] = opts[key];
        }
        this.mapOptions.viewerController = this;
        var map=this.mapComponent.createMap("map",this.mapOptions); // aanpassen aan config.xml
        this.mapComponent.addMap(map);
        return map;
    },
    zoomToExtent : function(minx,miny,maxx,maxy){
        this.mapComponent.getMap().zoomToExtent({
            minx:minx,
            miny:miny,
            maxx:maxx,
            maxy:maxy
        }, 0);
    },
  
    
    addComponent : function (className,config){
        if(className != "FlamingoMap"){
            config.viewerController = this;
            var component = Ext.create(className,config);
            this.components.push(component);
            return component;
        }
    },
    getComponentsByClassName : function(className){
        var componentList = new Array();
        for(var i = 0 ; i < this.components.length; i++){
            var comp = this.components[i];
            if(comp.$className == className){
                componentList.push(comp);
            }
        }
        return componentList;
    },
    getComponentByName : function (name){
        for(var i = 0 ; i < this.components.length; i++){
            var comp = this.components[i];
            if(comp.getName() == name){
                return comp;
            }
        }
        return null;
    },
    loadLayout : function(componentList){
        for( var i = 0 ; i < componentList.length ; i++){
            var component = componentList[i];
            var compConfig = app.components[component.componentName];
            compConfig.viewerController = this;
            compConfig.div = component.htmlId;
            this.addComponent(component.componentClass,compConfig);
        }
    },
    loadRootLevel : function (root){
        var a = 0;
    },
    /********************************************************************
     *                                                                  *
     * EventHandling                                                    *
     *                                                                  *
     *                                                                  *
     ********************************************************************/

    bind : function (event,object,handler){
        if(object.isComponent != undefined){
            object.bind(event,handler);
        }else{
            this.mapComponent.registerEvent(event, object, handler);
        }
    },
    unbind : function (event,object){
        this.mapComponent.unRegisterEvent(event, object);
    }
});
