package nl.b3p.i18n;

import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.controller.LifecycleStage;

import java.util.ResourceBundle;

public abstract class LocalizableActionBean implements ActionBean {

    private ResourceBundle bundle;

    @After(stages = LifecycleStage.ActionBeanResolution)
    public void initBundle() {
        // Should be called before getBundle() because of lifecycle annotation,
        // initialize with request locale
        setBundle(ResourceBundleProvider.getResourceBundle(getContext().getRequest().getLocale()));
    }

    /**
     * @return the bundle
     */
    public ResourceBundle getBundle() {
        // When the initBundle() is not yet called at least provide English
        // messages
        if (bundle == null) {
            bundle = ResourceBundleProvider.getResourceBundle();
        }
        return bundle;
    }

    /**
     * @param bundle the bundle to set
     */
    public void setBundle(ResourceBundle bundle) {
        this.bundle = bundle;
    }

}
