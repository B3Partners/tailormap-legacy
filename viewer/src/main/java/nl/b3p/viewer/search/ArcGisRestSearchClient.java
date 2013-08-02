/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
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
public class ArcGisRestSearchClient implements SearchClient{
    private static final Log log = LogFactory.getLog(ArcGisRestSearchClient.class);
    private String url;
    
    public ArcGisRestSearchClient(String url){
        this.url = url;
    }
    @Override
    public JSONArray search(String query){      
        String queryUrl;
        if (this.url.contains(SEARCHTERM_HOLDER)){
            queryUrl= this.url.replace(SEARCHTERM_HOLDER, query);
        }else{
            queryUrl = this.url + query;
        }
        JSONArray returnValue= new JSONArray();
        try{            
            JSONObject obj= new JSONObject(IOUtils.toString(new URL(url).openStream(), "UTF-8"));
            JSONArray candidates = (JSONArray)obj.get("candidates");            
            returnValue = candidateToResult(candidates);
        }catch(JSONException je){
            log.error("Search error while creating json objects",je);
            
        } catch (IOException ex) {
            log.error("Error while requesting url: "+queryUrl,ex);
        }
        return returnValue;
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
        JSONObject location = new JSONObject();
        location.put("x",loc.getDouble("x"));
        location.put("y",loc.getDouble("y"));
        return result;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
    
}
