/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.stripes;

import java.io.IOException;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.util.Iterator;
import java.util.Set;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.audit.AuditMessageObject;
import nl.b3p.viewer.audit.Auditable;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredComponent;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.SolrConf;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DefaultTransaction;
import org.geotools.data.FeatureSource;
import org.geotools.data.Transaction;
import org.geotools.data.simple.SimpleFeatureStore;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.FeatureIterator;
import org.geotools.filter.identity.FeatureIdImpl;
import org.json.JSONArray;
import org.json.JSONObject;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.PrecisionModel;
import org.locationtech.jts.precision.GeometryPrecisionReducer;
import org.locationtech.jts.simplify.TopologyPreservingSimplifier;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Meine Toonen
 */
@UrlBinding("/action/simplify")
@StrictBinding
public class SimplifyFeatureActionBean extends LocalizableApplicationActionBean implements Auditable {

    private static final Log LOG = LogFactory.getLog(SimplifyFeatureActionBean.class);

    private ActionBeanContext context;

    @Validate
    private SimpleFeatureType sft;

    @Validate
    private SolrConf solrconfig;

    @Validate
    private ApplicationLayer appLayer;
    @Validate
    private Application application;
    private SimpleFeatureStore store;
    @Validate
    private String featureId;

    // <editor-fold  defaultstate="collapsed" desc="Getters and Setters">
    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public ApplicationLayer getAppLayer() {
        return appLayer;
    }

    public void setAppLayer(ApplicationLayer appLayer) {
        this.appLayer = appLayer;
    }

    public String getFeatureId() {
        return featureId;
    }

    public void setFeatureId(String featureId) {
        this.featureId = featureId;
    }

    @Override
    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public SimpleFeatureType getSft() {
        return sft;
    }

    public void setSft(SimpleFeatureType sft) {
        this.sft = sft;
    }

    public SolrConf getSolrconfig() {
        return solrconfig;
    }

    public void setSolrconfig(SolrConf solrconfig) {
        this.solrconfig = solrconfig;
    }
    // </editor-fold>

    @Override
    public AuditMessageObject getAuditMessageObject() {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @DefaultHandler
    public Resolution simplify() {
        JSONObject result = new JSONObject();
        Transaction transaction = new DefaultTransaction("edit");
        result.put("success", false);
        FeatureSource fs = null;
        if (checkAuthorizations(result)) {
            try {
                JSONObject json = new JSONObject();

                json.put("success", Boolean.FALSE);
                String error = null;
                Layer layer;
                EntityManager em = Stripersist.getEntityManager();

                if (appLayer != null) {
                    layer = appLayer.getService().getLayer(appLayer.getLayerName(), em);

                    if (layer == null) {
                        throw new Exception(getBundle().getString("viewer.editfeatureactionbean.3"));
                    }

                    if (layer.getFeatureType() == null) {
                        throw new Exception(getBundle().getString("viewer.editfeatureactionbean.4"));
                    }

                    fs = layer.getFeatureType().openGeoToolsFeatureSource();
                } else {
                    fs = sft.openGeoToolsFeatureSource();
                }

                store = (SimpleFeatureStore) fs;
                store.setTransaction(transaction);

                FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();

                Filter filter = ff.id(new FeatureIdImpl(featureId));

                FeatureIterator<SimpleFeature> it = fs.getFeatures(filter).features();
                SimpleFeature sf = null;
                while (it.hasNext()) {
                    sf = it.next();
                }
                if (sf != null) {
                    Geometry geom = (Geometry) sf.getDefaultGeometry();
                    result.put("geom", simplify(geom));
                    result.put("success", true);
                }

            } catch (Exception ex) {
                LOG.error("Cannot simplify feature: ", ex);
                result.put("message", ex.getLocalizedMessage());
            } finally {
                try {
                    transaction.close();
                } catch (IOException ex) {
                    LOG.error("cannot close transaction", ex);
                    result.put("message", ex.getLocalizedMessage());
                }

                if (fs != null) {
                    fs.getDataStore().dispose();
                }
            }
        }
        return new StreamingResolution("application/json", new StringReader(result.toString()));
    }

    private String simplify(Geometry geom) throws UnsupportedEncodingException {
        PrecisionModel pm = new PrecisionModel(100);
        GeometryPrecisionReducer gpr = new GeometryPrecisionReducer(pm);
        geom = gpr.reduce(geom);
        Geometry bbox = geom.getEnvelope();
        int megabytes = (2097152/* 2MB is the default tomcat max post size */ - 100 * 1024);
        double simplify = 1.0;
        String geomTxt = geom.toText();

        while ((geomTxt.getBytes("UTF-8").length > megabytes || geom.getCoordinates().length > 600) && simplify < 9999) {
            // start simplifying to reduce size, start of with 1 and
            // each iteration multiply with 10, max 4 steps, so [1,10, 100, 1000]
            // if geom still too large bail out and use bbox
            LOG.debug("Simplify selected feature geometry with distance of: " + simplify);
            geom = TopologyPreservingSimplifier.simplify(geom, simplify);
            geom = gpr.reduce(geom);
            geomTxt = geom.toText();
            simplify = 10 * simplify;
        }

        if (simplify > 9999) {
            return bbox.toText();
        } else {
            return geomTxt;
        }
    }

    private boolean checkAuthorizations(JSONObject result) {
        if (appLayer == null && sft == null) {
            result.put("message", getBundle().getString("viewer.simplifyfeatureactionbean.1"));
            return false;
        }
        EntityManager em = Stripersist.getEntityManager();
        if (appLayer != null) {
            if (!Authorizations.isAppLayerWriteAuthorized(application, appLayer, context.getRequest(), em)) {
                result.put("message", getBundle().getString("viewer.simplifyfeatureactionbean.2"));
                return false;
            }
            return true;

        } else if (sft != null) {
            // Dit kan alleen als er via een zoekopdracht een call wordt gedaan, dus checken of solrconfig is geconfigureerd voor deze applicatie
            Set<ConfiguredComponent> comps = application.getComponents();
            for (ConfiguredComponent comp : comps) {
                if (comp.getClassName().equals("viewer.components.Search")) {
                    JSONObject config = new JSONObject(comp.getConfig());
                    JSONArray searchConfigs = config.getJSONArray("searchconfigs");
                    for (Iterator<Object> iterator = searchConfigs.iterator(); iterator.hasNext();) {
                        JSONObject searchConfig = (JSONObject) iterator.next();
                        String type = searchConfig.getString("type");
                        if (type.equals("solr") || type.equals("attributesource") ){
                            JSONObject solrConfigs = searchConfig.optJSONObject("solrConfig");
                            if(solrConfigs == null){
                                solrConfigs = searchConfig.optJSONObject("asConfig");
                            }
                            Set<String> configs = solrConfigs.keySet();
                            for (String c : configs) {
                                JSONObject sc = solrConfigs.getJSONObject(c);
                                if (sc.getInt("solrConfigid") == solrconfig.getId()) {
                                    return true;
                                }

                            }
                        }

                    }
                }
            }
            result.put("message", getBundle().getString("viewer.simplifyfeatureactionbean.3"));
        }
        return false;

    }
}
