/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.image;

import java.awt.Color;

/**
 *
 * @author Roy
 * @author mprins
 */
public class CombineImageWkt {
    private String wktGeom = "";
    private FeatureStyle style = new FeatureStyle();

    public CombineImageWkt(String wktGeom, FeatureStyle style) {
        this.style = style;
        this.wktGeom = wktGeom;
    }

    /**
     *
     * @param wktGeomString the geometry (with optional color and label)
     * @deprecated use
     * {@link CombineImageWkt#CombineImageWkt(java.lang.String, nl.b3p.viewer.image.FeatureStyle)}
     * if you also want to convey styling information or a label
     */
    @Deprecated
    public CombineImageWkt(String wktGeomString) {
        int colorIndex = wktGeomString.indexOf("#");
        int labelIndex = wktGeomString.indexOf("|");
        int wktEnd = wktGeomString.length();
        if (colorIndex > 0) {
            wktEnd = colorIndex;
        }
        if (labelIndex > 0 && labelIndex < wktEnd) {
            wktEnd = labelIndex;
        }
        this.setWktGeom(wktGeomString.substring(0, wktEnd));
        if (colorIndex > 0) {
            int colorEnd = labelIndex != -1 && labelIndex > colorIndex ? labelIndex : wktGeomString.length();
            this.setColor(wktGeomString.substring(colorIndex + 1, colorEnd));
        }
        if (labelIndex > 0) {
            int labelEnd = colorIndex != -1 && colorIndex > labelIndex ? colorIndex : wktGeomString.length();
            this.setLabel(wktGeomString.substring(labelIndex + 1, labelEnd));
        }
    }

    /**
     *
     * @param wktGeomString the geometry
     * @param color stroke and fill colour
     * @deprecated using
     * {@link CombineImageWkt#CombineImageWkt(java.lang.String, nl.b3p.viewer.image.FeatureStyle)}
     * is preferred
     */
    @Deprecated
    public CombineImageWkt(String wktGeomString, String color) {
        this.setWktGeom(wktGeomString);
        this.setColor(color);
    }

    /**
     *
     * @param wktGeomString the geometry
     * @param color stroke and fill colour
     * @param strokeWidth stroke width
     * @deprecated using
     * {@link CombineImageWkt#CombineImageWkt(java.lang.String, nl.b3p.viewer.image.FeatureStyle)}
     * is preferred
     */
    @Deprecated
    public CombineImageWkt(String wktGeomString, String color, Float strokeWidth) {
        this.setWktGeom(wktGeomString);
        this.setColor(color);
        this.setStrokeWidth(strokeWidth);
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
     *
     * @return the color
     * @deprecated get the color from the {@link #getStyle() featurestyle}
     * instead
     */
    public Color getColor() {
        return this.style.getFillColor();
    }

    /**
     * @param color the color to set
     * @deprecated set color on the {@link #getStyle() featurestyle} instead
     */
    @Deprecated
    public void setColor(Color color) {
        this.style.setFillColor(String.format("#%02x%02x%02x", color.getRed(), color.getGreen(), color.getBlue()));
        this.style.setFillOpacity((double) (color.getAlpha() & 0xff));
    }

    /**
     * @deprecated set color on the {@link #getStyle() featurestyle} instead
     */
    @Deprecated
    public void setColor(String hexrgb) {
        if (hexrgb == null || hexrgb.equals("transparent")) {
            return;
        }
        if (hexrgb.length() > 0) {
            this.style.setFillColor(hexrgb);
        }
    }

    /**
     * @return the label
     * @deprecated get the label from the {@link #getStyle() featurestyle}
     * instead
     */
    public String getLabel() {
        return this.style.getLabel();
    }

    /**
     * @param label the label to set
     * @deprecated set the label on the {@link #getStyle() featurestyle} instead
     */
    @Deprecated
    public void setLabel(String label) {
        this.style.setLabel(label);
    }

    /**
     *
     * @return stroke width
     * @deprecated use the value from the {@link #getStyle() featurestyle}
     * instead
     */
    @Deprecated
    public Float getStrokeWidth() {
        return this.style.getStrokeWidth().floatValue();
    }

    /**
     *
     * @param strokeWidth stroke width
     * @deprecated set the value on the the {@link #getStyle() featurestyle}
     * instead
     */
    @Deprecated
    public void setStrokeWidth(Float strokeWidth) {
        this.style.setStrokeWidth(strokeWidth.doubleValue());
    }

    public FeatureStyle getStyle() {
        return style;
    }

    public void setStyle(FeatureStyle style) {
        this.style = style;
    }

}
