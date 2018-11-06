package nl.b3p.i18n;

import org.apache.commons.lang.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.StringReader;
import java.util.Iterator;
import java.util.ResourceBundle;

public class ResourceBundleToJsProvider {

    public static String toJs(ResourceBundle bundle) {
        final JSONObject i18nBundle = new JSONObject();
        for(Iterator<String> iter = bundle.keySet().iterator(); iter.hasNext();) {
            final String key = iter.next();
            if (!key.startsWith("js.")) {
                continue;
            }
            final String jsKey = key.replace("js.", "").replace(".", "_");
            final String val = bundle.getString(key);
            i18nBundle.put(jsKey, val);
        }
        final StringBuilder sb = new StringBuilder();
        String lang = bundle.getLocale().getLanguage();
        if (StringUtils.isEmpty(lang)) {
            lang = "nl";
        }
        sb.append(String.format("i18next.init({ lng: '%1$s', fallbackLng: '%1$s', resources: { %1$s: { translation: ", lang));
        sb.append(i18nBundle.toString());
        sb.append(" } } });");
        return sb.toString();
    }

}
