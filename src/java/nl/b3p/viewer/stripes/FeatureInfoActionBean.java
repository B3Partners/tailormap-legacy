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
package nl.b3p.viewer.stripes;

import java.io.IOException;
import java.io.StringReader;
import java.util.*;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.geotools.filter.visitor.RemoveDistanceUnit;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.Layer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.feature.FeatureIterator;
import org.geotools.filter.text.cql2.CQL;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/featureinfo")
@StrictBinding
public class FeatureInfoActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(FeatureInfoActionBean.class);

    private ActionBeanContext context;

    private static final int TIMEOUT = 5000;
    
    @Validate
    private int limit = 10;
    
    @Validate
    private double x;
    
    @Validate 
    private double y;
    
    @Validate
    private double distance;
    
    @Validate
    private String queryJSON;
    
    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public double getDistance() {
        return distance;
    }

    public void setDistance(double distance) {
        this.distance = distance;
    }

    public String getQueryJSON() {
        return queryJSON;
    }

    public void setQueryJSON(String queryJSON) {
        this.queryJSON = queryJSON;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }
    //</editor-fold>
    
    private List<String> setPropertyNames(ApplicationLayer appLayer, Query q) {
        List<String> propertyNames = new ArrayList<String>();
        boolean haveInvisibleProperties = false;
        for(ConfiguredAttribute ca: appLayer.getAttributes()) {
            if(ca.isVisible()) {
                propertyNames.add(ca.getAttributeName());
            } else {
                haveInvisibleProperties = true;
            }                    
        }
        if(haveInvisibleProperties) {
            // By default Query retrieves Query.ALL_NAMES
            // Query.NO_NAMES is an empty String array
            q.setPropertyNames(propertyNames);
        }
        return propertyNames;
    }    
    
    public Resolution info() throws JSONException {
        JSONArray queries = new JSONArray(queryJSON);
        
        JSONArray responses = new JSONArray();
        
        for(int i = 0; i < queries.length(); i++) {
            JSONObject query = queries.getJSONObject(i);
            
            JSONObject response = new JSONObject();
            responses.put(response);
            response.put("request", query);

            String error = null;
            String exceptionMsg = query.toString();
            try {
                ApplicationLayer al = null;
                GeoService gs = null;
                
                if(query.has("appLayer")) {
                    al = Stripersist.getEntityManager().find(ApplicationLayer.class, query.getLong("appLayer"));
                } else {
                    gs = Stripersist.getEntityManager().find(GeoService.class, query.getLong("service"));
                }
                do {
                    if(al == null && gs == null) {
                        error = "App layer or service not found";
                        break;
                    }
                    Layer l;
                    if(al != null) {
                        l = al.getService().getLayer(al.getLayerName());
                    } else {
                        l = gs.getLayer(query.getString("layer"));
                    }
                    if(l == null) {
                        error = "Layer not found";
                        break;
                    }
                    if(l.getFeatureType() == null) {
                        response.put("noFeatureType",true);
                        break;
                    }
                    
                    Map<String,String> attributeAliases = new HashMap<String,String>();
                    for(AttributeDescriptor ad: l.getFeatureType().getAttributes()) {
                        if(ad.getAlias() != null) {
                            attributeAliases.put(ad.getName(), ad.getAlias());
                        }
                    }
                
                    String filter = query.optString("filter", null);
                    
                    FeatureSource fs = l.getFeatureType().openGeoToolsFeatureSource(TIMEOUT);
                    
                    Query q = new Query(fs.getName().toString());
                    
                    List<String> propertyNames;
                    if(al != null) {
                        propertyNames = setPropertyNames(al, q);
                    } else {
                        propertyNames = new ArrayList<String>();
                        for(AttributeDescriptor ad: l.getFeatureType().getAttributes()) {
                            propertyNames.add(ad.getName());
                        }
                    }
                    String geomAttribute = fs.getSchema().getGeometryDescriptor().getLocalName();
                    
                    String dwithin = String.format("DWITHIN(\"%s\", POINT(%f %f), %f, meters)",
                            geomAttribute,
                            x,
                            y,
                            distance);
                    
                    filter = filter != null ? "(" + dwithin + ") AND (" + filter + ")" : dwithin;
                    
                    Filter f = CQL.toFilter(filter);
                    f = (Filter)f.accept(new RemoveDistanceUnit(), null);
                    q.setFilter(f);
                    q.setMaxFeatures(limit);
                    
                    JSONArray features = getJSONFeatures(fs, q, propertyNames, attributeAliases);
                    response.put("features", features);
                } while(false);
            } catch(Exception e) {
                log.error("Exception loading feature info for " + exceptionMsg, e);
                error = "Exception: " + e.toString();
            } finally {
                if(error != null) {
                    response.put("error", error);
                }
            }
        }
        
        return new StreamingResolution("application/json", new StringReader(responses.toString(4)));        
    }    
    
    private static JSONArray getJSONFeatures(FeatureSource fs, Query q, List<String> propertyNames, Map<String,String> attributeAliases) throws IOException, JSONException {
        FeatureIterator<SimpleFeature> it = fs.getFeatures(q).features();
        JSONArray features = new JSONArray();
        try {
            while(it.hasNext()) {
                SimpleFeature f = it.next();

                JSONObject j = new JSONObject();
                j.put("id", f.getID());
                
                for(String name: propertyNames) {
                    String alias = attributeAliases.get(name);
                    j.put(alias != null ? alias : name, f.getAttribute(name));
                }                     
                features.put(j);
            }
            return features;
        } finally {
            it.close();                        
            fs.getDataStore().dispose();
        }
    }
}
