/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package nl.b3p.viewer.image;

import java.awt.Color;

/**
 *
 * @author Roy
 */
public class CombineImageWkt {
    private String wktGeom="";
    private Color color = null;
    private String label=null;
    private Float strokeWidth = null;
    private FeatureStyle style;
    
    public CombineImageWkt(String wktGeomString){
        int colorIndex=wktGeomString.indexOf("#");
        int labelIndex=wktGeomString.indexOf("|");
        int wktEnd= wktGeomString.length();
        if (colorIndex > 0)
            wktEnd=colorIndex;
        if (labelIndex > 0 && labelIndex < wktEnd){
            wktEnd=labelIndex;
        }
        this.setWktGeom(wktGeomString.substring(0,wktEnd));
        if (colorIndex>0){
            int colorEnd= labelIndex!=-1&& labelIndex>colorIndex?labelIndex:wktGeomString.length();            
            this.setColor(wktGeomString.substring(colorIndex+1,colorEnd));
        }
        if (labelIndex>0){
            int labelEnd= colorIndex!=-1&& colorIndex>labelIndex?colorIndex:wktGeomString.length();
            this.setLabel(wktGeomString.substring(labelIndex+1,labelEnd));
        }
    }
    public CombineImageWkt(String wktGeomString, String color){
        setWktGeom(wktGeomString);        
        setColor(color);
    }

    public CombineImageWkt(String wktGeomString, String color, Float strokeWidth) {
        setWktGeom(wktGeomString);
        setColor(color);
        setStrokeWidth(strokeWidth);
    }
    /**
     * @return the wktGeom
     */
    public String getWktGeom() {
        return wktGeom;
    }

    /**
     * @param wktGeom the wktGeom to set
     */
    public void setWktGeom(String wktGeom) {
        this.wktGeom = wktGeom;
    }

    /**
     * @return the color
     */
    public Color getColor() {
        return color;
    }

    /**
     * @param color the color to set
     */
    public void setColor(Color color) {
        this.color = color;
    }
    public void setColor(String hexrgb) {
        if (hexrgb==null || hexrgb.equals("transparent")){
            return;
        }
        if (hexrgb.length()>0)
            this.color = new Color( Integer.parseInt(( hexrgb ), 16) );
    }

    /**
     * @return the label
     */
    public String getLabel() {
        return label;
    }

    /**
     * @param label the label to set
     */
    public void setLabel(String label) {
        this.label = label;
    }

    public Float getStrokeWidth() {
        return strokeWidth;
    }

    public void setStrokeWidth(Float strokeWidth) {
        this.strokeWidth = strokeWidth;
    }

    public FeatureStyle getStyle() {
        return style;
    }

    public void setStyle(FeatureStyle style) {
        this.style = style;
    }
    
}
