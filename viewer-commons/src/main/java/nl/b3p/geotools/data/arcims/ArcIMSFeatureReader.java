/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
package nl.b3p.geotools.data.arcims;

import com.vividsolutions.jts.geom.GeometryFactory;
import java.io.IOException;
import java.util.Arrays;
import java.util.NoSuchElementException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.Query;
import org.geotools.data.simple.SimpleFeatureReader;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import nl.b3p.geotools.data.arcims.axl.*;
import org.geotools.data.jdbc.FilterToSQLException;

/**
 *
 * @author Matthijs Laan
 */
class ArcIMSFeatureReader implements SimpleFeatureReader {  
    private static final Log log = LogFactory.getLog(ArcIMSFeatureReader.class);

    private ArcIMSFeatureSource fs;
    private Query query;
    private String[] internedPropertyNames;
    
    private boolean initBeforeRequestDone = false;
    
    private SimpleFeatureBuilder builder;
    private SimpleFeatureType featureType;
    private GeometryFactory geometryFactory = new GeometryFactory();
    
    private AxlGetFeatures request;
    private AxlFeatures response;
    
    private int startIndex = 0;
    private Integer maxFeatures;
    
    private int index;
    
    private Integer totalCount;
    
    private String rowIdAttribute;

    public ArcIMSFeatureReader(ArcIMSFeatureSource fs, Query query) {
        this.fs = fs;
        this.query = query;     
        
        if(query.getStartIndex() != null) {
            this.startIndex = query.getStartIndex();
        }
        if(!query.isMaxFeaturesUnlimited()) {
            maxFeatures = query.getMaxFeatures();
        }
        
        if(!query.retrieveAllProperties() && query.getPropertyNames().length > 0) {
            String[] propertyNames = query.getPropertyNames();
            internedPropertyNames = new String[propertyNames.length];
            for(int i = 0; i < propertyNames.length; i++) {
                internedPropertyNames[i] = propertyNames[i].intern();
            }
            Arrays.sort(internedPropertyNames);
        }
        
        if(log.isDebugEnabled()) {
            String qryString = null;
            if(query != null) {
                try {
                    // NPE when NullSortBy
                    qryString = query.toString();
                } catch(Exception e) {
                    qryString = "<exception>";
                }
            }
            log.debug(String.format("%s init reader, startindex=%d maxfeatures=%d query %s", 
                    fs.getDataStore().toString(), 
                    startIndex, 
                    maxFeatures, 
                    qryString));
        }
    }
    
    /**
     * @return The amount of features that satisfy the query and max feature limit,
     *  subtracted with the start index
     */
    public int getCount() throws IOException {
        if(totalCount != null) {
            return totalCount;
        }
        
        AxlGetFeatures r = new AxlGetFeatures();
        r.setLayer(new AxlLayerInfo(fs.getEntry().getTypeName()));
        try {
            buildAxlQuery(r);
        } catch(Exception e) {
            throw new IOException("Error processing filter: " + e.toString(), e);
        }       
        r.setSkipfeatures(true);
        log.debug(String.format("%s get feature count for layer %s",
                fs.getDataStore().toString(),
                r.getLayer().getId()));
        try {
            AxlFeatures resp = ((ArcIMSDataStore)fs.getDataStore()).getArcIMSServer().getFeatures(r);
            totalCount = resp.getFeatureCount().getCount();
            int countMax = totalCount;
            if(query.getStartIndex() != null) {
                countMax = Math.max(0, totalCount - query.getStartIndex());
            }
            if(maxFeatures != null) {
                countMax = Math.min(countMax, maxFeatures);
            }
            log.debug(String.format("Total feature count for layer %s: %d (with start index and max features: %d)", r.getLayer().getId(), totalCount, countMax));
            return countMax;
        } catch(Exception e) {
            throw new IOException("Error retrieving feature count from ArcIMS: " + e.toString(), e);
        }        
    }
    
    /**
     * @return The total amount of features that satisfy the query without 
     *  applying max feature limit and start index
     */
    public int getTotalCount() throws IOException {
        if(totalCount == null) {
            getCount();
        }
        return totalCount;                
    }
    
    private void buildAxlQuery(AxlGetFeatures gf) throws FilterToSQLException {

        AxlSpatialQuery aq = new AxlSpatialQuery();
        gf.setQuery(aq);
        
        if(query.getPropertyNames() != null && query.getPropertyNames().length > 0) {
            aq.setSubfields(Arrays.asList(query.getPropertyNames()));
        }
        
        if(query.getFilter() != null) {
            FilterToArcXMLSQL visitor = new FilterToArcXMLSQL(aq);
            visitor.setFeatureType(getFeatureType());
            
            String where = visitor.encodeToString(query.getFilter());
            if(where.trim().length() > 0 && !where.trim().equals("1=1")) {
                aq.setWhere(where);
            }
        }
    }

    @Override
    public SimpleFeatureType getFeatureType() {
        return fs.getSchema();
    }
    
    private void performNewRequest() throws IOException {
        request = null;
        performRequest();
    }
    
    private void initBeforeRequest() throws IOException {
        if(initBeforeRequestDone) {
            return;
        }
        
        // Call to getFeatureType() will lead to GET_SERVICE_INFO request
        featureType = getFeatureType();
        
        builder = new SimpleFeatureBuilder(featureType);
        rowIdAttribute = fs.findRowIdAttribute();
        
        initBeforeRequestDone = true;        
    }
    
    protected void performRequest() throws IOException {
        if(request != null) {
            return;
        }
        initBeforeRequest();
                
        request = new AxlGetFeatures();
        request.setLayer(new AxlLayerInfo(fs.getEntry().getTypeName()));
        try {
            buildAxlQuery(request);
        } catch(Exception e) {
            throw new IOException("Error processing filter: " + e.toString(), e);
        }
        
        if(maxFeatures != null) {
            request.setFeaturelimit(maxFeatures);
        }
        request.setBeginrecord(startIndex+1);
        log.debug(String.format("%s get features for layer %s, beginrecord=%d featurelimit=%d",
                fs.getDataStore().toString(),
                request.getLayer().getId(),
                request.getBeginrecord(),
                request.getFeaturelimit()));
        try {
            response = ((ArcIMSDataStore)fs.getDataStore()).getArcIMSServer().getFeatures(request);
        } catch(Exception e) {
            throw new IOException("Error retrieving features from ArcIMS: " + e.toString(), e);
        }
    }
    
    protected SimpleFeature buildFeature(AxlFeature axlf) throws IOException {
        String id = null;

        for(AxlField f: axlf.getFields()) {
            if(rowIdAttribute != null && rowIdAttribute.equals(f.getName())) {
                id = f.getValue();
            }
            
            if(!query.retrieveAllProperties()) {
                if(internedPropertyNames == null) {
                    // No properties
                    continue;
                } else if(Arrays.binarySearch(internedPropertyNames, f.getName().intern()) < 0) {
                    continue;
                }
            }

            Class binding = null;
            try {
                binding = featureType.getType(f.getName()).getBinding();
                builder.set(f.getName(), f.getConvertedValue(binding, geometryFactory));
            } catch(Exception e) {
                throw new IOException(String.format("Error converting field \"%s\" value \"%s\" to type %s: %s",
                        f.getName(),
                        f.getValue(),
                        binding,
                        e.toString()), e);
            }
        }
        return builder.buildFeature(id);
    }

    @Override
    public SimpleFeature next() throws IOException, IllegalArgumentException, NoSuchElementException {
        performRequest();
        try {
            return buildFeature(response.getFeatures().get(index++));
        } catch(IndexOutOfBoundsException e) {
            throw new NoSuchElementException();
        }
    }

    @Override
    public boolean hasNext() throws IOException {
        performRequest();
        if(response == null || response.getFeatures() == null ||
                response.getFeatures().isEmpty()) {
            return false;
        }
        if(index < response.getFeatures().size()) {
            return true;
        }
        if(response.getFeatureCount().isHasmore()) {
            startIndex += response.getFeatures().size();
            index = 0;
            
            if(maxFeatures != null) {
                maxFeatures -= response.getFeatures().size();
                if(maxFeatures <= 0) {
                    return false;
                }
            }
            performNewRequest();
            return response.getFeatures() != null && !response.getFeatures().isEmpty();
        }
        return false;
    }

    public boolean hasMore() throws IOException {
        performRequest();
        return response.getFeatureCount().isHasmore();
    }
    
    @Override
    public void close() throws IOException {
        
    }
}
