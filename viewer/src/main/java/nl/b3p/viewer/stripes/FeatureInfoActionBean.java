/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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
package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.controller.LifecycleStage;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.util.GeometricShapeFactory;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.geotools.filter.visitor.RemoveDistanceUnit;
import nl.b3p.viewer.audit.AuditMessageObject;
import nl.b3p.viewer.audit.Auditable;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.FeatureTypeRelation;
import nl.b3p.viewer.config.services.FeatureTypeRelationKey;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.JDBCFeatureSource;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.util.ChangeMatchCase;
import nl.b3p.viewer.util.FeatureToJson;
import nl.b3p.viewer.util.FlamingoCQL;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.filter.text.cql2.CQL;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/featureinfo")
@StrictBinding
public class FeatureInfoActionBean extends LocalizableApplicationActionBean implements Auditable {
    private static final Log log = LogFactory.getLog(FeatureInfoActionBean.class);

    public static final String FID = "__fid";

    private ActionBeanContext context;

    private static final int TIMEOUT = 5000;

    @Validate
    private Application application;

    @Validate
    private int limit = 10;

    @Validate
    private String x;

    @Validate
    private String y;

    @Validate
    private String requestId;

    @Validate
    private String distance;

    @Validate
    private String queryJSON;

    @Validate
    private boolean edit = false;

    @Validate
    private boolean arrays = false;

    @Validate
    private List<Long> attributesToInclude = new ArrayList();

    @Validate
    private boolean graph = false;

    @Validate
    private boolean ordered = false;

    private Layer layer;

    private AuditMessageObject auditMessageObject;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
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

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public List<Long> getAttributesToInclude() {
        return attributesToInclude;
    }

    public void setAttributesToInclude(List<Long> attributesToInclude) {
        this.attributesToInclude = attributesToInclude;
    }

    public boolean isGraph() {
        return graph;
    }

    public void setGraph(boolean graph) {
        this.graph = graph;
    }

    public boolean isOrdered() {
        return ordered;
    }

    public void setOrdered(boolean ordered) {
        this.ordered = ordered;
    }

    public Layer getLayer() {
        return this.layer;
    }

    public AuditMessageObject getAuditMessageObject() {
        return this.auditMessageObject;
    }
    //</editor-fold>

    @Before(stages = LifecycleStage.EventHandling)
    public void initAudit(){
        auditMessageObject = new AuditMessageObject();
    }

    @DefaultHandler
    public Resolution info() throws JSONException {
        JSONArray queries = new JSONArray(queryJSON);

        JSONArray responses = new JSONArray();

        FeatureSource fs = null;

        EntityManager em = Stripersist.getEntityManager();
        for(int i = 0; i < queries.length(); i++) {
            JSONObject query = queries.getJSONObject(i);

            JSONObject response = new JSONObject();
            responses.put(response);
            response.put("request", query);
            if(requestId != null){
                response.put("requestId", requestId);
            }

            String error = null;
            String exceptionMsg = query.toString();
            try {
                ApplicationLayer al = null;
                GeoService gs = null;

                if(query.has("appLayer")) {
                    al = em.find(ApplicationLayer.class, query.getLong("appLayer"));
                } else {
                    gs = em.find(GeoService.class, query.getLong("service"));
                }
                do {
                    if(al == null && gs == null) {
                        error = getBundle().getString("viewer.featureinfoactionbean.1");
                        break;
                    }
                    if(!Authorizations.isAppLayerReadAuthorized(application, al, context.getRequest(), em)) {
                        error = getBundle().getString("viewer.featureinfoactionbean.2");
                        break;
                    }
                    // Edit component does not handle this very gracefully
                    // but the error when saving is ok

                    //if(edit && !Authorizations.isAppLayerWriteAuthorized(application, al, context.getRequest())) {
                    //    error = "U heeft geen rechten om deze kaartlaag te bewerken";
                    //    break;
                    //}
                    if(al != null) {
                        layer = al.getService().getLayer(al.getLayerName(), em);
                    } else {
                        layer = gs.getLayer(query.getString("layer"), em);
                    }
                    if(layer == null) {
                        error = getBundle().getString("viewer.featureinfoactionbean.3");
                        break;
                    }
                    if(layer.getFeatureType() == null) {
                        response.put("noFeatureType",true);
                        break;
                    }else{
                        response.put("featureType", layer.getFeatureType().getId());

                    }
                    String filter = query.optString("filter", null);

                    fs = layer.getFeatureType().openGeoToolsFeatureSource(TIMEOUT);
                    Query q = new Query(fs.getName().toString());

                    String geomAttribute = fs.getSchema().getGeometryDescriptor().getLocalName();

                    FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();

                    Filter spatialFilter=null;

                    boolean useIntersect = false;
                    if (layer.getService().getDetails().containsKey(GeoService.DETAIL_USE_INTERSECT)){
                        ClobElement ce = layer.getService().getDetails().get(GeoService.DETAIL_USE_INTERSECT);
                        useIntersect = Boolean.parseBoolean(ce.getValue());
                    }
                    if (false){
                        Point point = new GeometryFactory().createPoint(new Coordinate(
                            Double.parseDouble(x),
                            Double.parseDouble(y)));

                        spatialFilter = ff.dwithin(ff.property(geomAttribute), ff.literal(point), Double.parseDouble(distance), "meters");
                    }else{
                        GeometricShapeFactory shapeFact = new GeometricShapeFactory();
                        shapeFact.setNumPoints(32);
                        shapeFact.setCentre(new Coordinate(
                                Double.parseDouble(x),Double.parseDouble(y)));
                        shapeFact.setSize(Double.parseDouble(distance)*2);
                        Polygon p=shapeFact.createCircle();
                        spatialFilter = ff.intersects(ff.property(geomAttribute), ff.literal(p));
                    }

                    Filter currentFilter = filter != null && filter.trim().length() > 0 ? CQL.toFilter(filter) : null;

                    if (currentFilter!=null){
                        currentFilter = (Filter) currentFilter.accept(new ChangeMatchCase(false), null);
                    }

                    Filter f = currentFilter != null ? ff.and(spatialFilter, currentFilter) : spatialFilter;

                    //only remove unit if it is a JDBC datastore
                    if (JDBCFeatureSource.PROTOCOL.equals(layer.getService().getProtocol())){
                        f = (Filter)f.accept(new RemoveDistanceUnit(), null);
                    }

                    f = FeatureToJson.reformatFilter(f, layer.getFeatureType());

                    q.setFilter(f);
                    q.setMaxFeatures(limit +1);

                    JSONArray features = executeQuery(al, layer.getFeatureType(), fs, q);
                    if(features.length() > limit){
                        JSONArray newArray = new JSONArray();
                        for (int j = 0; j < features.length(); j++) {
                            if(j < limit){
                                newArray.put(features.get(j));
                            }                            
                        }
                        features = newArray;
                        response.put("moreFeaturesAvailable", true);
                    }
                    response.put("features", features);
                } while(false);
            } catch(Exception e) {
                log.error("Exception loading feature info for " + exceptionMsg, e);
                error = "Exception: " + e.toString();
            } finally {
                if(error != null) {
                    response.put("error", error);
                }
                if(fs != null) {
                    fs.getDataStore().dispose();
                }
            }
        }
        this.auditMessageObject.addMessage(responses);
        return new StreamingResolution("application/json", new StringReader(responses.toString(4)));
    }
    
    public Resolution relatedInfo() throws JSONException, Exception {
        JSONArray queries = new JSONArray(queryJSON);
        Boolean checkRelated = true;
        ApplicationLayer al = null;
        JSONObject response = new JSONObject();
        JSONObject jFeat = null;
        JSONArray responses = new JSONArray();
        FeatureSource fs = null;
        EntityManager em = Stripersist.getEntityManager();

        for (int i = 0; i < queries.length(); i++) {
            JSONObject query = queries.getJSONObject(i);
            response = new JSONObject();
            responses.put(response);
            response.put("request", query);
            if (requestId != null) {
                response.put("requestId", requestId);
            }
            String error = null;
            String exceptionMsg = query.toString();
            try {
                al = null;
                GeoService gs = null;
                if (query.has("appLayer")) {
                    al = em.find(ApplicationLayer.class, query.getLong("appLayer"));
                } else {
                    gs = em.find(GeoService.class, query.getLong("service"));
                }
                do {
                    if (al == null && gs == null) {
                        error = getBundle().getString("viewer.featureinfoactionbean.4");
                        break;
                    }
                    if (!Authorizations.isAppLayerReadAuthorized(application, al, context.getRequest(), em)) {
                        error = getBundle().getString("viewer.featureinfoactionbean.5");
                        break;
                    }
                    if (al != null) {
                        layer = al.getService().getLayer(al.getLayerName(), em);
                    } else {
                        layer = gs.getLayer(query.getString("layer"), em);
                    }
                    if (layer == null) {
                        error = getBundle().getString("viewer.featureinfoactionbean.6");
                        break;
                    }
                    if (layer.getFeatureType() == null) {
                        response.put("noFeatureType", true);
                        break;
                    } else {
                        response.put("featureType", layer.getFeatureType().getId());
                    }

                    String filter = query.optString("filter", null);
                    fs = layer.getFeatureType().openGeoToolsFeatureSource(TIMEOUT);
                    Query q = new Query(fs.getName().toString());
                    String geomAttribute = fs.getSchema().getGeometryDescriptor().getLocalName();

                    FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
                    Filter spatialFilter = null;

                    boolean useIntersect = false;
                    if (layer.getService().getDetails().containsKey(GeoService.DETAIL_USE_INTERSECT)) {
                        ClobElement ce = layer.getService().getDetails().get(GeoService.DETAIL_USE_INTERSECT);
                        useIntersect = Boolean.parseBoolean(ce.getValue());
                    }
                    if (!useIntersect) {
                        Point point = new GeometryFactory().createPoint(new Coordinate(
                                Double.parseDouble(x),
                                Double.parseDouble(y)));
                        spatialFilter = ff.dwithin(ff.property(geomAttribute), ff.literal(point), Double.parseDouble(distance), "meters");
                    } else {
                        GeometricShapeFactory shapeFact = new GeometricShapeFactory();
                        shapeFact.setNumPoints(32);
                        shapeFact.setCentre(new Coordinate(
                                Double.parseDouble(x), Double.parseDouble(y)));
                        shapeFact.setSize(Double.parseDouble(distance) * 2);
                        Polygon p = shapeFact.createCircle();
                        spatialFilter = ff.intersects(ff.property(geomAttribute), ff.literal(p));
                    }

                    Filter currentFilter = filter != null && filter.trim().length() > 0 ? FlamingoCQL.toFilter(filter,em) : null;

                    if (currentFilter != null) {
                        currentFilter = (Filter) currentFilter.accept(new ChangeMatchCase(false), null);
                    }

                    Filter f = currentFilter != null ? ff.and(spatialFilter, currentFilter) : spatialFilter;
                    if (JDBCFeatureSource.PROTOCOL.equals(layer.getService().getProtocol())) {
                        f = (Filter) f.accept(new RemoveDistanceUnit(), null);
                    }

                    f = FeatureToJson.reformatFilter(f, layer.getFeatureType());
                    q.setFilter(f);
                    q.setMaxFeatures(limit + 1);
                    JSONArray features = executeQuery(al, layer.getFeatureType(), fs, q);

                    if (features.length() > limit) {
                        JSONArray newArray = new JSONArray();
                        for (int j = 0; j < features.length(); j++) {
                            if (j < limit) {
                                newArray.put(features.get(j));
                            }
                        }
                        features = newArray;
                        response.put("moreFeaturesAvailable", true);
                    }
                    jFeat = features.getJSONObject(0);
                    response.put("features", features);
                } while (false);
            } catch (Exception e) {
                log.error("Exception loading feature info for " + exceptionMsg, e);
                error = "Exception: " + e.getLocalizedMessage();
            } finally {
                if (error != null) {
                    response.put("error", error);
                    checkRelated = false;
                }
                if (fs != null) {
                    fs.getDataStore().dispose();
                }
            }
        }

        if (layer.getFeatureType().hasRelations() && checkRelated) {
            for (int i = 0; i < response.getJSONArray("features").length(); i++) {
                jFeat = response.getJSONArray("features").getJSONObject(i);
                List<Long> attributesToInclude = new ArrayList<>();
                List<ConfiguredAttribute> attrs = al.getAttributes(layer.getFeatureType(), true);
                attrs.forEach((attr) -> {
                    attributesToInclude.add(attr.getId());
                });
                if (jFeat.has("related_featuretypes")) {
                    JSONObject js = jFeat.getJSONArray("related_featuretypes").getJSONObject(0);
                    if (js.has("filter")) {
                        String s = js.getString("filter");
                        int fid = Integer.parseInt(s.replaceAll("[\\D]", ""));
                        jFeat.put("fid", fid);
                    }
                }
                String label;
                FeatureToJson ftjson = new FeatureToJson(false, false, false, true, true, attributesToInclude);
                for (FeatureTypeRelation rel : layer.getFeatureType().getRelations()) {
                    if (rel.getType().equals(FeatureTypeRelation.RELATE)) {
                        SimpleFeatureType fType = rel.getForeignFeatureType();
                        label = fType.getDescription() == null ? fType.getTypeName() : fType.getDescription();

                        List<FeatureTypeRelationKey> keys = rel.getRelationKeys();
                        String leftSide = keys.get(0).getLeftSide().getName();
                        String rightSide = keys.get(0).getRightSide().getName();

                        Query q = new Query(fType.getTypeName(), FlamingoCQL.toFilter(rightSide + "=" + jFeat.get(leftSide), em));
                        q.setMaxFeatures(10 + 1);
                        q.setHandle("FeatureReportActionBean_related_attributes");

                        fs = fType.openGeoToolsFeatureSource(TIMEOUT);
                        JSONArray features = ftjson.getJSONFeatures(al, fType, fs, q,em,application, context.getRequest());

                        JSONArray jsonFeats = new JSONArray();
                        int featureCount;
                        int colCount = 0;
                        int numFeats = features.length();
                        int maxFeatures = Math.min(numFeats, 10);
                        for (featureCount = 0; featureCount < maxFeatures; featureCount++) {
                            colCount = features.getJSONObject(featureCount).length();
                            jsonFeats.put(features.getJSONObject(featureCount));
                        }
                        jFeat.put("related_features", jsonFeats);
                    }
                }
            }
        }
        this.auditMessageObject.addMessage(responses);
        return new StreamingResolution("application/json", new StringReader(responses.toString(4)));
    }
    
    /**
     * This will execute the actual featureinfo query, can be overridden in
     * subclasses to modify behaviour such as workflow.
     *
     * @param al the application layer
     * @param ft the featuretype
     * @param fs the feature source
     * @param q a query
     * @return the features embedded in a {@code JSONArray}
     * @throws IOException if any
     * @throws JSONException if transforming to json fails
     * @throws Exception if any
     */
    protected JSONArray executeQuery(ApplicationLayer al, SimpleFeatureType ft, FeatureSource fs, Query q)
            throws IOException, JSONException, Exception {

        FeatureToJson ftjson = new FeatureToJson(arrays, edit, graph, true /*aliases*/, false /*returnNullval*/, attributesToInclude, ordered);
        JSONArray features = ftjson.getJSONFeatures(al, ft, fs, q, null, null,Stripersist.getEntityManager(),application, context.getRequest());
        return features;
    }
}
