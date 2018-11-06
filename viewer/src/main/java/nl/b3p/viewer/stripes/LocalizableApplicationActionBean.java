package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.controller.LifecycleStage;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.util.ResourceBundleProvider;

/**
 * Abstract ActionBean which can be implemented by ActionBeans
 * based on Flamingo applications to set proper ResourceBundle
 * for configured application language
 */
abstract class LocalizableApplicationActionBean extends LocalizableActionBean implements ActionBean {

    @Override
    @After(stages = LifecycleStage.BindingAndValidation)
    public void initBundle() {
        if (getBundle() != null) {
            return;
        }
        setBundle(ResourceBundleProvider.getResourceBundle(getContext().getRequest().getLocale(), getApplication()));
    }

    public abstract Application getApplication();

}
