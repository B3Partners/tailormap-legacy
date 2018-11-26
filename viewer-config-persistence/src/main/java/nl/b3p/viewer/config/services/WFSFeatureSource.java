/*
 * Copyright (C) 2011-2016 B3Partners B.V.
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
package nl.b3p.viewer.config.services;

import java.util.*;
import javax.persistence.*;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.feature.FeatureCollection;
import org.json.JSONException;
import org.opengis.feature.type.AttributeType;
import org.opengis.feature.type.GeometryType;
import org.opengis.filter.Filter;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(WFSFeatureSource.PROTOCOL)
public class WFSFeatureSource extends UpdatableFeatureSource {

    private static final Log log = LogFactory.getLog(WFSFeatureSource.class);
    public static final String PROTOCOL = "wfs";
    public static final Integer TIMEOUT = 60000;

    public WFSFeatureSource() {
        super();
    }

    public WFSFeatureSource(Map params) throws JSONException {
        super();

        setUrl(params.get(WFSDataStoreFactory.URL.key).toString());
        setUsername((String) params.get(WFSDataStoreFactory.USERNAME.key));
        setPassword((String) params.get(WFSDataStoreFactory.PASSWORD.key));
    }

    public void loadFeatureTypes() throws Exception {
        loadFeatureTypes(new WaitPageStatus());
    }

    public void loadFeatureTypes(WaitPageStatus status) throws Exception {
         this.getFeatureTypes().addAll(createFeatureTypes(status));
    }

    /**
     * Creates list of featuretypes for this FeatureSource
     * @return list of featuretypes.
     * @throws java.lang.Exception if any
     */
    public List<SimpleFeatureType> createFeatureTypes() throws Exception{
        return createFeatureTypes(new WaitPageStatus());
    }
    @Override
    public List<SimpleFeatureType> createFeatureTypes(WaitPageStatus status) throws Exception {

        status.setCurrentAction("Ophalen informatie...");
        List<SimpleFeatureType> createdFeatureTypes = new ArrayList<SimpleFeatureType>();

        DataStore store = null;
        try {
            store = createDataStore();

            setName(store.getInfo().getTitle());

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
                    log.debug("Loading feature source " + typeName + " for WFS url " + getUrl());

                    SimpleFeatureSource gtFs = store.getFeatureSource(typeName);

                    SimpleFeatureType sft = new SimpleFeatureType();
                    sft.setTypeName(typeName);
                    sft.setFeatureSource(this);
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

    public DataStore createDataStore() throws Exception {
        return createDataStore(null);
    }

    public DataStore createDataStore(Map extraDataStoreParams) throws Exception {
        Map params = new HashMap();

        // Params which can be overridden
        params.put(WFSDataStoreFactory.TIMEOUT.key, TIMEOUT);

        if (extraDataStoreParams != null) {
            params.putAll(extraDataStoreParams);
        }

        // Params which can not be overridden below

        String wfsUrl = getUrl();
        if (!wfsUrl.endsWith("&") && !wfsUrl.endsWith("?")) {
            wfsUrl += wfsUrl.indexOf("?") >= 0 ? "&" : "?";
        }
        wfsUrl = wfsUrl + "REQUEST=GetCapabilities&SERVICE=WFS";
        if(!wfsUrl.toUpperCase().contains("VERSION")){
            wfsUrl += "&VERSION=1.1.0";
        }

        params.put(WFSDataStoreFactory.URL.key, wfsUrl);
        params.put(WFSDataStoreFactory.USERNAME.key, getUsername());
        params.put(WFSDataStoreFactory.PASSWORD.key, getPassword());

        log.debug("Opening datastore using parameters: " + params);
        try {
            DataStore ds = DataStoreFinder.getDataStore(params);
            if (ds == null) {
                params.put(WFSDataStoreFactory.PASSWORD.key, "xxx");
                throw new Exception("Cannot open datastore using parameters " + params);
            }
            return ds;
        } catch (Exception e) {
            params.put(WFSDataStoreFactory.PASSWORD.key, "xxx");
            throw new Exception("Cannot open datastore using parameters " + params, e);
        }
    }

    @Override
    public org.geotools.data.FeatureSource openGeoToolsFeatureSource(SimpleFeatureType sft) throws Exception {
        return openGeoToolsFeatureSource(sft, null);
    }

    @Override
    public org.geotools.data.FeatureSource openGeoToolsFeatureSource(SimpleFeatureType sft, int timeout) throws Exception {
        Map extraParams = new HashMap();
        extraParams.put(WFSDataStoreFactory.TIMEOUT.key, timeout);
        DataStore ds = createDataStore(extraParams);

        return ds.getFeatureSource(sft.getTypeName());
    }

    public org.geotools.data.FeatureSource openGeoToolsFeatureSource(SimpleFeatureType sft, Map extraDataStoreParams) throws Exception {
        DataStore ds = createDataStore(extraDataStoreParams);

        return ds.getFeatureSource(sft.getTypeName());
    }

    @Override
    FeatureCollection getFeatures(SimpleFeatureType sft, Filter f, int maxFeatures) throws Exception {
        org.geotools.data.Query q = null;
        if(f != null){
            q = new org.geotools.data.Query(sft.getTypeName(), f);
        }else{
            q = new org.geotools.data.Query(sft.getTypeName());
        }
        q.setMaxFeatures(maxFeatures);
        FeatureCollection fc = sft.openGeoToolsFeatureSource().getFeatures(q);
        return fc;
    }
}
