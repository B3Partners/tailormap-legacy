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

    private static JSONObject issueRequest(String url) throws Exception {
        /* XXX */
        return new JSONObject(IOUtils.toString(new URL(url+"?f=json").openStream(), "UTF-8"));
    }
    
    @Override
    public ArcGISService loadFromUrl(String url, Map params, WaitPageStatus status) throws Exception {
        try {
            status.setCurrentAction("Ophalen informatie...");

            if(!url.endsWith("/MapServer")) {
                throw new IllegalArgumentException("URL moet eindigen in \"/MapServer\"");
            }
            if(url.indexOf("/rest/") == -1) {
                throw new IllegalArgumentException("URL moet \"/rest/\" bevatten");
            }   
            
            JSONObject info = issueRequest(url + "/layers");

            ArcGISService s = new ArcGISService();
            
            int i = url.lastIndexOf("/MapServer");
            String temp = url.substring(0,i);
            i = temp.lastIndexOf("/");
            String name = temp.substring(i+1);
            
            s.setUrl(url);
            s.setName(name);

            status.setProgress(50);
            status.setCurrentAction("Inladen layers...");

            /* Automatically create featuresource */
            ArcGISFeatureSource fs = new ArcGISFeatureSource();
            fs.setLinkedService(s);
            fs.setUrl(url);
            fs.setName(FeatureSource.findUniqueName(s.getName()));
            
            Layer top = new Layer();
            
            top.setVirtual(true);
            top.setTitle("Layers");
            top.setService(s);

            JSONArray layers = info.getJSONArray("layers");
            for(i = 0; i < layers.length(); i++) {
                JSONObject layer = layers.getJSONObject(i);
                top.getChildren().add(parseArcGISLayer(layer, s, fs, top));
            }
            s.setTopLayer(top);
            
            if(!fs.getFeatureTypes().isEmpty()) {
                Stripersist.getEntityManager().persist(fs);
            }
            
            return s;
        } finally {
            status.setProgress(100);
            status.setCurrentAction("Service ingeladen");
            status.setFinished(true);
        }
    } 
    
    private Layer parseArcGISLayer(JSONObject agsl, GeoService service, ArcGISFeatureSource fs, Layer parent) throws JSONException {
        Layer l = new Layer();
        l.setService(service);
        l.setFilterable(true);
        l.setQueryable(true); // Could check capabilities field for "Query", but don't bother
        l.setName(agsl.getString("id"));
        l.setTitle(agsl.getString("name"));

        l.getDetails().put("arcgis_type", agsl.getString("type"));
        l.getDetails().put("arcgis_currentVersion", agsl.get("currentVersion").toString());        
        l.getDetails().put("arcgis_description", agsl.getString("description"));        
        l.getDetails().put("arcgis_geometryType", agsl.getString("geometryType"));  
        l.getDetails().put("arcgis_capabilities", agsl.getString("capabilities"));        
        
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

       JSONArray fields = agsl.getJSONArray("fields");
       if(fields.length() > 0) {
            SimpleFeatureType sft = new SimpleFeatureType();
            sft.setFeatureSource(fs);
            sft.setTypeName(l.getTitle());  
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
        
        JSONArray children = agsl.getJSONArray("subLayers");
        for(int i = 0; i < children.length(); i++) {
            l.getChildren().add(parseArcGISLayer(children.getJSONObject(i), service, fs, l));
        }
                        
        return l;
    }
    
}
