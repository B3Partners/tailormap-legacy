/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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

/**
 *
 * @author Roy Braam
 */
public class CombineArcServerRestUrl extends CombineImageUrl{

    private CombineArcServerRestUrl(CombineArcServerRestUrl casru) {
        super(casru);
    }

    public CombineArcServerRestUrl() {
        super();
    }

    
    public List<CombineImageUrl> calculateNewUrl(ImageBbox bbox) {
        CombineArcServerRestUrl ciu=null;
        if (bbox.getHeight()!=null && bbox.getWidth()!=null){
            ciu = new CombineArcServerRestUrl(this);
            ciu.changeParameter("bbox", bbox.getBbox().toString());
            ciu.changeParameter("size", bbox.getWidth() + "," +bbox.getHeight());            
        }else{
            ciu = this;
        }
        List<CombineImageUrl> list= new ArrayList<CombineImageUrl>();
        list.add(ciu);        
        return list;
    }    
    
    protected void changeParameter(String key,String newValue) {
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
}
