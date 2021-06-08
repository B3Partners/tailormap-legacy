package nl.tailormap.viewer.helpers.featuresources;

import nl.tailormap.viewer.config.services.FeatureSource;
import nl.tailormap.viewer.config.services.SimpleFeatureType;
import nl.tailormap.web.WaitPageStatus;

import java.util.List;

public interface FeatureSourceHelper {
    List<SimpleFeatureType> createFeatureTypes(FeatureSource fs, WaitPageStatus status) throws Exception;

    org.geotools.data.FeatureSource openGeoToolsFeatureSource(FeatureSource fs, SimpleFeatureType sft) throws Exception;
    org.geotools.data.FeatureSource openGeoToolsFeatureSource(FeatureSource fs, SimpleFeatureType sft, int timeout) throws Exception;
}
