package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.security.User;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.util.FeatureToJson;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.filter.text.cql2.CQL;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.stripesstuff.stripersist.Stripersist;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;

import javax.persistence.EntityManager;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

@UrlBinding("/action/digitree")
@StrictBinding
public class DigitreeTreeActionBean implements ActionBean {

    private ActionBeanContext context;

    private static final int TIMEOUT = 5000;

    @Validate
    private Application application;
    @Validate
    private String x;

    @Validate
    private String y;

    @Validate
    private String distance;

    @Validate
    private long applayerId = -1;

    @Validate
    private String feature;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public String getFeature() {
        return feature;
    }

    public void setFeature(String feature) {
        this.feature = feature;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
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

    public String getDistance() {
        return distance;
    }

    public void setDistance(String distance) {
        this.distance = distance;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;

    }

    @Override
    public ActionBeanContext getContext() {
        return this.context;
    }

    public long getApplayerId() {
        return applayerId;
    }

    public void setApplayerId(long applayerId) {
        this.applayerId = applayerId;

    }
    //</editor-fold>

    @DefaultHandler
    public Resolution view() {
        String session  = context.getRequest().getSession().getId();
        return new StreamingResolution("");
    }

    public Resolution saveTree(){
        System.out.println("saving");
        return new StreamingResolution("application/json", "{\"success\":\"false\" \"message\":\"error\"}");
    }

    public Resolution featuresForCoords(){
        String error = null;

        JSONArray responses = new JSONArray();

        EntityManager em = Stripersist.getEntityManager();
        FeatureSource fs = null;
        try {
            JSONObject response = new JSONObject();
            responses.put(response);
            ApplicationLayer al = null;
            Layer layer = null;
            if (applayerId > 0) {
                al = em.find(ApplicationLayer.class, applayerId);
                layer = al.getService().getLayer(al.getLayerName(), em);
            } else {
                error = "ApplicationLayer not found";
                return new StreamingResolution("application/json", "{\"success\":\"false\" \"message\":\"" + error + "\"}");
            }

            fs = layer.getFeatureType().openGeoToolsFeatureSource(TIMEOUT);
            Query q = new Query(fs.getName().toString());

            String geomAttribute = fs.getSchema().getGeometryDescriptor().getLocalName();
            FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
            Point point = new GeometryFactory().createPoint(new Coordinate(Double.parseDouble(x),Double.parseDouble(y)));
            Filter spatialFilter = ff.dwithin(ff.property(geomAttribute), ff.literal(point), Double.parseDouble(distance), "meters");
            Filter projectidFilter = CQL.toFilter("projectid = '" + getProjectId() +"'");

            Filter filter = ff.and(spatialFilter,projectidFilter);

            filter = FeatureToJson.reformatFilter(filter, layer.getFeatureType());

            Filter statusNew = CQL.toFilter("status = 'nieuw'");
            Filter statusaActual = CQL.toFilter("status = 'actueel'");
            filter = ff.and(filter,ff.or(statusNew,statusaActual));
            q.setFilter(filter);
            q.setMaxFeatures(20);

            JSONArray features = executeQuery(al, layer.getFeatureType(), fs, q);
            if (!features.isEmpty()){
                SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
                JSONObject feature;
                feature = features.getJSONObject(0);
                for (int i = 0; i < features.length(); i++){
                    JSONObject obj = features.getJSONObject(i);
                    String status = obj.getString("status").trim();
                    if (status.equals("nieuw")){
                        if(!feature.getString("status").trim().equals("nieuw")){
                            feature = obj;
                        } else {
                            Date objDate = formatter.parse(obj.getString("mutatiedatum") + " " + obj.getString("mutatietijd"));
                            Date featureDate = formatter.parse(feature.getString("mutatiedatum") + " " + feature.getString("mutatietijd"));
                            if(objDate.after(featureDate)){
                                feature = obj;
                            }
                        }
                    }

                }
                response.put("feature",feature);
            }

            return new StreamingResolution("application/json", responses.toString());
        } catch (Exception e){
            // log.error(e);
            error = "Er is iets fout gegaan tijdens het ophalen van een boom, bekijk de log voor meer informatie";
            return new StreamingResolution("application/json", "{\"success\":\"false\" \"message\":\"" + error + "\"}");
        }

    }

    private String getProjectId(){
        EntityManager em = Stripersist.getEntityManager();
        User user = em.find(User.class, context.getRequest().getUserPrincipal().getName());
        String projectId = "";
        for(Group g : user.getGroups()){
            if (g.getDescription() != null) {
                if (g.getDescription().equals("geofence")) {
                    projectId = g.getName();
                    break;
                }
            }
        }
        return projectId;
    }

    protected JSONArray executeQuery(ApplicationLayer al, SimpleFeatureType ft, FeatureSource fs, Query q)
            throws IOException, JSONException, Exception {

        FeatureToJson ftjson = new FeatureToJson(false, false, false, true /*aliases*/, false /*returnNullval*/, new ArrayList<>(), false);
        JSONArray features = ftjson.getJSONFeatures(al, ft, fs, q, null, null,Stripersist.getEntityManager(),application, context.getRequest());
        return features;
    }
}
