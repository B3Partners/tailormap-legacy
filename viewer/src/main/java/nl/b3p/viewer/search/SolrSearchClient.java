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

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import nl.b3p.viewer.SolrInitializer;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.client.solrj.response.SpellCheckResponse;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Meine Toonen
 */
public class SolrSearchClient implements SearchClient {

    @Override
    public JSONArray search(String query) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public JSONObject autosuggest(String term) throws JSONException {
        try {
            SolrServer server = SolrInitializer.getServerInstance();

            JSONObject obj = new JSONObject();
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
        return null;
    }
}
