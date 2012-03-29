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

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.Point;
import java.io.IOException;
import java.io.StringReader;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
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
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.FeatureIterator;
import org.geotools.filter.text.cql2.CQL;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/featureinfo")
@StrictBinding
public class FeatureInfoActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(FeatureInfoActionBean.class);

    public static final String FID = "__fid";
    
    private ActionBeanContext context;

    private static final int TIMEOUT = 5000;
    
    @Validate
    private int limit = 10;
    
    @Validate
    private String x;
    
    @Validate 
    private String y;
    
    @Validate
    private String distance;
    
    @Validate
    private String queryJSON;
    
    @Validate
    private boolean edit = false;
    
    @Validate
    private boolean arrays = false;
    
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

    public String getDistance() {
        return distance;
    }

    public void setDistance(String distance) {
        this.distance = distance;
    }
    
    public String getQueryJSON() {
        return queryJSON;
    }

    public void setQueryJSON(String queryJSON) {
        this.queryJSON = queryJSON;
    }

    public String getX() {
        return x;
    }

    public void setX(String x) {
        this.x = x;
    }

    public String getY() {
        return y;
    }

    public void setY(String y) {
        this.y = y;
    }

    public boolean isEdit() {
        return edit;
    }

    public void setEdit(boolean edit) {
        this.edit = edit;
    }

    public boolean isArrays() {
        return arrays;
    }

    public void setArrays(boolean arrays) {
        this.arrays = arrays;
    }
    //</editor-fold>
    
    private List<String> setPropertyNames(ApplicationLayer appLayer, Query q, boolean edit, String geomAttribute) {
        List<String> propertyNames = new ArrayList<String>();
        boolean haveInvisibleProperties = false;
        for(ConfiguredAttribute ca: appLayer.getAttributes()) {
            if((!edit && ca.isVisible()) || (edit && ca.isEditable()) || (edit && ca.getAttributeName().equals(geomAttribute))) {
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
                    if(!edit) {
                        for(AttributeDescriptor ad: l.getFeatureType().getAttributes()) {
                            if(ad.getAlias() != null) {
                                attributeAliases.put(ad.getName(), ad.getAlias());
                            }
                        }
                    }
                
                    String filter = query.optString("filter", null);
                    
                    FeatureSource fs = l.getFeatureType().openGeoToolsFeatureSource(TIMEOUT);
                    
                    Query q = new Query(fs.getName().toString());
                    
                    String geomAttribute = fs.getSchema().getGeometryDescriptor().getLocalName();

                    List<String> propertyNames;
                    if(al != null) {
                        propertyNames = setPropertyNames(al, q, edit, geomAttribute);
                    } else {
                        propertyNames = new ArrayList<String>();
                        for(AttributeDescriptor ad: l.getFeatureType().getAttributes()) {
                            propertyNames.add(ad.getName());
                        }
                    }
                    
                    FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
                    
                    Point point = new GeometryFactory().createPoint(new Coordinate(
                            Double.parseDouble(x),
                            Double.parseDouble(y)));
                    Filter dwithin = ff.dwithin(ff.property(geomAttribute), ff.literal(point), Double.parseDouble(distance), "meters");

                    Filter currentFilter = filter != null ? CQL.toFilter(filter) : null;
                    Filter f = currentFilter != null ? ff.and(dwithin, currentFilter) : dwithin;
                    
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
    
    private JSONArray getJSONFeatures(FeatureSource fs, Query q, List<String> propertyNames, Map<String,String> attributeAliases) throws IOException, JSONException {
        FeatureIterator<SimpleFeature> it = fs.getFeatures(q).features();
        JSONArray features = new JSONArray();
        try {
            while(it.hasNext()) {
                SimpleFeature f = it.next();

                JSONObject j = new JSONObject();

                if(arrays) {
                    int idx = 0;
                    for(String name: propertyNames) {
                        Object value = f.getAttribute(name);
                        j.put("c" + idx++, formatValue(value));
                    }    
                } else {
                    for(String name: propertyNames) {
                        String alias = attributeAliases.get(name);
                        j.put(alias != null ? alias : name, formatValue(f.getAttribute(name)));
                    }                     
                }
                j.put(FID, f.getID());
                features.put(j);
            }
            return features;
        } finally {
            it.close();                        
            fs.getDataStore().dispose();
        }
    }
    
    private DateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
    
    private Object formatValue(Object value) {
        if(value instanceof Date) {
            // JSON has no date type so format the date as it is used for 
            // display, not calculation
            return dateFormat.format((Date)value);
        } else {
            return value;
        }
    }
    
}
