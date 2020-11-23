package nl.b3p.viewer.userlayer;

import nl.b3p.viewer.audit.AuditMessageObject;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.services.GeoService;
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
    private final String layerTitle;
    private final EntityManager entityManager;
    private final Application application;
    private final GeoServerManager manager;
    private final String geoserverStore;
    private final String geoserverWorkspace;
    private Layer layer;
    private GeoService service;
    private JDBCDataStore dataStore;
    private DataBase dataBase;

    /**
     * @param auditMessageObject for audit messages, not {@code null}
     * @param entityManager      needed to get access to the database, not {@code null}
     * @param application        Application we're working for
     * @param appLayer           appLayer to remove or that is the base for the userlayer, {@code null}
     * @param query              CQL query, can be {@code null}
     * @param userLayerTitle     user friendly layername
     */
    public UserLayerHandler(AuditMessageObject auditMessageObject, EntityManager entityManager, Application application,
                            ApplicationLayer appLayer, String query, String userLayerTitle, String geoserverWorkspace,
                            String geoserverStore) {
        this.auditMessageObject = auditMessageObject;
        this.entityManager = entityManager;
        this.application = application;
        this.appLayer = appLayer;
        this.query = query;
        this.layerTitle = userLayerTitle;
        this.geoserverWorkspace = geoserverWorkspace;
        this.geoserverStore = geoserverStore;

        try {
            this.service = this.appLayer.getService();
            this.layer = this.service.getLayer(this.appLayer.getLayerName(), this.entityManager);
            this.dataStore = (JDBCDataStore) layer.getFeatureType().openGeoToolsFeatureSource().getDataStore();
            this.dataBase = DataBaseFactory.getDataBase(dataStore);
        } catch (Exception e) {
            LOG.fatal("Problem opening datastore. " + e.getLocalizedMessage());
        }

        manager = new GeoServerManager(
                this.service.getUrl(),
                this.service.getUsername(),
                this.service.getPassword(),
                this.geoserverWorkspace,
                this.geoserverStore
        );
    }


    public boolean add() {
        String viewName = this.dataBase.createViewName();

        boolean succes = createView(viewName);
        if (succes) {
            succes = createWMSLayer(viewName);
        }

        if (succes) {
            succes = createUserLayer();
        } else {
            dropview(viewName);
        }

        if (succes) {
            succes = updateApplication();
        } else {
            deleteWMSLayer(viewName);
            dropview(viewName);
        }

        return succes;
    }

    public boolean delete() {
        boolean succes = updateApplication(appLayer);
        if (succes) {
            succes = deleteWMSLayer(this.layer.getName());
        } else {
            return succes;
        }
        if (succes) {
            succes = dropview(this.layer.getName());
        } else {
            createWMSLayer(this.layer.getName());
            updateApplication();
        }

        return succes;
    }

    public boolean updateStyle(String cssStyle){
        return this.manager.addStyleToLayer(
                this.layer.getName(),
                cssStyle
        );
    }

    private boolean createView(String viewName) {
        boolean ok = false;
        try {
            FilterToSQL f = ((BasicSQLDialect) this.dataStore.getSQLDialect()).createFilterToSQL();
            String where = f.encodeToString(CQL.toFilter(this.query));
            String tableName = this.layer.getFeatureType().getTypeName();
            ok = this.dataBase.createView(viewName, tableName, where);

            this.auditMessageObject.addMessage("Aanmaken van view " + viewName + " is " + (ok ? "gelukt" : "mislukt"));
        } catch (FilterToSQLException | CQLException e) {
            LOG.error("Problem converting CQL to SQL. " + e.getLocalizedMessage());
        }
        return ok;
    }

    private boolean dropview(String viewName) {
        boolean ok = this.dataBase.dropView(viewName);
        this.auditMessageObject.addMessage("Verwijderen van view " + viewName + " is " + (ok ? "gelukt" : "mislukt"));
        return ok;
    }

    private boolean createWMSLayer(String viewName) {
        boolean ok = manager.createLayer(viewName, this.layerTitle, viewName);
        this.auditMessageObject.addMessage("Aanmaken van WMS layer " + viewName + " is " + (ok ? "gelukt" : "mislukt"));
        return ok;
    }

    private boolean deleteWMSLayer(String layerName) {
        boolean ok = manager.deleteLayer(layerName);
        this.auditMessageObject.addMessage(
                "Verwijderen van WMS layer " + layerName + " is " + (ok ? "gelukt" : "mislukt"));
        return ok;
    }

    /**
     * create the userlayer in the tailormap database.
     *
     * @return
     */
    private boolean createUserLayer() {
        // TODO implement
        // update this.appLayer and this.layer 
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
