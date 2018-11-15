package nl.b3p.viewer.util;

import nl.b3p.viewer.config.app.Application;
import org.apache.commons.lang.LocaleUtils;

import java.util.Locale;
import java.util.ResourceBundle;

public class ResourceBundleProvider {

    private static final String VIEWER_RESOURCES_FILE = "ViewerResources";

    private static final String BASE_LANGUAGE = "nl";

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

        // The language of the base properties file is "nl", but getBundle() 
        // considers the property file for the system default locale before
        // returning the base name properties file. We want the base
        // properties when "nl" language is requested. Specifying Locale.ROOT
        // makes getBundle() only consider the base name.
        if(BASE_LANGUAGE.equals(locale.getLanguage())) {
            return ResourceBundle.getBundle(VIEWER_RESOURCES_FILE, Locale.ROOT);
        } else {
            return ResourceBundle.getBundle(VIEWER_RESOURCES_FILE, locale);
        }
    }
}
