/*
 * Copyright (C) 2011 B3Partners B.V.
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
package nl.b3p.viewer.config.services;

import java.net.URL;
import java.util.*;
import javax.persistence.*;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.io.IOUtils;
import org.geotools.data.ows.HTTPClient;
import org.geotools.data.ows.SimpleHttpClient;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(ArcGISService.PROTOCOL)
public class ArcGISService extends GeoService {
    public static final String PROTOCOL = "arcgis";

    public static final String PARAM_USERNAME = "username";
    public static final String PARAM_PASSWORD = "password";    

    /** Layer.details map key for ArcGIS type property */
    public static final String DETAIL_TYPE = "arcgis_type";    
    /** Layer.details map key for ArcGIS currentVersion property */
    public static final String DETAIL_CURRENT_VERSION = "arcgis_currentVersion";    
    /** Layer.details map key for ArcGIS description property */
    public static final String DETAIL_DESCRIPTION = "arcgis_description";
    /** Layer.details map key for ArcGIS geometryType property */
    public static final String DETAIL_GEOMETRY_TYPE = "arcgis_geometryType";
    /** Layer.details map key for ArcGIS capabilities property */
    public static final String DETAIL_CAPABILITIES = "arcgis_capabilities";
    
    private static JSONObject issueRequest(String url, HTTPClient client) throws Exception {
        return new JSONObject(IOUtils.toString(client.get(new URL(url)).getResponseStream(), "UTF-8"));
    }
    
    @Transient
    private String currentVersion;
    @Transient
    private int currentVersionMajor;
    
    @Override
    public ArcGISService loadFromUrl(String url, Map params, WaitPageStatus status) throws Exception {
        try {
            status.setCurrentAction("Ophalen informatie...");

            if(!url.endsWith("/MapServer")) {
                throw new IllegalArgumentException("URL moet eindigen in \"/MapServer\"");
            }
            if(url.indexOf("/rest/services") == -1) {
                throw new IllegalArgumentException("URL moet \"/rest/\" bevatten");
            }   
            
            HTTPClient client = new SimpleHttpClient();
            client.setUser((String)params.get(PARAM_USERNAME));
            client.setPassword((String)params.get(PARAM_PASSWORD));
            
            // currentVersion not included in MapServer/ JSON in 9.3.1, get it
            // from the root services JSON
            int i = url.indexOf("/rest/services");
            String servicesUrl = url.substring(0, i) + "/rest/services";
            JSONObject servicesInfo = issueRequest(servicesUrl + "?f=json", client);
            currentVersion = servicesInfo.getString("currentVersion");
            currentVersionMajor = Integer.parseInt(currentVersion.split("\\.")[0]);
            
            JSONObject info;
            if(currentVersionMajor >= 10) {
                // In version 10, get full layers info immediately
                // The MapServer/ JSON is not very interesing by itself
                info = issueRequest(url + "/layers?f=json", client);
            } else {
                // In 9.x, MapServer/layers is not supported
                info = issueRequest(url + "?f=json", client);
            }

            if(Boolean.TRUE.equals(params.get(GeoService.PARAM_ONLINE_CHECK_ONLY))) {
                return null;
            }
            
            ArcGISService s = new ArcGISService();
            
            // Get name from URL instead of MapServer/:documentInfo.Title 
            i = url.lastIndexOf("/MapServer");
            String temp = url.substring(0,i);
            i = temp.lastIndexOf("/");
            String name = temp.substring(i+1);
            
            s.setUrl(url);
            s.setName(name);

            int layerCount = 1;
            try {
                layerCount = info.getJSONArray("layers").length();
            } catch(JSONException e) {
            }
            status.setProgress((int)Math.round(100.0/(layerCount+1)));

            status.setCurrentAction("Inladen layers...");

            /* Automatically create featuresource */
            ArcGISFeatureSource fs = new ArcGISFeatureSource();
            fs.setLinkedService(s);
            fs.setUrl(url);
            fs.setUsername(client.getUser());
            fs.setPassword(client.getPassword());
            
            Layer top = new Layer();
            
            top.setVirtual(true);
            top.setTitle("Layers");
            top.setService(s);
            top.getDetails().put(DETAIL_CURRENT_VERSION, currentVersion);

            if(currentVersionMajor >= 10) {
                // info is the MapServer/layers response, all layers JSON info
                // immediately available
                JSONArray layers = info.getJSONArray("layers");
                for(i = 0; i < layers.length(); i++) {
                    JSONObject layer = layers.getJSONObject(i);
                    top.getChildren().add(parseArcGISLayer(layer, s, fs, top));
                }
            } else {
                // In 9.x, request needed for each layer
                JSONArray layers = info.getJSONArray("layers");
                for(i = 0; i < layers.length(); i++) {
                    JSONObject layer = layers.getJSONObject(i);
                    String id = layer.getString("id");
                    status.setCurrentAction("Inladen laag \"" + layer.optString("name", id) + "\"");
                    layer = issueRequest(url + "/" + id + "?f=json", client);
                    top.getChildren().add(parseArcGISLayer(layer, s, fs, top));
                    status.setProgress((int)Math.round( 100.0/(layerCount+1) * i+2 ));                    
                }                
            }
                
            s.setTopLayer(top);
            
            if(!Boolean.FALSE.equals(params.get(PARAM_PERSIST_FEATURESOURCE)) && !fs.getFeatureTypes().isEmpty()) {
                fs.setName(FeatureSource.findUniqueName(s.getName()));
                Stripersist.getEntityManager().persist(fs);
            }
            
            return s;
        } finally {
            status.setProgress(100);
            status.setCurrentAction("Service ingeladen");
            status.setFinished(true);
        }
    } 
    
    @Override
    public JSONObject toJSONObject(boolean flatten, Set<String> layersToInclude) throws JSONException {
        JSONObject o = super.toJSONObject(flatten, layersToInclude);

        // Add currentVersion info to service info 
        
        // Assume 9.x by default
        
        JSONObject json = new JSONObject();
        o.put("arcGISVersion", json);
        json.put("s", "9.x");    // complete currentVersion string
        json.put("major", 9L);   // major version, integer
        json.put("number", 9.0); // version as as Number

        // currentVersion is persisted as layer details property
        
        if(getTopLayer() != null) {
            // get it from the topLayer (only saved in topLayer since version 4.1)
            String cv = getTopLayer().getDetails().get(DETAIL_CURRENT_VERSION);
            
            // try the first actual layer where may have been saved in version < 4.1 
            if(cv == null && !getTopLayer().getChildren().isEmpty()) {
                cv = getTopLayer().getChildren().get(0).getDetails().get(DETAIL_CURRENT_VERSION);
            }
            if(cv != null) {
                json.put("s", cv);
                try {
                    String[] parts = cv.split("\\.");
                    json.put("major", Integer.parseInt(parts[0]));
                    json.put("number", Double.parseDouble(cv));
                } catch(Exception e) {
                    // keep defaults
                }
            }
        }

        return o;
    }    
    
    @Override
    public JSONObject toJSONObject(boolean flatten) throws JSONException {
        return toJSONObject(flatten, null);
    }
    
    private Layer parseArcGISLayer(JSONObject agsl, GeoService service, ArcGISFeatureSource fs, Layer parent) throws JSONException {
        Layer l = new Layer();
        l.setParent(parent);
        l.setService(service);
        l.setFilterable(true);
        l.setQueryable(true); // Could check capabilities field for "Query", but don't bother
        l.setName(agsl.getString("id"));
        l.setTitle(agsl.getString("name"));

        l.getDetails().put(DETAIL_TYPE, agsl.getString("type"));
        l.getDetails().put(DETAIL_CURRENT_VERSION, agsl.optString("currentVersion", currentVersion));        
        l.getDetails().put(DETAIL_DESCRIPTION, agsl.getString("description"));        
        l.getDetails().put(DETAIL_GEOMETRY_TYPE, agsl.getString("geometryType"));  
        l.getDetails().put(DETAIL_CAPABILITIES, agsl.optString("capabilities"));        
        
        try {
            l.setMinScale(agsl.getDouble("minScale"));
            l.setMaxScale(agsl.getDouble("maxScale"));
        } catch(JSONException e) {
        }

        try {
            JSONObject extent = agsl.getJSONObject("extent");
            BoundingBox bbox = new BoundingBox();
            bbox.setMinx(extent.getDouble("xmin"));
            bbox.setMaxx(extent.getDouble("xmax"));
            bbox.setMiny(extent.getDouble("ymin"));
            bbox.setMaxy(extent.getDouble("ymax"));
            bbox.setCrs(new CoordinateReferenceSystem("EPSG:" + extent.getJSONObject("spatialReference").getInt("wkid")));
            l.getBoundingBoxes().put(bbox.getCrs(), bbox);
        } catch(JSONException e) {
        }

        // XXX implemented in ArcGISDataStore
        // XXX sometimes geometry field not in field list but layer has geometryType
       JSONArray fields = agsl.getJSONArray("fields");
       if(fields.length() > 0) {
            SimpleFeatureType sft = new SimpleFeatureType();
            sft.setFeatureSource(fs);
            sft.setTypeName(l.getName());
            sft.setDescription(l.getTitle());  
            sft.setWriteable(false);
           
            for(int i = 0; i < fields.length(); i++) {
                JSONObject field = fields.getJSONObject(i);

                AttributeDescriptor att = new AttributeDescriptor();
                sft.getAttributes().add(att);
                att.setName(field.getString("name"));
                att.setAlias(field.getString("alias"));

                String et = field.getString("type");
                String type = AttributeDescriptor.TYPE_STRING;
                if("esriFieldTypeOID".equals(et)) {
                    type = AttributeDescriptor.TYPE_INTEGER;
                } else if("esriFieldTypeGeometry".equals(et)) {
                    if(sft.getGeometryAttribute() == null) {
                        sft.setGeometryAttribute(att.getName());
                    }
                    String gtype = agsl.getString("geometryType");
                    if("esriGeometryPoint".equals(gtype)) {
                        type = AttributeDescriptor.TYPE_GEOMETRY_POINT;
                    } else if("esriGeometryMultipoint".equals(gtype)) {
                        type = AttributeDescriptor.TYPE_GEOMETRY_MPOINT;
                    } else if("esriGeometryLine".equals(gtype) || "esriGeometryPolyline".equals(gtype)) {
                        type = AttributeDescriptor.TYPE_GEOMETRY_LINESTRING;
                    } else if("esriGeometryPolygon".equals(gtype)) {
                        type = AttributeDescriptor.TYPE_GEOMETRY_POLYGON;
                    } else {
                        // don't bother
                        type = AttributeDescriptor.TYPE_GEOMETRY;
                    }
                } else if("esriFieldTypeDouble".equals(et)) {
                    type = AttributeDescriptor.TYPE_DOUBLE;
                } else if("esriFieldTypeInteger".equals(et)
                        ||"esriFieldTypeSmallInteger".equals(et)) {
                    type = AttributeDescriptor.TYPE_INTEGER;
                } else if("esriFieldTypeDate".equals(et)) {
                    type = AttributeDescriptor.TYPE_DATE;
                }
                att.setType(type);
            }
            fs.getFeatureTypes().add(sft);
            l.setFeatureType(sft);
        }        
/* XXX subLayers references top level layer, not a full JSON layer object
 * two passes needed to properly parse tree structure to set Layer.parent and
 * Layer.children
        JSONArray children = agsl.getJSONArray("subLayers");
        for(int i = 0; i < children.length(); i++) {
            l.getChildren().add(parseArcGISLayer(children.getJSONObject(i), service, fs, l));
        }
*/                        
        return l;
    }
    
}
