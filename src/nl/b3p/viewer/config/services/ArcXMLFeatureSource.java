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
import nl.b3p.geotools.data.arcims.ArcIMSDataStoreFactory;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
/**
 *
 * @author jytte
 */
@Entity
@DiscriminatorValue(ArcXMLFeatureSource.PROTOCOL)
public class ArcXMLFeatureSource extends FeatureSource {
    private static final Log log = LogFactory.getLog(ArcXMLFeatureSource.class);

    public static final String PROTOCOL = "arcxml";
    
    @Basic
    private String serviceName;

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    
    public DataStore createDataStore() throws Exception {
        Map params = new HashMap();
        
        params.put(ArcIMSDataStoreFactory.URL.key, new URL(getUrl()));
        params.put(ArcIMSDataStoreFactory.SERVICENAME.key, serviceName);
        
        params.put(ArcIMSDataStoreFactory.USER.key, getUsername());
        params.put(ArcIMSDataStoreFactory.PASSWD.key, getPassword());
        
        log.debug("Opening datastore using parameters: " + params);
        DataStore ds = null;
        try {
            ds = DataStoreFinder.getDataStore(params);      
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
    List<String> calculateUniqueValues(SimpleFeatureType sft, String attributeName, int maxFeatures) throws IOException {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    org.geotools.data.FeatureSource openGeoToolsFeatureSource(SimpleFeatureType sft) throws Exception {
        DataStore ds = createDataStore();

        return ds.getFeatureSource(sft.getTypeName());
    }
}
