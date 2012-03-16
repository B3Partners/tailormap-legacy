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
import org.geotools.data.FeatureReader;
import org.geotools.data.Query;
import org.geotools.data.QueryCapabilities;
import org.geotools.data.store.ContentEntry;
import org.geotools.data.store.ContentFeatureSource;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.filter.sort.SortBy;

/**
 *
 * @author Matthijs Laan
 */
public class ArcIMSFeatureSource extends ContentFeatureSource {

    private ArcIMSDataStore ds;
    private String layer;
    
    public ArcIMSFeatureSource(ContentEntry ce, Query q) {
        super(ce, q);
        this.ds = (ArcIMSDataStore)ce.getDataStore();
        this.layer = ce.getTypeName();
    }
    
    @Override
    public QueryCapabilities buildQueryCapabilities() {        
        return new QueryCapabilities() {
            @Override
            public boolean isJoiningSupported() {
                return false;
            }
            
            @Override
            public boolean isOffsetSupported() {
                return true;
            }
            
            @Override
            public boolean isReliableFIDSupported() {
                return true;
            }
            
            @Override
            public boolean isVersionSupported() {
                return false;
            }
            
            @Override 
            public boolean supportsSorting(SortBy[] attributes) {
                return false;
            }                    
        };       
    }
    
    @Override
    protected ReferencedEnvelope getBoundsInternal(Query query) throws IOException {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override   
    protected int getCountInternal(Query query) throws IOException {
        return -1;
    }

    @Override
    protected FeatureReader<SimpleFeatureType, SimpleFeature> getReaderInternal(Query query) throws IOException {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    protected SimpleFeatureType buildFeatureType() throws IOException {       
        throw new UnsupportedOperationException("Not supported yet.");
    }
    
}
