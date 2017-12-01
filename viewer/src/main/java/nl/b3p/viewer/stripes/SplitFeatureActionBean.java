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

import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.Polygon;
import com.vividsolutions.jts.geom.util.LineStringExtracter;
import com.vividsolutions.jts.io.WKTReader;
import com.vividsolutions.jts.operation.polygonize.Polygonizer;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
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
import org.geotools.util.Converter;
import org.geotools.util.GeometryTypeConverterFactory;
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
 * Split a feature using a line. Depending on the chosen strategy the split
 * feature may be updated with the largest resulting geometry of the split and
 * one or more new features are created or the split feature is deleted and all
 * new features are created.
 *
 * @author Mark Prins mark@b3partners.nl
 */
@UrlBinding("/action/feature/split")
@StrictBinding
public class SplitFeatureActionBean implements ActionBean {

    private static final Log log = LogFactory.getLog(SplitFeatureActionBean.class);

    private static final String FID = FeatureInfoActionBean.FID;

    private ActionBeanContext context;

    @Validate
    private Application application;

    @Validate
    private ApplicationLayer appLayer;

    @Validate
    private String toSplitWithFeature;

    /**
     * Existing feature handling strategy. {@code replace} updates the existing
     * feature with a new geometry and adds new ones, {@code add} deletes the
     * existing feature and creates new features.
     */
    @Validate
    private String strategy;

    @Validate
    private String extraData;

    @Validate
    private String splitFeatureFID;

    private SimpleFeatureStore store;

    private Layer layer = null;

    private boolean unauthorized;

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
    }

    public Resolution split() throws JSONException {
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        String error = null;

        if (appLayer == null) {
            error = "Invalid parameters";
        } else if (unauthorized) {
            error = "Not authorized";
        } else {
            FeatureSource fs = null;
            try {
                if (this.splitFeatureFID == null) {
                    throw new IllegalArgumentException("Split feature ID is null");
                }
                if (this.toSplitWithFeature == null) {
                    throw new IllegalArgumentException("Split line is null");
                }

                fs = this.layer.getFeatureType().openGeoToolsFeatureSource();
                if (!(fs instanceof SimpleFeatureStore)) {
                    throw new IllegalArgumentException("Feature source does not support editing");
                }
                this.store = (SimpleFeatureStore) fs;

                List<FeatureId> ids = this.splitFeature();

                if (ids.size() < 2) {
                    throw new IllegalArgumentException("Split failed, check that geometries overlap");
                }

                json.put("fids", ids);
                json.put("success", Boolean.TRUE);
            } catch (IllegalArgumentException e) {
                log.warn("Split error", e);
                error = e.getLocalizedMessage();
            } catch (Exception e) {
                log.error(String.format("Exception splitting feature %s", this.splitFeatureFID), e);
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
        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    /**
     * Handle extra data, to be extended by subclasses. eg. to modify the
     * features after the split before committing.
     *
     * @param features a list of features that can be modified
     * @return the list of features to be committed to the database
     * @see #handleExtraData(org.opengis.feature.simple.SimpleFeature)
     * @throws Exception if any
     */
    protected List<SimpleFeature> handleExtraData(List<SimpleFeature> features) throws Exception {
        return features;
    }

    /**
     * Handle extra data, delegates to {@link #handleExtraData(java.util.List)}.
     *
     * @param feature the feature that can be modified
     * @return the feature to be committed to the database
     * @see #handleExtraData(java.util.List)
     * @throws Exception if any
     */
    protected SimpleFeature handleExtraData(SimpleFeature feature) throws Exception {
        final List<SimpleFeature> features = new ArrayList();
        features.add(feature);
        return this.handleExtraData(features).get(0);
    }

    /**
     * Get feature from store and split it.
     *
     * @return a list of feature ids that have been updated
     * @throws Exception when there is an error communication with the datastore
     * of when the arguments are invalid. In case of an exception the
     * transaction will be rolled back
     */
    private List<FeatureId> splitFeature() throws Exception {
        List<FeatureId> ids = new ArrayList();
        Transaction transaction = new DefaultTransaction("split");
        try {
            store.setTransaction(transaction);
            // get the feature to split from database using the FID
            FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
            Filter filter = ff.id(new FeatureIdImpl(this.splitFeatureFID));
            FeatureCollection fc = store.getFeatures(filter);
            SimpleFeature f = null;
            if (fc.features().hasNext()) {
                f = (SimpleFeature) fc.features().next();
            } else {
                throw new IllegalArgumentException(
                        String.format("Feature to split having ID: (%s) not found in datastore.", this.splitFeatureFID));
            }
            String geomAttribute = store.getSchema().getGeometryDescriptor().getLocalName();
            Geometry toSplit = (Geometry) f.getProperty(geomAttribute).getValue();

            // get split line
            Geometry splitWith = new WKTReader().read(this.toSplitWithFeature);

            List<? extends Geometry> geoms = null;
            switch (toSplit.getDimension()) {
                case 1:
                    geoms = splitLine(toSplit, splitWith);
                    break;
                case 2:
                    geoms = splitPolygon(toSplit, splitWith);
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported dimension ("
                            + toSplit.getDimension() + ") for splitting, must be 1 or 2");
            }

            ids = handleStrategy(f, geoms, filter, this.store, this.strategy);

            transaction.commit();
            afterSplit(ids);
        } catch (Exception e) {
            transaction.rollback();
            throw e;
        } finally {
            transaction.close();
        }
        if (this.strategy.equalsIgnoreCase("replace")) {
            ids.add(0, new FeatureIdImpl(this.splitFeatureFID));
        }
        return ids;
    }

    /**
     * Called after the split is completed and commit was performed. Provides a
     * hook for postprocessing.
     * @param ids The list of committed feature ids
     */
    protected void afterSplit(List<FeatureId> ids) {
    }

    /**
     * Handles the feature creation/update/deletion strategy. You may want to
     * override this in a subclass to handle workflow.
     *
     * @param feature the feature that is about to be split
     * @param geoms new geometries that are the result of splitting
     * @param filter filter to get at feature
     * @param localStore the store we're working against
     * @param localStrategy the strategy in use
     * @return A list of FeatureIds is returned, one for each feature in the
     * order created. However, these might not be assigned until after a commit
     * has been performed.
     *
     * @throws Exception if an error occurs modifying the data source,
     * converting the geometry or an illegal argument was given
     */
    protected List<FeatureId> handleStrategy(SimpleFeature feature, List<? extends Geometry> geoms,
            Filter filter, SimpleFeatureStore localStore, String localStrategy) throws Exception {

        List<SimpleFeature> newFeats = new ArrayList();
        GeometryTypeConverterFactory cf = new GeometryTypeConverterFactory();
        Converter c = cf.createConverter(Geometry.class,
                localStore.getSchema().getGeometryDescriptor().getType().getBinding(), null);
        GeometryType type = localStore.getSchema().getGeometryDescriptor().getType();
        String geomAttribute = localStore.getSchema().getGeometryDescriptor().getLocalName();
        boolean firstFeature = true;
        for (Geometry newGeom : geoms) {
            if (firstFeature) {
                // default to replace strategy
                if (localStrategy == null || localStrategy.equalsIgnoreCase("replace")) {
                    // use first/largest geom to update existing feature geom
                    feature.setAttribute(geomAttribute, c.convert(newGeom, type.getBinding()));
                    feature = this.handleExtraData(feature);
                    Object[] attributevalues = feature.getAttributes().toArray(new Object[feature.getAttributeCount()]);
                    AttributeDescriptor[] attributes = feature.getFeatureType().getAttributeDescriptors().toArray(new AttributeDescriptor[feature.getAttributeCount()]);
                    localStore.modifyFeatures(attributes, attributevalues, filter);
                    firstFeature = false;
                    continue;
                } else if (localStrategy.equalsIgnoreCase("add")) {
                    // delete the source feature, new ones will be created
                    localStore.removeFeatures(filter);
                    firstFeature = false;
                } else {
                    throw new IllegalArgumentException("Unknown strategy '" + localStrategy + "', cannot split");
                }
            }
            // create + add new features
            SimpleFeature newFeat = DataUtilities.createFeature(feature.getType(),
                    DataUtilities.encodeFeature(feature, false));
            newFeat.setAttribute(geomAttribute, c.convert(newGeom, type.getBinding()));
            newFeats.add(newFeat);
        }
        newFeats = this.handleExtraData(newFeats);
        return localStore.addFeatures(DataUtilities.collection(newFeats));
    }

    /**
     * Sort geometries by (descending) size, either circumference or length. The
     * list will have the largest geometry as the first element.
     *
     * @param geoms to sort
     *
     * @see com.​vividsolutions.​jts.​geom.​Geometry#compareTo(Object)
     */
    private void geometrySorter(List<? extends Geometry> geoms) {
        Collections.sort(geoms, new Comparator<Geometry>() {
            @Override
            public int compare(Geometry a, Geometry b) {
                return b.compareTo(a);
            }
        });
    }

    /**
     * @param toSplit the line to split
     * @param line the line to use for the split
     * @return a sorted list of geometries as a result of splitting toSplit with
     * line
     */
    protected List<LineString> splitLine(Geometry toSplit, Geometry line) {
        List<LineString> output = new ArrayList();
        Geometry lines = toSplit.union(line);

        for (int i = 0; i < lines.getNumGeometries(); i++) {
            LineString l = (LineString) lines.getGeometryN(i);
            // TODO to be tested
            if (toSplit.contains(l.getInteriorPoint())) {
                output.add(l);
            }
        }
        geometrySorter(output);
        return output;
    }

    /**
     * @param poly the polygon to split
     * @param line the line to use for the split
     * @return a sorted list of geometries as a result of splitting poly with
     * line
     */
    protected List<Polygon> splitPolygon(Geometry poly, Geometry line) {
        List<Polygon> output = new ArrayList();

        Geometry nodedLinework = poly.getBoundary().union(line);
        Geometry polys = polygonize(nodedLinework);

        // only keep polygons which are inside the input
        for (int i = 0; i < polys.getNumGeometries(); i++) {
            Polygon candpoly = (Polygon) polys.getGeometryN(i);
            if (poly.contains(candpoly.getInteriorPoint())) {
                output.add(candpoly);
            }
        }
        geometrySorter(output);
        return output;
    }

    private Geometry polygonize(Geometry geometry) {
        List lines = LineStringExtracter.getLines(geometry);
        Polygonizer polygonizer = new Polygonizer();
        polygonizer.add(lines);
        Collection polys = polygonizer.getPolygons();
        Polygon[] polyArray = GeometryFactory.toPolygonArray(polys);
        return geometry.getFactory().createGeometryCollection(polyArray);
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

    public String getToSplitWithFeature() {
        return toSplitWithFeature;
    }

    public void setToSplitWithFeature(String toSplitWithFeature) {
        this.toSplitWithFeature = toSplitWithFeature;
    }

    public String getSplitFeatureFID() {
        return splitFeatureFID;
    }

    public void setSplitFeatureFID(String splitFeatureFID) {
        this.splitFeatureFID = splitFeatureFID;
    }

    public String getStrategy() {
        return strategy;
    }

    public void setStrategy(String strategy) {
        this.strategy = strategy;
    }

    public String getExtraData() {
        return extraData;
    }

    public void setExtraData(String extraData) {
        this.extraData = extraData;
    }

    public Layer getLayer() {
        return this.layer;
    }
    //</editor-fold>
}
