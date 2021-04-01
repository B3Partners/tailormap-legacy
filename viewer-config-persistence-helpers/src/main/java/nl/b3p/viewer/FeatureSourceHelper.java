package nl.b3p.viewer;

import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import org.stripesstuff.stripersist.Stripersist;

public class FeatureSourceHelper {

    public static void removeFeatureType(FeatureSource fs, SimpleFeatureType featureType) {
        Stripersist.getEntityManager().remove(featureType);
        fs.getFeatureTypes().remove(featureType);
    }

}
