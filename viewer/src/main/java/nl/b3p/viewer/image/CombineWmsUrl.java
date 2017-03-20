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

import java.util.ArrayList;
import java.util.List;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *
 * @author Roy Braam
 */
public class CombineWmsUrl extends CombineImageUrl{
    private static final Log log = LogFactory.getLog(CombineWmsUrl.class);
    
    private Integer maxTileWidth = 2048;
    private Integer maxTileHeight= 2048;
    
    private CombineWmsUrl(CombineWmsUrl cwu) {
        super(cwu);
    }

    public CombineWmsUrl() {
        super();
    }
    
    public List<CombineImageUrl> calculateNewUrl(ImageBbox bbox) {
        CombineWmsUrl ciu = new CombineWmsUrl(this);
        Integer width = bbox.getWidth();
        Integer height = bbox.getHeight();
        List<CombineImageUrl> list= new ArrayList<CombineImageUrl>();
        //if bigger then max size, then split image in smaller parts.
        if (width > this.maxTileWidth || height > this.maxTileHeight){
            Bbox newBbox = bbox.getBbox();

            Double resolutionWidth = bbox.getUnitsPixelX();
            Double resolutionHeight = bbox.getUnitsPixelY();

            for (int beginX = 0; beginX < width; beginX += this.maxTileWidth) {
                for (int endY = height; endY >= 0; endY -= this.maxTileHeight) {

                    Integer endX = beginX + this.maxTileWidth;
                    if (endX > width) {
                        endX = width;
                    }

                    Integer beginY = endY-this.maxTileHeight;
                    if (beginY < 0) {
                        beginY = 0;
                    }
                    
                    Bbox curBbox = new Bbox(
                            newBbox.getMinx() + beginX * resolutionWidth,
                            newBbox.getMiny() + (height-endY) * resolutionHeight,
                            newBbox.getMinx() + endX * resolutionWidth,
                            newBbox.getMiny() + (height-beginY) * resolutionHeight);

                    CombineWmsUrl newCiu = new CombineWmsUrl(this);                
                    newCiu.changeParameter("bbox", curBbox.toString());
                    newCiu.changeParameter("width", "" + (endX-beginX));
                    newCiu.changeParameter("height", "" + (endY-beginY));

                    CombineStaticImageUrl csiu = new CombineStaticImageUrl();
                    csiu.setX(beginX);
                    csiu.setY(beginY);
                    csiu.setBbox(curBbox);
                    csiu.setUrl(newCiu.getUrl());
                    csiu.setHeight(endY-beginY);
                    csiu.setWidth(endX-beginX);

                    list.add(csiu);
                }
            }
        }else{
            ciu.changeParameter("bbox", bbox.getBbox().toString());
            ciu.changeParameter("width", bbox.getWidth().toString());
            ciu.changeParameter("height", bbox.getHeight().toString());
            list.add(ciu);
        }
        return list;
    }
    
    /**
     * Try to resolve the width and height from the given CombineImageUrl.
     *
     * @return Array of int's width is the first in the array, height second
     */
    public Integer[] getWidthAndHeightFromUrl() {
        if (this.getUrl()==null) {
            return null;
        }
        String url=this.getUrl();

        String heightString = this.getParameter("height");
        String widthString = this.getParameter("width");
        Integer[] result = null;
        if (heightString != null && widthString != null) {
            try {
                result = new Integer[2];
                result[0] = new Integer(widthString);
                result[1] = new Integer(heightString);
            } catch (NumberFormatException nfe) {
                result = null;
                log.debug("Height en/of Width zijn geen integers: Heigth: " + heightString + "Width: " + widthString);
            }
        }
        return result;
    }
    /**
     * Gets the bbox from the url in the CombineImageUrl.
     *
     * @return the bbox for this url
     */
    public Bbox getBboxFromUrl() {
        if (this.getUrl()==null) {
            return null;
        }
        double[] bb = null;
        String url=this.getUrl();
        String stringBbox = this.getParameter("bbox");
        if (stringBbox != null) {
            if (stringBbox.split(",").length != 4) {
                stringBbox = null;
            } else {
                bb = new double[4];
                try {
                    bb[0] = Double.parseDouble(stringBbox.split(",")[0]);
                    bb[1] = Double.parseDouble(stringBbox.split(",")[1]);
                    bb[2] = Double.parseDouble(stringBbox.split(",")[2]);
                    bb[3] = Double.parseDouble(stringBbox.split(",")[3]);
                } catch (NumberFormatException nfe) {
                    bb = null;
                    log.debug("Geen geldige double waarden in de bbox: " + stringBbox);
                }
            }
        }
        if (bb != null) {
            return new Bbox(bb);
        } else {
            return null;
        }
    }
    /**
     * Returned a url with changed param.
     *
     * @param key the param name
     * @param newValue the new value
     * @return the changed url
     *
     */
    private void changeParameter(String key,String newValue) {
        String lowerUrl = url.toLowerCase();
        if (lowerUrl.indexOf("?" + key + "=") >= 0 || lowerUrl.indexOf("&" + key + "=") >= 0) {
            int beginIndex = 0;
            int endIndex = lowerUrl.length();
            if (lowerUrl.indexOf("?" + key + "=") >= 0) {
                beginIndex = lowerUrl.indexOf("?" + key + "=") + key.length() + 2;
            } else {
                beginIndex = lowerUrl.indexOf("&" + key + "") + key.length() + 2;
            }
            if (lowerUrl.indexOf("&", beginIndex) > 0) {
                endIndex = lowerUrl.indexOf("&", beginIndex);
            }
            if (beginIndex < endIndex) {
                String newUrl="";
                if (beginIndex>0){
                    newUrl+=url.substring(0,beginIndex);
                }
                newUrl+=newValue;
                if (endIndex < url.length()){
                    newUrl+=url.substring(endIndex,url.length());
                }
                url=newUrl;
            }
        }
    }
    /**
     * Get a parameter from this url.
     *
     * @param key param to get
     * @return parameter value (possibly {@code null})
     */
    public String getParameter(String key) {
        String lowerUrl = url.toLowerCase();
        if (lowerUrl.indexOf("?" + key + "=") >= 0 || lowerUrl.indexOf("&" + key + "=") >= 0) {
            int beginIndex = 0;
            int endIndex = lowerUrl.length();
            if (lowerUrl.indexOf("?" + key + "=") >= 0) {
                beginIndex = lowerUrl.indexOf("?" + key + "=") + key.length() + 2;
            } else {
                beginIndex = lowerUrl.indexOf("&" + key + "") + key.length() + 2;
            }
            if (lowerUrl.indexOf("&", beginIndex) > 0) {
                endIndex = lowerUrl.indexOf("&", beginIndex);
            }
            if (beginIndex < endIndex) {
                return url.substring(beginIndex, endIndex);
            }
        }
        return null;
    }
}
