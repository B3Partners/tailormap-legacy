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
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.*;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
//import org.codehaus.httpcache4j.cache.HTTPCache;
import org.geotools.data.ows.HTTPClient;
import org.geotools.data.ows.HTTPResponse;
import org.geotools.data.ows.SimpleHttpClient;
import org.geotools.data.store.ContentDataStore;
import org.geotools.data.store.ContentEntry;
import org.geotools.data.store.ContentFeatureSource;
import org.geotools.feature.NameImpl;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.opengis.feature.type.Name;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

/**
 * DataStore for ArcGIS Server REST API for MapServer or FeatureServer
 * (read-only) services.
 * <p>
 * Because of the nature of the REST API, paging is not suited for stateless
 * code such as web pages. When you request a FeatureReader with a Query with
 * paging parameters set using {@link org.geotools.data.Query#setStartIndex} and
 * {@link org.geotools.data.Query#setMaxFeatures}, the data store must always
 * request all object ids matching the rest of the query and then request the
 * features in the page using the object ids. If the feature collection is very
 * large this can take a long time.
 * <p>
 * It is possible to request the object ids matching the Query using
 * {@link ArcGISFeatureReader#getObjectIds()} and use this List later on to
 * request features with
 * {@link ArcGISFeatureReader#getFeaturesByObjectIds(java.util.List)}. The list
 * with object ids can be cached where appropriate and be used to request a
 * sublist for paging.
 * <p>
 * Unfortunately the object ids cannot be used as a row id in a query to pass on
 * the start index and max features. While sometimes the object ids start at 1
 * and increment for each subsequent feature, this is not guaranteed.
 * <p>
 * Although ArcGIS server sends ETag headers in response to requests, there is
 * not really a performance improvement using conditional HTTP requests - with
 * very large feature collections the performance is abysmal no matter what.
 * Because of this the HTTP cache (using
 * <a href="http://httpcache4j.codehaus.org/">HttpCache4j</a>) is disabled by
 * default * so the HttpCache4j libraries are not required. To enable HTTP caching you
 * must patch HttpCache4j to support non-conformant ETag headers sent by ESRI
 * (see CachingHTTPClient, renamed to CachingHTTPClient.java.disabled) and
 * uncomment the relevant lines in this class and
 * {@link ArcGISDataStoreFactory}. Then pass a HTTPCache instance to the
 * constructor or using the HTTP_CACHE Param for the factory.
 * <p>
 * When reading features ArcGIS server may produce invalid JSON when it
 * apparently has an invalid coordinate and sends "*****************" instead.
 * Like non-well formed XML we do not accept this so ArcGISFeatureReader.next()
 * may throw an exception (consistently, the ESRI WFS server also produces
 * invalid posLists this way).
 * <p>
 * The standard ESRI spatial querying restrictions apply: only one spatial
 * operator with the default geometry and a literal geometry operand is
 * supported and can only be combined with other attribute queries in a Boolean
 * AND.
 *
 * @author Matthijs Laan
 */
public class ArcGISDataStore extends ContentDataStore {
    private static final Log log = LogFactory.getLog(ArcGISDataStore.class);
    
    private URL url;
    
    private enum ServerType {
        MapServer, FeatureServer;
    }
       
    private ServerType serverType;
    
    private CoordinateReferenceSystem crs;    

    private List<Name> typeNames = null;

    private Map<String,JSONObject> layersById = new HashMap<String,JSONObject>();

    private HTTPClient client;
    
    private String currentVersion;
    private Integer currentMajorVersion;
    
    public ArcGISDataStore(URL url) {
        this(url, null, null, null, null, null, null, null);
    }
    
    public ArcGISDataStore(URL url, String user, String passwd, Integer timeout, Boolean gzip, CoordinateReferenceSystem crs, Object httpCache, String currentVersion) {
        this.url = url;
        this.crs = crs;    
        this.currentVersion = currentVersion;
        if(currentVersion != null) {
            try {
                currentMajorVersion = Integer.parseInt(currentVersion.split("\\.")[0]);            
            } catch(Exception e) {
                log.warn(String.format(
                        "Invalid currentVersion specified to ArcGISDataStore: \"%s\", will ask server instead",
                        currentVersion));
                this.currentVersion = null;
            }
        }
        
        String urlString = url.toString();
        
        if(urlString.endsWith("/MapServer")) {
            serverType = ServerType.MapServer;
        } else if(urlString.endsWith("/FeatureServer")) {
            serverType = ServerType.FeatureServer;
        } else {
            throw new IllegalArgumentException("URL must end in \"/MapServer\" or \"/FeatureServer\"");
        }
        if(urlString.indexOf("/rest/") == -1) {
            throw new IllegalArgumentException("URL must contain \"/rest/\"");
        }         
        
        // Uncomment to enable HttpCache4j
        //if(httpCache != null) {
        //    client = new CachingHTTPClient((HTTPCache)httpCache);
        //    if(!Boolean.FALSE.equals(gzip)) {
        //        ((CachingHTTPClient)client).setGzip(true);
        //    }
        //} else {
            client = new SimpleHttpClient();
        //}

        client.setUser(user);
        client.setPassword(passwd);
        if(timeout != null) {
            client.setConnectTimeout(timeout);
            client.setReadTimeout(timeout);
        }
    }
    
    public String getCurrentVersion() throws IOException {
        if(currentVersion == null) {
            log.debug("Determining currentVersion of ArcGIS service to check for 9.x (to prevent this request, provide CURRENT_VERSION parameter to DataStore)");
            
            // currentVersion not included in MapServer/ JSON in 9.3.1, get it
            // from the root services JSON

            URL originalUrl = this.url;
            
            try {
                int i = originalUrl.toString().indexOf("/rest/services");
                String servicesUrl = originalUrl.toString().substring(0, i) + "/rest/services";
                this.url = new URL(servicesUrl);
                
                // XXX Send "Accept-Language: en" when server has Dutch regional settings
                // otherwise server sends currentVersion: 1001 instead of 10.01

                // $ wget -q  -O - "http://<server>.nl/ArcGIS/rest/services?f=pjson" | head -n 1
                // {"currentVersion" : 1001, 
                // $ wget -q --header="Accept-Language: en" -O - "http://<server>.nl/ArcGIS/rest/services?f=pjson" | head -n 1
                // {"currentVersion" : 10.01, 

                // XXX Not possible to send headers with GeoTools interface...
                
                JSONObject servicesInfo = getServerJSONResponse("?f=json");
                
                // ugly workaround
                Object vObject = servicesInfo.get("currentVersion");
                currentVersion = vObject.toString();
                if(vObject instanceof Long && (Long)vObject >= 1000) {
                    currentMajorVersion = 10;
                } else {
                    currentMajorVersion = Integer.parseInt(currentVersion.split("\\.")[0]);            
                }
            } catch(Exception e) {
                throw new IOException("Error finding out the currentVersion of ArcGIS REST service at " + url.toString(), e);
            } finally {
                this.url = originalUrl;
            }
        }            
        return currentVersion;
    }
    
    public int getCurrentMajorVersion() throws IOException {
        if(currentVersion == null) {
            getCurrentVersion();
        }
        return currentMajorVersion;
    }
    
    public JSONObject getServerJSONResponse(String extraUrl) throws IOException {
        String requestUrl = url + (extraUrl.startsWith("/") ? "" : "/") + extraUrl;
        log.debug("request: " + requestUrl);
        HTTPResponse response = client.get(new URL(requestUrl));
        try {
            String json = IOUtils.toString(response.getResponseStream(), "UTF-8");
            JSONObject j = (JSONObject)JSONValue.parse(json);

            if(j == null) {
                int endIndex = Math.min(json.length(), 30);
                throw new IOException("ArcGIS server returned invalid JSON response: " + json.substring(0, endIndex));
            } 
            if(j.containsKey("error")) {
                throw new ArcGISException(requestUrl, j);
            }
            return j;
        } finally {
            response.dispose();
        }
    }
    
    public static String appendUrlParameters(String url, Map<String,String> params) {
        StringBuilder sb = new StringBuilder(url);
        if(!params.isEmpty()) {
            if(url.indexOf("?") == -1) {
                sb.append("?");
            } else {
                sb.append("&");
            }
            boolean first = true;
            
            for(Map.Entry<String,String> entry: params.entrySet()) {
                if(first) {
                    first = false;
                } else {
                    sb.append("&");
                }
                try {
                    sb.append(URLEncoder.encode(entry.getKey(), "UTF-8"));
                    sb.append("=");
                    sb.append(URLEncoder.encode(entry.getValue(), "UTF-8"));
                } catch(UnsupportedEncodingException e) {
                }
            }
        }
        return sb.toString();
    }
    
    public JSONObject getServerJSONResponse(String extraUrl, Map<String,String> params) throws IOException {
        return getServerJSONResponse(appendUrlParameters(extraUrl, params));
    }
    
    private JSONObject requestLayerJSON(String id) throws IOException {
        JSONObject layer = getServerJSONResponse(id + "?f=json");
        return layer;
    }
    
    public JSONObject getLayerJSON(String id) throws IOException {
        if(layersById.containsKey(id)) {
            
            if(getCurrentMajorVersion() > 9) {
                // Full layer JSON always available
                return layersById.get(id);
            } else {
                // Layer JSON must be fetched per layer in 9.x, but do this on
                // demand
                
                // If the current JSON object has a "type", the full layer JSON
                // was already fetched
                
                JSONObject layer = layersById.get(id);
                if(!layer.containsKey("type")) {
                    layer = requestLayerJSON(id);                    
                    layersById.put(id, layer);
                }
                return layer;
            }
        } else {
            return requestLayerJSON(id);
        }
    }    
      
    private JSONObject checkLayerJSON(String id, JSONObject layer) throws IOException {

        /* No use checking layer JSON for query capabilities in 9.x */
        if(getCurrentMajorVersion() > 9) {
        
            String capabilities = (String)layer.get("capabilities");

            if(capabilities == null || Arrays.asList(capabilities.split(",")).indexOf("Query") == -1) {
                throw new IOException("ArcGIS layer " + id + " has no Query capabilities");
            }
        }
        
        layersById.put(id, layer);
        return layer;
    }    
    
    @Override
    protected List<Name> createTypeNames() throws IOException {
        try {
            if(typeNames == null) {
                typeNames = new ArrayList<Name>();
                
                JSONObject info;
                if(getCurrentMajorVersion() >= 10) {
                    // In version 10, get full layers info immediately
                    // The MapServer/ JSON is not very interesing by itself
                    info = getServerJSONResponse("/layers?f=json");
                } else {
                    // In 9.x, MapServer/layers is not supported
                    info = getServerJSONResponse("?f=json");
                }
                
                JSONArray layers = (JSONArray)info.get("layers");
                for(Object o: layers) {
                    if(! (o instanceof JSONObject)) {
                        continue;
                    }
                    JSONObject layer = (JSONObject)o;
                    if(layer.get("id") == null) {
                        continue;
                    }
                    
                    String id = layer.get("id").toString();
                    
                    //if(serverType == ServerType.FeatureServer || currentMajorVersion < 10) {
                    //    layer = getServerJSONResponse(id + "?f=json");
                    //}
                    
                    if(checkLayerJSON(id, layer) != null) {
                        layersById.put(id, layer);
                        typeNames.add(new NameImpl(id));
                    }
                }
                
            }
            return typeNames;
        } catch(IOException ioe) {
            throw ioe;
        } catch(Exception e) {
            throw new IOException(e);
        }
    }

    @Override
    protected ContentFeatureSource createFeatureSource(ContentEntry ce) throws IOException {
        return new ArcGISFeatureSource(ce);
    }

    public CoordinateReferenceSystem getCRS() {
        return crs;
    }
    
    @Override
    public String toString() {
        return "ArcGISDataStore URL=" + url.toString();
    }    
}
