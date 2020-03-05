package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.audit.AuditMessageObject;
import nl.b3p.viewer.audit.Auditable;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.Layer;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DefaultTransaction;
import org.geotools.data.FeatureSource;
import org.geotools.data.Transaction;
import org.geotools.data.simple.SimpleFeatureStore;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.filter.identity.FeatureIdImpl;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.WKTReader;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.feature.type.GeometryType;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import static nl.b3p.viewer.stripes.FeatureInfoActionBean.FID;

@UrlBinding("/action/feature/editbulk")
@StrictBinding
public class EditBulkFeatureActionBean extends LocalizableApplicationActionBean implements Auditable {
    private ActionBeanContext context;
    private static final Log log = LogFactory.getLog(EditBulkFeatureActionBean.class);

    protected SimpleFeatureStore store;

    @Validate
    private Application application;

    @Validate
    private String features;

    @Validate
    private ApplicationLayer appLayer;

    protected Layer layer;

    private JSONObject currentFeature;

    private FeatureSource featureSource;

    protected EntityManager entityManager;

    private AuditMessageObject auditMessageObject;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    @Override
    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public String getFeatures() {
        return features;
    }

    public void setFeatures(String features) {
        this.features = features;
    }

    public ApplicationLayer getAppLayer() {
        return appLayer;
    }

    public void setAppLayer(ApplicationLayer appLayer) {
        this.appLayer = appLayer;
    }

    public SimpleFeatureStore getStore() {
        return store;
    }

    public JSONObject getCurrentFeature() {
        return currentFeature;
    }

    public void setCurrentFeature(JSONObject currentFeature) {
        this.currentFeature = currentFeature;
    }

    public void setEntityManager(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public EntityManager getEntityManager() {
        return this.entityManager;
    }

    public Layer getLayer() {
        return layer;
    }

    @Override
    public AuditMessageObject getAuditMessageObject() {
        return this.auditMessageObject;
    }
    //</editor-fold>

    @Before(stages = LifecycleStage.EventHandling)
    public void initAudit() {
        auditMessageObject = new AuditMessageObject();
    }

    @DefaultHandler
    public Resolution editbulk() throws JSONException {
        JSONObject response = editbulkResponse();
        return new StreamingResolution("application/json", new StringReader(response.toString(4)));
    }

    public JSONObject editbulkResponse() throws JSONException {
        featureSource = null;

        if (entityManager == null) {
            entityManager = Stripersist.getEntityManager();
        }

        JSONObject response = new JSONObject();

        try {
            saveFeatures();
            response.put("success", true);
            response.put(FID, getFeatureIds());
        } catch (Exception e) {
            String errorMessage = getErrorMessage(e);

            log.error("Exception editing features", e);
            log.error("Returned error message editing feature: " + errorMessage);

            response.put("success", false);
            response.put("error", errorMessage);
        } finally {
            if (featureSource != null) {
                featureSource.getDataStore().dispose();
            }
        }

        this.auditMessageObject.addMessage(response);

        return response;
    }

    private JSONArray getFeatureIds() {
        JSONArray fids = new JSONArray();
        for (JSONObject feature : getFeaturesArray()) {
            fids.put(feature.getString(FID));
        }
        return fids;
    }

    private String getErrorMessage(Exception e) {
        String errorMessage = e.toString();
        if (e.getCause() != null) {
            errorMessage += "; cause: " + e.getCause().toString();
        }
        return errorMessage;
    }

    private void saveFeatures() throws IOException, ParseException, EditBulkFeatureActionBeanException {
        Transaction transaction = new DefaultTransaction("edit");

        createStore();

        try {
            store.setTransaction(transaction);

            for (JSONObject feature : getFeaturesArray()) {
                saveFeatureToStore(feature);
            }

            transaction.commit();
        } catch (FeatureWriteNotAuthorizedException | IOException | ParseException | MissingFeatureIdException e) {
            transaction.rollback();
            throw e;
        } finally {
            transaction.close();
        }
    }

    JSONObject[] getFeaturesArray() {
        JSONArray jsonFeatures = new JSONArray(this.features);
        JSONObject[] list = new JSONObject[jsonFeatures.length()];
        for (int i = 0; i < jsonFeatures.length(); i++) {
            list[i] = jsonFeatures.getJSONObject(i);
        }
        return list;
    }

    private void createStore() {
        if (appLayer == null) {
            throw new AppLayerNotFoundException();
        }
        if (!Authorizations.isAppLayerWriteAuthorized(application, appLayer, context.getRequest(), entityManager)) {
            throw new AppLayerWriteNotAuthorizedException();
        }

        layer = appLayer.getService().getLayer(appLayer.getLayerName(), entityManager);

        if (layer == null) {
            throw new LayerNotFoundException();
        }

        if (layer.getFeatureType() == null) {
            throw new NoFunctionTypeException();
        }

        try {
            featureSource = layer.getFeatureType().openGeoToolsFeatureSource();
        } catch (Exception e) {
            throw new CannotGetFeatureSourceException(e);
        }

        if (!(featureSource instanceof SimpleFeatureStore)) {
            throw new FeatureSourceDoesNotSupportEditingException();
        }

        store = (SimpleFeatureStore) featureSource;
    }

    private void saveFeatureToStore(JSONObject feature) throws IOException, ParseException, EditBulkFeatureActionBeanException {
        if (!this.isFeatureWriteAuthorized(appLayer, feature, context.getRequest())) {
            throw new FeatureWriteNotAuthorizedException();
        }

        String fid = feature.optString(FID, null);

        if (fid == null) {
            throw new MissingFeatureIdException();
        }

        Pair<String[], Object[]> attributesAndValues = buildAttributesAndValues(feature);

        String[] attributes = attributesAndValues.getKey();
        Object[] values = attributesAndValues.getValue();

        log.debug(String.format("Modifying features source #%d fid=%s, attributes=%s, values=%s",
                layer.getFeatureType().getId(),
                fid,
                Arrays.toString(attributes),
                Arrays.toString(values)));

        FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
        Filter filter = ff.id(new FeatureIdImpl(fid));

        store.modifyFeatures(attributes, values, filter);
    }

    private Pair<String[], Object[]> buildAttributesAndValues(JSONObject feature) throws ParseException {
        List<String> attributes = new ArrayList<>();
        List<Object> values = new ArrayList<>();
        for (Iterator<String> it = feature.keys(); it.hasNext(); ) {
            String attribute = it.next();
            if (!FID.equals(attribute)) {

                SimpleFeatureType schema = store.getSchema();
                AttributeDescriptor ad = schema.getDescriptor(attribute);

                if (ad != null) {
                    if (!isAttributeUserEditingDisabled(attribute)) {
                        attributes.add(attribute);

                        if (ad.getType() instanceof GeometryType) {
                            String wkt = feature.getString(ad.getLocalName());
                            Geometry g = null;
                            if (wkt != null) {
                                g = new WKTReader().read(wkt);
                            }
                            values.add(g);
                        } else if (ad.getType().getBinding().getCanonicalName().equals("byte[]")) {
                            Object ba = feature.get(attribute);
                            values.add(ba);
                        } else {
                            String v = feature.optString(attribute);
                            values.add(StringUtils.defaultIfBlank(v, null));
                        }
                    } else {
                        log.info(String.format("Attribute \"%s\" not user editable; ignoring", attribute));
                    }
                } else {
                    log.warn(String.format("Attribute \"%s\" not in features type; ignoring", attribute));
                }
            }
        }

        String[] arrAttributes = attributes.toArray(new String[]{});
        Object[] arrValues = values.toArray(new Object[]{});
        return new ImmutablePair<>(arrAttributes, arrValues);
    }

    /**
     * Check that if {@code disableUserEdit} flag is set on the attribute.
     *
     * @param attrName attribute to check
     * @return {@code true} when the configured attribute is flagged as
     * "readOnly"
     */
    private boolean isAttributeUserEditingDisabled(String attrName) {
        ConfiguredAttribute attribute = this.getAppLayer().getAttribute(this.getLayer().getFeatureType(), attrName);
        return (attribute != null) && attribute.isDisableUserEdit();
    }

    private boolean isFeatureWriteAuthorized(ApplicationLayer appLayer, JSONObject jsonFeature, HttpServletRequest request) {
        if (appLayer.getDetails() != null && appLayer.getDetails().containsKey("editfeature.usernameAttribute")) {
            String attr = appLayer.getDetails().get("editfeature.usernameAttribute").getValue();

            String featureUsername = jsonFeature.optString(attr);
            return featureUsername != null && featureUsername.equals(request.getRemoteUser());
        }
        return true;
    }

    //<editor-fold defaultstate="collapsed" desc="exceptions">
    private class EditBulkFeatureActionBeanException extends RuntimeException {
        public EditBulkFeatureActionBeanException(String s) {
            super(s);
        }
    }

    private class AppLayerNotFoundException extends EditBulkFeatureActionBeanException {
        public AppLayerNotFoundException() {
            super(getBundle().getString("viewer.editfeatureactionbean.1"));
        }
    }

    private class AppLayerWriteNotAuthorizedException extends EditBulkFeatureActionBeanException {
        public AppLayerWriteNotAuthorizedException() {
            super(getBundle().getString("viewer.editfeatureactionbean.2"));
        }
    }

    private class LayerNotFoundException extends EditBulkFeatureActionBeanException {
        public LayerNotFoundException() {
            super(getBundle().getString("viewer.editfeatureactionbean.3"));
        }
    }

    private class NoFunctionTypeException extends EditBulkFeatureActionBeanException {
        public NoFunctionTypeException() {
            super(getBundle().getString("viewer.editfeatureactionbean.4"));
        }
    }

    private class FeatureSourceDoesNotSupportEditingException extends EditBulkFeatureActionBeanException {
        public FeatureSourceDoesNotSupportEditingException() {
            super(getBundle().getString("viewer.editfeatureactionbean.5"));
        }
    }

    private class FeatureWriteNotAuthorizedException extends EditBulkFeatureActionBeanException {
        public FeatureWriteNotAuthorizedException() {
            super(getBundle().getString("viewer.editfeatureactionbean.6"));
        }
    }

    private class MissingFeatureIdException extends EditBulkFeatureActionBeanException {
        public MissingFeatureIdException() {
            super(getBundle().getString("viewer.editbulkfeatureactionbean.1"));
        }
    }

    private class CannotGetFeatureSourceException extends RuntimeException {
        public CannotGetFeatureSourceException(Exception e) {
            super(e);
        }
    }
    //</editor-fold>
}
