package nl.b3p.viewer.search;

import net.sourceforge.stripes.action.ActionBeanContext;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.security.User;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.SolrConf;
import nl.b3p.viewer.util.FeatureToJson;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.Query;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.filter.text.cql2.CQL;
import org.geotools.filter.text.cql2.CQLException;
import org.geotools.geometry.jts.WKTReader2;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.locationtech.jts.geom.Envelope;
import org.locationtech.jts.geom.Geometry;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.filter.Or;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import java.util.*;

public class DigitreeAttributeSearchClient extends SearchClient {
    private static final Log log = LogFactory.getLog(DigitreeAttributeSearchClient.class);

    private JSONObject config;
    private ActionBeanContext context;
    private WKTReader2 wkt;

    public DigitreeAttributeSearchClient(JSONObject config, ActionBeanContext context) {
        this.config = config;
        this.context = context;
        wkt = new WKTReader2();
    }

    @Override
    public SearchResult search(String query) {
        JSONObject asConfig = config.getJSONObject("asConfig");

        JSONArray processedResults = new JSONArray();
        for (Iterator<String> iterator = asConfig.keys(); iterator.hasNext();) {
            String configId = iterator.next();
            Integer id = Integer.parseInt(configId);
            getResults(query,id,processedResults);
        }

        SearchResult sr = new SearchResult();
        sr.setResults(processedResults);
        return sr;
    }

    private void getResults(String query, Integer solrConfigId,JSONArray processedResults ) {

        try {
            EntityManager em = Stripersist.getEntityManager();

            SolrConf conf = em.find(SolrConf.class, solrConfigId.longValue());
            List<String> queryAttributes = conf.getIndexAttributes();
            List<String> resultAttributes = conf.getResultAttributes();

            SimpleFeatureType ft = conf.getSimpleFeatureType();

            org.geotools.data.FeatureSource gtFS = ft.openGeoToolsFeatureSource();

            FeatureToJson ftoj = new FeatureToJson(false, false, false, true, null);
            Query q = createQuery(queryAttributes, gtFS, query);
            q.setMaxFeatures(FeatureToJson.MAX_FEATURES);
            JSONArray features = ftoj.getJSONFeatures(null, ft, gtFS, q, null, null, em, null, null);

            for (Object feature : features) {
                JSONObject newFeature = new JSONObject();
                JSONObject oldFeature = (JSONObject) feature;
                String label = "";
                for (String name : resultAttributes) {
                    Object value = oldFeature.optString(name, "");
                    newFeature.put(name, value);
                    label += " " + value;
                }
                Geometry g = (Geometry) oldFeature.get(ft.getGeometryAttribute());
                Envelope env = g.getEnvelopeInternal();

                Map bbox = new HashMap();
                bbox.put("minx", env.getMinX());
                bbox.put("miny", env.getMinY());
                bbox.put("maxx", env.getMaxX());
                bbox.put("maxy", env.getMaxY());

                newFeature.put("location", bbox);
                newFeature.put("type", conf.getName());
                newFeature.put("label", label);
                newFeature.put("sft",ft.getId() );
                newFeature.put("id",oldFeature.optString("__fid"));
                newFeature.put("searchConfig", solrConfigId);
                processedResults.put(newFeature);
            }

        } catch (Exception ex) {
            log.error("Error searching", ex);
        }
    }

    private Query createQuery(List<String> queryAttrs, org.geotools.data.FeatureSource gtFS, String term) throws CQLException {
        Query q = new Query(gtFS.getName().toString());
        FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();

        List<Filter> filters = new ArrayList<>();
        for (String queryAttr : queryAttrs) {
            Filter filter = ff.like(ff.property(queryAttr), "%" + term + "%", "%", "_", "\\", false);
            filters.add(filter);
        }
        Or or = ff.or(filters);

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

        Filter filter = ff.and(or, CQL.toFilter("projectid = '" + projectId + "'"));

        q.setFilter(filter);
        return q;
    }

    @Override
    public JSONArray autosuggest(String query) throws JSONException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
