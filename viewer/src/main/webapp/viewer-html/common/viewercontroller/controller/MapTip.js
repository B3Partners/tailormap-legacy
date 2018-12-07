/**
 * @class 
 * @description The superclass for a maptip
 * @param layer The layer on which this maptip applies to
 * @param mapTipField The field which must be shown in the maptip
 * @param aka 
 */

function MapTip(layer,mapTipField,aka){
    this.layer=layer;
    this.mapTipField=mapTipField;
    this.aka=aka;
}
