package nl.b3p.viewer.admin.stripes;

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import nl.b3p.i18n.ResourceBundleToJsProvider;
import java.io.StringReader;
import java.util.ResourceBundle;

@UrlBinding("/action/i18n/{name}")
@StrictBinding
public class I18nActionBean implements ActionBean {

    private ResourceBundle bundle;

    private ActionBeanContext context;

    @After(stages = LifecycleStage.ActionBeanResolution)
    protected void initBundle() {
        setBundle(ResourceBundle.getBundle("ViewerResources", context.getRequest().getLocale()));
    }

    /**
     * Returns the i18next JS translation file based on ViewerResources bundle
     * @return
     */
    public Resolution i18nextJs() {
        context.getResponse().addDateHeader("Expires", System.currentTimeMillis() + (1000 * 60 * 60 * 24));
        return new StreamingResolution("application/js", new StringReader(ResourceBundleToJsProvider.toJs(getBundle())));
    }

    /**
     * @param bundle the bundle to set
     */
    public void setBundle(ResourceBundle bundle) {
        this.bundle = bundle;
    }

    /**
     * @return the bundle
     */
    public ResourceBundle getBundle() {
        if (bundle == null) {
            bundle = ResourceBundle.getBundle("ViewerResources");
        }
        return bundle;
    }

    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

}
