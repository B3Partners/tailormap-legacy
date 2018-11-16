package nl.b3p.i18n;

import java.util.Locale;
import java.util.ResourceBundle;

/**
 * Use this class for Flamingo web applications instead of calling
 * ResourceBundle.getBundle() directly, because this class will take into
 * account the language of the base properties file and not use the system
 * default language when that language is requested.
 *
 * When no locale is known, uses English instead of system default locale, which
 * could result in Dutch messages from the base properties on a system default
 * locale set to a language for which we have no properties file.
 *
 * @author matthijsln
 */
public class ResourceBundleProvider {

    private static final String VIEWER_RESOURCES_FILE = "ViewerResources";

    private static final String BASE_LANGUAGE = "nl";

    public static ResourceBundle getResourceBundle() {
        return getResourceBundle(null);
    }

    public static ResourceBundle getResourceBundle(Locale locale) {
        // When no Locale known from request or application setting, return
        // English indepent of system default locale
        if(locale == null) {
            locale = Locale.ENGLISH;
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
