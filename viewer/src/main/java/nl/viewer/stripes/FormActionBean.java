package nl.viewer.stripes;

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.viewer.config.app.Application;
import nl.viewer.config.forms.Form;
import nl.viewer.config.security.Authorizations;
import nl.web.stripes.ErrorMessageResolution;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import java.io.StringReader;
import java.util.List;

@UrlBinding("/action/form")
@StrictBinding
public class FormActionBean implements ActionBean {

    private static final Log log = LogFactory.getLog(FormActionBean.class);
    private ActionBeanContext context;

    @Validate
    private Application application;
    private boolean unauthorized;

    @Before(stages= LifecycleStage.EventHandling)
    public void checkAuthorization() {
        EntityManager em = Stripersist.getEntityManager();
        if(application == null|| !Authorizations.isApplicationReadAuthorized(application, context.getRequest(), em)) {
            unauthorized = true;
        }
    }

    @DefaultHandler
    public Resolution configs(){
        if(unauthorized){
            return new ErrorMessageResolution("User unauthorized to read application");
        }
        EntityManager em = Stripersist.getEntityManager();
        List<Form> forms = em.createQuery("FROM Form", Form.class).getResultList();
        JSONObject fts = new JSONObject();
        HttpServletRequest request = context.getRequest();
        for (Form form : forms) {
            if(form.getJson() != null && !form.getJson().isEmpty()){
                if (Authorizations.isFormAuthorized(form, request, em)) {
                    fts.put(form.getFeatureTypeName(), new JSONObject(form.getJson()));
                }
            }
        }

        JSONObject config = new JSONObject();
        config.put("config", fts);
        return new StreamingResolution("application/json", new StringReader(config.toString()));
    }

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
}
