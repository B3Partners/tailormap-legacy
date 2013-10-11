/*
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.image;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *
 * @author Roy Braam
 */
public class CombineWmsUrl extends CombineImageUrl{
    private static final Log log = LogFactory.getLog(CombineWmsUrl.class);
    private CombineWmsUrl(CombineWmsUrl cwu) {
        super(cwu);
    }

    public CombineWmsUrl() {
        super();
    }
    
    public CombineWmsUrl calculateNewUrl(ImageBbox bbox) {
        CombineWmsUrl ciu = new CombineWmsUrl(this);
        ciu.changeParameter("bbox", bbox.getBbox().toString());
        ciu.changeParameter("width", bbox.getWidth().toString());
        ciu.changeParameter("height", bbox.getHeight().toString());        
        return ciu;
    }
    
    /**
     * Try to resolve the width and height from the given CombineImageUrl
     * @param ciu 
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
     * Gets the bbox from the url in the CombineImageUrl
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
      * Get a parameter from this url.      
      * @param key
      * @return 
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
