package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.controller.LifecycleStage;
import nl.b3p.viewer.util.ResourceBundleProvider;

import java.util.ResourceBundle;

public abstract class LocalizableActionBean implements ActionBean {

    private ResourceBundle bundle;

    @After(stages = LifecycleStage.BindingAndValidation)
    public void initBundle() {
        if (getBundle() != null) {
            return;
        }
        setBundle(ResourceBundleProvider.getResourceBundle(getContext().getRequest().getLocale()));
    }

    /**
     * @return the bundle
     */
    public ResourceBundle getBundle() {
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
