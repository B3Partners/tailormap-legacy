package nl.tailormap.viewer.admin.stripes;

import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import nl.tailormap.i18n.LocalizableActionBean;
import nl.tailormap.i18n.ResourceBundleToJsProvider;

import java.io.StringReader;

@UrlBinding("/action/i18n")
@StrictBinding
public class I18nActionBean extends LocalizableActionBean {

    private ActionBeanContext context;

    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    /**
     * Find the i18next JS translation file based on ViewerResources bundle.
     * @return the i18next JS translation file based on ViewerResources bundle
     */
    public Resolution i18nextJs() {
        context.getResponse().addDateHeader("Expires", System.currentTimeMillis() + (1000 * 60 * 60 * 24));
        return new StreamingResolution("application/javascript", new StringReader(ResourceBundleToJsProvider.toJs(getBundle())));
    }
}
