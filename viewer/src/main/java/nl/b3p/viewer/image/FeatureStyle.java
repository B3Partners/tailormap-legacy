/*
 * Copyright (C) 2017 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.image;

import java.awt.Color;
import org.json.JSONObject;

/**
 *
 * @author Meine Toonen
 */
public class FeatureStyle {

    private String label = "";
    private String labelOutlineColor = "FFFFFF";
    private Integer labelOutlineWidth = 1;
    private String labelAlign = null;
    private Float fontSize = 12f;
    private String fontColor = "000000";
    private Double rotation = 0.0;
    private Double labelXOffset = 0.0;
    private Double labelYOffset = 0.0;
    private String fillColor = null;
    private double fillOpacity = 0.0f;
    private String strokeColor = null;
    private Double strokeOpacity = 0.0;
    private Double strokeWidth = 0.0;
    private String strokeDashstyle = "solid";
    private String graphicName = null;
    private Double pointRadius = 0.0;

    /**
     *
     * @deprecated use {@link FeatureStyle(JSONObject)} instead, as this sets up
     * the style with aberrant properties.
     */
    @Deprecated
    public FeatureStyle(){
        fillColor = "ff0000";
        fillOpacity = 0.3;
        pointRadius = 6.0;
        strokeColor = "ff0000";
        strokeOpacity = 0.3;
        strokeWidth = 2.0;        
    }
    
    public FeatureStyle(JSONObject style) {
        label = style.optString("label");
        labelOutlineColor = sanitizeColorString(style.optString("labelOutlineColor", "#FFFFFF"));
        labelOutlineWidth = style.optInt("labelOutlineWidth", 1);
        labelAlign = style.optString("labelAlign");
        fontSize = style.optFloat("fontSize", 12f);
        fontColor = sanitizeColorString(style.optString("fontColor", "#000000"));
        rotation = style.optDouble("rotation", 0.0);
        labelXOffset = style.optDouble("labelXOffset", 0.0);
        labelYOffset = style.optDouble("labelYOffset", 0.0);
        String fc = style.optString("fillColor");
        boolean transparentFillColor = fc.equalsIgnoreCase("transparent");
        fc = transparentFillColor ? null : fc;
        fc = sanitizeColorString(fc);
        fillColor = sanitizeColorString(fc);
        fillOpacity = transparentFillColor ? 0.0 : style.optDouble("fillOpacity", 0.0);
        strokeColor = sanitizeColorString(style.optString("strokeColor"));
        strokeOpacity = style.optDouble("strokeOpacity", 0.0);
        strokeDashstyle = style.optString("strokeDashstyle", "solid");
        strokeWidth = style.optDouble("strokeWidth", 3.0);
        graphicName = style.optString("graphicName");
        pointRadius = style.optDouble("pointRadius", 0.0);
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Color getLabelOutlineColor() {
        return labelOutlineColor != null ? new Color(Integer.parseInt((labelOutlineColor), 16)) : null;
    }

    public void setLabelOutlineColor(String labelOutlineColor) {
        this.labelOutlineColor = labelOutlineColor;
    }

    public Integer getLabelOutlineWidth() {
        return labelOutlineWidth;
    }

    public void setLabelOutlineWidth(Integer labelOutlineWidth) {
        this.labelOutlineWidth = labelOutlineWidth;
    }

    public String getLabelAlign() {
        return labelAlign;
    }

    public void setLabelAlign(String labelAlign) {
        this.labelAlign = labelAlign;
    }

    // return a float because https://docs.oracle.com/javase/8/docs/api/java/awt/Font.html#deriveFont-float-
    public Float getFontSize() {
        return fontSize;
    }

    public void setFontSize(Float fontSize) {
        this.fontSize = fontSize;
    }

    public Color getFontColor() {
        return fontColor != null ? new Color(Integer.parseInt((fontColor), 16)) : Color.BLACK;
    }

    public void setFontColor(String fontColor) {
        this.fontColor = fontColor;
    }

    public Double getRotation() {
        return rotation;
    }

    public void setRotation(Double rotation) {
        this.rotation = rotation;
    }

    public Double getLabelXOffset() {
        return labelXOffset;
    }

    public void setLabelXOffset(Double labelXOffset) {
        this.labelXOffset = labelXOffset;
    }

    public Double getLabelYOffset() {
        return labelYOffset;
    }

    public void setLabelYOffset(Double labelYOffset) {
        this.labelYOffset = labelYOffset;
    }

    public Color getFillColor() {
        return fillColor != null && !fillColor.isEmpty() ? new Color(Integer.parseInt((fillColor), 16)) : CombineImageSettings.defaultWktGeomColor;
    }

    public void setFillColor(String fillColor) {
        this.fillColor = fillColor;
    }

    public Double getFillOpacity() {
        return fillOpacity;
    }

    public void setFillOpacity(Double fillOpacity) {
        this.fillOpacity = fillOpacity;
    }

    public Color getStrokeColor() {
        return strokeColor != null ? new Color(Integer.parseInt((strokeColor), 16)) : null;
    }

    public void setStrokeColor(String strokeColor) {
        this.strokeColor = strokeColor;
    }

    public Double getStrokeOpacity() {
        return strokeOpacity;
    }

    public void setStrokeOpacity(Double strokeOpacity) {
        this.strokeOpacity = strokeOpacity;
    }

    public String getStrokeDashstyle() {
        return strokeDashstyle;
    }

    public void setStrokeDashstyle(String strokeDashstyle) {
        this.strokeDashstyle = strokeDashstyle;
    }

    public String getGraphicName() {
        return graphicName;
    }

    public void setGraphicName(String graphicName) {
        this.graphicName = graphicName;
    }

    public Double getPointRadius() {
        return pointRadius;
    }

    public void setPointRadius(Double pointRadius) {
        this.pointRadius = pointRadius;
    }

    public Double getStrokeWidth() {
        return strokeWidth;
    }

    public void setStrokeWidth(Double strokeWidth) {
        this.strokeWidth = strokeWidth;
    }
    

    private String sanitizeColorString(String color){
        if(color == null || color.isEmpty()){
            return null;
        }
        int index = color.indexOf("#");
        if(index != -1){
            color = color.substring(index+1);
        }
        return color;
    }

    @Override
    public String toString() {
        return "FeatureStyle{" + "label=" + label + ", labelOutlineColor=" + labelOutlineColor + ", labelOutlineWidth=" + labelOutlineWidth + ", labelAlign=" + labelAlign + ", fontSize=" + fontSize + ", fontColor=" + fontColor + ", rotation=" + rotation + ", labelXOffset=" + labelXOffset + ", labelYOffset=" + labelYOffset + ", fillColor=" + fillColor + ", fillOpacity=" + fillOpacity + ", strokeColor=" + strokeColor + ", strokeOpacity=" + strokeOpacity + ", strokeWidth=" + strokeWidth + ", strokeDashstyle=" + strokeDashstyle + ", graphicName=" + graphicName + ", pointRadius=" + pointRadius + '}';
    }

}
