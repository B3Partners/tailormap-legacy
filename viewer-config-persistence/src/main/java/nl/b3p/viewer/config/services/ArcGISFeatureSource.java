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
import javax.persistence.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import nl.b3p.geotools.data.arcgis.ArcGISDataStoreFactory;
import nl.b3p.viewer.config.ClobElement;
import org.geotools.data.DataStore;
import org.geotools.feature.FeatureCollection;
import org.geotools.referencing.CRS;
import org.opengis.filter.Filter;

/**
 *
 * @author jytte
 */
@Entity
@DiscriminatorValue(ArcGISFeatureSource.PROTOCOL)
public class ArcGISFeatureSource extends FeatureSource {

    private static final Log log = LogFactory.getLog(ArcGISFeatureSource.class);
    public static final String PROTOCOL = "arcgis";


    public DataStore createDataStore() throws Exception {
        return createDataStore(null);
    }

    public DataStore createDataStore(Map extraDataStoreParams) throws Exception {
        Map params = new HashMap();

        if(getLinkedService() != null) {
            Map<String,ClobElement> serviceDetails = getLinkedService().getDetails();
            ClobElement assumeVersion = serviceDetails.get(ArcGISService.DETAIL_ASSUME_VERSION);
            if(assumeVersion != null && assumeVersion.getValue() != null) {
                log.debug("Linked service details specify user assumed version " + assumeVersion + ", passing on to datastore");
                params.put(ArcGISDataStoreFactory.AGS_ASSUME_VERSION.key, assumeVersion.getValue());
            } else {
                String version = ((ArcGISService)getLinkedService()).getCurrentVersion();
                if(version != null) {
                    log.debug("Linked service details has current version " + version + ", passing on to datastore");
                    params.put(ArcGISDataStoreFactory.AGS_ASSUME_VERSION.key, version);
                }
            }
            if(!params.containsKey(ArcGISDataStoreFactory.AGS_ASSUME_VERSION.key)) {
                log.debug("No ArcGIS Server version to pass on to datastore, extra version request will be performed!");
            }
        }

        // Params which can be overridden
        if (extraDataStoreParams != null) {
            params.putAll(extraDataStoreParams);

            if(extraDataStoreParams.containsKey(ArcGISDataStoreFactory.AGS_ASSUME_VERSION.key)) {
                log.debug("NOTE: version parameter as determined above overridden to " + params.get(ArcGISDataStoreFactory.AGS_ASSUME_VERSION.key));
            }
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
        } catch (Exception e) {
            params.put(ArcGISDataStoreFactory.PASSWD.key, "xxx");
            throw new Exception("Cannot open datastore using parameters " + params, e);
        }
        if (ds == null) {
            params.put(ArcGISDataStoreFactory.PASSWD.key, "xxx");
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

    @Override
    FeatureCollection getFeatures(SimpleFeatureType sft, Filter f, int maxFeatures) throws Exception {
        org.geotools.data.Query q = null;
        if(f != null){
            q = new org.geotools.data.Query(sft.getTypeName(), f);
        }else{
            q = new org.geotools.data.Query(sft.getTypeName());
        }

        q.setMaxFeatures(maxFeatures);
        org.geotools.data.FeatureSource fs = sft.openGeoToolsFeatureSource();
        FeatureCollection fc = fs.getFeatures(q);
        return fc;
    }
}
