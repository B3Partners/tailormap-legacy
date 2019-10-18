/*
 * Copyright (C) 2013-2017 B3Partners B.V.
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

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import nl.b3p.viewer.config.services.SolrConf;
import nl.b3p.viewer.solr.SolrInitializer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.response.QueryResponse;
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
    private static final Log log = LogFactory.getLog(SolrSearchClient.class);  

    private JSONObject config;
    private List<Long> visibleLayers;
    
    private Map<Long, SolrConf> configMap = new HashMap();
    
    @Override
    public SearchResult search(String term) {
        SearchResult result = new SearchResult();
        JSONArray respDocs = new JSONArray();
        try {
            if(term == null){
                term = "";
            }else{
                String[] terms = term.split(" ");
                String newTerm = null;
                for (String t : terms) {
                    if(newTerm != null){
                        newTerm += " AND ";
                    }else{
                        newTerm = "";
                    }
                    newTerm += t;
                }
                term = newTerm;
                
                term = term.replaceAll("\\:", "\\\\:");
                term  += " AND (";
            }
            SolrServer server = SolrInitializer.getServerInstance();
            String extraQuery = createAttributeSourceQuery();
            if (extraQuery.isEmpty()) {
                extraQuery = "searchConfig:\\-1"; // Dummy expression to always evaluate to false and return no results
            }
              
            SolrQuery query = new SolrQuery();
            query.setQuery(term);
            query.setFilterQueries(extraQuery);
          
            
            query.setRequestHandler("/select");
            QueryResponse rsp = server.query(query);
            SolrDocumentList list = rsp.getResults();
            
            for (SolrDocument solrDocument : list) {
                JSONObject doc = solrDocumentToResult(solrDocument);
                if(doc != null){
                    respDocs.put(doc);
                }
            }
            result.setResults(respDocs);
            result.setLimitReached( list.getNumFound()> list.size() );
           

        } catch (SolrServerException ex) {
            log.error("Error doing solr search:", ex);
        } catch (JSONException ex) {
            log.error("Error doing solr search:",ex);
        } 
        
        return result;
    }
    
    @Override
    public JSONArray autosuggest(String term) throws JSONException {
        JSONObject obj = new JSONObject();
        JSONArray respDocs = new JSONArray();
        try {
            SolrServer server = SolrInitializer.getServerInstance();

            JSONObject response = new JSONObject();
            response.put("docs", respDocs);
            obj.put("response", response);
            String extraQuery = createAttributeSourceQuery();
            term += " AND (";
            if (!extraQuery.isEmpty()) {
                term += extraQuery + ")";
            } else {
                term += "searchConfig:\\-1)"; // Dummy expression to always evaluate to false and return no results
            }
            SolrQuery query = new SolrQuery();
            query.setQuery(term);
            query.setRequestHandler("/select");
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
    
    private String createAttributeSourceQuery() throws JSONException{
        String extraQuery = "";
        JSONObject solrConfigsJson = config.getJSONObject("solrConfig");
        Iterator<String> it = solrConfigsJson.keys();
        while (it.hasNext()){
            String key = it.next();
            if(canBeSearched(key)){
                if(!extraQuery.isEmpty()){
                    extraQuery += " OR ";
                }
                extraQuery += "searchConfig:" + key;
            }
        }
        return extraQuery;
    }
    
    private boolean canBeSearched(String key) throws JSONException{
        JSONObject solrConfigsJson = config.getJSONObject("solrConfig");
        JSONObject solrConfig = solrConfigsJson.getJSONObject(key);
        JSONArray requiredLayers = solrConfig.getJSONArray("requiredLayers");
        boolean allVisible = true;
        for( int i = 0; i < requiredLayers.length() ;i ++){
            long reqLayerId = requiredLayers.getInt(i);
            boolean visible = false;
            for (Long visibleId : visibleLayers) {
                if(visibleId == reqLayerId){
                    visible = true;
                    break;
                }
            }
            if(!visible){
                allVisible = false;
                break;
            }
        }
        return allVisible;
      
    }
    
    private JSONObject solrDocumentToResult(SolrDocument doc){
        JSONObject result = null;
        try {
            Collection<Object> resultValues = doc.getFieldValues("resultValues");
            if (resultValues != null) {
                result = new JSONObject();
                String resultLabel = "";
                List<String> labels = new ArrayList(resultValues);
                for (String label : labels) {
                    if (!resultLabel.isEmpty()) {
                        resultLabel += ", ";
                    }
                    resultLabel += label;
                }
                result.put("label", resultLabel);
                Map bbox = new HashMap();
                bbox.put("minx", doc.getFieldValue("minx"));
                bbox.put("miny", doc.getFieldValue("miny"));
                bbox.put("maxx", doc.getFieldValue("maxx"));
                bbox.put("maxy", doc.getFieldValue("maxy"));
                result.put("location", bbox);

                result.put("searchConfig", doc.getFieldValue("searchConfig"));
                String naam = getConfigurationNaam((Integer)doc.getFieldValue("searchConfig"));
                result.put("type", naam);
            }
        } catch (JSONException ex) {
            log.error(ex);
        }
        return result;
    }
    private String getConfigurationNaam(Integer id){
        Long longValue = new Long(id);
        if(!configMap.containsKey(longValue)){
            EntityManager em = Stripersist.getEntityManager();
            SolrConf configuration = em.find(SolrConf.class, longValue);
            configMap.put(longValue,configuration);
            return configuration.getName();
        }
        return configMap.get(longValue).getName();
    }

    public JSONObject getConfig() {
        return config;
    }

    public void setConfig(JSONObject config) {
        this.config = config;
    }

    public void setVisibleLayers(List<Long> visibleLayers) {
        this.visibleLayers = visibleLayers;
    }

}
