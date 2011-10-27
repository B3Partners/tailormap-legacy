
function OpenLayersTool(id,olControlObject,type,addToPanel){
    this.controls = new Array();
    this.onActiveHandler = new Object();
    Tool.call(this,id,olControlObject,type);
}
OpenLayersTool.prototype = new Tool();
OpenLayersTool.prototype.constructor= OpenLayersTool;

OpenLayersTool.prototype.register = function (event,handler){
    var specificName = webMapController.getSpecificEventName(event);
    if(this.type == Tool.BUTTON){
        this.getFrameworkTool().trigger= handler;
    }else if (this.type== Tool.CLICK){
        this.getFrameworkTool().handler.callbacks[specificName]= function (evt){
            var lonlat= this.map.getLonLatFromViewPortPx(evt.xy);
            handler.call(this,new Extent(lonlat.lat,lonlat.lon,lonlat.lat,lonlat.lon))
        };
    }else if(Event.ON_SET_TOOL == event){
        this.onActiveHandler = handler;
        this.getFrameworkTool().events.register(specificName,this,this.onSetActive);
    } else{
        this.getFrameworkTool().events.register(specificName,this.getFrameworkTool(),handler);
    }
}

OpenLayersTool.prototype.addControl = function(control){
    if (!(this.type == Tool.GET_FEATURE_INFO)){
        throw("The given Control object is not of type get feature info. But: "+this.type);
    }
    this.controls.push(control);
}

OpenLayersTool.prototype.getId = function(){
    return this.id;
}

OpenLayersTool.prototype.setVisible = function(visibility){
    if (visibility){
        this.getFrameworkTool().panel_div.style.display="block";
    }else{
        this.getFrameworkTool().panel_div.style.display="none";
    }
}

OpenLayersTool.prototype.isActive = function (){
    return this.getFrameworkTool().active;
}

OpenLayersTool.prototype.onSetActive = function(data){
    this.onActiveHandler(this.getId(),data);
}