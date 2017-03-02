/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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

import java.net.URL;
import java.util.*;
import javax.persistence.Basic;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import nl.b3p.geotools.data.arcims.ArcIMSDataStoreFactory;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataStore;
import org.geotools.feature.FeatureCollection;
import org.geotools.referencing.CRS;
import org.opengis.filter.Filter;

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
        return createDataStore(null);
    }

    public DataStore createDataStore(Map extraDataStoreParams) throws Exception {
        Map params = new HashMap();

        // Params which can be overridden
        if (extraDataStoreParams != null) {
            params.putAll(extraDataStoreParams);
        }

        // Params which can not be overridden below

        params.put(ArcIMSDataStoreFactory.URL.key, new URL(getUrl()));
        params.put(ArcIMSDataStoreFactory.SERVICENAME.key, serviceName);

        params.put(ArcIMSDataStoreFactory.USER.key, getUsername());
        params.put(ArcIMSDataStoreFactory.PASSWD.key, getPassword());

        log.debug("Opening datastore using parameters: " + params);

        params.put(ArcIMSDataStoreFactory.CRS.key, CRS.decode("EPSG:28992"));

        DataStore ds = null;
        try {
            ds = new ArcIMSDataStoreFactory().createDataStore(params);
        } catch (Exception e) {
            params.put(ArcIMSDataStoreFactory.PASSWD.key, "xxx");
            throw new Exception("Cannot open datastore using parameters " + params, e);
        }
        if (ds == null) {
            params.put(ArcIMSDataStoreFactory.PASSWD.key, "xxx");
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
        extraParams.put(ArcIMSDataStoreFactory.TIMEOUT.key, timeout);
        DataStore ds = createDataStore(extraParams);

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
