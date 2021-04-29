package nl.b3p.viewer.helpers.featuresources;

import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.WFSFeatureSource;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.feature.FeatureCollection;
import org.opengis.feature.type.AttributeType;
import org.opengis.feature.type.GeometryType;
import org.opengis.filter.Filter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WFSFeatureSourceHelper implements FeatureSourceHelper {
    private static final Log log = LogFactory.getLog(WFSFeatureSourceHelper.class);
    public static final Integer TIMEOUT = 60000;


    @Override
    public List<SimpleFeatureType> createFeatureTypes(FeatureSource fs, WaitPageStatus status) throws Exception {
        return WFSFeatureSourceHelper.createFSFeatureTypes((WFSFeatureSource)fs, status);
    }

    @Override
    public org.geotools.data.FeatureSource openGeoToolsFeatureSource(FeatureSource fs, SimpleFeatureType sft) throws Exception {
        return openGeoToolsFeatureSource(fs, sft, TIMEOUT);
    }

    @Override
    public org.geotools.data.FeatureSource openGeoToolsFeatureSource(FeatureSource fs, SimpleFeatureType sft, int timeout) throws Exception {
        return WFSFeatureSourceHelper.openGeoToolsFSFeatureSource(sft, timeout, (WFSFeatureSource) fs);
    }

    public static List<SimpleFeatureType> createFSFeatureTypes(WFSFeatureSource fs, WaitPageStatus status) throws Exception {
        status.setCurrentAction("Ophalen informatie...");
        List<SimpleFeatureType> createdFeatureTypes = new ArrayList<SimpleFeatureType>();

        DataStore store = null;
        try {
            store = createDataStore(fs);

            fs.setName(store.getInfo().getTitle());

            status.setProgress(10);
            status.setCurrentAction("Lijst van type-namen ophalen...");
            String[] typeNames = store.getTypeNames();
            status.setProgress(20);

            /*
             * XXX generalize this code and exact same code in JDBCFeatureSource
             */
            if (typeNames.length != 0) {
                double progress = 20.0;
                double progressPerTypeName = (80.0 / typeNames.length);
                for (String typeName : typeNames) {
                    status.setCurrentAction("Inladen schema van type \"" + typeName + "\"...");
                    log.debug("Loading feature source " + typeName + " for WFS url " + fs.getUrl());

                    SimpleFeatureSource gtFs = store.getFeatureSource(typeName);

                    SimpleFeatureType sft = new SimpleFeatureType();
                    sft.setTypeName(typeName);
                    sft.setFeatureSource(fs);
                    sft.setWriteable(false);
                    if (gtFs.getInfo() != null) {
                        String title = gtFs.getInfo().getTitle();
                        sft.setDescription(StringUtils.isBlank(title) ? null : title);
                    }

                    org.opengis.feature.simple.SimpleFeatureType gtFt = gtFs.getSchema();

                    for (org.opengis.feature.type.AttributeDescriptor gtAtt : gtFt.getAttributeDescriptors()) {
                        AttributeDescriptor att = new AttributeDescriptor();
                        sft.getAttributes().add(att);
                        att.setName(gtAtt.getLocalName());

                        AttributeType gtType = gtAtt.getType();
                        String binding = gtType.getBinding().getName();

                        /*
                         * XXX use instanceof...
                         */
                        String type = "";
                        if (binding.equals("org.locationtech.jts.geom.MultiPolygon")) {
                            type = AttributeDescriptor.TYPE_GEOMETRY_MPOLYGON;
                        } else if (binding.equals("org.locationtech.jts.geom.Polygon")) {
                            type = AttributeDescriptor.TYPE_GEOMETRY_POLYGON;
                        } else if (binding.equals("org.locationtech.jts.geom.Geometry")) {
                            type = AttributeDescriptor.TYPE_GEOMETRY;
                        } else if (binding.equals("org.locationtech.jts.geom.LineString")) {
                            type = AttributeDescriptor.TYPE_GEOMETRY_LINESTRING;
                        } else if (binding.equals("org.locationtech.jts.geom.Point")) {
                            type = AttributeDescriptor.TYPE_GEOMETRY_POINT;
                        } else if (binding.equals("org.locationtech.jts.geom.MultiLineString")) {
                            type = AttributeDescriptor.TYPE_GEOMETRY_MLINESTRING;
                        } else if (binding.equals("org.locationtech.jts.geom.MultiPoint")) {
                            type = AttributeDescriptor.TYPE_GEOMETRY_MPOINT;
                        } else if (binding.equals("java.lang.Boolean")) {
                            type = AttributeDescriptor.TYPE_BOOLEAN;
                        } else if (binding.equals("java.lang.Long")) {
                            type = AttributeDescriptor.TYPE_INTEGER;
                        } else if (binding.equals("java.lang.String")) {
                            type = AttributeDescriptor.TYPE_STRING;
                        } else if (binding.equals("java.lang.Integer")) {
                            type = AttributeDescriptor.TYPE_INTEGER;
                        } else if (binding.equals("java.lang.Short")) {
                            type = AttributeDescriptor.TYPE_INTEGER;
                        } else if (binding.equals("java.lang.Double")) {
                            type = AttributeDescriptor.TYPE_DOUBLE;
                        } else if (binding.equals("java.lang.Float")) {
                            type = AttributeDescriptor.TYPE_DOUBLE;
                        } else if (binding.equals("java.sql.Timestamp")) {
                            type = AttributeDescriptor.TYPE_TIMESTAMP;
                        } else if (binding.equals("java.sql.Date")) {
                            type = AttributeDescriptor.TYPE_DATE;
                        } else if (binding.equals("java.math.BigDecimal")) {
                            type = AttributeDescriptor.TYPE_DOUBLE;
                        }

                        if (sft.getGeometryAttribute() == null && gtType instanceof GeometryType) {
                            sft.setGeometryAttribute(att.getName());
                        }

                        att.setType(type);
                    }
                    createdFeatureTypes.add(sft);
                    progress += progressPerTypeName;
                    status.setProgress((int) progress);
                }
            }
        } finally {
            status.setProgress(100);
            status.setCurrentAction("Service ingeladen");
            status.setFinished(true);
            if (store != null) {
                store.dispose();
            }
        }
        return createdFeatureTypes;
    }


    public static DataStore createDataStore( WFSFeatureSource fs) throws Exception {
        return createDataStore(null, fs);
    }

    public static DataStore createDataStore(Map extraDataStoreParams, WFSFeatureSource fs) throws Exception {
        Map params = new HashMap();

        // Params which can be overridden
        params.put(WFSDataStoreFactory.TIMEOUT.key, TIMEOUT);

        if (extraDataStoreParams != null) {
            params.putAll(extraDataStoreParams);
        }

        // Params which can not be overridden below

        String wfsUrl = fs.getUrl();
        if (!wfsUrl.endsWith("&") && !wfsUrl.endsWith("?")) {
            wfsUrl += wfsUrl.indexOf("?") >= 0 ? "&" : "?";
        }
        wfsUrl = wfsUrl + "REQUEST=GetCapabilities&SERVICE=WFS";
        if(!wfsUrl.toUpperCase().contains("VERSION")){
            wfsUrl += "&VERSION=1.1.0";
        }

        params.put(WFSDataStoreFactory.URL.key, wfsUrl);
        params.put(WFSDataStoreFactory.USERNAME.key, fs.getUsername());
        params.put(WFSDataStoreFactory.PASSWORD.key, fs.getPassword());

        Map logParams = new HashMap(params);
        if(fs.getPassword() != null) {
            logParams.put(WFSDataStoreFactory.PASSWORD.key, String.valueOf(new char[fs.getPassword().length()]).replace("\0", "*"));
        }
        if(log.isDebugEnabled()) {
            log.debug("Opening datastore using parameters: " + logParams);
        }
        try {
            DataStore ds = DataStoreFinder.getDataStore(params);
            if (ds == null) {
                throw new Exception("Cannot open datastore using parameters " + logParams);
            }
            return ds;
        } catch (Exception e) {
            throw new Exception("Cannot open datastore using parameters " + logParams, e);
        }
    }

    public static org.geotools.data.FeatureSource openGeoToolsFSFeatureSource(SimpleFeatureType sft, WFSFeatureSource fs) throws Exception {
        return openGeoToolsFSFeatureSource(sft, null,fs);
    }

    public static org.geotools.data.FeatureSource openGeoToolsFSFeatureSource(SimpleFeatureType sft, int timeout, WFSFeatureSource fs) throws Exception {
        Map extraParams = new HashMap();
        extraParams.put(WFSDataStoreFactory.TIMEOUT.key, timeout);
        DataStore ds = WFSFeatureSourceHelper.createDataStore(extraParams, fs);

        return ds.getFeatureSource(sft.getTypeName());
    }

    public static org.geotools.data.FeatureSource openGeoToolsFSFeatureSource(SimpleFeatureType sft,
                                                                            Map extraDataStoreParams
                                                                            , WFSFeatureSource fs) throws Exception {
        DataStore ds = createDataStore(extraDataStoreParams, fs);

        return ds.getFeatureSource(sft.getTypeName());
    }

    public static FeatureCollection getFeatures(SimpleFeatureType sft, Filter f, int maxFeatures) throws Exception {
        org.geotools.data.Query q = null;
        if(f != null){
            q = new org.geotools.data.Query(sft.getTypeName(), f);
        }else{
            q = new org.geotools.data.Query(sft.getTypeName());
        }
        q.setMaxFeatures(maxFeatures);
        FeatureCollection fc = WFSFeatureSourceHelper.openGeoToolsFSFeatureSource(sft, (WFSFeatureSource) sft.getFeatureSource()).getFeatures(q);
        return fc;
    }


    public static void loadFeatureTypes(WFSFeatureSource fs) throws Exception {
        loadFeatureTypes(fs, new WaitPageStatus());
    }

    public static void loadFeatureTypes(WFSFeatureSource fs, WaitPageStatus status) throws Exception {
        fs.getFeatureTypes().addAll(WFSFeatureSourceHelper.createFSFeatureTypes(fs, status));
    }

}
