package nl.b3p.viewer.userlayer;

import nl.b3p.viewer.audit.AuditMessageObject;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.services.Layer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.jdbc.FilterToSQL;
import org.geotools.data.jdbc.FilterToSQLException;
import org.geotools.filter.text.cql2.CQL;
import org.geotools.filter.text.cql2.CQLException;
import org.geotools.jdbc.BasicSQLDialect;
import org.geotools.jdbc.JDBCDataStore;

import javax.persistence.EntityManager;

public class UserLayerHandler {
    private static final Log LOG = LogFactory.getLog(UserLayerHandler.class);
    private final AuditMessageObject auditMessageObject;
    private final ApplicationLayer appLayer;
    private final String query;
    private final EntityManager entityManager;
    private final Application application;
    private Layer layer;
    private JDBCDataStore dataStore;
    private DataBase dataBase;

    /**
     * @param auditMessageObject for audit messages, not {@code null}
     * @param entityManager      needed to get access to the database, not {@code null}
     * @param application        Application we're working for
     * @param appLayer           appLayer to remove or that is the base for the userlayer, {@code null}
     * @param query              CQL query, can be {@code null}
     */
    public UserLayerHandler(AuditMessageObject auditMessageObject, EntityManager entityManager, Application application,
                            ApplicationLayer appLayer, String query) {
        this.auditMessageObject = auditMessageObject;
        this.entityManager = entityManager;
        this.application = application;
        this.appLayer = appLayer;
        this.query = query;

        try {
            this.layer = this.appLayer.getService().getLayer(this.appLayer.getLayerName(), this.entityManager);
            this.dataStore = (JDBCDataStore) layer.getFeatureType().openGeoToolsFeatureSource().getDataStore();
            this.dataBase = DataBaseFactory.getDataBase(dataStore);
        } catch (Exception e) {
            LOG.fatal("Problem opening datastore. " + e.getLocalizedMessage());
        }
    }


    public boolean add() {
        boolean succes = createView();
        if (succes) {
            succes = createWMSLayer();
        }
        if (succes) {
            succes = createUserLayer();
        } else {
            dropview();
        }
        if (succes) {
            succes = updateApplication();
        } else {
            deleteWMSLayer();
            dropview();
        }

        return succes;
    }

    public boolean delete() {
        boolean succes = updateApplication(appLayer);
        if (succes) {
            succes = deleteWMSLayer();
        } else {
            return succes;
        }
        if (succes) {
            succes = dropview();
        } else {
            createWMSLayer();
            updateApplication();
        }

        return succes;
    }

    private boolean createView() {
        boolean succes = false;
        try {
            FilterToSQL f = ((BasicSQLDialect) this.dataStore.getSQLDialect()).createFilterToSQL();
            String where = f.encodeToString(CQL.toFilter(this.query));
            String viewName = this.dataBase.createViewName();
            String tableName = this.layer.getFeatureType().getTypeName();
            succes = this.dataBase.createView(viewName, tableName, where);

            this.auditMessageObject.addMessage("Aanmaken van view " + viewName);
        } catch (FilterToSQLException | CQLException e) {
            LOG.error("Problem converting CQL to SQL. " + e.getLocalizedMessage());
        }
        return succes;
    }

    private boolean dropview() {
        String viewName = this.layer.getName();
        boolean succes = this.dataBase.dropView(viewName);

        this.auditMessageObject.addMessage("Verwijderen van view " + viewName);

        return succes;
    }

    private boolean createWMSLayer() {
        // TODO implement
        return true;
    }

    private boolean deleteWMSLayer() {
        // TODO implement
        return true;
    }

    private boolean createUserLayer() {
        // TODO implement
        return true;
    }

    private boolean updateApplication() {
        // TODO implement
        // add appLayer, update application
        return true;
    }

    private boolean updateApplication(ApplicationLayer applicationLayer) {
        // TODO implement
        // delete appLayer, update application
        return true;
    }

    public ApplicationLayer getApplicationLayer() {
        return this.appLayer;
    }

    public long getAppLayerId() {
        return this.appLayer.getId();
    }

    public String getLayerName() {
        return this.layer.getName();
    }
}
