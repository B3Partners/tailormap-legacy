/*
 * Copyright (C) 2017 B3Partners B.V.
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

import java.util.HashMap;
import java.util.Map;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrServer;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class PDOKSearchClient extends SearchClient {

    private static final Log log = LogFactory.getLog(SolrSearchClient.class);  
    private SolrServer server;
    
    public PDOKSearchClient(){
        server = new HttpSolrServer("http://geodata.nationaalgeoregister.nl/locatieserver");
    }
    
    @Override
    public SearchResult search(String term) {
        SearchResult result = new SearchResult();
        try {
            JSONArray respDocs = new JSONArray();
            SolrQuery query = new SolrQuery();
            query.setQuery(term);
            query.setRequestHandler("/free");
            QueryResponse rsp = server.query(query);
            SolrDocumentList list = rsp.getResults();
            
            for (SolrDocument solrDocument : list) {
                JSONObject doc = solrDocumentToResult(solrDocument);
                if (doc != null) {
                    respDocs.put(doc);
                }
            }
            result.setResults(respDocs);
            result.setLimitReached(list.getNumFound() > list.size());
        } catch (SolrServerException ex) {
            log.error("Cannot search:",ex);
        }
        return result;
    }

    @Override
    public JSONArray autosuggest(String term) throws JSONException {
        JSONObject obj = new JSONObject();
        JSONArray respDocs = new JSONArray();
        try {
            JSONObject response = new JSONObject();
            response.put("docs", respDocs);
            obj.put("response", response);
           
            SolrQuery query = new SolrQuery();
            query.setQuery(term);
            query.setRequestHandler("/suggest");
            QueryResponse rsp = server.query(query);
            SolrDocumentList list = rsp.getResults();

            for (SolrDocument solrDocument : list) {
                JSONObject doc = solrDocumentToResult(solrDocument);
                if(doc != null){
                    respDocs.put(doc);
                }
            }
            response.put("docs", respDocs);
            return respDocs;
        } catch (SolrServerException ex) {
            log.error(ex);
        }
        return respDocs;
    }
    
    private JSONObject solrDocumentToResult(SolrDocument doc){
        JSONObject result = null;
        try {
            Map<String, Object> values = doc.getFieldValueMap();
            result = new JSONObject();
            for (String key : values.keySet()) {
                result.put(key, values.get(key));
            }
            String centroide = (String)doc.getFieldValue("centroide_rd");
            if (centroide != null) {
                String x = centroide.substring(6, centroide.indexOf(" ", 6));
                String y = centroide.substring(centroide.indexOf(" ") + 1, centroide.length() - 1);
                Map bbox = new HashMap();
                bbox.put("minx", x);
                bbox.put("miny", y);
                bbox.put("maxx", x);
                bbox.put("maxy", y);

                result.put("location", bbox);
            }
            result.put("label", values.get("weergavenaam"));
            
        } catch (JSONException ex) {
            log.error(ex);
        }
        return result;
    }
}
