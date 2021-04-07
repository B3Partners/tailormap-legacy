package nl.b3p.viewer.helpers.featuresources;

import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.web.WaitPageStatus;

import java.util.List;

public interface FeatureSourceHelper {
    List<SimpleFeatureType> createFeatureTypes(FeatureSource fs, WaitPageStatus status) throws Exception;

    org.geotools.data.FeatureSource openGeoToolsFeatureSource(FeatureSource fs, SimpleFeatureType sft) throws Exception;
    org.geotools.data.FeatureSource openGeoToolsFeatureSource(FeatureSource fs, SimpleFeatureType sft, int timeout) throws Exception;
}
