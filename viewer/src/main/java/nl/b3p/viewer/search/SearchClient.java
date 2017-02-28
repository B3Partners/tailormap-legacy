/*
 * Copyright (C) 2013-2016 B3Partners B.V.
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
package nl.b3p.viewer.search;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Roy Braam
 */
public abstract class SearchClient {
    public static final String SEARCHTERM_HOLDER="[ZOEKWOORD]";
    
    /**
     *  
     * @param query The term which must be found
     * @return An JSONArray with the answer. This must be in the following format:
     * 
     *<pre>
     * [
     *      { 
     *          location :{ 
     *              minx: double,
     *              miny: double,
     *              maxx: double,
     *              maxy: double
     *          }, 
     *          type: {String}, // For openLS this is one of: Street, MunicipalitySubdivision, Municipality,CountrySubdivision, for solr it is the name of the configuration
     *          label: {String}
     *      }
     * ]
     * </pre>
     */
    public abstract SearchResult search(String query);
    
    public abstract JSONArray autosuggest(String query) throws JSONException;
    
    public JSONObject locationToBBOX(int zoomboxSize, double x, double y) throws JSONException{
        JSONObject extent = new JSONObject();
        double zoomBoxSize = zoomboxSize / 2;
        extent.put("minx", x - zoomBoxSize);
        extent.put("miny", y - zoomBoxSize);
        extent.put("maxx", x + zoomBoxSize);
        extent.put("maxy", y + zoomBoxSize);
        return extent;
    }
}
