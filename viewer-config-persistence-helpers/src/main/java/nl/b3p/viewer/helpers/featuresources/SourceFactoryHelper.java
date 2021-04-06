package nl.b3p.viewer.helpers.featuresources;

import nl.b3p.viewer.config.services.*;
import nl.b3p.web.WaitPageStatus;

import java.util.List;

public class SourceFactoryHelper {

    public static Boolean isUpdatable(FeatureSource fs){
        return fs instanceof WFSFeatureSource || fs instanceof JDBCFeatureSource;
    }

    public static org.geotools.data.FeatureSource openGeoToolsFeatureSource(SimpleFeatureType sft, int timeout) throws Exception {
        return SourceFactoryHelper.openGeoToolsFeatureSource(sft.getFeatureSource(), sft, timeout);
    }
    public static org.geotools.data.FeatureSource openGeoToolsFeatureSource(SimpleFeatureType sft) throws Exception {
        return SourceFactoryHelper.openGeoToolsFeatureSource(sft.getFeatureSource(), sft, 30);
    }

    public static org.geotools.data.FeatureSource openGeoToolsFeatureSource(FeatureSource fs,SimpleFeatureType sft) throws Exception {
        return SourceFactoryHelper.openGeoToolsFeatureSource(fs, sft, 30);
    }

    public static org.geotools.data.FeatureSource openGeoToolsFeatureSource(FeatureSource fs, SimpleFeatureType sft, int timeout) throws Exception {
        SourceHelper sh = getHelper(fs);
        return sh.openGeoToolsFeatureSource(fs, sft, timeout);
    }

    public static List<SimpleFeatureType> createFeatureTypes(FeatureSource fs, WaitPageStatus status) throws Exception {
        SourceHelper sh = getHelper(fs);
        return sh.createFeatureTypes(fs, status);
    }

    public static List<SimpleFeatureType> createFeatureTypes(FeatureSource fs) throws Exception {
        return SourceFactoryHelper.createFeatureTypes(fs, new WaitPageStatus());
    }

    public static SourceHelper getHelper(FeatureSource fs){
        if(fs instanceof JDBCFeatureSource){
            return new JDBCSourceHelper();
        }else if(fs instanceof WFSFeatureSource){
            return new WFSSourceHelper();
        }else if(fs instanceof ArcGISFeatureSource){
            return new ArcGISSourceHelper();
        }
        return null;
    }
}
