/*
 * Copyright (C) 2011 B3Partners B.V.
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

import java.io.IOException;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import nl.b3p.geotools.data.arcgis.ArcGISDataStoreFactory;
import org.geotools.data.DataStore;
import org.geotools.referencing.CRS;
/**
 *
 * @author jytte
 */
@Entity
@DiscriminatorValue(ArcGISFeatureSource.PROTOCOL)
public class ArcGISFeatureSource extends FeatureSource {
    private static final Log log = LogFactory.getLog(ArcGISFeatureSource.class);
    
    public static final String PROTOCOL = "arcgis";

    @Override
    List<String> calculateUniqueValues(SimpleFeatureType sft, String attributeName, int maxFeatures) throws IOException {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public DataStore createDataStore() throws Exception {
        return createDataStore(null);
    }
    
    public DataStore createDataStore(Map extraDataStoreParams) throws Exception {
        Map params = new HashMap();
            
        // Params which can be overridden
        if(extraDataStoreParams != null) {
            params.putAll(extraDataStoreParams);
        }
        
        // Params which can not be overridden below        
        
        params.put(ArcGISDataStoreFactory.URL.key, new URL(getUrl()));
        params.put(ArcGISDataStoreFactory.USER.key, getUsername());
        params.put(ArcGISDataStoreFactory.PASSWD.key, getPassword());
        
        log.debug("Opening datastore using parameters: " + params);
        
        
        params.put(ArcGISDataStoreFactory.CRS.key, CRS.decode("EPSG:28992"));

        DataStore ds = null;
        try {
            ds = new ArcGISDataStoreFactory().createDataStore(params);      
        } catch(Exception e) {
            throw new Exception("Cannot open datastore using parameters " + params, e);
        }
        if(ds == null) {
            throw new Exception("Cannot open datastore using parameters " + params);
        } else {
            return ds;        
        }
    }    

    @Override
    org.geotools.data.FeatureSource openGeoToolsFeatureSource(SimpleFeatureType sft) throws Exception {
        DataStore ds = createDataStore();

        return ds.getFeatureSource(sft.getTypeName());
    }
    
    @Override
    org.geotools.data.FeatureSource openGeoToolsFeatureSource(SimpleFeatureType sft, int timeout) throws Exception {
        Map extraParams = new HashMap();
        extraParams.put(ArcGISDataStoreFactory.TIMEOUT.key, timeout);
        DataStore ds = createDataStore(extraParams);

        return ds.getFeatureSource(sft.getTypeName());
    }       
    
    public org.geotools.data.FeatureSource openGeoToolsFeatureSource(SimpleFeatureType sft, Map extraDataStoreParams) throws Exception {
        DataStore ds = createDataStore(extraDataStoreParams);

        return ds.getFeatureSource(sft.getTypeName());
    }    
}
