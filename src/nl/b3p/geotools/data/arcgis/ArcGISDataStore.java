/*
 * Copyright (C) 2012 B3Partners B.V.
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
package nl.b3p.geotools.data.arcgis;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.*;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.codehaus.httpcache4j.cache.HTTPCache;
import org.codehaus.httpcache4j.cache.MemoryCacheStorage;
import org.codehaus.httpcache4j.client.HTTPClientResponseResolver;
import org.geotools.data.DataStore;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.data.ows.HTTPClient;
import org.geotools.data.ows.HTTPResponse;
import org.geotools.data.ows.SimpleHttpClient;
import org.geotools.data.store.ContentDataStore;
import org.geotools.data.store.ContentEntry;
import org.geotools.data.store.ContentFeatureSource;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.geotools.feature.NameImpl;
import org.geotools.referencing.CRS;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.feature.type.Name;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

/**
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

    private HTTPCache httpCache;
    private HTTPClient client;
    
    public ArcGISDataStore(URL url) {
        this(url, null, null, null, null, null, null);
    }
    
    public ArcGISDataStore(URL url, String user, String passwd, Integer timeout, Boolean gzip, CoordinateReferenceSystem crs, HTTPCache httpCache) {
        this.url = url;
        this.crs = crs;        
        
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

        this.httpCache = httpCache;
        
        if(httpCache != null) {
            client = new CachingHTTPClient(httpCache);
            if(!Boolean.FALSE.equals(gzip)) {
                ((CachingHTTPClient)client).setGzip(true);
            }
        } else {
            client = new SimpleHttpClient();
        }

        client.setUser(user);
        client.setPassword(passwd);
        if(timeout != null) {
            client.setConnectTimeout(timeout);
            client.setReadTimeout(timeout);
        }
    }
    
    public JSONObject getServerJSONResponse(String extraUrl) throws IOException {
        String requestUrl = url + (extraUrl.startsWith("/") ? "" : "/") + extraUrl;
        log.debug("request: " + requestUrl);
        HTTPResponse response = client.get(new URL(requestUrl));
        try {
            String json = IOUtils.toString(response.getResponseStream(), "UTF-8");
            JSONObject j = (JSONObject)JSONValue.parse(json);

            if(j == null) {
                throw new IOException("ArcGIS server returned no JSON response: " + json);
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
        return checkLayerJSON(id, layer);
    }
    
    private JSONObject checkLayerJSON(String id, JSONObject layer) throws IOException {

        String capabilities = (String)layer.get("capabilities");

        if(capabilities != null && Arrays.asList(capabilities.split(",")).indexOf("Query") != -1) {
            layersById.put(id, layer);
            return layer;
        } else {
            throw new IOException("ArcGIS layer " + id + " has no Query capabilities");
        }
    }    
    
    @Override
    protected List<Name> createTypeNames() throws IOException {
        try {
            if(typeNames == null) {
                typeNames = new ArrayList<Name>();
                
                JSONObject info = getServerJSONResponse((serverType == ServerType.MapServer ? "/layers" : "") + "?f=json");
                
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
                    
                    if(serverType == ServerType.FeatureServer) {
                        layer = getServerJSONResponse(id + "?f=json");
                    }
                    
                    if(checkLayerJSON(id, layer) != null) {
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
    
    public JSONObject getLayerJSON(String id) throws IOException {
        if(layersById.containsKey(id)) {
            return layersById.get(id);
        } else {
            return requestLayerJSON(id);
        }
    }
    
    @Override
    public String toString() {
        return "ArcGISDataStore URL=" + url.toString();
    }    
    
    public static void main(String... args) throws Exception {
        CoordinateReferenceSystem crs = CRS.decode("EPSG:28992");
        
        HTTPCache cache = new HTTPCache(
            new MemoryCacheStorage(),
            HTTPClientResponseResolver.createMultithreadedInstance()
        );
        
        DataStore ds = new ArcGISDataStore(
                new URL("http://gisopenbaar.toverijs3.nl/ArcGIS/rest/services/VenB/vergunningen_bekendmakingen/MapServer"),
                null,
                null,
                null,
                null,
                crs, cache);
/*
        print(ds);*/
        
        ds = new ArcGISDataStore(
                new URL("http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/SanFrancisco/311Incidents/FeatureServer"),
                "pietje",
                "puk",
                null,
                null,
                crs, cache);

        print(ds);
        Thread.sleep(5000);
        print(ds);        
        /*
        ds = new ArcGISDataStore(
                new URL("http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Petroleum/KSFields/FeatureServer"),
                null,
                null,
                null,
                crs);

        print(ds);*/
    }
    
    private static void print(DataStore ds) throws Exception {
        System.out.println(ds);

        String[] typeNames = ds.getTypeNames();
        
        for(String t: typeNames) {
            System.out.println("Type name: " + t);
            try {
                FeatureSource fs = ds.getFeatureSource(t);
                //System.out.println("Feature source: " + fs);
                //System.out.println("Count: " + fs.getCount(Query.ALL));
                
                Query q = new Query();
                q.setStartIndex(2);
                q.setMaxFeatures(150);
                FeatureCollection fc = fs.getFeatures(q);

                FeatureIterator<SimpleFeature> it = fc.features();
                try {
                    while(it.hasNext()) {
                        SimpleFeature f = (SimpleFeature)it.next();
                        
                        StringBuilder sb = new StringBuilder();
                        for(AttributeDescriptor ad: f.getFeatureType().getAttributeDescriptors()) {
                            sb.append(", ");
                            sb.append(ad.getLocalName());
                            sb.append("=");
                            sb.append(f.getAttribute(ad.getLocalName()));
                        }
                        System.out.println(f.getID() + ": " + f.getDefaultGeometry() + sb.toString());
                    }
                } finally {
                    it.close();                        
                    fs.getDataStore().dispose();
                }
                
            } catch(Exception e) {
                e.printStackTrace();
            }            
        }
    }
}
