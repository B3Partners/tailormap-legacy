/*
 * Copyright (C) 2013 B3Partners B.V.
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
package nl.b3p.viewer.search;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.persistence.EntityManager;
import nl.b3p.viewer.SolrInitializer;
import nl.b3p.viewer.config.services.SolrConfiguration;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.client.solrj.response.SpellCheckResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Meine Toonen
 */
public class SolrSearchClient extends SearchClient {

    private JSONObject config;
    
    @Override
    public JSONArray search(String term) {
        JSONArray respDocs = new JSONArray();
        try {
            SolrServer server = SolrInitializer.getServerInstance();
            String extraQuery = createAttributeSourceQuery();
            if(!extraQuery.isEmpty()){
                term  += " AND (" + extraQuery + ")";
            }
            SolrQuery query = new SolrQuery();
            query.setQuery(term);
            query.setRequestHandler("/select");
            QueryResponse rsp = server.query(query);
            SolrDocumentList list = rsp.getResults();

            for (SolrDocument solrDocument : list) {
                JSONObject doc = solrDocumentToResult(solrDocument);
                respDocs.put(doc);
            }

        } catch (SolrServerException ex) {
            Logger.getLogger(SolrSearchClient.class.getName()).log(Level.SEVERE, null, ex);
        } catch (JSONException ex) {
            Logger.getLogger(SolrSearchClient.class.getName()).log(Level.SEVERE, null, ex);
        } 
        return respDocs;
    }
    
    private String createAttributeSourceQuery() throws JSONException{
        String extraQuery = "";
        JSONObject solrConfigsJson = config.getJSONObject("solrConfig");
        Iterator<String> it = solrConfigsJson.keys();
        while (it.hasNext()){
            String key = it.next();
            if(!extraQuery.isEmpty()){
                extraQuery += " OR ";
            }
            extraQuery += "searchConfig:" + key;
        }
        return extraQuery;
    }
    
    private JSONObject solrDocumentToResult(SolrDocument doc){
        JSONObject result = new JSONObject();
       try {
            List<String> labels = new ArrayList( doc.getFieldValues("resultValues"));
            String resultLabel = "";
            for (String label : labels) {
                if(!resultLabel.isEmpty()){
                    resultLabel += ", ";
                }
                resultLabel += label;
            }

            result.put("label", resultLabel);
            
            result.put("minx", doc.getFieldValue("minx"));
            result.put("miny", doc.getFieldValue("miny"));
            result.put("maxx", doc.getFieldValue("maxx"));
            result.put("maxy", doc.getFieldValue("maxy"));
        } catch (JSONException ex) {
            Logger.getLogger(SolrSearchClient.class.getName()).log(Level.SEVERE, null, ex);
        }
        return result;
    }

    @Override
    public JSONObject autosuggest(String term) throws JSONException {
        JSONObject obj = new JSONObject();
        try {
            SolrServer server = SolrInitializer.getServerInstance();

            JSONObject response = new JSONObject();
            JSONArray respDocs = new JSONArray();
            response.put("docs", respDocs);
            obj.put("response", response);


            SolrQuery query = new SolrQuery();
            query.setQuery(term);
            query.setRequestHandler("/suggest");
            QueryResponse rsp = server.query(query);
            SpellCheckResponse sc = rsp.getSpellCheckResponse();
            List<SpellCheckResponse.Suggestion> suggestions = sc.getSuggestions();
            for (SpellCheckResponse.Suggestion suggestion : suggestions) {
                List<String> alternatives = suggestion.getAlternatives();
                for (String alt : alternatives) {
                    JSONObject sug = new JSONObject();
                    sug.put("suggestion", alt);
                    respDocs.put(sug);
                }
            }
            response.put("docs", respDocs);
        } catch (SolrServerException ex) {
            Logger.getLogger(SolrSearchClient.class.getName()).log(Level.SEVERE, null, ex);
        }
        return obj;
    }

    public JSONObject getConfig() {
        return config;
    }

    public void setConfig(JSONObject config) {
        this.config = config;
    }

}
