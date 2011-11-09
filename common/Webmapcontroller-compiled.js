// Input 0
Ext.define("Event", {statics:{ON_CONFIG_COMPLETE:"ON_CONFIG_COMPLETE", ON_SET_TOOL:"ON_SET_TOOL", ON_GET_FEATURE_INFO:"ON_GET_FEATURE_INFO", ON_GET_FEATURE_INFO_DATA:"ON_GET_FEATURE_INFO_DATA", ON_ALL_LAYERS_LOADING_COMPLETE:"ON_ALL_LAYERS_LOADING_COMPLETE", ON_CHANGE_EXTENT:"ON_CHANGE_EXTENT", ON_FINISHED_CHANGE_EXTENT:"ON_FINISHED_CHANGE_EXTENT", ON_GET_CAPABILITIES:"ON_REQUEST", ON_FEATURE_ADDED:"ON_FEATURE_ADDED", ON_REQUEST:"ON_REQUEST", ON_LOADING_START:"ON_LOADING_START", ON_LOADING_END:"ON_LOADING_END", 
ON_EVENT_DOWN:"ON_EVENT_DOWN", ON_EVENT_UP:"ON_EVENT_UP", ON_CLICK:"ON_CLICK", ON_MEASURE:"ON_MEASURE", ON_ONIT:"ON_ONIT", ON_LAYER_SWITCHED_OFF:"ON_LAYER_SWITCHED_OFF", ON_LAYER_SWITCHED_ON:"ON_LAYER_SWITCHED_ON"}});
// Input 1
Ext.define("Extent", {constructor:function(minx, miny, maxx, maxy) {
  if(minx != undefined && miny == undefined && maxx == undefined && maxy == undefined) {
    var tokens = minx.split(",");
    if(tokens.length != 4) {
      throw"Can not create Extent because there is no bbox found";
    }
    this.minx = tokens[0];
    this.miny = tokens[1];
    this.maxx = tokens[2];
    this.maxy = tokens[3]
  }else {
    this.minx = minx;
    this.maxx = maxx;
    this.miny = miny;
    this.maxy = maxy
  }
  return this
}});
// Input 2
Ext.define("Feature", {constructor:function(id, wkt) {
  this.id = id;
  this.wkt = wkt;
  this.wktParser = new OpenLayers.Format.WKT
}, getId:function() {
  return this.id
}, getWkt:function() {
  return this.wkt
}, toOpenLayersFeature:function() {
  var olFeature = this.wktParser.read(this.getWkt());
  return olFeature
}, fromOpenLayersFeature:function(openLayersFeature) {
  var feature = new Feature(openLayersFeature.id, openLayersFeature.geometry.toString());
  return feature
}, toFlamingoFeature:function() {
  var flFeature = new Object;
  flFeature["id"] = this.getId();
  flFeature["wktgeom"] = this.getWkt();
  return flFeature
}, fromFlamingoFeature:function(flamingoFeature) {
  var feature = new Feature(flamingoFeature["id"], flamingoFeature["wktgeom"]);
  return feature
}});
// Input 3
Ext.define("Layer", {extend:"Ext.util.Observable", events:[], maptips:new Array, config:{id:"id", frameworkObject:new Object, options:new Object}, constructor:function(config) {
  this.initConfig(config)
}, getFrameworkLayer:function() {
  return this.frameworkLayer
}, getOption:function(optionKey) {
  throw"Layer.getOption() Not implemented! Must be implemented in sub-class";
}, setOption:function(optionKey, optionValue) {
  throw"Layer.getOption() Not implemented! Must be implemented in sub-class";
}, getId:function() {
  return this.id
}, addMapTip:function(maptip) {
  this.maptips.push(maptip)
}, setMapTips:function(maptips) {
  this.maptips = maptips
}, getMapTips:function() {
  return this.maptips
}, getMapTipByFeatureType:function(featureType) {
  for(var m = 0;m < this.maptips.length;m++) {
    if(this.maptips[m].layer == featureType || this.maptips[m].aka == featureType) {
      return this.maptips[m]
    }
  }
  return null
}, fire:function(event, options) {
  this.fireEvent(event, this, options)
}, registerEvent:function(event, handler) {
  this.addListener(event, handler)
}});
// Input 4
Ext.define("Map", {extend:"Ext.util.Observable", events:[], layers:new Array, config:{id:"id"}, constructor:function(config) {
  this.initConfig(config);
  this.frameworkMap = mapViewer.wmc.viewerObject;
  this.addEvents(Event.ON_ALL_LAYERS_LOADING_COMPLETE, Event.ON_CHANGE_EXTENT, Event.ON_GET_FEATURE_INFO, Event.ON_GET_FEATURE_INFO_DATA, Event.ON_FINISHED_CHANGE_EXTENT);
  return this
}, registerEvent:function(event, handler) {
  this.addListener(event, handler)
}, fire:function(event, options) {
  this.fireEvent(event, this, options)
}, getFrameworkMap:function() {
  return this.frameworkMap
}, addLayers:function(layers) {
  for(var i = 0;i < layers.length;i++) {
    this.addLayer(layers[i])
  }
}, getLayers:function() {
  if(this.layers == undefined) {
    this.layers = new Array
  }
  return this.layers
}, getLayer:function(id) {
  for(var i = 0;i < this.layers.length;i++) {
    if(id == this.layers[i].getId()) {
      return this.layers[i]
    }
  }
  return null
}, removeLayerById:function(layerId) {
  this.removeLayer(this.getLayer(layerId))
}, removeAllLayers:function() {
  for(var i = 0;i < this.layers().length;i++) {
    removeLayer(this.layers[i])
  }
}, getLayerIndex:function(layer) {
  for(var i = 0;i < this.getLayers().length;i++) {
    if(this.getLayers()[i] == layer) {
      return i
    }
  }
  return-1
}, addLayer:function(layer) {
  this.layers.push(layer)
}, removeLayer:function(layer) {
  var index = this.getLayerIndex(layer);
  if(index == -1) {
    throw"Map.removeLayer(): Layer not available in map!";
  }
  this.layers.splice(index, 1)
}, setLayerIndex:function(layer, newIndex) {
  if(!(layer instanceof Layer)) {
    throw"Given layer not of type Layer";
  }
  var currentIndex = this.getLayerIndex(layer);
  var newLayerArray = new Array;
  var oldLayerArray = this.getLayers();
  var size = oldLayerArray.length;
  var count = 0;
  oldLayerArray.splice(currentIndex, 1);
  for(var i = 0;i < size;i++) {
    if(newIndex == i) {
      newLayerArray.push(layer)
    }else {
      newLayerArray.push(oldLayerArray[count]);
      count++
    }
  }
  this.layers = newLayerArray;
  return currentIndex
}, getId:function() {
  throw"Map.getId() Not implemented! Must be implemented in sub-class";
}, getAllWMSLayers:function() {
  throw"Map.getAllWMSLayers() Not implemented! Must be implemented in sub-class";
}, getAllVectorLayers:function() {
  throw"Map.getAllVectorLayers() Not implemented! Must be implemented in sub-class";
}, remove:function() {
  throw"Map.remove() Not implemented! Must be implemented in sub-class";
}, zoomToExtent:function(extent) {
  throw"Map.moveToExtent() Not implemented! Must be implemented in sub-class";
}, zoomToMaxExtent:function() {
  throw"Map.zoomToMaxExtent() Not implemented! Must be implemented in sub-class";
}, zoomToScale:function(scale) {
  throw"Map.zoomToScale() Not implemented! Must be implemented in sub-class";
}, zoomToResolution:function(resolution) {
  throw"Map.zoomToResolution() Not implemented! Must be implemented in sub-class";
}, getExtent:function() {
  throw"Map.getExtent() Not implemented! Must be implemented in sub-class";
}, setMaxExtent:function(extent) {
  throw"Map.setMaxExtent() Not implemented! Must be implemented in sub-class";
}, getMaxExtent:function() {
  throw"Map.getFullExtent() Not implemented! Must be implemented in sub-class";
}, doIdentify:function(x, y) {
  throw"Map.doIdentify() Not implemented! Must be implemented in sub-class";
}, update:function() {
  throw"Map.update() Not implemented! Must be implemented in sub-class";
}, setMarker:function(markerName, x, y, type) {
  throw"Map.setMarker() Not implemented! Must be implemented in sub-class";
}, removeMarker:function(markerName) {
  throw"Map.removeMarker() Not implemented! Must be implemented in sub-class";
}, getScale:function() {
  throw"Map.getScale() Not implemented! Must be implemented in sub-class";
}, getResolution:function() {
  throw"Map.getResolution() Not implemented! Must be implemented in sub-class";
}, coordinateToPixel:function(x, y) {
  throw"Map.coordinateToPixel() Not implemented! Must be implemented in sub-class";
}, getCenter:function() {
  throw"Map.getCenter() Not implemented! Must be implemented in sub-class";
}});
// Input 5
function MapTip(layer, mapTipField, aka) {
  this.layer = layer;
  this.mapTipField = mapTipField;
  this.aka = aka
}
;
// Input 6
Ext.define("Tool", {extend:"Ext.util.Observable", events:[], config:{id:"id", frameworkObject:new Object}, constructor:function(config) {
  this.initConfig(config);
  this.addEvents(Event.ON_CLICK, Event.ON_EVENT_DOWN, Event.ON_EVENT_UP);
  return this
}, fire:function(event, options) {
  this.fireEvent(event, this, options)
}, registerEvent:function(event, handler) {
  this.addListener(event, handler)
}, statics:{DRAW_FEATURE:0, NAVIGATION_HISTORY:1, ZOOM_BOX:2, PAN:3, BUTTON:4, TOGGLE:5, CLICK:6, LOADING_BAR:7, GET_FEATURE_INFO:8, MEASURE:9, SCALEBAR:10, ZOOM_BAR:11, LAYER_SWITCH:12, DRAW_FEATURE_POINT:13, DRAW_FEATURE_LINE:14, DRAW_FEATURE_POLYGON:15}, getFrameworkTool:function() {
  return this.frameworkTool
}, getType:function() {
  return this.type
}, getId:function() {
  return this.id
}, setVisible:function() {
  throw"Tool.setVisible() not implemented! Must be implemented in sub-class";
}, isActive:function() {
  throw"Tool.isActive() not implemented! Must be implemented in sub-class";
}});
// Input 7
function Utils() {
}
Utils.createBounds = function(extent) {
  return new OpenLayers.Bounds(extent.minx, extent.miny, extent.maxx, extent.maxy)
};
Utils.createExtent = function(bounds) {
  return new Extent(bounds.left, bounds.bottom, bounds.right, bounds.top)
};
OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {button:null, defaultHandlerOptions:{"single":true, "double":true, "pixelTolerance":0, "stopSingle":false, "stopDouble":false}, initialize:function(options) {
  this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
  OpenLayers.Control.prototype.initialize.apply(this, arguments);
  this.handler = new OpenLayers.Handler.Click(this, {"click":this.onClick, "dblclick":this.onDblclick}, this.handlerOptions);
  var buttonOptions = {displayClass:this.displayClass + "Button", type:OpenLayers.Control.TYPE_TOOL};
  this.button = new OpenLayers.Control(buttonOptions);
  this.button.events.register("activate", this, this.activate);
  this.button.events.register("deactivate", this, this.deactivate)
}, onClick:function(evt) {
}, onDblclick:function(evt) {
}});
OpenLayers.Control.LoadingPanel = OpenLayers.Class(OpenLayers.Control, {counter:0, maximized:false, visible:true, initialize:function(options) {
  OpenLayers.Control.prototype.initialize.apply(this, [options])
}, setVisible:function(visible) {
  this.visible = visible;
  if(visible) {
    OpenLayers.Element.show(this.div)
  }else {
    OpenLayers.Element.hide(this.div)
  }
}, getVisible:function() {
  return this.visible
}, hide:function() {
  this.setVisible(false)
}, show:function() {
  this.setVisible(true)
}, toggle:function() {
  this.setVisible(!this.getVisible())
}, addLayer:function(evt) {
  if(evt.layer) {
    evt.layer.events.register("loadstart", this, this.increaseCounter);
    evt.layer.events.register("loadend", this, this.decreaseCounter)
  }
}, setMap:function(map) {
  OpenLayers.Control.prototype.setMap.apply(this, arguments);
  this.map.events.register("preaddlayer", this, this.addLayer);
  for(var i = 0;i < this.map.layers.length;i++) {
    var layer = this.map.layers[i];
    layer.events.register("loadstart", this, this.increaseCounter);
    layer.events.register("loadend", this, this.decreaseCounter)
  }
}, increaseCounter:function() {
  this.counter++;
  if(this.counter > 0) {
    if(!this.maximized && this.visible) {
      this.maximizeControl()
    }
  }
}, decreaseCounter:function() {
  if(this.counter > 0) {
    this.counter--
  }
  if(this.counter == 0) {
    if(this.maximized && this.visible) {
      this.minimizeControl()
    }
  }
}, draw:function() {
  OpenLayers.Control.prototype.draw.apply(this, arguments);
  return this.div
}, minimizeControl:function(evt) {
  this.div.style.display = "none";
  this.maximized = false;
  if(evt != null) {
    OpenLayers.Event.stop(evt)
  }
}, maximizeControl:function(evt) {
  this.div.style.display = "block";
  this.maximized = true;
  if(evt != null) {
    OpenLayers.Event.stop(evt)
  }
}, destroy:function() {
  if(this.map) {
    this.map.events.unregister("preaddlayer", this, this.addLayer);
    if(this.map.layers) {
      for(var i = 0;i < this.map.layers.length;i++) {
        var layer = this.map.layers[i];
        layer.events.unregister("loadstart", this, this.increaseCounter);
        layer.events.unregister("loadend", this, this.decreaseCounter)
      }
    }
  }
  OpenLayers.Control.prototype.destroy.apply(this, arguments)
}, CLASS_NAME:"OpenLayers.Control.LoadingPanel"});
// Input 8
Ext.define("FlamingoLayer", {extend:"Layer", constructor:function(config) {
  this.initConfig(config);
  return this
}, toXML:function() {
  throw"FlamingoLayer.toXML(): .toXML() must be made!";
}, getTagName:function() {
  throw"FlamingoLayer.getTagName: .getTagName() must be made!";
}, getOption:function(optionKey) {
  var availableOptions = "";
  for(var op in this.options) {
    if(op.toLowerCase() == optionKey.toLowerCase()) {
      return this.options[op]
    }
    availableOptions += op + ","
  }
  return null
}, setOption:function(optionKey, optionValue) {
  this.options[optionKey] = optionValue
}, getId:function() {
  return this.id
}});
// Input 9
Ext.define("FlamingoArcIMSLayer", {extend:"FlamingoLayer", constructor:function(config) {
  this.initConfig(config);
  return this
}, getTagName:function() {
  return"LayerArcIMS"
}, toXML:function() {
  var xml = "<fmc:";
  xml += this.getTagName();
  xml += ' xmlns:fmc="fmc"';
  xml += ' id="' + this.getId() + '"';
  if(this.getOption("sld") && this.getOption("url")) {
    xml += this.getOption("url").indexOf("?") >= 0 ? "&" : "?";
    xml += "sld=" + this.getOption("sld") + "&"
  }
  for(var optKey in this.options) {
    if(optKey.toLowerCase() == "url" || optKey.toLowerCase() == "sld") {
    }else {
      xml += " " + optKey + '="' + this.options[optKey] + '"'
    }
  }
  xml += ' name="' + this.getOption("name") + '"';
  xml += ' server="' + this.getOption("server") + '"';
  xml += ' servlet="' + this.getOption("servlet") + '"';
  xml += ' mapservice="' + this.getOption("mapservice") + '"';
  xml += ">";
  for(var i = 0;i < this.getMapTips().length;i++) {
    var maptip = this.getMapTips()[i];
    xml += "<layer";
    xml += ' id="' + maptip.layer + '"';
    if(maptip.mapTipField != null) {
      xml += ' maptip="' + maptip.mapTipField + '"'
    }
    if(maptip.aka != null) {
      xml += ' aka="' + maptip.aka + '"'
    }
    xml += "/>"
  }
  xml += "</fmc:" + this.getTagName() + ">";
  return xml
}, getId:function() {
  return this.id
}, reload:function() {
  this.getFrameworkLayer().callMethod(webMapController.getMap().getId() + "_" + this.getId(), "setConfig", this.toXML())
}, getName:function() {
  return this.options["name"]
}, getServer:function() {
  return this.options["server"]
}, getService:function() {
  return this.options["service"]
}, getServlet:function() {
  return this.options["servlet"]
}, getMapservice:function() {
  return this.options["mapservice"]
}});
// Input 10
Ext.define("FlamingoWMSLayer", {extend:"FlamingoLayer", constructor:function(config) {
  this.initConfig(config);
  return this
}, getTagName:function() {
  return"LayerOGWMS"
}, getURL:function() {
  return this.url
}, setURL:function(url) {
  this.url = url
}, toXML:function() {
  var xml = "<fmc:";
  xml += this.getTagName();
  xml += ' xmlns:fmc="fmc"';
  xml += ' id="' + this.getId() + '"';
  xml += ' initService="' + this.getOption("initService") + '"';
  xml += ' url="' + this.getOption("url");
  if(this.getOption("sld") && this.getOption("url")) {
    xml += this.getOption("url").indexOf("?") >= 0 ? "&" : "?";
    xml += "sld=" + this.getOption("sld") + "&"
  }
  xml += '"';
  for(var optKey in this.options) {
    if(optKey.toLowerCase() == "url" || optKey.toLowerCase() == "sld") {
    }else {
      xml += " " + optKey + '="' + this.options[optKey] + '"'
    }
  }
  xml += ">";
  for(var i = 0;i < this.getMapTips().length;i++) {
    var maptip = this.getMapTips()[i];
    xml += "<layer";
    xml += ' id="' + maptip.layer + '"';
    if(maptip.mapTipField != null) {
      xml += ' maptip="' + maptip.mapTipField + '"'
    }
    if(maptip.aka != null) {
      xml += ' aka="' + maptip.aka + '"'
    }
    xml += "/>"
  }
  xml += "</fmc:" + this.getTagName() + ">";
  return xml
}, getId:function() {
  return this.id
}, reload:function() {
  this.getFrameworkLayer().callMethod(webMapController.getMap().getId() + "_" + this.getId(), "setConfig", this.toXML())
}});
// Input 11
Ext.define("FlamingoVectorLayer", {extend:"FlamingoLayer", layerName:"layer1", constructor:function(config) {
  this.superclass.constructor.call(this, config);
  this.initConfig(config);
  return this
}, toXML:function() {
  return""
}, getLayerName:function() {
  return this.layerName
}, removeAllFeatures:function() {
  var flamingoObj = mapViewer.wmc.viewerObject;
  flamingoObj.callMethod(this.getId(), "removeAllFeatures")
}, getActiveFeature:function() {
  var flamingoObj = mapViewer.wmc.viewerObject;
  var flaFeature = flamingoObj.callMethod(this.id, "getActiveFeature");
  if(flaFeature == null) {
    return null
  }
  var featureObj = new Feature;
  var feature = featureObj.fromFlamingoFeature(flaFeature);
  return feature
}, getFeature:function(index) {
  return this.getAllFeatures()[index]
}, addFeature:function(feature) {
  var flamingoObj = mapViewer.wmc.viewerObject;
  flamingoObj.callMethod(this.getId(), "addFeature", this.getLayerName(), feature.toFlamingoFeature())
}, getAllFeatures:function() {
  var flamingoObj = mapViewer.wmc.viewerObject;
  var flamingoFeatures = flamingoObj.callMethod(this.getId(), "getAllFeaturesAsObject");
  var features = new Array;
  var featureObj = new Feature;
  for(var i = 0;i < flamingoFeatures.length;i++) {
    var flFeature = flamingoFeatures[i];
    var feature = featureObj.fromFlamingoFeature(flFeature);
    features.push(feature)
  }
  return features
}, drawFeature:function(type) {
  mapViewer.wmc.viewerObject.callMethod(this.getId(), "editMapDrawNewGeometry", this.getLayerName(), type)
}, stopDrawDrawFeature:function() {
  mapViewer.wmc.viewerObject.callMethod(this.getId(), "removeEditMapCreateGeometry", this.getLayerName())
}});
// Input 12
Ext.define("FlamingoMap", {extend:"Map", constructor:function(config) {
  this.superclass.constructor.call(this, config);
  this.initConfig(config);
  return this
}, getId:function() {
  return this.id
}, getAllWMSLayers:function() {
  var lagen = new Array;
  for(var i = 0;i < this.layers.length;i++) {
    if(this.layers[i] instanceof FlamingoWMSLayer) {
      lagen.push(this.layers[i])
    }
  }
  return lagen
}, getAllVectorLayers:function() {
  var lagen = new Array;
  for(var i = 0;i < this.layers.length;i++) {
    if(this.layers[i] instanceof FlamingoVectorLayer) {
      lagen.push(this.layers[i])
    }
  }
  return lagen
}, remove:function() {
  this.getFrameworkMap().callMethod("flamingo", "killComponent", this.getId())
}, addLayer:function(layer) {
  if(!(layer instanceof FlamingoLayer)) {
    throw"FlamingoMap.addLayer(): Given layer not of type FlamingoLayer";
  }
  this.superclass.addLayer.call(this, layer);
  if(!(layer instanceof FlamingoVectorLayer)) {
    this.getFrameworkMap().callMethod(this.getId(), "addLayer", layer.toXML())
  }
}, removeLayer:function(layer) {
  if(!(layer instanceof FlamingoLayer)) {
    throw"FlamingoMap.removeLayer(): Given layer not of type FlamingoLayer";
  }
  Map.prototype.removeLayer.call(this, layer);
  if(!(layer instanceof FlamingoVectorLayer)) {
    this.getFrameworkMap().callMethod(this.getId(), "removeLayer", this.getId() + "_" + layer.getId())
  }
}, setLayerIndex:function(layer, newIndex) {
  if(!(layer instanceof FlamingoLayer)) {
    throw"FlamingoMap.setLayerIndex(): Given layer not of type FlamingoLayer.";
  }
  if(!(layer instanceof FlamingoVectorLayer)) {
    this.getFrameworkMap().callMethod(this.getId(), "swapLayer", this.getId() + "_" + layer.getId(), newIndex)
  }
  return Map.prototype.setLayerIndex(layer, newIndex)
}, zoomToExtent:function(extent) {
  this.getFrameworkMap().callMethod(this.getId(), "moveToExtent", extent, 0)
}, zoomToMaxExtent:function() {
  this.zoomToExtent(this.getFrameworkMap().callMethod(this.getId(), "getFullExtent"))
}, zoomToResolution:function(resolution) {
  this.getFrameworkMap().callMethod(this.getId(), "moveToScale", resolution, undefined, 0)
}, zoomToScale:function(resolution) {
  this.zoomToResolution(resolution)
}, setMaxExtent:function(extent) {
  this.getFrameworkMap().callMethod(this.getId(), "setFullExtent", extent)
}, getMaxExtent:function() {
  var extent = this.getFrameworkMap().callMethod(this.getId(), "getFullExtent");
  return new Extent(extent.minx, extent.miny, extent.maxx, extent.maxy)
}, doIdentify:function(x, y) {
  throw"Map.doIdentify() Not implemented!";
}, getExtent:function() {
  var extent = this.getFrameworkMap().callMethod(this.getId(), "getExtent");
  return new Extent(extent.minx, extent.miny, extent.maxx, extent.maxy)
}, update:function() {
  this.getFrameworkMap().callMethod(this.getId(), "update", 100, true)
}, setMarker:function(markerName, x, y, type) {
  this.getFrameworkMap().callMethod(this.getId(), "setMarker", markerName, type, Number(x), Number(y))
}, removeMarker:function(markerName) {
  this.getFrameworkMap().callMethod(this.getId(), "removeMarker", markerName)
}, getScale:function() {
  return this.getResolution()
}, getResolution:function() {
  return this.getFrameworkMap().callMethod(this.getId(), "getScaleHint")
}, coordinateToPixel:function(x, y) {
  return this.getFrameworkMap().callMethod(this.getId(), "coordinate2Point", {x:x, y:y})
}, getCenter:function() {
  return this.getFrameworkMap().callMethod(this.getId(), "getCenter")
}});
// Input 13
Ext.define("FlamingoTool", {extend:"Tool", constructor:function(config) {
  this.initConfig(config);
  return this
}, setVisible:function(visibility) {
  this.getFrameworkTool().callMethod(this.getId(), "setVisible", visibility)
}});
// Input 14
function Controller(viewerObject) {
  this.maps = new Array;
  this.tools = new Array;
  this.events = new Array;
  this.panel = null;
  this.eventList = new Array;
  this.addEvents(Event.ON_CONFIG_COMPLETE);
  webMapController = this
}
var webMapController = null;
Ext.extend(Controller, Ext.util.Observable, {});
Controller.prototype.getId = function() {
  return"Controller"
};
Controller.prototype.createWMSLayer = function(name, url, ogcParams, options) {
  throw"Controller.createWMSLayer() Not implemented! Must be implemented in sub-class";
};
Controller.prototype.createTMSLayer = function(id, name, url, options) {
  throw"Controller.createTMSLayer() Not implemented! Must be implemented in sub-class";
};
Controller.prototype.createMap = function(id, options) {
  throw"Controller.createMap(...) not implemented! Must be implemented in sub-class";
};
Controller.prototype.createTool = function() {
  throw"Controller.createTool(...) not implemented! Must be implemented in sub-class";
};
Controller.prototype.addTools = function(tools) {
  for(var i = 0;i < tools.length;i++) {
    addTool(tools[i])
  }
};
Controller.prototype.addTool = function(tool) {
  if(!(tool instanceof Tool)) {
    throw"Given tool not of type 'Tool'";
  }
  this.tools.push(tool)
};
Controller.prototype.removeTool = function(tool) {
  if(!(tool instanceof Tool)) {
    throw"Given tool not of type 'Tool'";
  }
  for(var i = 0;i < this.tools;i++) {
    if(this.tools[i] == tool) {
      this.tools.splice(i, 1);
      return
    }
  }
};
Controller.prototype.getTool = function(id) {
  for(var i = 0;i < this.tools.length;i++) {
    var tool = this.tools[i];
    if(tool.getId() == id) {
      return tool
    }
  }
  return null
};
Controller.prototype.getToolsByType = function(type) {
  var foundTools = new Array;
  for(var i = 0;i < this.tools.length;i++) {
    if(this.tools[i].getType() == type) {
      foundTools.push(this.tools[i])
    }
  }
  return foundTools
};
Controller.prototype.removeToolById = function(id) {
  throw"Controller.removeToolById() Not implemented! Must be implemented in sub-class";
};
Controller.prototype.addMap = function(mapObject) {
  throw"Controller.addMap() Not implemented! Must be implemented in sub-class";
};
Controller.prototype.getMap = function(mapId) {
  throw"Controller.getMap() Not implemented! Must be implemented in sub-class";
};
Controller.prototype.removeMap = function(removeMap) {
  throw"Controller.removeMap() Not implemented! Must be implemented in sub-class";
};
Controller.prototype.createVectorLayer = function(name) {
  throw"Controller.createVectorLayer() Not implemented! Must be implemented in sub-class";
};
Controller.prototype.createImageLayer = function(name, url, bounds, size, options) {
  throw"Controller.createImageLayer() Not implemented! Must be implemented in sub-class";
};
Controller.prototype.createPanel = function(name) {
  throw"Controller.createPanel() Not implemented! Must be implemented in sub-class";
};
Controller.prototype.registerEvent = function(event, object, handler) {
  throw"Controller.registerEvent() Not implemented! Must be implemented in sub-class";
};
Controller.prototype.unRegisterEvent = function(event, object) {
  throw"Controller.unRegisterEvent() Not implemented! Must be implemented in sub-class";
};
Controller.prototype.handleEvents = function(event) {
  throw"Controller.handleEvents() Not implemented! Must be implemented in sub-class";
};
Controller.prototype.initEvents = function() {
  throw"Controller.initEvent() Not implemented! Must be implemented in sub-class";
};
Controller.prototype.getGenericEventName = function(specific) {
  if(this.eventList.length == 0) {
    this.initEvents()
  }
  for(var key in this.eventList) {
    if(this.eventList[key] == specific) {
      return key
    }
  }
  throw"Event " + specific + " does not exist!";
};
Controller.prototype.getSpecificEventName = function(generic) {
  return this.eventList[generic]
};
Controller.prototype.activateTool = function(id) {
  throw"Controller.activateTool() Not implemented! Must be implemented in sub-class";
};
// Input 15
function FlamingoController(domId) {
  var so = new SWFObject("flamingo/flamingo.swf?config=/config.xml", "flamingo", "100%", "100%", "8", "#FFFFFF");
  so.addParam("wmode", "transparent");
  so.write(domId);
  this.viewerObject = document.getElementById("flamingo");
  Controller.call(this, domId)
}
FlamingoController.prototype = new Controller;
FlamingoController.prototype.constructor = FlamingoController;
FlamingoController.prototype.initEvents = function() {
  this.eventList[Event.ON_EVENT_DOWN] = "onEvent";
  this.eventList[Event.ON_EVENT_UP] = "onEvent";
  this.eventList[Event.ON_GET_CAPABILITIES] = "onGetCapabilities";
  this.eventList[Event.ON_CONFIG_COMPLETE] = "onConfigComplete";
  this.eventList[Event.ON_FEATURE_ADDED] = "onGeometryDrawFinished";
  this.eventList[Event.ON_REQUEST] = "onRequest";
  this.eventList[Event.ON_SET_TOOL] = "onSetTool";
  this.eventList[Event.ON_GET_FEATURE_INFO] = "onIdentify";
  this.eventList[Event.ON_GET_FEATURE_INFO_DATA] = "onIdentifyData";
  this.eventList[Event.ON_ALL_LAYERS_LOADING_COMPLETE] = "onUpdateComplete";
  this.eventList[Event.ON_FINISHED_CHANGE_EXTENT] = "onReallyChangedExtent";
  this.eventList[Event.ON_CHANGE_EXTENT] = "onChangeExtent"
};
FlamingoController.prototype.createMap = function(id, options) {
  var config = {id:id};
  var map = new FlamingoMap(config);
  var maxExtent = options["maxExtent"];
  return map
};
FlamingoController.prototype.createWMSLayer = function(name, url, ogcParams, options) {
  var object = new Object;
  object["name"] = name;
  object["url"] = url;
  var ide = null;
  for(var key in ogcParams) {
    object[key] = ogcParams[key]
  }
  for(var key in options) {
    if(key.toLowerCase() == "id") {
      ide = options[key]
    }else {
      object[key] = options[key]
    }
  }
  if(ide == null) {
    ide = name
  }
  var config = {id:ide, options:object, frameworkObject:new Object};
  return new FlamingoWMSLayer(config)
};
FlamingoController.prototype.createArcIMSLayer = function(name, server, servlet, mapservice, ogcParams, options) {
  var object = new Object;
  object["name"] = name;
  object["server"] = server;
  object["servlet"] = servlet;
  object["mapservice"] = mapservice;
  var ide = null;
  for(var key in ogcParams) {
    object[key] = ogcParams[key]
  }
  for(var key in options) {
    if(key.toLowerCase() == "id") {
      ide = options[key]
    }else {
      object[key] = options[key]
    }
  }
  var config = {id:ide, options:object};
  return new FlamingoArcIMSLayer(config)
};
FlamingoController.prototype.createTool = function(ide, type, options) {
  var config = {id:ide, frameworkObject:new Object};
  var tool = new FlamingoTool(config);
  if(type == Tool.GET_FEATURE_INFO) {
    webMapController.registerEvent(Event.ON_GET_FEATURE_INFO, webMapController.getMap(), options["handlerBeforeGetFeatureHandler"]);
    webMapController.registerEvent(Event.ON_GET_FEATURE_INFO_DATA, webMapController.getMap(), options["handlerGetFeatureHandler"])
  }
  return tool
};
FlamingoController.prototype.createVectorLayer = function(identification) {
  var config = {id:identification, frameworkObject:new Object};
  return new FlamingoVectorLayer(config)
};
FlamingoController.prototype.createPanel = function(name) {
  this.panel = name
};
FlamingoController.prototype.addTool = function(tool) {
  if(!(tool instanceof FlamingoTool)) {
    throw"The given tool is not of type 'FlamingoTool'";
  }
  this.viewerObject.callMethod(tool.getId(), "setVisible", true);
  Controller.prototype.addTool.call(this, tool)
};
FlamingoController.prototype.activateTool = function(id) {
  this.viewerObject.call(this.panel, "setTool", id)
};
FlamingoController.prototype.removeTool = function(tool) {
  if(!(tool instanceof FlamingoTool)) {
    throw"The given tool is not of type 'FlamingoTool'";
  }
  this.viewerObject.callMethod(tool.getId(), "setVisible", false);
  Controller.prototype.removeTool.call(this, tool)
};
FlamingoController.prototype.addMap = function(map) {
  if(!(map instanceof FlamingoMap)) {
    throw"FlamingoController.addMap(): The given map is not of the type 'FlamingoMap'";
  }
  this.maps.push(map)
};
FlamingoController.prototype.removeToolById = function(id) {
  var tool = this.getTool(id);
  if(tool == null || !(tool instanceof FlamingoTool)) {
    throw"The given tool is not of type 'FlamingoTool' or the given id does not exist";
  }
  this.removeTool(tool)
};
FlamingoController.prototype.getMap = function(mapId) {
  if(mapId == undefined && this.maps.length == 1) {
    return this.maps[0]
  }
  var availableMaps = "";
  for(var i = 0;i < this.maps.length;i++) {
    if(i != 0) {
      availableMaps += ","
    }
    availableMaps += this.maps[i].getId();
    if(this.maps[i].getId() == mapId) {
      return this.maps[i]
    }
  }
  return null
};
FlamingoController.prototype.registerEvent = function(event, object, handler) {
  if(object instanceof Ext.util.Observable) {
    if(object == this) {
      this.addListener(event, handler)
    }else {
      object.registerEvent(event, handler)
    }
  }else {
    alert("Unmapped event:", event);
    if(this.events[event] == undefined) {
      this.events[event] = new Object
    }
    if(this.events[event][object.getId()] == undefined) {
      this.events[event][object.getId()] = new Array
    }
    this.events[event][object.getId()].push(handler)
  }
};
FlamingoController.prototype.unRegisterEvent = function(event, object, handler) {
  var newHandlerArray = new Array;
  for(var i = 0;i < this.events[event][object.getId()].length;i++) {
    if(handler != this.events[event][object.getId()][i]) {
      newHandlerArray.push(this.events[event][object.getId()][i])
    }
  }
  if(newHandlerArray.length == 0) {
    delete this.events[event][object.getId()]
  }else {
    this.events[event][object.getId()] = newHandlerArray
  }
};
FlamingoController.prototype.getObject = function(name) {
  if(name instanceof Array) {
    name = name[0]
  }
  if(this.getMap(name) != null) {
    return this.getMap(name)
  }else {
    if(this.getMap().getLayer(name.replace(this.getMap().getId() + "_", "")) != null) {
      return this.getMap().getLayer(name.replace(this.getMap().getId() + "_", ""))
    }else {
      if(this.getTool(name) != null) {
        return this.getTool(name)
      }else {
        if(name == this.getId()) {
          return this
        }else {
          return null
        }
      }
    }
  }
};
FlamingoController.prototype.handleEvents = function(event, component) {
  var id = component[0];
  if(event == "onEvent") {
    if(component[1]["down"]) {
      event = Event.ON_EVENT_DOWN
    }else {
      event = Event.ON_EVENT_UP
    }
  }else {
    event = this.getGenericEventName(event)
  }
  if(event == Event.ON_REQUEST) {
    var obj = component[2];
    if(obj.requesttype == "GetMap") {
      var tokens = component[0].split("_");
      if(tokens.length == 2) {
        this.getMap(tokens[0]).getLayer(tokens[1]).setURL(obj.url)
      }
      if(tokens.length == 3) {
        this.getMap(tokens[0]).getLayer(tokens[1] + "_" + tokens[2]).setURL(obj.url)
      }
    }
  }else {
    if(event == Event.ON_SET_TOOL) {
      id = this.getId()
    }else {
      if(event == Event.ON_FEATURE_ADDED) {
        var feature = new Feature(id, component[1]);
        component = feature
      }else {
        if(event == Event.ON_GET_FEATURE_INFO) {
          component = component[1]
        }else {
          if(event == Event.ON_GET_FEATURE_INFO_DATA) {
            component = component[2]
          }
        }
      }
    }
  }
  var object = this.getObject(id);
  if(object != undefined) {
    object.fire(event)
  }else {
    alert("Event niet gemapped:", event);
    for(var i = 0;i < this.events[event][id].length;i++) {
      this.events[event][id][i](id, component)
    }
  }
};
FlamingoController.prototype.fire = function(event, options) {
  this.fireEvent(event, this, options)
};
function dispatchEventJS(event, comp) {
  if(comp[0] == null) {
    comp[0] = webMapController.getId();
    comp[1] = new Object
  }
  if(event == "onConfigComplete") {
    var a = 0
  }
  mapViewer.wmc.handleEvents(event, comp)
}
;
// Input 16
function OpenLayersController() {
  this.pointButton = null;
  this.lineButton = null;
  this.polygonButton = null;
  Controller.call(this, "")
}
OpenLayersController.prototype = new Controller;
OpenLayersController.prototype.constructor = OpenLayersController;
OpenLayersController.prototype.initEvents = function() {
  this.eventList[Event.ON_EVENT_DOWN] = "activate";
  this.eventList[Event.ON_EVENT_UP] = "deactivate";
  this.eventList[Event.ON_GET_CAPABILITIES] = "onGetCapabilities";
  this.eventList[Event.ON_CONFIG_COMPLETE] = "onConfigComplete";
  this.eventList[Event.ON_FEATURE_ADDED] = "featureadded";
  this.eventList[Event.ON_CLICK] = "click";
  this.eventList[Event.ON_SET_TOOL] = "activate";
  this.eventList[Event.ON_ALL_LAYERS_LOADING_COMPLETE] = "onUpdateComplete";
  this.eventList[Event.ON_LOADING_START] = "loadstart";
  this.eventList[Event.ON_LOADING_END] = "loadend";
  this.eventList[Event.ON_MEASURE] = "measure";
  this.eventList[Event.ON_FINISHED_CHANGE_EXTENT] = "zoomend";
  this.eventList[Event.ON_CHANGE_EXTENT] = "move"
};
OpenLayersController.prototype.getPanel = function() {
  if(this.panel == null) {
    this.panel = new OpenLayers.Control.Panel;
    this.maps[0].getFrameworkMap().addControl(this.panel)
  }
  return this.panel
};
OpenLayersController.prototype.createPanel = function(id) {
  var paneel = new OpenLayers.Control.Panel;
  this.panel = paneel;
  this.maps[0].getFrameworkMap().addControl(this.panel)
};
OpenLayersController.prototype.createMap = function(id, options) {
  if(!options["theme"]) {
    options["theme"] = OpenLayers._getScriptLocation() + "theme/b3p/style.css"
  }
  Ext.fly(id).replaceWith({tag:"div", id:id, style:{border:"1px solid black"}});
  var maxExtent = options["maxExtent"];
  var maxBounds = new OpenLayers.Bounds(maxExtent.minx, maxExtent.miny, maxExtent.maxx, maxExtent.maxy);
  options["maxExtent"] = maxBounds;
  var map = new OpenLayers.Map(id, options);
  map.events.register("click", webMapController, webMapController.onIdentifyHandler);
  return new OpenLayersMap(map)
};
OpenLayersController.prototype.createWMSLayer = function(name, wmsurl, ogcParams, options) {
  options["id"] = null;
  options["isBaseLayer"] = false;
  options["singleTile"] = true;
  options["transitionEffect"] = "resize";
  options["events"] = new Object;
  var wmsLayer = new OpenLayersWMSLayer(new OpenLayers.Layer.WMS(name, wmsurl, ogcParams, options), name);
  if(ogcParams["query_layers"] != null && ogcParams["query_layers"] != "") {
    var info = new OpenLayers.Control.WMSGetFeatureInfo({url:wmsurl, title:"Identify features by clicking", queryVisible:true, layers:[wmsLayer.getFrameworkLayer()], queryLayers:ogcParams["query_layers"], infoFormat:"text/xml"});
    info.request = doGetFeatureRequest;
    wmsLayer.setGetFeatureInfoControl(info)
  }
  if(options["maptip_layers"] != null && options["maptip_layers"] != "") {
    var maptip = new OpenLayers.Control.WMSGetFeatureInfo({url:wmsurl, title:"Identify features by clicking", queryVisible:true, layers:[wmsLayer.getFrameworkLayer()], queryLayers:options["maptip_layers"], infoFormat:"application/vnd.ogc.gml", hover:true});
    maptip.request = doGetFeatureRequest;
    wmsLayer.setMapTipControl(maptip)
  }
  return wmsLayer
};
OpenLayersController.prototype.createTMSLayer = function(name, url, options) {
  var tmsLayer = new OpenLayersTMSLayer(new OpenLayers.Layer.TMS(name, url, options), name);
  return tmsLayer
};
OpenLayersController.prototype.createImageLayer = function(name, url, bounds, size, options) {
  var imageLayer = new OpenLayersImageLayer(new OpenLayers.Layer.Image(name, url, bounds, size, options));
  return imageLayer
};
OpenLayersController.prototype.createTool = function(id, type, options) {
  if(type == Tool.DRAW_FEATURE) {
    var layer = options["layer"];
    var toolbar = new OpenLayers.Control.EditingToolbar(layer.getFrameworkLayer());
    this.pointButton = new OpenLayersTool(id + "_point", toolbar.controls[1], type);
    this.lineButton = new OpenLayersTool(id + "_line", toolbar.controls[2], type);
    this.polygonButton = new OpenLayersTool(id + "_polygon", toolbar.controls[3], type);
    var openLayersTools = new Array;
    openLayersTools.push(this.pointButton);
    openLayersTools.push(this.lineButton);
    openLayersTools.push(this.polygonButton);
    return openLayersTools
  }else {
    if(type == Tool.DRAW_FEATURE_POINT) {
      var layer = options["layer"];
      var toolbar = new OpenLayers.Control.EditingToolbar(layer.getFrameworkLayer());
      this.pointButton = new OpenLayersTool(id, toolbar.controls[1], type);
      return this.pointButton
    }else {
      if(type == Tool.DRAW_FEATURE_LINE) {
        var layer = options["layer"];
        var toolbar = new OpenLayers.Control.EditingToolbar(layer.getFrameworkLayer());
        this.lineButton = new OpenLayersTool(id, toolbar.controls[2], type);
        return this.lineButton
      }else {
        if(type == Tool.DRAW_FEATURE_POLYGON) {
          var layer = options["layer"];
          var toolbar = new OpenLayers.Control.EditingToolbar(layer.getFrameworkLayer());
          this.polygonButton = new OpenLayersTool(id, toolbar.controls[3], type);
          return this.polygonButton
        }else {
          if(type == Tool.NAVIGATION_HISTORY) {
            return new OpenLayersTool(id, new OpenLayers.Control.NavigationHistory(options), type)
          }else {
            if(type == Tool.ZOOM_BOX) {
              return new OpenLayersTool(id, new OpenLayers.Control.ZoomBox(options), type)
            }else {
              if(type == Tool.PAN) {
                return new OpenLayersTool(id, new OpenLayers.Control.DragPan(options), type)
              }else {
                if(type == Tool.BUTTON) {
                  if(!options) {
                    options = new Object
                  }
                  options["displayClass"] = "olControl" + id;
                  options["type"] = OpenLayers.Control.TYPE_BUTTON;
                  return new OpenLayersTool(id, new OpenLayers.Control(options), type)
                }else {
                  if(type == Tool.TOGGLE) {
                    if(!options) {
                      options = new Object
                    }
                    options["displayClass"] = "olControl" + id;
                    options["type"] = OpenLayers.Control.TYPE_TOGGLE;
                    return new OpenLayersTool(id, new OpenLayers.Control(options), type)
                  }else {
                    if(type == Tool.CLICK) {
                      if(!options) {
                        options = new Object
                      }
                      options["displayClass"] = "olControl" + id;
                      return new OpenLayersTool(id, new OpenLayers.Control.Click(options), type)
                    }else {
                      if(type == Tool.LOADING_BAR) {
                        return new OpenLayersTool(id, new OpenLayers.Control.LoadingPanel(options), type)
                      }else {
                        if(type == Tool.GET_FEATURE_INFO) {
                          if(!options) {
                            options = new Object
                          }
                          options["displayClass"] = "olControl" + id;
                          options["type"] = OpenLayers.Control.TYPE_TOOL;
                          var identifyTool = new OpenLayersIdentifyTool(id, new OpenLayers.Control(options), type);
                          identifyTool.getFrameworkTool().events.register("activate", this, this.activateGetFeatureControls);
                          identifyTool.getFrameworkTool().events.register("deactivate", this, this.deactivateGetFeatureControls);
                          identifyTool.setGetFeatureInfoHandler(options["handlerGetFeatureHandler"]);
                          identifyTool.setBeforeGetFeatureInfoHandler(options["handlerBeforeGetFeatureHandler"]);
                          return identifyTool
                        }else {
                          if(type == Tool.MEASURE) {
                            if(!options) {
                              options = new Object
                            }
                            options["persist"] = true;
                            options["callbacks"] = {modify:function(evt) {
                              if(evt.parent) {
                                var measureValueDiv = document.getElementById("olControlMeasureValue");
                                if(measureValueDiv == undefined) {
                                  measureValueDiv = document.createElement("div");
                                  measureValueDiv.id = "olControlMeasureValue";
                                  measureValueDiv.style.position = "absolute";
                                  this.map.div.appendChild(measureValueDiv);
                                  measureValueDiv.style.zIndex = "10000";
                                  measureValueDiv.className = "olControlMaptip";
                                  var measureValueText = document.createElement("div");
                                  measureValueText.id = "olControlMeasureValueText";
                                  measureValueDiv.appendChild(measureValueText)
                                }
                                var px = this.map.getViewPortPxFromLonLat(new OpenLayers.LonLat(evt.x, evt.y));
                                measureValueDiv.style.top = px.y + "px";
                                measureValueDiv.style.left = px.x + 10 + "px";
                                measureValueDiv.style.display = "block";
                                var measureValueText = document.getElementById("olControlMeasureValueText");
                                var bestLengthTokens = this.getBestLength(evt.parent);
                                measureValueText.innerHTML = bestLengthTokens[0].toFixed(3) + " " + bestLengthTokens[1]
                              }
                            }};
                            var measureTool = new OpenLayersTool(id, new OpenLayers.Control.Measure(OpenLayers.Handler.Path, options), type);
                            measureTool.getFrameworkTool().events.register("measure", measureTool.getFrameworkTool(), function() {
                              var measureValueDiv = document.getElementById("olControlMeasureValue");
                              if(measureValueDiv) {
                                measureValueDiv.style.display = "none"
                              }
                              this.cancel()
                            });
                            measureTool.getFrameworkTool().events.register("deactivate", measureTool.getFrameworkTool(), function() {
                              var measureValueDiv = document.getElementById("olControlMeasureValue");
                              if(measureValueDiv) {
                                measureValueDiv.style.display = "none"
                              }
                            });
                            return measureTool
                          }else {
                            if(type == Tool.SCALEBAR) {
                              return new OpenLayersTool(id, new OpenLayers.Control.ScaleLine(options), type)
                            }else {
                              if(type == Tool.ZOOM_BAR) {
                                return new OpenLayersTool(id, new OpenLayers.Control.PanZoomBar(options), type)
                              }else {
                                if(type == Tool.LAYER_SWITCH) {
                                  return new OpenLayersTool(id, new OpenLayers.Control.LayerSwitcher(options), type)
                                }else {
                                  throw"Type >" + type + "< not recognized. Please use existing type.";
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
OpenLayersController.prototype.activateGetFeatureControls = function() {
  var layers = this.getMap().getAllWMSLayers();
  for(var i = 0;i < layers.length;i++) {
    var con = layers[i].getGetFeatureInfoControl();
    if(con != null) {
      con.activate()
    }
  }
};
OpenLayersController.prototype.deactivateGetFeatureControls = function() {
  var layers = this.getMap().getAllWMSLayers();
  for(var i = 0;i < layers.length;i++) {
    var con = layers[i].getGetFeatureInfoControl();
    if(con != null) {
      con.deactivate()
    }
  }
};
OpenLayersController.prototype.addTool = function(tool) {
  if(this.maps.length == 0) {
    throw"No map in Controller!";
  }
  if(tool instanceof Array) {
    for(var i = 0;i < tool.length;i++) {
      this.getMap().getFrameworkMap().addControl(tool[i].getFrameworkTool());
      this.addTool(tool[i]);
      Controller.prototype.addTool.call(this, tool[i])
    }
  }else {
    if(tool.getType() == Tool.NAVIGATION_HISTORY) {
      this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
      this.getPanel().addControls([tool.getFrameworkTool().previous, tool.getFrameworkTool().next])
    }else {
      if(tool.getType() == Tool.CLICK) {
        this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
        this.getPanel().addControls([tool.getFrameworkTool().button])
      }else {
        if(tool.getType() == Tool.LOADING_BAR) {
          this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool())
        }else {
          if(tool.getType() == Tool.GET_FEATURE_INFO) {
            this.getPanel().addControls([tool.getFrameworkTool()]);
            this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool())
          }else {
            if(tool.getType() == Tool.SCALEBAR) {
              this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool())
            }else {
              if(tool.getType() == Tool.ZOOM_BAR) {
                this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool())
              }else {
                this.getPanel().addControls([tool.getFrameworkTool()])
              }
            }
          }
        }
      }
    }
  }
  if(!(tool instanceof Array)) {
    Controller.prototype.addTool.call(this, tool)
  }
};
OpenLayersController.prototype.removeToolById = function(id) {
  var tool = this.getTool(id);
  this.removeTool(tool)
};
OpenLayersController.prototype.removeTool = function(tool) {
  if(!(tool instanceof OpenLayersTool)) {
    throw"The given tool is not of type 'OpenLayersTool'";
  }
  if(tool.type == Tool.NAVIGATION_HISTORY) {
    OpenLayers.Util.removeItem(this.getPanel().controls, tool.getFrameworkTool().next);
    OpenLayers.Util.removeItem(this.getPanel().controls, tool.getFrameworkTool().previous);
    tool.getFrameworkTool().destroy()
  }else {
    OpenLayers.Util.removeItem(this.getPanel().controls, tool.getFrameworkTool())
  }
  this.maps[0].getFrameworkMap().removeControl(tool.getFrameworkTool());
  if(this.getPanel().controls.length == 0) {
    this.getPanel().destroy();
    this.panel = null
  }else {
    this.getPanel().redraw()
  }
  Controller.prototype.removeTool.call(this, tool)
};
OpenLayersController.prototype.addMap = function(map) {
  if(!(map instanceof OpenLayersMap)) {
    throw"The given map is not of the type 'OpenLayersMap'";
  }
  if(this.maps.length >= 1) {
    throw"Multiple maps not supported yet";
  }
  this.maps.push(map);
  map.getFrameworkMap().events.register("mousemove", this, this.removeMaptip)
};
OpenLayersController.prototype.getMap = function(mapId) {
  return this.maps[0]
};
OpenLayersController.prototype.removeMap = function(removeMap) {
  removeMap.remove();
  this.maps = new Array
};
OpenLayersController.prototype.createVectorLayer = function(id, options) {
  if(options == undefined) {
    options = new Object;
    options["isBaseLayer"] = false
  }else {
    if(options["isBaseLayer"] == undefined) {
      options["isBaseLayer"] = false
    }
  }
  return new OpenLayersVectorLayer(new OpenLayers.Layer.Vector(id, options), id)
};
OpenLayersController.prototype.activateTool = function(id) {
  var tools = this.tools;
  for(var i = 0;i < tools.length;i++) {
    tools[i].getFrameworkTool().deactivate()
  }
  var tool = this.getTool(id);
  tool.getFrameworkTool().activate()
};
OpenLayersController.prototype.registerEvent = function(event, object, handler, thisObj) {
  object.register(event, handler, thisObj)
};
OpenLayersController.prototype.unRegisterEvent = function(event, object, handler, thisObj) {
  object.unRegister(event, handler, thisObj)
};
OpenLayersController.prototype.register = function(event, handler) {
  var specificName = this.getSpecificEventName(event);
  if(this.events[specificName] == null) {
    this.events[specificName] = new Array
  }
  for(var i = 0;i < this.events[specificName].length;i++) {
    if(this.events[specificName][i] == handler) {
      return
    }
  }
  this.events[specificName].push(handler)
};
OpenLayersController.prototype.unRegister = function(event, handler) {
  var specificName = this.getSpecificEventName(event);
  var newEventHandlers = new Array;
  for(var i = 0;i < this.events[specificName].length;i++) {
    if(this.events[specificName][i] != handler) {
      newEventHandlers.push(this.events[specificName][i])
    }
  }
  this.events[specificName] = newEventHandlers
};
OpenLayersController.prototype.handleEvent = function(event) {
  var handlers = this.events[event];
  for(var i = 0;i < handlers.length;i++) {
    var handler = handlers[i];
    handler()
  }
};
OpenLayersController.prototype.onMapTipHandler = function(data) {
  var allMaptips = "";
  for(var i = 0;i < data.features.length;i++) {
    var featureType = null;
    if(data.features[i].gml) {
      featureType = data.features[i].gml.featureType
    }else {
      if(data.features[i].type) {
        featureType = data.features[i].type
      }
    }
    var maptip = this.getMapTipByFeatureType(featureType);
    if(maptip == null) {
      maptip = this.getMapTips()[0]
    }
    if(maptip != null) {
      var maptipField = maptip.mapTipField;
      for(var f in data.features[i].attributes) {
        if(data.features[i].attributes[f] != null) {
          maptipField = maptipField.replace("[" + f + "]", data.features[i].attributes[f])
        }
      }
      if(!(maptipField.indexOf("[") >= 0)) {
        if(allMaptips.length != 0) {
          allMaptips += "<br/>"
        }
        allMaptips += maptipField
      }
    }
  }
  var maptipDiv = document.getElementById("olControlMapTip");
  if(allMaptips.length > 0) {
    if(maptipDiv == undefined) {
      maptipDiv = document.createElement("div");
      maptipDiv.id = "olControlMapTip";
      maptipDiv.style.position = "absolute";
      data.object.map.div.appendChild(maptipDiv);
      maptipDiv.style.zIndex = "10000";
      maptipDiv.className = "olControlMaptip";
      var maptipText = document.createElement("div");
      maptipText.id = "olControlMaptipText";
      maptipDiv.appendChild(maptipText)
    }
    maptipDiv.style.top = data.xy.y + "px";
    maptipDiv.style.left = data.xy.x + 10 + "px";
    maptipDiv.style.display = "block";
    var maptipText = document.getElementById("olControlMaptipText");
    if(maptipText.innerHTML.length == 0) {
      maptipText.innerHTML = allMaptips
    }else {
      maptipText.innerHTML = maptipText.innerHTML + "<br/>" + allMaptips
    }
  }
};
OpenLayersController.prototype.removeMaptip = function(object) {
  var maptipDiv = document.getElementById("olControlMapTip");
  if(maptipDiv != undefined) {
    maptipDiv.style.display = "none";
    var maptipText = document.getElementById("olControlMaptipText");
    maptipText.innerHTML = ""
  }
};
OpenLayersController.prototype.onIdentifyDataHandler = function(data) {
  var obj = new Object;
  for(var i = 0;i < data.features.length;i++) {
    var featureType = data.features[i].gml.featureType;
    if(obj[featureType] == undefined) {
      obj[featureType] = new Array
    }
    obj[featureType].push(data.features[i].attributes)
  }
  var getFeatureTools = this.getToolsByType(Tool.GET_FEATURE_INFO);
  for(var i = 0;i < getFeatureTools.length;i++) {
    if(getFeatureTools[i].isActive()) {
      getFeatureTools[i].getFeatureInfoHandler("onIdentifyData", obj);
      return
    }
  }
};
OpenLayersController.prototype.onIdentifyHandler = function(extent) {
  var getFeatureTools = this.getToolsByType(Tool.GET_FEATURE_INFO);
  for(var i = 0;i < getFeatureTools.length;i++) {
    if(getFeatureTools[i].isActive()) {
      var pix = extent.xy;
      var lonlat = webMapController.getMap().getFrameworkMap().getLonLatFromPixel(pix);
      var genericExtent = new Extent(lonlat.lon, lonlat.lat, lonlat.lon, lonlat.lat);
      getFeatureTools[i].beforeGetFeatureInfoHandler("onIdentify", genericExtent);
      return
    }
  }
};
Ext.onReady(function() {
  if(webMapController instanceof OpenLayersController) {
    var specificName = webMapController.getSpecificEventName(Event.ON_CONFIG_COMPLETE);
    webMapController.handleEvent(specificName)
  }
});
function doGetFeatureRequest(clickPosition, options) {
  var layers = this.findLayers();
  if(layers.length == 0) {
    this.events.triggerEvent("nogetfeatureinfo");
    OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
    return
  }
  options = options || {};
  if(this.drillDown === false) {
    var wmsOptions = this.buildWMSOptions(this.url, layers, clickPosition, layers[0].params.FORMAT);
    wmsOptions["params"]["STYLES"] = "";
    wmsOptions["params"]["QUERY_LAYERS"] = this.queryLayers.split(",");
    var request = OpenLayers.Request.GET(wmsOptions);
    if(options.hover === true) {
      this.hoverRequest = request
    }
  }else {
    this._requestCount = 0;
    this._numRequests = 0;
    this.features = [];
    var services = {}, url;
    for(var i = 0, len = layers.length;i < len;i++) {
      var layer = layers[i];
      var service, found = false;
      url = layer.url instanceof Array ? layer.url[0] : layer.url;
      if(url in services) {
        services[url].push(layer)
      }else {
        this._numRequests++;
        services[url] = [layer]
      }
    }
    var layers;
    for(var url in services) {
      layers = services[url];
      var wmsOptions = this.buildWMSOptions(url, layers, clickPosition, layers[0].params.FORMAT);
      OpenLayers.Request.GET(wmsOptions)
    }
  }
}
;
// Input 17
