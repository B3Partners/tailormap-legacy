/*
 * Copyright (C) 2012 B3Partners B.V.
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
package nl.b3p.geotools.data.arcgis;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.Point;
import java.io.IOException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataUtilities;
import org.geotools.data.Query;
import org.geotools.data.jdbc.FilterToSQLException;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureReader;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.util.Converters;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeDescriptor;

/**
 * 
 * @author Matthijs Laan
 */
public class ArcGISFeatureReader implements SimpleFeatureReader {
    private static final Log log = LogFactory.getLog(ArcGISFeatureReader.class);

    private static final int BATCH_SIZE = 100;
    
    private ArcGISFeatureSource fs;
    private String typeName;
    private Query query;
    private boolean returnGeometry;
    private String outFields;

    private String objectIdFieldName;
    private List objectIds;
    
    private boolean initBeforeRequestDone = false;    
    
    private SimpleFeatureBuilder builder;
    private SimpleFeatureType featureType;
    private GeometryFactory geometryFactory = new GeometryFactory();
    
    private JSONArray batch;
    
    private int batchIndex = 0;
    private int index = 0;
    
    public ArcGISFeatureReader(ArcGISFeatureSource fs, Query query) {
        this.fs = fs;
        this.query = query; 
        this.typeName = fs.getEntry().getTypeName();
    }

    @Override
    public SimpleFeatureType getFeatureType() {
        return fs.getSchema();
    }  
    
    public int getCount() throws IOException {
        return getObjectIds().size();
    } 
    
    public List getObjectIds() throws IOException {
        if(objectIds != null) {
            return objectIds;
        }
        Map<String,String> params = null;
        try {
            params = createQueryParams();
        } catch (FilterToSQLException ex) {
            throw new IOException(ex);
        }
        params.put("returnIdsOnly", "true");
        
        try {
            JSONObject idsResponse = fs.getArcGISDataStore().getServerJSONResponse(typeName + "/query", params);
            
            if(!idsResponse.containsKey("objectIds") || !idsResponse.containsKey("objectIdFieldName")) {
                throw new Exception("Requested returnIdsOnly but no objectIds or objectIdFieldName in response");
            }
            
            objectIdFieldName = (String)idsResponse.get("objectIdFieldName");
            objectIds = (JSONArray)idsResponse.get("objectIds");

            // Ensure consistent startIndex by sorting the objectIds
            Collections.sort(objectIds);
            
            int originalSize = objectIds.size();
            
            if(query.getStartIndex() != null) {
                objectIds = objectIds.subList(Math.min(query.getStartIndex(), objectIds.size()), objectIds.size());
            }
            if(objectIds.size() > query.getMaxFeatures()) {
                objectIds = objectIds.subList(0, query.getMaxFeatures());
            }
            
            if(log.isDebugEnabled()) {
                log.debug(String.format("Object ids count for layer %s: %d; when adjusted for startIndex %s and maxFeatures %s the count is %d",
                    typeName,
                    originalSize,
                    query.getStartIndex() + "",
                    query.isMaxFeaturesUnlimited() ? "unlimited" : query.getMaxFeatures() + "",
                    objectIds.size()));
            }
            return objectIds;
        } catch(Exception e) {
            throw new IOException("Error retrieving feature count from ArcGIS: " + e.toString(), e);
        } 
    }

    private Map<String,String> createQueryParams() throws FilterToSQLException {
        Map<String,String> params = new HashMap<String,String>();
        params.put("f","json");
         
        String where;
        if(query.getFilter() != null) {
            FilterToArcGISSQL visitor = new FilterToArcGISSQL();
            visitor.setFeatureType(getFeatureType());
            
            where = visitor.encodeToString(query.getFilter());
            params.putAll(visitor.getSpatialParams());
        } else {
            where = "1=1"; // where parameter is required
        }
                
        params.put("where", where);
        return params;
    }
    
    private String getOutFields() {
        if(outFields != null) {
            return outFields;
        }
        
        Set<String> s = new HashSet<String>();
        // We always need the id
        s.add(objectIdFieldName);
        if(query.getPropertyNames() == Query.ALL_NAMES) {
            for(AttributeDescriptor ad: getFeatureType().getAttributeDescriptors()) {
                s.add(ad.getLocalName());
            }
        } else if(query.getPropertyNames().length > 0) {
            s.addAll(Arrays.asList(query.getPropertyNames()));
        }
        returnGeometry = s.contains(getFeatureType().getGeometryDescriptor().getLocalName());
        s.remove(ArcGISFeatureSource.DEFAULT_GEOMETRY_ATTRIBUTE_NAME);
        StringBuilder sb = new StringBuilder();
        for(String name: s) {
            if(sb.length() > 0) {
                sb.append(",");
            }
            sb.append(name);
        }
        outFields = sb.toString();
        
        return outFields;
    }
    
    private void initBeforeRequest() throws IOException {
        if(initBeforeRequestDone) {
            return;
        }
        
        // Call to getFeatureType() will request layer info from server
        featureType = getFeatureType();
        
        builder = new SimpleFeatureBuilder(featureType);
        
        outFields = getOutFields();
        
        initBeforeRequestDone = true;        
    }
    
    protected void getNextBatch() throws IOException {
        initBeforeRequest();
        
        if(batch != null) {
            batchIndex += batch.size();
        }
        int end = Math.min(batchIndex + BATCH_SIZE, objectIds.size());        
        batch = getJSONFeaturesByObjectIds(objectIds.subList(batchIndex, end));
    }
    
    private JSONArray getJSONFeaturesByObjectIds(List ids) throws IOException {
        Map<String,String> params = new HashMap<String,String>();
        params.put("f","json");
        params.put("outFields", getOutFields());
        params.put("returnGeometry", returnGeometry + "");

        StringBuilder sb = new StringBuilder();
        for(Object id: ids) {
            if(sb.length() > 0) {
                sb.append(",");
            }
            sb.append(id);
        }
        params.put("objectIds", sb.toString());
        
        // XXX should use POST for large number of ids
        JSONObject response = fs.getArcGISDataStore().getServerJSONResponse(typeName + "/query", params);
        
        JSONArray features = (JSONArray)response.get("features");
        if(features == null) {
            throw new IOException("No features returned in ArcGIS server response");
        }      
        
        // Sort not strictly necessary, but neater
        final String idField = objectIdFieldName;
        Collections.sort(features, new Comparator() {

            @Override
            public int compare(Object o1, Object o2) {
                JSONObject lhs = (JSONObject)o1;
                JSONObject rhs = (JSONObject)o2;
                JSONObject lhsAtts = (JSONObject)lhs.get("attributes");
                JSONObject rhsAtts = (JSONObject)rhs.get("attributes");
                return ((Comparable)lhsAtts.get(idField)).compareTo(rhsAtts.get(idField) );
            }
        } );
        
        return features;
    }
    
    public SimpleFeatureCollection getFeaturesByObjectIds(List ids) throws IOException {
        JSONArray jfeatures = getJSONFeaturesByObjectIds(ids);
        List<SimpleFeature> features = new ArrayList<SimpleFeature>();
        for(Object o: jfeatures) {
            features.add(buildFeature((JSONObject)o));
        }
        return DataUtilities.collection(features);
    }
        
    protected SimpleFeature buildFeature(JSONObject jf) throws IOException {
        String id = null;
        
        JSONObject attributes = (JSONObject)jf.get("attributes");
        
        for(String attribute: (Set<String>)attributes.keySet()) {

            if(objectIdFieldName != null && objectIdFieldName.equals(attribute)) {
                Object o = attributes.get(objectIdFieldName);
                id = o == null ? null : o.toString();
            }

            Class binding = null;
            try {
                binding = featureType.getType(attribute).getBinding();
                if(binding == null) {
                    continue;
                }
                builder.set(attribute, Converters.convert(attributes.get(attribute), binding));
            } catch(Exception e) {
                throw new IOException(String.format("Error converting field \"%s\" value \"%s\" to type %s: %s",
                        attribute,
                        attributes.get(attribute),
                        binding,
                        e.toString()), e);
            }
        }        

        JSONObject jg = (JSONObject)jf.get("geometry");
        if(jg != null) {
            AttributeDescriptor ad = featureType.getGeometryDescriptor();
            Geometry g = ArcGISUtils.convertToJTSGeometry(jg, ad.getType().getBinding(), geometryFactory);
            builder.set(ad.getName(), g);
        }
        
        return builder.buildFeature(id);
    }
    
    @Override
    public SimpleFeature next() throws IOException, IllegalArgumentException, NoSuchElementException {
        
        if(batch == null || index >= batchIndex + batch.size()) {
            getNextBatch();
        }
        try {
            return buildFeature( (JSONObject) batch.get(index++ - batchIndex));
        } catch(IndexOutOfBoundsException e) {
            throw new NoSuchElementException();
        }
    }

    @Override
    public boolean hasNext() throws IOException {
        return index < getObjectIds().size();
    }
    
    @Override
    public void close() throws IOException {
        
    }    
}
