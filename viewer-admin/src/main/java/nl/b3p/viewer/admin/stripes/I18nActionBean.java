package nl.b3p.viewer.admin.stripes;

import net.sourceforge.stripes.action.*;
import nl.b3p.i18n.ResourceBundleToJsProvider;
import java.io.StringReader;
import nl.b3p.i18n.LocalizableActionBean;

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
     * Returns the i18next JS translation file based on ViewerResources bundle
     * @return
     */
    public Resolution i18nextJs() {
        context.getResponse().addDateHeader("Expires", System.currentTimeMillis() + (1000 * 60 * 60 * 24));
        return new StreamingResolution("application/javascript", new StringReader(ResourceBundleToJsProvider.toJs(getBundle())));
    }
}
