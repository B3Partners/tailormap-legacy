package nl.b3p.viewer.util;

import nl.b3p.viewer.config.app.Application;
import org.apache.commons.lang.LocaleUtils;

import java.util.Locale;
import java.util.ResourceBundle;

public class ResourceBundleProvider {

    private static final String VIEWER_RESOURCES_FILE = "ViewerResources";

    public static ResourceBundle getResourceBundle() {
        return ResourceBundle.getBundle(VIEWER_RESOURCES_FILE);
    }

    public static ResourceBundle getResourceBundle(Locale locale) {
        return getResourceBundle(locale, null);
    }

    public static ResourceBundle getResourceBundle(Locale locale, Application application) {
        if (application != null) {
            locale = LocaleUtils.toLocale(application.getLang());
        }
        return ResourceBundle.getBundle(VIEWER_RESOURCES_FILE, locale);
    }

}
