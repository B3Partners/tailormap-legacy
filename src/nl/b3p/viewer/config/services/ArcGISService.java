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
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.geotools.data.ows.HTTPClient;
import org.geotools.data.ows.SimpleHttpClient;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

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

    /** GeoService.details map key for ArcGIS currentVersion property */
    public static final String DETAIL_CURRENT_VERSION = "arcgis_currentVersion";    

    /** Layer.details map key for ArcGIS type property */
    public static final String DETAIL_TYPE = "arcgis_type";    
    /** Layer.details map key for ArcGIS description property */
    public static final String DETAIL_DESCRIPTION = "arcgis_description";
    /** Layer.details map key for ArcGIS geometryType property */
    public static final String DETAIL_GEOMETRY_TYPE = "arcgis_geometryType";
    /** Layer.details map key for ArcGIS capabilities property */
    public static final String DETAIL_CAPABILITIES = "arcgis_capabilities";
    /** Layer.details map key for ArcGIS defaultVisibility property */
    public static final String DETAIL_DEFAULT_VISIBILITY = "arcgis_defaultVisibility";
    /** Layer.details map key for ArcGIS definitionExpression property */
    public static final String DETAIL_DEFINITION_EXPRESSION = "arcgis_definitionExpression";
    
    // Layer types are not specified in the ArcGIS API reference, so these are guesses.
    // See {nl.b3p.viewer.config.services.Layer#virtual}
    // Group layers are thus virtual layers. Sometimes ArcGIS even has layers 
    // without a type...
    public static final Set<String> NON_VIRTUAL_LAYER_TYPES = Collections.unmodifiableSet(new HashSet(Arrays.asList(new String[] {
        "Feature Layer",
        "Annotation Layer" // not sure about this one...
    })));
    
    private static JSONObject issueRequest(String url, HTTPClient client) throws Exception {
        return new JSONObject(IOUtils.toString(client.get(new URL(url)).getResponseStream(), "UTF-8"));
    }
    
    @Transient
    private JSONObject serviceInfo;
    @Transient
    private String currentVersion;
    @Transient
    private int currentVersionMajor;
    
    //<editor-fold defaultstate="collapsed" desc="Loading service metadata from ArcGIS">
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
            
            ArcGISService s = new ArcGISService();
            s.setUrl(url);
            s.loadServiceInfo(client);
            
            if(Boolean.TRUE.equals(params.get(GeoService.PARAM_ONLINE_CHECK_ONLY))) {
                return null;
            }
            
            // Get name from URL instead of MapServer/:documentInfo.Title
            // Will not change on update
            int i = url.lastIndexOf("/MapServer");
            String temp = url.substring(0,i);
            i = temp.lastIndexOf("/");
            String name = temp.substring(i+1);
            
            s.setName(name);
            
            s.load(client, status);
            
            return s;
        } finally {
            status.setProgress(100);
            status.setCurrentAction("Service ingeladen");
            status.setFinished(true);
        }
    }
    
    private void loadServiceInfo(HTTPClient client) throws Exception {
        // currentVersion not included in MapServer/ JSON in 9.3.1, get it
        // from the root services JSON
        int i = getUrl().indexOf("/rest/services");
        String servicesUrl = getUrl().substring(0, i) + "/rest/services";
        serviceInfo = issueRequest(servicesUrl + "?f=json", client);
        currentVersion = serviceInfo.getString("currentVersion");
        currentVersionMajor = Integer.parseInt(currentVersion.split("\\.")[0]);
        
        if(currentVersionMajor >= 10) {
            // In version 10, get full layers info immediately
            // The MapServer/ JSON is not very interesing by itself
            serviceInfo = issueRequest(getUrl() + "/layers?f=json", client);
        } else {
            // In 9.x, MapServer/layers is not supported
            serviceInfo = issueRequest(getUrl() + "?f=json", client);
        }
        
        getDetails().put(DETAIL_CURRENT_VERSION, new ClobElement(currentVersion));
    }
    
    private void load(HTTPClient client, WaitPageStatus status) throws Exception {
        int layerCount = serviceInfo.getJSONArray("layers").length();
        
        status.setProgress((int)Math.round(100.0/(layerCount+1)));
        
        status.setCurrentAction("Inladen layers...");
        
        /* Automatically create featuresource */
        ArcGISFeatureSource fs = new ArcGISFeatureSource();
        fs.setLinkedService(this);
        fs.setUrl(getUrl());
        fs.setUsername(client.getUser());
        fs.setPassword(client.getPassword());
        
        Layer top = new Layer();
        
        top.setVirtual(true);
        top.setTitle("Layers");
        top.setService(this);
        
        Map<String,Layer> layersById = new HashMap();
        Map<String,List<String>> childrenByLayerId = new HashMap();
        List<Layer> allLayers = new ArrayList();
        
        if(currentVersionMajor >= 10) {
            // info is the MapServer/layers response, all layers JSON info
            // immediately available
            JSONArray layers = serviceInfo.getJSONArray("layers");
            for(int i = 0; i < layers.length(); i++) {
                JSONObject layer = layers.getJSONObject(i);
                
                Layer l = parseArcGISLayer(layer, this, fs, childrenByLayerId);
                layersById.put(l.getName(), l);
                allLayers.add(l);
            }
        } else {
            // In 9.x, request needed for each layer
            JSONArray layers = serviceInfo.getJSONArray("layers");
            for(int i = 0; i < layers.length(); i++) {
                JSONObject layer = layers.getJSONObject(i);
                String id = layer.getString("id");
                status.setCurrentAction("Inladen laag \"" + layer.optString("name", id) + "\"");
                layer = issueRequest(getUrl() + "/" + id + "?f=json", client);
                
                Layer l = parseArcGISLayer(layer, this, fs, childrenByLayerId);
                layersById.put(l.getName(), l);
                allLayers.add(l);
                status.setProgress((int)Math.round( 100.0/(layerCount+1) * i+2 ));
            }
        }
        
        /* 2nd pass: fill children list and parent references */
        /* children of top layer is special because those have parentLayerId -1 */
        
        for(Layer l: allLayers) {
            List<String> childrenIds = childrenByLayerId.get(l.getName());
            if(childrenIds != null) {
                for(String childId: childrenIds) {
                    Layer child = layersById.get(childId);
                    if(child != null) {
                        l.getChildren().add(child);
                        child.setParent(l);
                    }
                }
            }
        }
        
        for(Layer l: allLayers) {
            if(l.getParent() == null) {
                top.getChildren().add(l);
                l.setParent(top);
            }
        }
        
        setTopLayer(top);
        
        // FeatureSource is navigable via Layer.featureType CascadeType.PERSIST relation
        if(!fs.getFeatureTypes().isEmpty()) {
            fs.setName(FeatureSource.findUniqueName(getName()));
        }
    }
    
    private Layer parseArcGISLayer(JSONObject agsl, GeoService service, ArcGISFeatureSource fs, Map<String,List<String>> childrenByLayerId) throws JSONException {
        Layer l = new Layer();
        // parent set later in 2nd pass
        l.setService(service);
        l.setName(agsl.getString("id"));
        l.setTitle(agsl.getString("name"));
        
        JSONArray subLayerIds = agsl.optJSONArray("subLayers");
        if(subLayerIds != null) {
            List<String> childrenIds = new ArrayList();
            for(int i = 0; i < subLayerIds.length(); i++) {
                JSONObject subLayer = subLayerIds.getJSONObject(i);
                String subLayerId = subLayer.getInt("id") + "";
                childrenIds.add(subLayerId);
            }
            childrenByLayerId.put(l.getName(), childrenIds);
        }
        
        l.getDetails().put(DETAIL_TYPE, agsl.getString("type"));
        l.getDetails().put(DETAIL_CURRENT_VERSION, agsl.optString("currentVersion", currentVersion));
        l.getDetails().put(DETAIL_DESCRIPTION, StringUtils.defaultIfBlank(agsl.getString("description"),null));
        l.getDetails().put(DETAIL_GEOMETRY_TYPE, agsl.getString("geometryType"));
        l.getDetails().put(DETAIL_CAPABILITIES, agsl.optString("capabilities"));
        l.getDetails().put(DETAIL_DEFAULT_VISIBILITY, agsl.optBoolean("defaultVisibility",false) ? "true" : "false");
        l.getDetails().put(DETAIL_DEFINITION_EXPRESSION, StringUtils.defaultIfBlank(agsl.optString("definitionExpression"), null));
        
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
        
        boolean hasFields = fields.length() > 0;
        
        /* We could check capabilities field for "Query", but don't bother,
         * group layers have Query in that property but no fields...
         */
        l.setQueryable(hasFields);
        l.setFilterable(hasFields);
        
        l.setVirtual(!NON_VIRTUAL_LAYER_TYPES.contains(l.getDetails().get(DETAIL_TYPE)));
        
        return l;
    }
    //</editor-fold>
    
    //<editor-fold desc="Add currentVersion to toJSONObject()">
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
        
        ClobElement ce = getDetails().get(DETAIL_CURRENT_VERSION);
        String cv = ce != null ? ce.getValue() : null;
        
        if(cv == null && getTopLayer() != null) {
            // get it from the topLayer, was saved there before GeoService.details
            // was added
            cv = getTopLayer().getDetails().get(DETAIL_CURRENT_VERSION);
            
            // try the first actual layer where may have been saved in version < 4.1
            if(cv == null && !getTopLayer().getChildren().isEmpty()) {
                cv = getTopLayer().getChildren().get(0).getDetails().get(DETAIL_CURRENT_VERSION);
            }
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
        
        return o;
    }
    
    @Override
    public JSONObject toJSONObject(boolean flatten) throws JSONException {
        return toJSONObject(flatten, null);
    }
    //</editor-fold>
    
}
