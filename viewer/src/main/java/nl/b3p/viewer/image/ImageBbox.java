/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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

/**
 * Class to keep track of the relation between the screen dimension and the bbox in the 'real world'
 * @author Roy Braam
 */
public class ImageBbox {
    //the bbox in the Real World
    private Bbox bbox = null;
    //the width in pixels on the screen
    private Integer width = null;
    //the height in pixels on the screen
    private Integer height = null;

    /**
     * Constructor for creating a ImageBbox
     * @param bbox the bbox in the Real World
     * @param width the width in pixels on the screen
     * @param height the height in pixels on the screen.
     */
    ImageBbox(Bbox bbox, Integer width, Integer height) {
        this.bbox=bbox;
        this.width=width;
        this.height=height;
    }

    //<editor-fold defaultstate="collapsed" desc="Getters and setters">
    public Bbox getBbox() {
        return bbox;
    }
    
    public void setBbox(Bbox bbox) {
        this.bbox = bbox;
    }
    
    public Integer getWidth() {
        return width;
    }
    
    public void setWidth(Integer width) {
        this.width = width;
    }
    
    public Integer getHeight() {
        return height;
    }
    
    public void setHeight(Integer height) {
        this.height = height;
    }
    /**
     * Get the units per pixel y.
     *
     * @return units per pixel y
     */
    public double getUnitsPixelY() {
        return bbox.getHeight()/height;
    }
    /**
     * Get the units per pixel x
     *
     * @return units per pixel x
     */
    public double getUnitsPixelX() {
        return bbox.getWidth()/width;
    }
    //</editor-fold>
}
