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

import org.locationtech.jts.geom.Envelope;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.io.ParseException;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.geometry.jts.WKTReader2;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 * @author mprins
 */
public class PDOKSearchClient extends SearchClient {

    private static final Log log = LogFactory.getLog(SolrSearchClient.class);
    private WKTReader2 wkt;
    private String filter;
    private static final String PDOK_URL="https://api.pdok.nl/bzk/locatieserver/search/v3_1/free";

    /* This is a lookup table with a distance per type of object so we can generate a sensible
        bbox to zoom to, these values are used when we only get a point for a hit.
        The map has "type":distance (meter, because epsg:28995)
     */
    private static final HashMap<String, Double> BUFFERS = new HashMap<>();

    static {
        BUFFERS.put("gemeente", 5000d);
        BUFFERS.put("woonplaats", 2500d);
        // weg is the default
        BUFFERS.put("weg", 50d);
        BUFFERS.put("postcode", 50d);
        BUFFERS.put("adres", 10d);
        BUFFERS.put("hectometerpaal", 35d);
        BUFFERS.put("perceel", 25d);
    }
    
    public PDOKSearchClient(String filter){
        wkt = new WKTReader2();
        this.filter = filter;
    }
    
    @Override
    public SearchResult search(String term) {
        SearchResult result = new SearchResult();
        try {
            JSONArray respDocs = new JSONArray();
            // add asterisk to make it match partial queries (for autosuggest)
            term += "*";
            String  final_url = this.PDOK_URL + "?q=" + term;
            if(this.filter != null && !this.filter.isEmpty()){
                final_url += "&fq=" + this.filter;
            }

            // specify fields to retrieve (null values wil be omitted in the response),
            //   the default is listed at https://github.com/PDOK/locatieserver/wiki/API-Locatieserver#52url-parameters
            //   this list is probably still longer than needed, so maybe could be pruned
            final_url += "&fl=" + "identificatie,weergavenaam,bron,type,openbareruimte_id,openbareruimtetype,straatnaam,adresseerbaarobject_id,nummeraanduiding_id,huisnummer,huisletter,huisnummertoevoeging,huis_nlt,postcode,woonplaatscode,woonplaatsnaam,gemeentenaam,provinciecode,provincienaam,kadastraal_object_id,kadastrale_gemeentecode,kadastrale_gemeentenaam,kadastrale_sectie,perceelnummer,kadastrale_grootte,gekoppeld_perceel,kadastrale_aanduiding,centroide_rd,boundingbox_rd,geometrie_rd,score";
            URL url = new URL(final_url);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            StringBuilder response = new StringBuilder();
            String line;
            try(BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
            } catch (IOException ex) {
                log.error("Cannot get search response from PDOK:",ex);
            }

            JSONObject pdokResponse = new JSONObject(response.toString()).getJSONObject("response");
            JSONArray docs = pdokResponse.getJSONArray("docs");

            Iterator<Object> it = docs.iterator();
            while (it.hasNext()) {
                JSONObject doc = (JSONObject) it.next();
                doc = solrDocumentToResult(doc);
                if (doc != null) {
                    respDocs.put(doc);
                }
            }

            result.setResults(respDocs);
            result.setLimitReached(pdokResponse.getInt("numFound") > docs.length());
        } catch (  IOException ex) {
            log.error("Cannot search:",ex);
        }
        return result;
    }

    @Override
    public JSONArray autosuggest(String term) throws JSONException {
      SearchResult r = search(term);
      return r.getResults();
    }
    
    private JSONObject solrDocumentToResult(JSONObject doc){
        JSONObject result = null;
        try {
            Map<String, Object> values = doc.toMap();
            result = new JSONObject();
            for (String key : values.keySet()) {
                switch (key) {
                    // some fields to skip
                    case "geometrie_rd":
                    case "boundingbox_rd":
                    case "centroide_rd":
                        // because calculated clientside
                        break;
                    default:
                        result.put(key, values.get(key));
                }
            }

            String geom = (String) doc.get("centroide_rd");
            if (values.containsKey("geometrie_rd")) {
                geom = (String) values.get("geometrie_rd");
            } else if (values.containsKey("boundingbox_rd")) {
                geom = (String) values.get("boundingbox_rd");
            }
            Geometry g = wkt.read(geom);

            if (g instanceof Point) {
                // if got a point buffer the geom
                Double d = BUFFERS.get(result.getString("type"));
                if (d == null) {
                    // unknown type in response, fall back to "weg"
                    d = BUFFERS.get("weg");
                }
                g = g.buffer(d);
            }

            if (geom != null) {
                Envelope env = g.getEnvelopeInternal();
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
