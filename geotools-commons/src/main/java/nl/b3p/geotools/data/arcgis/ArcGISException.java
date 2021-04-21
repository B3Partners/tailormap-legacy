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
package nl.b3p.geotools.data.arcgis;

import java.io.IOException;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;


/**
 *
 * @author Matthijs Laan
 */
public class ArcGISException extends IOException {
    private JSONObject response;
    
    private String message;
    
    public ArcGISException(String url, JSONObject response) {
        super();
        assert(response.containsKey("error"));
        
        JSONObject error = (JSONObject)response.get("error");
        StringBuilder sb = new StringBuilder("ArcGIS server returned error for URL ");
        sb.append(url);
        sb.append(": code: ");
        sb.append(error.get("code"));
        sb.append(": ");
        sb.append(error.get("message"));
        if(error.containsKey("details")) {
            sb.append(" - details: ");
            JSONArray details = (JSONArray)error.get("details");
            boolean first = true;
            for(Object o: details) {
                if(first) {
                    first = false;
                } else {
                    sb.append(", ");
                }
                sb.append(o);
            }
        }
        message = sb.toString();
        
    }
    
    public JSONObject getResponse() {
        return response;
    }    
    
    @Override
    public String getMessage() {
        return message;
    }
}
