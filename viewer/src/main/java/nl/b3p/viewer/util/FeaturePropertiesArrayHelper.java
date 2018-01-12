package nl.b3p.viewer.util;

import org.json.JSONArray;
import org.json.JSONObject;

public class FeaturePropertiesArrayHelper {

    public static boolean containsKey(JSONArray j, String key) {
        int len = j.length();
        for(int i = 0; i < len; i++) {
            JSONObject o = j.optJSONObject(i);
            if(o != null && o.has(key)) {
                return true;
            }
        }
        return false;
    }

    public static Object getByKey(JSONArray j, String key) {
        int len = j.length();
        for(int i = 0; i < len; i++) {
            JSONObject o = j.optJSONObject(i);
            if(o != null && o.has(key)) {
                return o.get(key);
            }
        }
        return null;
    }

    public static JSONArray removeKey(JSONArray j, String key) {
        int len = j.length();
        int idx = -1;
        for(int i = (len - 1); i >= 0; i--) {
            JSONObject o = j.optJSONObject(i);
            if(o != null && o.has(key)) {
                idx = i;
                break;
            }
        }
        if(idx != -1) {
            j.remove(idx);
        }
        return j;
    }

}
