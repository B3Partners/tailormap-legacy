package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.audit.AuditMessageObject;
import nl.b3p.viewer.audit.Auditable;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.userlayer.UserLayerHandler;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

import javax.servlet.http.HttpServletResponse;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.Locale;

@UrlBinding("/action/userlayer")
@StrictBinding
public class UserLayerActionBean implements ActionBean, ValidationErrorHandler, Auditable {
    private static final Log LOG = LogFactory.getLog(UserLayerActionBean.class);
    private ActionBeanContext context;

    @Validate(required = true)
    private ApplicationLayer appLayer;

    @Validate(required = true)
    private Application application;

    @Validate(required = true, on = "add")
    private String query;

    @Validate(required = true, on="add")
    private String title;

    private AuditMessageObject auditMessageObject;
    private boolean unauthorized;

    // <editor-fold desc="Validation handlers" defaultstate="collapsed">
    @ValidationMethod(when = ValidationState.NO_ERRORS)
    public void validateUser(ValidationErrors errors) {
        Principal p = context.getRequest().getUserPrincipal();
        if (p == null) {
            errors.addGlobalError(new SimpleError("Geen gebruiker gevonden of niet aangemeld"));
        } else {
            this.auditMessageObject.setUsername(p.getName());
            this.auditMessageObject.setEvent(this.context.getEventName() + " userlayer");
        }
    }

    @Before(stages = LifecycleStage.EventHandling)
    public void checkLayerAndAuthorization() {
        if (application == null || appLayer == null
            // TODO add a new method "isLayerTODOAuthorized" to Authorizations
            // Layer layer = appLayer.getService().getLayer(appLayer.getLayerName(), Stripersist.getEntityManager());
            //  || !Authorizations.isLayerGeomWriteAuthorized(layer, context.getRequest(), Stripersist
            //  .getEntityManager())
        ) {
            unauthorized = true;
        }
    }

    @Before(stages = LifecycleStage.EventHandling)
    public void initializeAuditMessageObject() {
        this.auditMessageObject = new AuditMessageObject();
    }
    // </editor-fold>

    @Override
    public Resolution handleValidationErrors(ValidationErrors errors) {
        StringBuilder msg = new StringBuilder("Validatiefouten: ");

        JSONObject json = (new JSONObject()).put("success", Boolean.FALSE);

        if (errors.hasFieldErrors()) {
            errors.entrySet().stream().forEach((entry) -> {
                entry.getValue().stream().map((e) -> {
                    if (LOG.isTraceEnabled()) {
                        msg.append("veld: ").append(entry.getKey()).append(", waarde: ");
                        msg.append(e.getFieldValue()).append(", melding: ");
                    }
                    return e;
                }).forEach((e) -> {
                    msg.append(e.getMessage(Locale.ROOT)).append("; ");
                });
            });
        }
        if (errors.get(ValidationErrors.GLOBAL_ERROR) != null) {
            errors.get(ValidationErrors.GLOBAL_ERROR).stream().forEach((e) -> {
                msg.append(e.getMessage(Locale.ROOT));
            });
        }
        json.put("error", msg.toString());
        return new StreamingResolution("application/json") {
            @Override
            public void stream(HttpServletResponse response) throws Exception {
                IOUtils.copy(new StringReader(json.toString()), response.getOutputStream(), StandardCharsets.UTF_8);
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            }
        };
    }

    @DefaultHandler
    public Resolution add() {
        final JSONObject jsonObject = new JSONObject();
        if (unauthorized) {
            // TODO
            jsonObject.append("success", false);
        } else {
            final UserLayerHandler ulh = new UserLayerHandler(auditMessageObject, Stripersist.getEntityManager(),
                    application, appLayer, query, title);
            final JSONObject message = new JSONObject();

            jsonObject.append("appLayerId", ulh.getAppLayerId());
            jsonObject.append("layerName", ulh.getLayerName());
            jsonObject.append("success", ulh.add());

            message.append("appLayer", ulh.getApplicationLayer());
            jsonObject.append("message", message);

            this.auditMessageObject.addMessage(
                    "UserLayer " + ulh.getLayerName() + " aangemaakt met id " + ulh.getAppLayerId());
        }
        return new StreamingResolution("application/json") {
            @Override
            public void stream(HttpServletResponse response) throws Exception {
                IOUtils.copy(new StringReader(jsonObject.toString()), response.getOutputStream(),
                        StandardCharsets.UTF_8);
                if (!jsonObject.getBoolean("success")) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                }
            }
        };
    }

    public Resolution delete() {
        final JSONObject jsonObject = new JSONObject();
        if (unauthorized) {
            // TODO
            jsonObject.append("success", false);
        } else {
            final UserLayerHandler ulh = new UserLayerHandler(auditMessageObject, Stripersist.getEntityManager(),
                    application, appLayer, query, title);
            jsonObject.append("success", ulh.delete());

            this.auditMessageObject.addMessage(
                    "UserLayer " + ulh.getLayerName() + " met id " + ulh.getAppLayerId() + " verwijderd.");
        }
        return new StreamingResolution("application/json") {
            @Override
            public void stream(HttpServletResponse response) throws Exception {
                IOUtils.copy(new StringReader(jsonObject.toString()), response.getOutputStream(),
                        StandardCharsets.UTF_8);
                if (!jsonObject.getBoolean("success")) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                }
            }
        };
    }

    // <editor-fold desc="Getters and Setters" defaultstate="collapsed">

    /**
     * Accessor to get the auditing information that has been provided by the
     * implementing class.
     *
     * @return the audit information
     * @see AuditMessageObject
     */
    @Override
    public AuditMessageObject getAuditMessageObject() {
        return this.auditMessageObject;
    }

    @Override
    public ActionBeanContext getContext() {
        return this.context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public ApplicationLayer getAppLayer() {
        return this.appLayer;
    }

    public void setAppLayer(ApplicationLayer appLayer) {
        this.appLayer = appLayer;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }
    // </editor-fold>
}
