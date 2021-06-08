package nl.tailormap.viewer.stripes;

import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import nl.tailormap.i18n.ResourceBundleProvider;
import nl.tailormap.i18n.ResourceBundleToJsProvider;
import org.apache.commons.lang.LocaleUtils;

import java.io.StringReader;
import java.util.Locale;
import java.util.ResourceBundle;

@UrlBinding("/action/i18n/{name}")
@StrictBinding
public class I18nActionBean implements ActionBean {

    private ActionBeanContext context;

    @Validate
    private String language;

    /**
     * Returns the i18next JS translation file based on ViewerResources bundle
     * @return Return resolution with resources
     */
    public Resolution i18nextJs() {
        Locale locale = LocaleUtils.toLocale(language);
        ResourceBundle bundle = ResourceBundleProvider.getResourceBundle(locale);
        context.getResponse().addDateHeader("Expires", System.currentTimeMillis() + (1000 * 60 * 60 * 24));
        return new StreamingResolution("application/javascript", new StringReader(ResourceBundleToJsProvider.toJs(bundle)));
    }

    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}
