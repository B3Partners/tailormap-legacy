/*
 * Copyright (C) 2018 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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
