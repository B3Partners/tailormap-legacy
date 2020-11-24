package nl.b3p.viewer.util;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.ColumnListHandler;
import org.apache.commons.dbutils.handlers.KeyedHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Class to export object data for safetymaps-viewer, meant for both online use
 * within safetymaps-server and for exporting to filesystem for offline viewers.
 *
 * @author Matthijs Laan
 */
public class ViewerDataExporter {

    // TODO LogFactory use, so errors get logged both online and when exporting

    private Connection c;

    public ViewerDataExporter(Connection c) {
        this.c = c;
    }

    /**
     * Get a tag with the latest date an object was modified and total object
     * count, to use as caching ETag.
     */
    public String getObjectsETag() throws Exception {
        String key = new QueryRunner().query(c, "select max(datum_actualisatie) || '_' || count(*) from viewer.viewer_object", new ScalarHandler<String>());
        key += "_v" + new QueryRunner().query(c, "select max(value) from viewer.schema_version", new ScalarHandler<>());
        if(key == null) {
            return "empty_db";
        } else {
            return key;
        }
    }

    /**
     * @return All the objects that should be visible in the viewer with all object
     * properties needed by the viewer as a JSON array, without properties that are
     * null or empty strings.
     */
    public JSONArray getViewerObjectMapOverview() throws Exception {
        List<Map<String,Object>> rows = new QueryRunner().query(c, "select * from viewer.viewer_object_map", new MapListHandler());

        // Not efficient in PostgreSQL: selectieadressen and verdiepingen

        Set<Integer> verdiepingenIds = new HashSet(new QueryRunner().query(c, "select hoofdobject_id from viewer.viewer_object where hoofdobject_id is not null", new ColumnListHandler<>()));

        Map selectieadressen = new QueryRunner().query(c, "select * from viewer.viewer_object_selectieadressen", new KeyedHandler<>("id"));

        JSONArray a = new JSONArray();
        for(Map<String, Object> row: rows) {
            Integer id = (Integer)row.get("id");
            String name = (String)row.get("formele_naam");
            try {
                JSONObject o = rowToJson(row, true, true);
                if(verdiepingenIds.contains(id)) {
                    o.put("heeft_verdiepingen", true);
                }
                Map sa = (Map)selectieadressen.get(id);
                if(sa != null) {
                    o.put("selectieadressen", new JSONArray(sa.get("selectieadressen").toString()));
                }
                a.put(o);
            } catch(Exception e) {
                throw new Exception(String.format("Error processing object id=%d, name \"%s\"", id, name), e);
            }
        }
        return a;
    }

    /**
     * @return All details for the viewer of an objector null
     * if the object is not found or visible in the viewer
     */
    public JSONObject getViewerObjectDetails(long id) throws Exception {
        List<Map<String,Object>> rows = new QueryRunner().query(c, "select * from viewer.viewer_object_details where id = ?", new MapListHandler(), id);

        if(rows.isEmpty()) {
            return null;
        }

        try {
            return rowToJson(rows.get(0), true, true);
        } catch(Exception e) {
            throw new Exception(String.format("Error getting object details for id " + id), e);
        }
    }

    /**
     * Get all ids of objects that should be visible in the viewer.
     */
    public List<Integer> getViewerObjectIds() throws Exception {
        return new QueryRunner().query(c, "select id from viewer.viewer_object_map", new ColumnListHandler<Integer>());
    }

    /**
     * @return All details for viewer objects using a single query
     */
    public List<JSONObject> getAllViewerObjectDetails() throws Exception {
        List<Map<String,Object>> rows = new QueryRunner().query(c, "select * from viewer.viewer_object_details", new MapListHandler());

        List<JSONObject> result = new ArrayList();

        for(Map<String,Object> row: rows) {
            Object id = row.get("id");
            Object name = row.get("name");
            try {
                result.add(rowToJson(row, true, true));
            } catch(Exception e) {
                throw new Exception(String.format("Error converting object details to JSON for id " + id + ", name " + name), e);
            }
        }
        return result;
    }

    /**
     * Get styling information
     */
    public JSONObject getStyles() throws Exception {
        JSONObject o = new JSONObject();

        JSONObject compartments = new JSONObject();
        o.put("compartments", compartments);
        List<Map<String,Object>> rows = new QueryRunner().query(c, "select * from wfs.type_compartment", new MapListHandler());
        for(Map<String,Object> row: rows) {
            String code = (String)row.get("code");
            JSONObject compartment = rowToJson(row, false, false);
            compartments.put(code, compartment);
        }

        JSONObject lines = new JSONObject();
        o.put("custom_lines", lines);
        rows = new QueryRunner().query(c, "select * from wfs.type_custom_line", new MapListHandler());
        for(Map<String,Object> row: rows) {
            String code = (String)row.get("code");
            JSONObject line = rowToJson(row, false, false);
            lines.put(code, line);
        }

        JSONObject polygons = new JSONObject();
        o.put("custom_polygons", polygons);
        rows = new QueryRunner().query(c, "select * from wfs.type_custom_polygon", new MapListHandler());
        for(Map<String,Object> row: rows) {
            String code = (String)row.get("code");
            JSONObject polygon = rowToJson(row, false, false);
            polygons.put(code, polygon);
        }

        return o;
    }

    public static JSONObject rowToJson(Map<String, Object> row, boolean skipNull, boolean skipEmptyString) throws Exception {
        JSONObject o = new JSONObject();
        for(Map.Entry<String,Object> e: row.entrySet()) {
            /* do not put null or empty string properties in result */

            if(e.getValue() == null) {
                if(!skipNull) {
                    o.put(e.getKey(), (Object)null);
                }
                continue;
            }

            if("".equals(e.getValue())) {
                if(!skipEmptyString) {
                    o.put(e.getKey(), "");
                }
                continue;
            }

            /* JSON objects are returned as org.postgresql.util.PGobject,
             * compare classname by string ignoring package
             */
            if(e.getValue().getClass().getName().endsWith("PGobject")) {
                try {
                    String json = e.getValue().toString();
                    Object pgj;
                    if(json.startsWith("[")) {
                        pgj = new JSONArray(json);
                    } else if(json.startsWith("{")) {
                        pgj = new JSONObject(json);
                    } else {
                        // Just the toString()
                        pgj = json;
                    }
                    o.put(e.getKey(), pgj);
                } catch(JSONException ex) {
                    throw new Exception("Error parsing PostgreSQL JSON for property " + e.getKey() + ": " + ex.getMessage() + ", JSON=" + e.getValue());
                }
            } else {
                o.put(e.getKey(), e.getValue());
            }
        }
        return o;
    }
}