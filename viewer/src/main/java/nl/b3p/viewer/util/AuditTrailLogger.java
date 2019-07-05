package nl.b3p.viewer.util;

import net.sourceforge.stripes.action.ActionBeanContext;
import org.apache.commons.logging.Log;
import org.geotools.data.simple.SimpleFeatureStore;
import org.geotools.filter.text.cql2.CQL;
import org.opengis.feature.type.AttributeDescriptor;

import java.util.List;

public class AuditTrailLogger {

    protected SimpleFeatureStore store;
    protected Log log;
    private ActionBeanContext context;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public SimpleFeatureStore getStore() {
        return store;
    }

    public void setStore(SimpleFeatureStore store) {
        this.store = store;
    }

    public Log getLog() {
        return log;
    }

    public void setLog(Log log) {
        this.log = log;
    }

    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    //</editor-fold>

    /**
     * Method to query the datastore with a dummy query, containing the username. This is used for an audittrail.
     * A query is composed using the
     * first attribute from the type, and constructing a Query with it:
     * {@code <firstattribute> = 'username is <username>'}.
     */
    public void addAuditTrailLog() {
        try {
            List<AttributeDescriptor> attributeDescriptors = store.getSchema().getAttributeDescriptors();
            String typeName = null;
            for (AttributeDescriptor ad : attributeDescriptors) {
                // Get an attribute of type string. This because the username is almost always a string, and passing it to a Integer/Double will result in a invalid
                // query which will not log the passed values (possibly because the use of geotools).
                if (ad.getType().getBinding() == String.class) {
                    typeName = ad.getLocalName();
                    break;
                }
            }

            if (typeName == null) {
                typeName = store.getSchema().getAttributeDescriptors().get(0).getLocalName();
                log.warn("Audittrail: cannot find attribute of type double/integer or string. Take the first attribute.");
            }
            String username = context.getRequest().getRemoteUser();
            String[] dummyValues = new String[]{"a", "b"}; // use these values for creating a statement which will always fail: attribute1 = a AND attribute1 = b.
            String valueToInsert = "username = " + username;
            store.modifyFeatures(typeName, valueToInsert, CQL.toFilter(typeName + " = '" + dummyValues[0] + "' and " + typeName + " = '" + dummyValues[1] + "'"));

        } catch (Exception ex) {
            // Swallow all exceptions, because this inherently fails. It's only use is to log the application username, so it can be matched (via the database process id
            // to the following insert/update/delete statement.
        }
    }
}
