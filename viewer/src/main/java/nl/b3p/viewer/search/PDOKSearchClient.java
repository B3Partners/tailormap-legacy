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

import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.io.ParseException;
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
import org.geotools.geometry.jts.WKTReader2;
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
    private WKTReader2 wkt;
    private String filter;
    
    public PDOKSearchClient(String filter){
        server = new HttpSolrServer("http://geodata.nationaalgeoregister.nl/locatieserver");
        wkt = new WKTReader2();
        this.filter = filter;
    }
    
    @Override
    public SearchResult search(String term) {
        SearchResult result = new SearchResult();
        try {
            JSONArray respDocs = new JSONArray();
            SolrQuery query = new SolrQuery();
            if(this.filter != null){
                term += this.filter;
            }
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
      SearchResult r = search(term);
      return r.getResults();
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
            
            String geom = centroide;
            if(values.containsKey("geometrie_rd")){
                geom = (String) values.get("geometrie_rd");
            }
            Geometry g = wkt.read(geom);
            Envelope env = g.getEnvelopeInternal();
            
            if (centroide != null) {
                Map bbox = new HashMap();
                bbox.put("minx", env.getMinX());
                bbox.put("miny", env.getMinY());
                bbox.put("maxx", env.getMaxX());
                bbox.put("maxy", env.getMaxY());

                result.put("location", bbox);
            }
            result.put("label", values.get("weergavenaam"));
            
        } catch (JSONException | ParseException ex) {
            log.error(ex);
        }
        return result;
    }
}
