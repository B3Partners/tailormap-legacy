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
package nl.b3p.geotools.data.arcims;

import java.io.IOException;
import java.text.DateFormat;
import java.util.Date;
import java.util.NoSuchElementException;
import org.geotools.data.Query;
import org.geotools.data.simple.SimpleFeatureReader;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeType;

/**
 *
 * @author Matthijs Laan
 */
class ArcIMSFeatureReader implements SimpleFeatureReader {  

    private ArcIMSFeatureSource fs;
    private Query query;
    
    private SimpleFeatureBuilder builder;
    
    private AxlGetFeatures request;
    private AxlFeatures response;
    
    private DateFormat dateFormat;
    
    private int index;
    
    public ArcIMSFeatureReader(ArcIMSFeatureSource fs, Query query) {
        this.fs = fs;
        this.query = query;        
    }

    @Override
    public SimpleFeatureType getFeatureType() {
        return fs.getSchema();
    }
    
    protected void performRequest() throws IOException {
        if(request != null) {
            return;
        }
        builder = new SimpleFeatureBuilder(getFeatureType());
        for(AttributeType t: getFeatureType().getTypes()) {
            if(t.getBinding().equals(Date.class)) {
                dateFormat = AxlField.createDateFormat();
            }
        }
        
        request = new AxlGetFeatures();
        request.setLayer(new AxlLayerInfo(fs.getEntry().getTypeName()));
        request.setQuery(new AxlQuery());
        
        try {
            response = ((ArcIMSDataStore)fs.getDataStore()).getArcIMSServer().getFeatures(request);
        } catch(Exception e) {
            throw new IOException("Error retrieving features from ArcIMS: " + e.toString(), e);
        }
    }
    
    protected SimpleFeature buildFeature(AxlFeature axlf) throws IOException {
        
        boolean hasId = false;
        
        for(AxlField f: axlf.getFields()) {
            Class binding = null;
            try {
                binding = getFeatureType().getType(f.getName()).getBinding();
                builder.set(f.getName(), f.getConvertedValue(binding, dateFormat));
                hasId = AxlField.AXL_ID.equals(f.getName());
            } catch(Exception e) {
                throw new IOException(String.format("Error converting field \"%s\" value \"%s\" to type %s: %s",
                        f.getName(),
                        f.getValue(),
                        binding,
                        e.toString()), e);
            }
        }
        return builder.buildFeature(hasId ? AxlField.AXL_ID : null);
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
        if(response == null || response.getFeatures() == null || response.getFeatures() == null ||
                response.getFeatures().isEmpty()) {
            return false;
        }
        return index < response.getFeatures().size();
    }

    public boolean hasMore() throws IOException {
        performRequest();
        return response.getFeatureCount().isHasmore();
    }
    
    @Override
    public void close() throws IOException {
        
    }
}
