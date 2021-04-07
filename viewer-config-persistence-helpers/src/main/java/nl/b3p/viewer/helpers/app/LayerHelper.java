package nl.b3p.viewer.helpers.app;

import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.helpers.services.WMSServiceHelper;
import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.stripesstuff.stripersist.Stripersist;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;

public class LayerHelper {
    private static final Log log = LogFactory.getLog(LayerHelper.class);

    /**
     * Clone this layer and remove it from the tree of the GeoService this Layer
     * is part of. Used for updating service, call only on non-persistent objects.
     * @return a clone of this Layer with its parent and service set to null and
     * children set to a new, empty list.
     */
    public static Layer pluckCopy(Layer l) {
        if(Stripersist.getEntityManager().contains(l)) {
            throw new IllegalStateException();
        }
        try {
            Layer clone = (Layer) BeanUtils.cloneBean(l);
            clone.setParent(null);
            clone.setChildren(new ArrayList());
            clone.setService(null);

            return clone;
        } catch (Exception e) {
            log.error("Cannot clone layer");
            return null;
        }
    }
}
