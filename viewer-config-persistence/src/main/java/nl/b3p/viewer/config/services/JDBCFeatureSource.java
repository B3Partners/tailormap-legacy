/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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
package nl.b3p.viewer.config.services;

import java.util.*;
import javax.persistence.*;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.feature.FeatureCollection;
import org.geotools.jdbc.JDBCDataStoreFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.type.AttributeType;
import org.opengis.feature.type.GeometryType;
import org.opengis.filter.Filter;

/**
 *
 * @author jytte
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(JDBCFeatureSource.PROTOCOL)
public class JDBCFeatureSource extends UpdatableFeatureSource{
    private static final Log log = LogFactory.getLog(JDBCFeatureSource.class);

    public static final String PROTOCOL = "jdbc";

    @Column(name="db_schema")
    private String schema;

    public String getSchema() {
        return schema;
    }

    public void setSchema(String schema) {
        this.schema = schema;
    }

    public JDBCFeatureSource(){
        super();
    }

    public JDBCFeatureSource(Map params) throws JSONException {
        super();

        JSONObject urlObj = new JSONObject();
        urlObj.put("dbtype", params.get("dbtype"));
        urlObj.put("host", params.get("host"));
        urlObj.put("port", params.get("port"));
        urlObj.put("database", params.get("database"));
        setUrl(urlObj.toString());

        schema = (String)params.get("schema");
        setUsername((String)params.get("user"));
        setPassword((String)params.get("passwd"));
    }

    public void loadFeatureTypes() throws Exception {
        loadFeatureTypes(new WaitPageStatus());
    }

    public void loadFeatureTypes(WaitPageStatus status) throws Exception {
        this.getFeatureTypes().addAll(createFeatureTypes(status));
    }

    /**
     * Creates list of featuretypes for this FeatureSource.
     *
     * @return list of featuretypes
     * @throws java.lang.Exception if any
     */
    public List<SimpleFeatureType> createFeatureTypes() throws Exception{
        return createFeatureTypes(new WaitPageStatus());
    }
    public List<SimpleFeatureType> createFeatureTypes(WaitPageStatus status) throws Exception{
        status.setCurrentAction("Databaseverbinding maken...");
        List<SimpleFeatureType> createdFeatureTypes = new ArrayList<SimpleFeatureType>();
        DataStore store = null;
        try {
            store = createDataStore();
            status.setProgress(10);
            status.setCurrentAction("Lijst van tabellen met geo-informatie ophalen...");
            String[] typeNames = store.getTypeNames();
            status.setProgress(20);

            if(typeNames.length != 0) {
                double progress = 20.0;
                double progressPerTypeName = (80.0/typeNames.length);
                for(String typeName: typeNames) {
                    status.setCurrentAction("Inladen schema van tabel \"" + typeName + "\"...");
                    log.debug("Loading feature source " + typeName + " for JDBCFeatureSource " + getName());

                    SimpleFeatureSource gtFs = store.getFeatureSource(typeName);

                    SimpleFeatureType sft = new SimpleFeatureType();
                    sft.setTypeName(typeName);
                    sft.setFeatureSource(this);
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
                        if(binding.equals("com.vividsolutions.jts.geom.MultiPolygon")){
                            type = AttributeDescriptor.TYPE_GEOMETRY_MPOLYGON;
                        }else if(binding.equals("com.vividsolutions.jts.geom.Polygon")){
                            type = AttributeDescriptor.TYPE_GEOMETRY_POLYGON;
                        }else if(binding.equals("com.vividsolutions.jts.geom.Geometry")){
                            type = AttributeDescriptor.TYPE_GEOMETRY;
                        }else if(binding.equals("com.vividsolutions.jts.geom.LineString")){
                            type = AttributeDescriptor.TYPE_GEOMETRY_LINESTRING;
                        }else if(binding.equals("com.vividsolutions.jts.geom.Point")){
                            type = AttributeDescriptor.TYPE_GEOMETRY_POINT;
                        }else if(binding.equals("com.vividsolutions.jts.geom.MultiLineString")){
                            type = AttributeDescriptor.TYPE_GEOMETRY_MLINESTRING;
                        }else if(binding.equals("com.vividsolutions.jts.geom.MultiPoint")){
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

    public DataStore createDataStore() throws Exception {
        Map params = new HashMap();
        JSONObject urlObj = new JSONObject(getUrl());
        params.put("dbtype", urlObj.get("dbtype"));
        params.put("host", urlObj.get("host"));
        params.put("port", urlObj.get("port"));
        params.put("database", urlObj.get("database"));

        params.put("schema", schema);
        params.put("user", getUsername());
        params.put(JDBCDataStoreFactory.FETCHSIZE.key,50);
        params.put("passwd", getPassword());
        params.put(JDBCDataStoreFactory.EXPOSE_PK.key, true);
        params.put(JDBCDataStoreFactory.PK_METADATA_TABLE.key, "gt_pk_metadata");
        log.debug("Opening datastore using parameters: " + params);
        try {
            DataStore ds = DataStoreFinder.getDataStore(params);
            if(ds == null) {
                params.put("passwd", "xxx");
                throw new Exception("Cannot open datastore using parameters " + params);
            }
            return ds;
        } catch(Exception e) {
            params.put("passwd", "xxx");
            throw new Exception("Cannot open datastore using parameters " + params, e);
        }
    }


    @Override
    org.geotools.data.FeatureSource openGeoToolsFeatureSource(SimpleFeatureType sft) throws Exception {
        DataStore ds = createDataStore();

        return ds.getFeatureSource(sft.getTypeName());
    }

    @Override
    org.geotools.data.FeatureSource openGeoToolsFeatureSource(SimpleFeatureType sft, int timeout) throws Exception {
        return openGeoToolsFeatureSource(sft);
    }

    @Override
    FeatureCollection getFeatures(SimpleFeatureType sft, Filter f, int maxFeatures) throws Exception {
        FeatureCollection fc = null;
        if(f != null){
            fc = sft.openGeoToolsFeatureSource().getFeatures(f);
        }else{
            fc = sft.openGeoToolsFeatureSource().getFeatures();
        }
        return fc;
    }
}
