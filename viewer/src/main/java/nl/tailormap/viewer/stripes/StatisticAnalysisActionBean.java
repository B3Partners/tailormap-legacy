package nl.tailormap.viewer.stripes;

import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.tailormap.geotools.filter.visitor.RemoveDistanceUnit;
import nl.tailormap.viewer.audit.AuditMessageObject;
import nl.tailormap.viewer.audit.Auditable;
import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.config.app.ApplicationLayer;
import nl.tailormap.viewer.config.services.Layer;
import nl.tailormap.viewer.config.services.SimpleFeatureType;
import nl.tailormap.viewer.helpers.featuresources.FeatureSourceFactoryHelper;
import nl.tailormap.viewer.userlayer.TMFilterToSQL;
import nl.tailormap.viewer.util.ChangeMatchCase;
import nl.tailormap.viewer.util.FilterHelper;
import nl.tailormap.viewer.util.TailormapCQL;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DefaultTransaction;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.data.jdbc.FilterToSQLException;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.filter.text.cql2.CQLException;
import org.geotools.jdbc.JDBCDataStore;
import org.json.JSONObject;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.filter.expression.Function;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import java.io.IOException;
import java.io.StringReader;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.MessageFormat;

@UrlBinding("/action/statisticanalysis")
@StrictBinding
public class StatisticAnalysisActionBean extends LocalizableApplicationActionBean implements Auditable {


    private static final Log log = LogFactory.getLog(SldActionBean.class);


    private AuditMessageObject auditMessageObject;
    private ActionBeanContext context;

    @Validate
    private Application application;

    @Validate
    private ApplicationLayer appLayer;

    @Validate
    private SimpleFeatureType featureType;

    private Layer layer = null;

    @Validate
    private String type;

    @Validate
    private String column;

    @Validate
    private String filter;


    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public ApplicationLayer getAppLayer() {
        return appLayer;
    }

    public void setAppLayer(ApplicationLayer appLayer) {
        this.appLayer = appLayer;
    }

    public SimpleFeatureType getFeatureType() {
        return featureType;
    }

    public void setFeatureType(SimpleFeatureType featureType) {
        this.featureType = featureType;
    }

    public Layer getLayer() {
        return layer;
    }

    public void setLayer(Layer layer) {
        this.layer = layer;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    @Override
    public AuditMessageObject getAuditMessageObject() {
        return auditMessageObject;
    }

    public void setAuditMessageObject(AuditMessageObject auditMessageObject) {
        this.auditMessageObject = auditMessageObject;
    }

    public String getFilter() {
        return filter;
    }

    public void setFilter(String filter) {
        this.filter = filter;
    }

    public String getColumn() {
        return column;
    }

    public void setColumn(String column) {
        this.column = column;
    }
// </editor-fold>


    @Before(stages = LifecycleStage.EventHandling)
    public void initAudit(){
        auditMessageObject = new AuditMessageObject();
    }

    @After(stages= LifecycleStage.BindingAndValidation)
    public void loadLayer() {
        layer = appLayer.getService().getSingleLayer(appLayer.getLayerName(), Stripersist.getEntityManager());
    }

    @DefaultHandler
    public Resolution analyse() {
        JSONObject json = new JSONObject();
        json.put("success", false);
        try {
            AnalysisType analysis = getAnalysisType();
            if(analysis == null){
                json.put("message", "Wrong type of analysis :" + type);
            }
            if (analysis != null && (featureType != null || (layer != null && layer.getFeatureType() != null))) {
                FeatureSource fs;
                SimpleFeatureType ft = featureType;
                if (ft == null) {
                    ft = layer.getFeatureType();
                }

                fs = FeatureSourceFactoryHelper.openGeoToolsFeatureSource(ft);

                if(fs.getDataStore() instanceof JDBCDataStore) {
                    log.debug("trying to get Analysis with SQL for JDBCDatastore");
                    json.put("type", "sql");
                    EntityManager em = Stripersist.getEntityManager();
                    JDBCDataStore da = (JDBCDataStore) fs.getDataStore();

                    String whereStatement = "";
                    if(this.filter != null) {
                        whereStatement = this.getSQLQuery(da, ft.getTypeName(), em);
                    }

                    json.put("result", getValueWithSQL(da, ft, whereStatement));
                    json.put("success", true);
                    this.auditMessageObject.addMessage(whereStatement);
                } else {

                    final Query q = new Query(fs.getName().toString());
                    //  q.setMaxFeatures(getMaxFeatures());

                    setFilter(filter, q, ft, Stripersist.getEntityManager());


                    SimpleFeatureCollection fc = (SimpleFeatureCollection) fs.getFeatures(q);

                    FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2(null);
                    Function unique = ff.function(analysis.geotoolsFunction, ff.property(column));

                    Object value = unique.evaluate(fc);
                    json.put("result", value);
                    json.put("success", true);
                    this.auditMessageObject.addMessage(q);
                }

                this.auditMessageObject.addMessage(ft);
                this.auditMessageObject.addMessage(fs);
            }
        } catch (Exception e) {
            log.error("Error loading features", e);


            String message = MessageFormat.format(getBundle().getString("viewer.downloadfeaturesactionbean.1"), e.toString() );
            Throwable cause = e.getCause();
            while (cause != null) {
                message += "; " + cause.toString();
                cause = cause.getCause();
            }
            json.put("message", message);
        }
        return new StreamingResolution("application/json",new StringReader(json.toString()));
    }

    private AnalysisType getAnalysisType(){
        AnalysisType[] types = AnalysisType.values();

        for (AnalysisType analysisType : types) {
            if(analysisType.name().equals(type)){
                return analysisType;
            }
        }
        return null;
    }

    private void setFilter(String filter, Query q, SimpleFeatureType ft, EntityManager em) throws Exception {
        if (filter != null && filter.trim().length() > 0) {
            Filter f = TailormapCQL.toFilter(filter, em);
            f = (Filter) f.accept(new RemoveDistanceUnit(), null);
            f = (Filter) f.accept(new ChangeMatchCase(false), null);
            f = FilterHelper.reformatFilter(f, ft);
            q.setFilter(f);
        }
    }

    public enum AnalysisType {
        SUM("Collection_Sum"),
        MIN("Collection_Min"),
        MAX("Collection_Max"),
        COUNT("Collection_Count"),
        AVERAGE("Collection_Average");
        private final String geotoolsFunction;

        AnalysisType(String geotoolsFunction) {
            this.geotoolsFunction = geotoolsFunction;
        }
    }

    private String getSQLQuery(JDBCDataStore dataStore, String tableName, EntityManager em) throws CQLException, FilterToSQLException, IOException {
        TMFilterToSQL f = new TMFilterToSQL(dataStore, tableName);
        f.createFilterCapabilities();
        return f.encodeToString(TailormapCQL.toFilter(this.filter, em, false));
    }

    private double getValueWithSQL(JDBCDataStore da, SimpleFeatureType ft, String whereStatement) throws SQLException {
        double value = 0;
        Connection con = null;

        try {
            con = da.getConnection(new DefaultTransaction("analysis"));
            String sql  = buildAnalysisQuery(ft.getTypeName(), whereStatement);
            ResultSet rs = con.prepareStatement(sql).executeQuery();
            rs.next();
            value = rs.getInt(1);
        } catch (IOException | SQLException e) {
            log.error("Can't get feature Analysis with sql for JDBCDatastore: " + e.getMessage());
        } finally {
            if (con != null) {
                con.close();;
            }
        }
        return value;
    }

    private String buildAnalysisQuery(String tableName, String whereStatement) {
        String sql = "SELECT ";
        switch (type) {
            case "SUM":
                sql += "SUM (" + column + ") FROM " + tableName + " " + whereStatement;
                break;
            case "MIN":
                sql += "MIN (" + column + ") FROM " + tableName + " " + whereStatement;
                break;
            case "MAX":
                sql += "MAX (" + column + ") FROM " + tableName + " " + whereStatement;
                break;
            case "COUNT":
                sql += "COUNT (" + column + ") FROM " + tableName + " " + whereStatement;
                break;
            case "AVERAGE":
                sql += "AVG (" + column + ") FROM " + tableName + " " + whereStatement;
                break;
            default:
                sql = "";
        }
        return sql;
    }
}
