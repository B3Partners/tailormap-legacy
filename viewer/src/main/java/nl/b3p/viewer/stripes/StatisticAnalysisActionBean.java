package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.geotools.filter.visitor.RemoveDistanceUnit;
import nl.b3p.viewer.audit.AuditMessageObject;
import nl.b3p.viewer.audit.Auditable;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.WFSFeatureSource;
import nl.b3p.viewer.util.ChangeMatchCase;
import nl.b3p.viewer.util.FeatureToJson;
import nl.b3p.viewer.util.FlamingoCQL;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.factory.CommonFactoryFinder;
import org.json.JSONObject;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.filter.expression.Function;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import java.io.StringReader;
import java.text.MessageFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private AnalysisType type;

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

    public AnalysisType getType() {
        return type;
    }

    public void setType(AnalysisType type) {
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
        try {
            if (featureType != null || (layer != null && layer.getFeatureType() != null)) {
                FeatureSource fs;
                SimpleFeatureType ft = featureType;
                if (ft == null) {
                    ft = layer.getFeatureType();
                }

                fs = ft.openGeoToolsFeatureSource();


                final Query q = new Query(fs.getName().toString());
              //  q.setMaxFeatures(getMaxFeatures());

                setFilter(filter, q, ft, Stripersist.getEntityManager());


                SimpleFeatureCollection fc =(SimpleFeatureCollection) fs.getFeatures(q);

                FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2(null);
                Function unique = ff.function("Collection_Sum", ff.property(column));
                /*
                FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
                Function sum = ff.function(type.geotoolsFunction, ff.property(column));*/

                Object value = unique.evaluate( fc );

                json.put("success", true);

                this.auditMessageObject.addMessage(ft);
                this.auditMessageObject.addMessage(q);
                this.auditMessageObject.addMessage(fs);
            }
        } catch (Exception e) {
            log.error("Error loading features", e);

            json.put("success", false);

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



    protected void setFilter(String filter, Query q, SimpleFeatureType ft, EntityManager em) throws Exception {
        if (filter != null && filter.trim().length() > 0) {
            Filter f = FlamingoCQL.toFilter(filter, em);
            f = (Filter) f.accept(new RemoveDistanceUnit(), null);
            f = (Filter) f.accept(new ChangeMatchCase(false), null);
            f = FeatureToJson.reformatFilter(f, ft);
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

    ;
}
