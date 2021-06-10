package nl.tailormap.viewer.stripes;

import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.controller.LifecycleStage;
import nl.tailormap.i18n.LocalizableActionBean;
import nl.tailormap.i18n.ResourceBundleProvider;
import nl.tailormap.viewer.config.app.Application;
import org.apache.commons.lang.LocaleUtils;

import java.util.Locale;

/**
 * Abstract ActionBean which can be implemented by ActionBeans
 * based on Flamingo applications to set proper ResourceBundle
 * for configured application language
 */
abstract class LocalizableApplicationActionBean extends LocalizableActionBean implements ActionBean {

    @Override
    @After(stages = LifecycleStage.BindingAndValidation)
    public void initBundle() {
        Locale locale = determineLocaleForBundle(getContext(), getApplication());
        setBundle(ResourceBundleProvider.getResourceBundle(locale));
    }

    public static Locale determineLocaleForBundle(ActionBeanContext context, Application application) {
        Locale locale = context.getRequest().getLocale();
        if (application != null) {
            try {
                locale = LocaleUtils.toLocale(application.getLang());
            } catch(Exception e) {
                // Invalid app setting, use request locale
            }
        }
        return locale;
    }

    public abstract Application getApplication();
}
