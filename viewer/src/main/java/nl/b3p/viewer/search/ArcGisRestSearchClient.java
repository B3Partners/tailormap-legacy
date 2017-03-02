/*
 * Copyright (C) 2013 B3Partners B.V.
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

import java.io.IOException;
import java.net.URL;
import static nl.b3p.viewer.search.SearchClient.SEARCHTERM_HOLDER;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Roy Braam
 */
public class ArcGisRestSearchClient extends SearchClient{
    private static final Log log = LogFactory.getLog(ArcGisRestSearchClient.class);
    private String url;
    private static final int DEFAULT_ZOOMBOX_SIZE = 200;
    
    public ArcGisRestSearchClient(String url){
        this.url = url;
    }
    @Override
    public SearchResult search(String query){      
        SearchResult result = new SearchResult();
        String queryUrl;
        if (this.url.contains(SEARCHTERM_HOLDER)){
            queryUrl= this.url.replace(SEARCHTERM_HOLDER, query);
        }else{
            queryUrl = this.url + query;
        }
        JSONArray returnValue= new JSONArray();
        try{            
            JSONObject obj= new JSONObject(IOUtils.toString(new URL(queryUrl).openStream(), "UTF-8"));
            JSONArray candidates = (JSONArray)obj.get("candidates");            
            returnValue = candidateToResult(candidates);
            result.setResults(returnValue);
            result.setLimitReached(false);
        }catch(JSONException je){
            log.error("Search error while creating json objects",je);
            
        } catch (IOException ex) {
            log.error("Error while requesting url: "+queryUrl,ex);
        }
        return result;
    }
    
    private JSONArray candidateToResult(JSONArray candidates) throws JSONException{
        JSONArray results = new JSONArray();
        for (int i=0; i < candidates.length(); i++){
            JSONObject candidate = (JSONObject) candidates.get(i);
            results.put(candidateToResult(candidate));
        }
        return results;
    }
    
    private JSONObject candidateToResult(JSONObject candidate) throws JSONException{
        JSONObject result = new JSONObject();
        result.put("label", candidate.optString("address"));
        JSONObject loc= candidate.getJSONObject("location");
        JSONObject location = locationToBBOX(DEFAULT_ZOOMBOX_SIZE, loc.getDouble("x"), loc.getDouble("y"));
        result.put("location", location);
        return result;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public JSONArray autosuggest(String query) {
        throw new UnsupportedOperationException("Not supported.");
    }
    
}
