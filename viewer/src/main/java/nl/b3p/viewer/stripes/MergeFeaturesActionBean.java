/*
 * Copyright (C) 2015-2016 B3Partners B.V.
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

import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.locationtech.jts.operation.overlay.snap.GeometrySnapper;
import java.io.StringReader;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.audit.AuditMessageObject;
import nl.b3p.viewer.audit.Auditable;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.Layer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataUtilities;
import org.geotools.data.DefaultTransaction;
import org.geotools.data.FeatureSource;
import org.geotools.data.Transaction;
import org.geotools.data.simple.SimpleFeatureStore;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.FeatureCollection;
import org.geotools.filter.identity.FeatureIdImpl;
import org.geotools.geometry.jts.GeometryCollector;
import org.geotools.util.Converter;
import org.geotools.data.util.GeometryTypeConverterFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.feature.type.GeometryType;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.filter.identity.FeatureId;
import org.stripesstuff.stripersist.Stripersist;

/**
 * Merge two features, A and B so that A will have the combined geometry of A
 * and B and B will cease to exist. A may be a new feature if that strategy is
 * chosen.
 *
 * @author Mark Prins mark@b3partners.nl
 */
@UrlBinding("/action/feature/merge")
@StrictBinding
public class MergeFeaturesActionBean extends LocalizableApplicationActionBean implements Auditable {

    private static final Log LOG = LogFactory.getLog(MergeFeaturesActionBean.class);

    private static final String FID = FeatureInfoActionBean.FID;

    private ActionBeanContext context;

    @Validate
    private Application application;

    @Validate
    private ApplicationLayer appLayer;

    /**
     * Existing feature handling strategy. {@code replace} updates the existing
     * feature A with a new geometry and deletes feature B, {@code new} deletes
     * the existing features and creates a new feature.
     */
    @Validate
    private String strategy;

    @Validate
    private String extraData;

    @Validate
    private int mergeGapDist;

    @Validate
    private String fidA;

    @Validate
    private String fidB;

    private SimpleFeatureStore store;

    private Layer layer = null;

    private boolean unauthorized;

    private AuditMessageObject auditMessageObject;

    @After(stages = LifecycleStage.BindingAndValidation)
    public void loadLayer() {
        this.layer = appLayer.getService().getSingleLayer(appLayer.getLayerName(), Stripersist.getEntityManager());
    }

    @Before(stages = LifecycleStage.EventHandling)
    public void checkAuthorization() {
        if (application == null || appLayer == null
                || !Authorizations.isLayerGeomWriteAuthorized(layer, context.getRequest(), Stripersist.getEntityManager())) {
            unauthorized = true;
        }
        auditMessageObject = new AuditMessageObject();
    }

    public Resolution merge() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);
        String error = null;

        if (appLayer == null) {
            error = getBundle().getString("viewer.mergefeaturesactionbean.1");
        } else if (unauthorized) {
            error = getBundle().getString("viewer.mergefeaturesactionbean.2");
        } else {
            FeatureSource fs = null;
            try {
                if (this.fidA == null || this.fidB == null) {
                    throw new IllegalArgumentException(getBundle().getString("viewer.mergefeaturesactionbean.3"));
                }
                if (this.strategy == null) {
                    throw new IllegalArgumentException(getBundle().getString("viewer.mergefeaturesactionbean.4"));
                }

                fs = this.layer.getFeatureType().openGeoToolsFeatureSource();
                if (!(fs instanceof SimpleFeatureStore)) {
                    throw new IllegalArgumentException(getBundle().getString("viewer.mergefeaturesactionbean.5"));
                }
                this.store = (SimpleFeatureStore) fs;

                List<FeatureId> ids = this.mergeFeatures();

                if (ids.isEmpty()) {
                    throw new IllegalArgumentException(getBundle().getString("viewer.mergefeaturesactionbean.6"));
                }

                if (ids.size() > 1) {
                    throw new IllegalArgumentException(getBundle().getString("viewer.mergefeaturesactionbean.7"));
                }

                json.put("fids", ids);
                json.put("success", Boolean.TRUE);
            } catch (IllegalArgumentException e) {
                LOG.warn("Merge error", e);
                error = e.getLocalizedMessage();
            } catch (Exception e) {
                LOG.error(MessageFormat.format(getBundle().getString("viewer.mergefeaturesactionbean.8"), this.fidB, this.fidA, e ));
                error = e.toString();
                if (e.getCause() != null) {
                    error += "; cause: " + e.getCause().toString();
                }
            } finally {
                if (fs != null) {
                    fs.getDataStore().dispose();
                }
            }
        }

        if (error != null) {
            json.put("error", error);
        }
        this.auditMessageObject.addMessage(json);
        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    /**
     * Handle extra data, to be extended by subclasses. eg. to modify the
     * features after the split before committing.
     *
     * @param features a list of features that can be modified
     * @return the list of features to be committed to the database
     *
     * @throws java.lang.Exception if any
     *
     * @see #handleExtraData(org.opengis.feature.simple.SimpleFeature)
     */
    protected List<SimpleFeature> handleExtraData(List<SimpleFeature> features) throws Exception {
        return features;
    }

    /**
     * Handle extra data, delegates to {@link #handleExtraData(java.util.List)}.
     *
     * @param feature the feature that can be modified
     * @return the feature to be committed to the database
     *
     * @throws java.lang.Exception if any
     *
     * @see #handleExtraData(java.util.List)
     */
    protected SimpleFeature handleExtraData(SimpleFeature feature) throws Exception {
        final List<SimpleFeature> features = new ArrayList();
        features.add(feature);
        return this.handleExtraData(features).get(0);
    }

    /**
     * Get features from store and merge them. The final merge resuls depend on
     * the chosen {@link #strategy} and optional {@code afterMerge} processing.
     *
     * @return a list of feature ids that have been updated
     * @throws Exception when there is an error communication with the datastore
     * of when the arguments are invalid. In case of an exception the
     * transaction will be rolled back
     *
     * @see #handleStrategy(org.opengis.feature.simple.SimpleFeature,
     * org.opengis.feature.simple.SimpleFeature,
     * org.locationtech.jts.geom.Geometry, org.opengis.filter.Filter,
     * org.opengis.filter.Filter, org.geotools.data.simple.SimpleFeatureStore,
     * java.lang.String)
     * @see #afterMerge(java.util.List)
     */
    private List<FeatureId> mergeFeatures() throws Exception {
        List<FeatureId> ids = new ArrayList();
        Transaction transaction = new DefaultTransaction("split");
        try {
            store.setTransaction(transaction);
            // get the features to merge from database using the FID
            FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
            Filter filterA = ff.id(new FeatureIdImpl(this.fidA));
            Filter filterB = ff.id(new FeatureIdImpl(this.fidB));

            SimpleFeature fA = null;
            FeatureCollection fc = store.getFeatures(filterA);
            if (fc.features().hasNext()) {
                fA = (SimpleFeature) fc.features().next();
            } else {
                throw new IllegalArgumentException(
                        MessageFormat.format(getBundle().getString("viewer.mergefeaturesactionbean.9"), this.fidA ));
            }

            SimpleFeature fB = null;
            fc = store.getFeatures(filterB);
            if (fc.features().hasNext()) {
                fB = (SimpleFeature) fc.features().next();
            } else {
                throw new IllegalArgumentException(
                        MessageFormat.format(getBundle().getString("viewer.mergefeaturesactionbean.10"), this.fidB ));
            }

            String geomAttrName = store.getSchema().getGeometryDescriptor().getLocalName();
            Geometry geomA = (Geometry) fA.getProperty(geomAttrName).getValue();
            Geometry geomB = (Geometry) fB.getProperty(geomAttrName).getValue();

            LOG.debug("input geomA: " + geomA);
            LOG.debug("input geomB: " + geomB);

            Geometry newGeom = null;
            GeometryCollector geoms = new GeometryCollector();
            geoms.setFactory(new GeometryFactory(new PrecisionModel(), geomA.getSRID()));
            geoms.add(geomA);
            geoms.add(geomB);

            if (!geomB.intersects(geomA)) {
                // no overlap between geometries, do some smart stuff to interpolate, then use this interpolation in the union of all geoms
                double distance = geomA.distance(geomB);
                LOG.info(MessageFormat.format(getBundle().getString("viewer.mergefeaturesactionbean.11"), distance ));
                if (distance > this.mergeGapDist) {
                    throw new IllegalArgumentException(
                            MessageFormat.format(getBundle().getString("viewer.mergefeaturesactionbean.12"), distance ));
                }
                newGeom = GeometrySnapper.snapToSelf(geoms.collect(), mergeGapDist, true);
                geoms.add(newGeom);
            }
            newGeom = geoms.collect().union();

            LOG.debug("new geometry: " + newGeom);
            LOG.debug("New Geometry is valid? " + newGeom.isValid());
            // if invalid maybe cleanup self-intersect;
            // see: https://stackoverflow.com/questions/31473553/is-there-a-way-to-convert-a-self-intersecting-polygon-to-a-multipolygon-in-jts
            // clean up small self intersects and unioning artifacts, snapping distance of 0.01m  (because rijksdriehoek)
            newGeom = GeometrySnapper.snapToSelf(newGeom, .01, true);
            newGeom.normalize();
            LOG.debug("Normalized new geometry: " + newGeom);
            LOG.debug("Normalized new Geometry is valid? " + newGeom.isValid());

            // maybe simplify? needs tolerance param
            // double tolerance = 1d;
            // TopologyPreservingSimplifier simplify = new TopologyPreservingSimplifier(newGeom);
            // simplify.setDistanceTolerance(tolerance);
            // newGeom = simplify.getResultGeometry();
            ids = this.handleStrategy(fA, fB, newGeom, filterA, filterB, this.store, this.strategy);

            transaction.commit();
            afterMerge(ids);
        } catch (Exception e) {
            transaction.rollback();
            throw e;
        } finally {
            transaction.close();
        }
        return ids;
    }

    /**
     * Handles the feature creation/update/deletion strategy. You may want to
     * override this in a subclass to handle workflow.
     *
     * @param featureA the feature that is about to be merged into
     * @param featureB the feature that is about to be merged to A
     * @param newGeom the new geometry that is the result of merging A and B
     * geometries
     * @param filterA filter to get at feature A
     * @param filterB filter to get at feature B
     * @param localStore the store we're working against
     * @param localStrategy the strategy in use
     * @return A list of FeatureIds is returned, one for each feature in the
     * order created. However, these might not be assigned until after a commit
     * has been performed.
     *
     * @throws Exception if an error occurs modifying the data source,
     * converting the geometry or an illegal argument was given
     */
    protected List<FeatureId> handleStrategy(SimpleFeature featureA, SimpleFeature featureB,
            Geometry newGeom, Filter filterA, Filter filterB, SimpleFeatureStore localStore,
            String localStrategy) throws Exception {
        List<FeatureId> ids = new ArrayList();
        String geomAttrName = localStore.getSchema().getGeometryDescriptor().getLocalName();
        GeometryType type = localStore.getSchema().getGeometryDescriptor().getType();
        GeometryTypeConverterFactory cf = new GeometryTypeConverterFactory();
        Converter c = cf.createConverter(Geometry.class,
                localStore.getSchema().getGeometryDescriptor().getType().getBinding(),
                null);

        if (localStrategy.equalsIgnoreCase("replace")) {
            // update existing feature (A) geom, delete merge partner (B)
            featureA.setAttribute(geomAttrName, c.convert(newGeom, type.getBinding()));
            featureA = this.handleExtraData(featureA);
            Object[] attributevalues = featureA.getAttributes().toArray(new Object[featureA.getAttributeCount()]);
            AttributeDescriptor[] attributes = featureA.getFeatureType().getAttributeDescriptors().toArray(new AttributeDescriptor[featureA.getAttributeCount()]);
            localStore.modifyFeatures(attributes, attributevalues, filterA);
            localStore.removeFeatures(filterB);
            ids.add(new FeatureIdImpl(this.fidA));
        } else if (localStrategy.equalsIgnoreCase("new")) {
            // delete the source feature (A) and merge partner(B)
            //   and create a new feature with the attributes of A but a new geom.
            localStore.removeFeatures(filterA);
            localStore.removeFeatures(filterB);
            SimpleFeature newFeat = DataUtilities.createFeature(featureA.getType(),
                    DataUtilities.encodeFeature(featureA, false));
            newFeat.setAttribute(geomAttrName, c.convert(newGeom, type.getBinding()));

            List<SimpleFeature> newFeats = new ArrayList();
            newFeats.add(newFeat);
            newFeats = this.handleExtraData(newFeats);
            ids = localStore.addFeatures(DataUtilities.collection(newFeats));
        } else {
            throw new IllegalArgumentException(MessageFormat.format(getBundle().getString("viewer.mergefeaturesactionbean.13"), localStrategy ));
        }
        return ids;
    }

    /**
     * Called after the merge is completed and commit was performed. Provides a
     * hook for postprocessing.
     * @param ids The list of committed feature ids
     */
    protected void afterMerge(List<FeatureId> ids) {
    }

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public ApplicationLayer getAppLayer() {
        return appLayer;
    }

    public void setAppLayer(ApplicationLayer appLayer) {
        this.appLayer = appLayer;
    }

    public String getStrategy() {
        return strategy;
    }

    public void setStrategy(String strategy) {
        this.strategy = strategy;
    }

    public String getFidA() {
        return fidA;
    }

    public void setFidA(String fidA) {
        this.fidA = fidA;
    }

    public String getFidB() {
        return fidB;
    }

    public void setFidB(String fidB) {
        this.fidB = fidB;
    }

    public int getMergeGapDist() {
        return mergeGapDist;
    }

    public void setMergeGapDist(int mergeGapDist) {
        this.mergeGapDist = mergeGapDist;
    }

    public String getExtraData() {
        return extraData;
    }

    public void setExtraData(String extraData) {
        this.extraData = extraData;
    }

    public Layer getLayer() {
        return layer;
    }

    public AuditMessageObject getAuditMessageObject() {
        return this.auditMessageObject;
    }
    //</editor-fold>
}
