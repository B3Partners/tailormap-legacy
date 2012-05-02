/*
 * Copyright (C) 2012 B3Partners B.V.
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

/**
 *
 * @author Roy Braam
 */
public class CombineWmsUrl extends CombineImageUrl{

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
     * Returned a url with changed param     
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
