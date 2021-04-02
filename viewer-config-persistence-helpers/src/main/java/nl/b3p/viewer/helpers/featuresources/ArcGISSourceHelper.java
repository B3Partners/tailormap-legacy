package nl.b3p.viewer.helpers.featuresources;

import nl.b3p.geotools.data.arcgis.ArcGISDataStoreFactory;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.viewer.config.services.ArcGISFeatureSource;
import nl.b3p.viewer.config.services.ArcGISService;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataStore;
import org.geotools.feature.FeatureCollection;
import org.geotools.referencing.CRS;
import org.opengis.filter.Filter;

import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ArcGISSourceHelper implements SourceHelper {
    private static final Log log = LogFactory.getLog(ArcGISSourceHelper.class);

    @Override
    public List<SimpleFeatureType> createFeatureTypes(FeatureSource fs) throws Exception {
        return createFeatureTypes(fs, new WaitPageStatus());
    }

    @Override
    public List<SimpleFeatureType> createFeatureTypes(FeatureSource fs, WaitPageStatus status) throws Exception {
        return null;
    }

    @Override
    public org.geotools.data.FeatureSource openGeoToolsFeatureSource(FeatureSource fs, SimpleFeatureType sft) throws Exception {
        return openGeoToolsFeatureSource(fs, sft, 30);
    }

    @Override
    public org.geotools.data.FeatureSource openGeoToolsFeatureSource(FeatureSource fs, SimpleFeatureType sft, int timeout) throws Exception {
        return ArcGISSourceHelper.openGeoToolsFSFeatureSource((ArcGISFeatureSource) fs, sft, timeout);
    }


    public static DataStore createDataStore(ArcGISFeatureSource fs) throws Exception {
        return createDataStore(null);
    }

    public static DataStore createDataStore(ArcGISFeatureSource fs, Map extraDataStoreParams) throws Exception {
        Map params = new HashMap();

        if (fs.getLinkedService() != null) {
            Map<String, ClobElement> serviceDetails = fs.getLinkedService().getDetails();
            ClobElement assumeVersion = serviceDetails.get(ArcGISService.DETAIL_ASSUME_VERSION);
            if (assumeVersion != null && assumeVersion.getValue() != null) {
                log.debug("Linked service details specify user assumed version " + assumeVersion + ", passing on to datastore");
                params.put(ArcGISDataStoreFactory.AGS_ASSUME_VERSION.key, assumeVersion.getValue());
            } else {
                String version = ((ArcGISService) fs.getLinkedService()).getCurrentVersion();
                if (version != null) {
                    log.debug("Linked service details has current version " + version + ", passing on to datastore");
                    params.put(ArcGISDataStoreFactory.AGS_ASSUME_VERSION.key, version);
                }
            }
            if (!params.containsKey(ArcGISDataStoreFactory.AGS_ASSUME_VERSION.key)) {
                log.debug("No ArcGIS Server version to pass on to datastore, extra version request will be performed!");
            }
        }

        // Params which can be overridden
        if (extraDataStoreParams != null) {
            params.putAll(extraDataStoreParams);

            if (extraDataStoreParams.containsKey(ArcGISDataStoreFactory.AGS_ASSUME_VERSION.key)) {
                log.debug("NOTE: version parameter as determined above overridden to " + params.get(ArcGISDataStoreFactory.AGS_ASSUME_VERSION.key));
            }
        }

        // Params which can not be overridden below

        params.put(ArcGISDataStoreFactory.URL.key, new URL(fs.getUrl()));
        params.put(ArcGISDataStoreFactory.USER.key, fs.getUsername());
        params.put(ArcGISDataStoreFactory.PASSWD.key, fs.getPassword());
        Map logParams = new HashMap(params);
        if (fs.getPassword() != null) {
            logParams.put(ArcGISDataStoreFactory.PASSWD.key, new String(new char[fs.getPassword().length()]).replace("\0", "*"));
        }

        log.debug("Opening datastore using parameters: " + logParams);


        params.put(ArcGISDataStoreFactory.CRS.key, CRS.decode("EPSG:28992"));

        DataStore ds = null;
        try {
            ds = new ArcGISDataStoreFactory().createDataStore(params);
        } catch (Exception e) {
            throw new Exception("Cannot open datastore using parameters " + logParams, e);
        }
        if (ds == null) {
            throw new Exception("Cannot open datastore using parameters " + logParams);
        } else {
            return ds;
        }
    }

    static org.geotools.data.FeatureSource openGeoToolsFSFeatureSource(ArcGISFeatureSource fs, SimpleFeatureType sft) throws Exception {
        return ArcGISSourceHelper.openGeoToolsFSFeatureSource(fs, sft, 30);
    }

    static org.geotools.data.FeatureSource openGeoToolsFSFeatureSource(ArcGISFeatureSource fs, SimpleFeatureType sft, int timeout) throws Exception {
        Map extraParams = new HashMap();
        extraParams.put(ArcGISDataStoreFactory.TIMEOUT.key, timeout);

        return ArcGISSourceHelper.openGeoToolsFSFeatureSource(fs, sft, extraParams);
    }

    public static org.geotools.data.FeatureSource openGeoToolsFSFeatureSource(ArcGISFeatureSource fs, SimpleFeatureType sft, Map extraDataStoreParams) throws Exception {
        DataStore ds = createDataStore(fs, extraDataStoreParams);

        return ds.getFeatureSource(sft.getTypeName());
    }

    static FeatureCollection getFeatures(ArcGISFeatureSource fs, SimpleFeatureType sft, Filter f, int maxFeatures) throws Exception {
        org.geotools.data.Query q = null;
        if (f != null) {
            q = new org.geotools.data.Query(sft.getTypeName(), f);
        } else {
            q = new org.geotools.data.Query(sft.getTypeName());
        }

        q.setMaxFeatures(maxFeatures);
        org.geotools.data.FeatureSource dfs = ArcGISSourceHelper.openGeoToolsFSFeatureSource(fs, sft);
        FeatureCollection fc = dfs.getFeatures(q);
        return fc;
    }
}
