package nl.b3p.viewer.helpers.featuresources;

import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.opengis.filter.Filter;
import org.stripesstuff.stripersist.Stripersist;

import java.util.Collection;
import java.util.List;
import java.util.Map;

public class SimpleFeatureTypeHelper {
    private static final Log log = LogFactory.getLog(SimpleFeatureTypeHelper.class);
    public static void clearReferences(Collection<SimpleFeatureType> typesToRemove) {
        // Clear references
        int removed = Stripersist.getEntityManager().createQuery("update Layer set featureType = null where featureType in (:types)")
                .setParameter("types", typesToRemove)
                .executeUpdate();
        if(removed > 0) {
            log.warn("Cleared " + removed + " references to " + typesToRemove.size() + " type names which are to be removed");
        }

        // Ignore Layar references
    }




/* TODO is this needed? I think we can use the SourceFactoryHelper directly

    public org.geotools.data.FeatureSource openGeoToolsFeatureSource(FeatureSource fs, SimpleFeatureType sft) throws Exception {
        return featureSource.openGeoToolsFeatureSource(this);
    }

    public org.geotools.data.FeatureSource openGeoToolsFeatureSource(int timeout) throws Exception {
        return featureSource.openGeoToolsFeatureSource(this, timeout);
    }
*/
}
