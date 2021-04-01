package nl.b3p.viewer;

import nl.b3p.viewer.config.services.SimpleFeatureType;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.stripesstuff.stripersist.Stripersist;

import java.util.Collection;

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

}
