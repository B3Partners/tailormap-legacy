/**  
 * Layer
 * @class 
 * @constructor
 * @description The superclass for all layers 
 * @param frameworkLayer The frameworkspecific layer
 * @param id The id of the layer
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */

function Layer(frameworkLayer,id){
    this.frameworkLayer=frameworkLayer;
    this.id = id;
    this.maptips=new Array();
}

Ext.extend(Layer,Ext.util.Observable,{});
/**
* Get's the frameworklayer: the viewer specific layer.
*/
Layer.prototype.getFrameworkLayer = function(){
    return this.frameworkLayer;
}
/**
     *Gets a option of this layer
     *@return the option value or null if not exists
     */
Layer.prototype.getOption = function(optionKey){
    throw("Layer.getOption() Not implemented! Must be implemented in sub-class");
}
/**
     *sets or overwrites a option
     */
Layer.prototype.setOption = function(optionKey,optionValue){
    throw("Layer.getOption() Not implemented! Must be implemented in sub-class");
}

/**
     *Get the id of this layer
     */
Layer.prototype.getId =function (){
    return this.id;
}
/**
 *Add a maptip to the layer
 */
Layer.prototype.addMapTip = function(maptip){
    this.maptips.push(maptip);
}
/**
 * set a array of maptips
 */
Layer.prototype.setMapTips = function (maptips){
    this.maptips=maptips;
}
/**
 * get a array of maptips
 */
Layer.prototype.getMapTips = function (){
    return this.maptips;
}
/**
 *Gets the feature by a feature type (layername)
 *@param featureType the name of the featuretype returned by the server
 *@return the maptip for this layer/featuretype or null if none found
 */
Layer.prototype.getMapTipByFeatureType = function(featureType){
    for (var m=0; m < this.maptips.length; m++){
        if (this.maptips[m].layer == featureType ||
            this.maptips[m].aka == featureType){
            return this.maptips[m];
        }
    }
    return null;
}

Layer.prototype.fire = function (event,options){
    this.fireEvent(event,this,options);
}

Layer.prototype.registerEvent = function (event,handler){
    this.addListener(event,handler);
}
