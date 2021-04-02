package nl.b3p.viewer.helpers.featuresources;

import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.JDBCFeatureSource;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.sqlserver.SQLServerDataStoreFactory;
import org.geotools.feature.FeatureCollection;
import org.geotools.jdbc.JDBCDataStoreFactory;
import org.json.JSONObject;
import org.opengis.feature.type.AttributeType;
import org.opengis.feature.type.GeometryType;
import org.opengis.filter.Filter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JDBCSourceHelper implements SourceHelper{

    private static final Log log = LogFactory.getLog(JDBCSourceHelper.class);

    @Override
    public List<SimpleFeatureType> createFeatureTypes(FeatureSource fs) throws Exception {
        return createFeatureTypes(fs, new WaitPageStatus());
    }

    @Override
    public List<SimpleFeatureType> createFeatureTypes(FeatureSource fs, WaitPageStatus status) throws Exception {
        return JDBCSourceHelper.createFSFeatureTypes((JDBCFeatureSource)fs, status);
    }

    @Override
    public org.geotools.data.FeatureSource openGeoToolsFeatureSource(FeatureSource fs, SimpleFeatureType sft) throws Exception {
        return JDBCSourceHelper.openGeoToolsFSFeatureSource((JDBCFeatureSource) fs, sft);
    }

    @Override
    public org.geotools.data.FeatureSource openGeoToolsFeatureSource(FeatureSource fs, SimpleFeatureType sft, int timeout) throws Exception {
        return JDBCSourceHelper.openGeoToolsFSFeatureSource((JDBCFeatureSource) fs, sft);
    }

    public static List<SimpleFeatureType> createFSFeatureTypes(JDBCFeatureSource fs, WaitPageStatus status) throws Exception {
        status.setCurrentAction("Databaseverbinding maken...");
        List<SimpleFeatureType> createdFeatureTypes = new ArrayList<SimpleFeatureType>();
        DataStore store = null;
        try {
            store = JDBCSourceHelper.createDataStore(fs);
            status.setProgress(10);
            status.setCurrentAction("Lijst van tabellen met geo-informatie ophalen...");
            String[] typeNames = store.getTypeNames();
            status.setProgress(20);

            if(typeNames.length != 0) {
                double progress = 20.0;
                double progressPerTypeName = (80.0/typeNames.length);
                for(String typeName: typeNames) {
                    status.setCurrentAction("Inladen schema van tabel \"" + typeName + "\"...");
                    log.debug("Loading feature source " + typeName + " for JDBCFeatureSource " + fs.getName());

                    SimpleFeatureSource gtFs = store.getFeatureSource(typeName);

                    SimpleFeatureType sft = new SimpleFeatureType();
                    sft.setTypeName(typeName);
                    sft.setFeatureSource(fs);
                    sft.setWriteable(true);
                    if(gtFs.getInfo() != null) {
                        sft.setDescription(gtFs.getInfo().getDescription());
                    }

                    org.opengis.feature.simple.SimpleFeatureType gtFt = gtFs.getSchema();

                    for(org.opengis.feature.type.AttributeDescriptor gtAtt: gtFt.getAttributeDescriptors()) {
                        AttributeDescriptor att = new AttributeDescriptor();
                        sft.getAttributes().add(att);
                        att.setName(gtAtt.getLocalName());

                        AttributeType gtType = gtAtt.getType();
                        String binding = gtType.getBinding().getName();

                        /* XXX use instanceof... */
                        String type = "";
                        if(binding.equals("org.locationtech.jts.geom.MultiPolygon")){
                            type = AttributeDescriptor.TYPE_GEOMETRY_MPOLYGON;
                        }else if(binding.equals("org.locationtech.jts.geom.Polygon")){
                            type = AttributeDescriptor.TYPE_GEOMETRY_POLYGON;
                        }else if(binding.equals("org.locationtech.jts.geom.Geometry")){
                            type = AttributeDescriptor.TYPE_GEOMETRY;
                        }else if(binding.equals("org.locationtech.jts.geom.LineString")){
                            type = AttributeDescriptor.TYPE_GEOMETRY_LINESTRING;
                        }else if(binding.equals("org.locationtech.jts.geom.Point")){
                            type = AttributeDescriptor.TYPE_GEOMETRY_POINT;
                        }else if(binding.equals("org.locationtech.jts.geom.MultiLineString")){
                            type = AttributeDescriptor.TYPE_GEOMETRY_MLINESTRING;
                        }else if(binding.equals("org.locationtech.jts.geom.MultiPoint")){
                            type = AttributeDescriptor.TYPE_GEOMETRY_MPOINT;
                        }else if(binding.equals("java.lang.Boolean")){
                            type = AttributeDescriptor.TYPE_BOOLEAN;
                        }else if(binding.equals("java.lang.Long")){
                            type = AttributeDescriptor.TYPE_INTEGER;
                        }else if(binding.equals("java.lang.String")){
                            type = AttributeDescriptor.TYPE_STRING;
                        }else if(binding.equals("java.lang.Integer")){
                            type = AttributeDescriptor.TYPE_INTEGER;
                        }else if(binding.equals("java.lang.Short")){
                            type = AttributeDescriptor.TYPE_INTEGER;
                        }else if(binding.equals("java.lang.Double")){
                            type = AttributeDescriptor.TYPE_DOUBLE;
                        }else if(binding.equals("java.lang.Float")){
                            type = AttributeDescriptor.TYPE_DOUBLE;
                        }else if(binding.equals("java.sql.Timestamp")){
                            type = AttributeDescriptor.TYPE_TIMESTAMP;
                        }else if(binding.equals("java.sql.Date")){
                            type = AttributeDescriptor.TYPE_DATE;
                        }else if(binding.equals("java.math.BigDecimal")){
                            type = AttributeDescriptor.TYPE_DOUBLE;
                        }

                        if(sft.getGeometryAttribute() == null && gtType instanceof GeometryType) {
                            sft.setGeometryAttribute(att.getName());
                        }

                        att.setType(type);
                    }
                    createdFeatureTypes.add(sft);

                    progress += progressPerTypeName;
                    status.setProgress((int)progress);
                }
            }
        } finally {
            status.setProgress(100);
            status.setCurrentAction("Databasegegevens ingeladen");
            status.setFinished(true);
            if(store != null) {
                store.dispose();
            }
        }
        return createdFeatureTypes;
    }

    public static DataStore createDataStore(JDBCFeatureSource fs) throws Exception {
        Map params = new HashMap();
        JSONObject urlObj = new JSONObject(fs.getUrl());
        params.put("dbtype", urlObj.get("dbtype"));
        params.put("host", urlObj.get("host"));
        params.put("port", urlObj.get("port"));
        params.put("database", urlObj.get("database"));

        params.put("schema", fs.schema);
        params.put("user", fs.getUsername());
        params.put(JDBCDataStoreFactory.FETCHSIZE.key,50);
        params.put("passwd", fs.getPassword());
        params.put(JDBCDataStoreFactory.EXPOSE_PK.key, true);
        params.put(JDBCDataStoreFactory.PK_METADATA_TABLE.key, "gt_pk_metadata");
        // this key is available in ao. Oracle and MS SQL datastore factories, but not in the common parent..
        // we need this for mssql to determine a featuretype on an empty table
        if(!urlObj.get("dbtype").equals("oracle")){
            params.put(SQLServerDataStoreFactory.GEOMETRY_METADATA_TABLE.key, "geometry_columns");
        }
        Map logParams = new HashMap(params);
        if(fs.getPassword() != null) {
            logParams.put("passwd", new String(new char[fs.getPassword().length()]).replace("\0", "*"));
        }
        log.debug("Opening datastore using parameters: " + logParams);
        try {
            DataStore ds = DataStoreFinder.getDataStore(params);
            if(ds == null) {
                throw new Exception("Cannot open datastore using parameters " + logParams);
            }
            return ds;
        } catch(Exception e) {
            throw new Exception("Cannot open datastore using parameters " + logParams, e);
        }
    }


    public static org.geotools.data.FeatureSource openGeoToolsFSFeatureSource(JDBCFeatureSource fs, SimpleFeatureType sft) throws Exception {
        DataStore ds = createDataStore(fs);

        return ds.getFeatureSource(sft.getTypeName());
    }

    static FeatureCollection getFeatures(JDBCFeatureSource fs, SimpleFeatureType sft, Filter f, int maxFeatures) throws Exception {
        FeatureCollection fc = null;
        if(f != null){
            fc = JDBCSourceHelper.openGeoToolsFSFeatureSource(fs,sft).getFeatures(f);
        }else{
            fc = JDBCSourceHelper.openGeoToolsFSFeatureSource(fs,sft).getFeatures();
        }
        return fc;
    }


    public static void loadFeatureTypes(JDBCFeatureSource fs) throws Exception {
        JDBCSourceHelper.loadFeatureTypes(fs, new WaitPageStatus());
    }

    public static void loadFeatureTypes(JDBCFeatureSource fs,WaitPageStatus status) throws Exception {
        fs.getFeatureTypes().addAll(JDBCSourceHelper.createFSFeatureTypes(fs, status));
    }
}
