package nl.tailormap.viewer.helpers.services;

import nl.tailormap.viewer.config.ClobElement;
import nl.tailormap.viewer.config.services.ArcGISFeatureSource;
import nl.tailormap.viewer.config.services.ArcGISService;
import nl.tailormap.viewer.config.services.AttributeDescriptor;
import nl.tailormap.viewer.config.services.BoundingBox;
import nl.tailormap.viewer.config.services.CoordinateReferenceSystem;
import nl.tailormap.viewer.config.services.GeoService;
import nl.tailormap.viewer.config.services.Layer;
import nl.tailormap.viewer.config.services.SimpleFeatureType;
import nl.tailormap.viewer.config.services.UpdateResult;
import nl.tailormap.viewer.helpers.featuresources.FeatureSourceFactoryHelper;
import nl.tailormap.web.WaitPageStatus;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.mutable.MutableBoolean;
import org.apache.commons.lang3.tuple.MutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.http.HTTPClient;
import org.geotools.http.SimpleHttpClient;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import static nl.tailormap.viewer.config.RemoveEmptyMapValuesUtil.removeEmptyMapValues;
import static nl.tailormap.viewer.config.services.ArcGISService.DETAIL_ASSUME_VERSION;
import static nl.tailormap.viewer.config.services.ArcGISService.DETAIL_CAPABILITIES;
import static nl.tailormap.viewer.config.services.ArcGISService.DETAIL_CURRENT_VERSION;
import static nl.tailormap.viewer.config.services.ArcGISService.DETAIL_DEFAULT_VISIBILITY;
import static nl.tailormap.viewer.config.services.ArcGISService.DETAIL_DEFINITION_EXPRESSION;
import static nl.tailormap.viewer.config.services.ArcGISService.DETAIL_DESCRIPTION;
import static nl.tailormap.viewer.config.services.ArcGISService.DETAIL_GEOMETRY_TYPE;
import static nl.tailormap.viewer.config.services.ArcGISService.DETAIL_TYPE;
import static nl.tailormap.viewer.config.services.ArcGISService.NON_VIRTUAL_LAYER_TYPES;
import static nl.tailormap.viewer.config.services.ArcGISService.PARAM_ASSUME_VERSION;
import static nl.tailormap.viewer.config.services.ArcGISService.TOPLAYER_ID;
import static nl.tailormap.viewer.config.services.GeoService.PARAM_PASSWORD;
import static nl.tailormap.viewer.config.services.GeoService.PARAM_USERNAME;

public class ArcGISServiceHelper implements GeoServiceHelper {
    private static final Log log = LogFactory.getLog(ArcGISServiceHelper.class);


    public static Set<String> additionalUpdatableDetails = new HashSet<String>(Arrays.asList(new String[] {
            DETAIL_TYPE,
            DETAIL_DESCRIPTION,
            DETAIL_GEOMETRY_TYPE,
            DETAIL_CAPABILITIES,
            DETAIL_DEFAULT_VISIBILITY,
            DETAIL_DEFINITION_EXPRESSION,
            DETAIL_CURRENT_VERSION
    }));

    @Override
    public GeoService loadServiceFromURL(String url, Map params, WaitPageStatus status, EntityManager em) throws Exception {
        return ArcGISServiceHelper.loadFromUrl(url, params, status, em);
    }

    @Override
    public UpdateResult updateService(EntityManager em, GeoService service) {
        return ArcGISServiceHelper.update(em, (ArcGISService) service);
    }


    //<editor-fold defaultstate="collapsed" desc="Loading service metadata from ArcGIS">
    public static ArcGISService loadFromUrl(String url, Map params, WaitPageStatus status, EntityManager em) throws Exception {
        try {
            status.setCurrentAction("Ophalen informatie...");

            if(!url.endsWith("/MapServer")) {
                throw new IllegalArgumentException("URL moet eindigen in \"/MapServer\"");
            }
            if(url.indexOf("/rest/services") == -1) {
                throw new IllegalArgumentException("URL moet \"/rest/\" bevatten");
            }

            HTTPClient client = new SimpleHttpClient();
            client.setUser((String)params.get(PARAM_USERNAME));
            client.setPassword((String)params.get(PARAM_PASSWORD));

            ArcGISService s = new ArcGISService();
            s.setUrl(url);
            ArcGISServiceHelper.loadServiceInfo(client, (String)params.get(PARAM_ASSUME_VERSION), s);

            if(Boolean.TRUE.equals(params.get(GeoService.PARAM_ONLINE_CHECK_ONLY))) {
                return null;
            }

            // Get name from URL instead of MapServer/:documentInfo.Title
            // Will not change on update
            int i = url.lastIndexOf("/MapServer");
            String temp = url.substring(0,i);
            i = temp.lastIndexOf("/");
            String name = temp.substring(i+1);

            s.setName(name);
            ArcGISServiceHelper.load(client, status, em, s);

            return s;
        } finally {
            status.setProgress(90);
            status.setCurrentAction("Service ingeladen");
        }
    }


    private static void loadServiceInfo(HTTPClient client, String assumeVersion, ArcGISService s) throws Exception {

        if("9.x".equals(assumeVersion)) {
            s.currentVersion = "9.x";
            s.currentVersionMajor = 9;
            s.getDetails().put(DETAIL_ASSUME_VERSION, new ClobElement("9.x"));
        } else if("10.x".equals(assumeVersion)) {
            s.currentVersion = "10.x";
            s.currentVersionMajor = 10;
            s.getDetails().put(DETAIL_ASSUME_VERSION, new ClobElement("10.x"));
        } else {
            // currentVersion not included in MapServer/ JSON in 9.3.1, get it
            // from the root services JSON
            int i = s.getUrl().indexOf("/rest/services");
            String servicesUrl = s.getUrl().substring(0, i) + "/rest/services";
            s.serviceInfo = ArcGISServiceHelper.issueRequest(servicesUrl + "?f=json", client);
            s.currentVersion = s.serviceInfo.get("currentVersion").toString();
            s.currentVersionMajor = Integer.parseInt(s.currentVersion.split("\\.")[0]);
        }

        if(s.currentVersionMajor >= 10) {
            // In version 10, get full layers info immediately
            // The MapServer/ JSON is not very interesing by itself
            s.serviceInfo = issueRequest(s.getUrl() + "/layers?f=json", client);
        } else {
            // In 9.x, MapServer/layers is not supported
            s.serviceInfo = issueRequest(s.getUrl() + "?f=json", client);
        }

        s.getDetails().put(DETAIL_CURRENT_VERSION, new ClobElement(s.currentVersion));
    }

    private static void load(HTTPClient client, WaitPageStatus status, EntityManager em, ArcGISService s) throws Exception {
        int layerCount = s.serviceInfo.getJSONArray("layers").length();

        status.setProgress((int)Math.round(100.0/(layerCount+1)));

        status.setCurrentAction("Inladen layers...");

        /* Automatically create featuresource */
        ArcGISFeatureSource fs = new ArcGISFeatureSource();
        fs.setLinkedService(s);
        fs.setUrl(s.getUrl());
        fs.setUsername(client.getUser());
        fs.setPassword(client.getPassword());

        Layer top = new Layer();

        top.setVirtual(true);       // set to false later if any defaultVisible children
        top.setName(TOPLAYER_ID);   // name needed for possible non-virtual layer
        top.setTitle(s.getName());
        top.setService(s);
        s.setTopLayer(top);

        s.layersById = new TreeMap();
        s.childrenByLayerId = new HashMap();

        s.layersById.put(top.getName(), top);

        if(s.currentVersionMajor >= 10) {
            // info is the MapServer/layers response, all layers JSON info
            // immediately available
            JSONArray layers = s.serviceInfo.getJSONArray("layers");
            for(int i = 0; i < layers.length(); i++) {
                JSONObject layer = layers.getJSONObject(i);

                Layer l = ArcGISServiceHelper.parseArcGISLayer(layer, s, fs, s.childrenByLayerId);
                s.layersById.put(l.getName(), l);
            }
        } else {
            // In 9.x, request needed for each layer
            JSONArray layers = s.serviceInfo.getJSONArray("layers");
            for(int i = 0; i < layers.length(); i++) {
                JSONObject layer = layers.getJSONObject(i);
                String id = layer.getString("id");
                status.setCurrentAction("Inladen laag \"" + layer.optString("name", id) + "\"");
                layer = issueRequest(s.getUrl() + "/" + id + "?f=json", client);

                Layer l = parseArcGISLayer(layer, s, fs, s.childrenByLayerId);
                s.layersById.put(l.getName(), l);
                status.setProgress((int)Math.round( 100.0/(layerCount+1) * i+2 ));
            }
        }

        setLayerTree(s.getTopLayer(), s.layersById, s.childrenByLayerId, em);
        LayerHelper.setAllChildrenDetail(s.getTopLayer(), em);

        // FeatureSource is navigable via Layer.featureType CascadeType.PERSIST relation
        if(!fs.getFeatureTypes().isEmpty()) {
            fs.setName(s.getName());
        }
    }

    private static void setLayerTree(Layer topLayer, Map<String,Layer> layersById, Map<String, List<String>> childrenByLayerId, EntityManager em) {
        topLayer.getChildren().clear();

        em.flush();

        /* fill children list and parent references */
        for(Layer l: layersById.values()) {
            List<String> childrenIds = childrenByLayerId.get(l.getName());
            if(childrenIds != null) {
                for(String childId: childrenIds) {
                    Layer child = layersById.get(childId);
                    if(child != null) {
                        l.getChildren().add(child);
                        child.setParent(l);
                    }
                }
            }
        }

        /* children of top layer is special because those have parentLayerId -1 */
        for(Layer l: layersById.values()) {
            if(l.getParent() == null && !TOPLAYER_ID.equals(l.getName())) {
                topLayer.getChildren().add(l);
                l.setParent(topLayer);
            }
        }
        Collections.sort(topLayer.getChildren(), new Comparator<Layer>() {
            @Override
            public int compare(Layer lhs, Layer rhs) {
                return lhs.getName().compareTo(rhs.getName());
            }
        });
    }

    private static Layer parseArcGISLayer(JSONObject agsl, ArcGISService service, ArcGISFeatureSource fs,
                                          Map<String,List<String>> childrenByLayerId) throws JSONException {
        Layer l = new Layer();
        // parent set later in 2nd pass
        l.setService(service);
        l.setName(agsl.get("id").toString());
        l.setTitle(agsl.getString("name"));

        JSONArray subLayerIds = agsl.optJSONArray("subLayers");
        if(subLayerIds != null) {
            List<String> childrenIds = new ArrayList();
            for(int i = 0; i < subLayerIds.length(); i++) {
                JSONObject subLayer = subLayerIds.getJSONObject(i);
                String subLayerId = subLayer.getInt("id") + "";
                childrenIds.add(subLayerId);
            }
            childrenByLayerId.put(l.getName(), childrenIds);
        }

        l.getDetails().put(DETAIL_TYPE, new ClobElement(agsl.getString("type")));
        l.getDetails().put(DETAIL_CURRENT_VERSION, new ClobElement(agsl.optString("currentVersion", service.currentVersion)));
        l.getDetails().put(DETAIL_DESCRIPTION, new ClobElement(StringUtils.defaultIfBlank(agsl.getString("description"),null)));
        l.getDetails().put(DETAIL_GEOMETRY_TYPE, new ClobElement(StringUtils.defaultIfBlank(agsl.optString("geometryType"),null)));
        l.getDetails().put(DETAIL_CAPABILITIES, new ClobElement(agsl.optString("capabilities")));
        l.getDetails().put(DETAIL_DEFAULT_VISIBILITY, new ClobElement(agsl.optBoolean("defaultVisibility",false) ? "true" : "false"));
        l.getDetails().put(DETAIL_DEFINITION_EXPRESSION, new ClobElement(StringUtils.defaultIfBlank(agsl.optString("definitionExpression"), null)));

        removeEmptyMapValues(l.getDetails());

        try {
            l.setMinScale(agsl.getDouble("minScale"));
            l.setMaxScale(agsl.getDouble("maxScale"));
        } catch(JSONException e) {
        }

        try {
            JSONObject extent = agsl.getJSONObject("extent");
            BoundingBox bbox = new BoundingBox();
            bbox.setMinx(extent.getDouble("xmin"));
            bbox.setMaxx(extent.getDouble("xmax"));
            bbox.setMiny(extent.getDouble("ymin"));
            bbox.setMaxy(extent.getDouble("ymax"));
            bbox.setCrs(new CoordinateReferenceSystem("EPSG:" + extent.getJSONObject("spatialReference").getInt("wkid")));
            l.getBoundingBoxes().put(bbox.getCrs(), bbox);
        } catch(JSONException e) {
        }

        // XXX implemented in ArcGISDataStore
        // XXX sometimes geometry field not in field list but layer has geometryType
        boolean hasFields = false;
        if(!agsl.isNull("fields")){
            JSONArray fields = agsl.getJSONArray("fields");
            if(fields.length() > 0) {
                SimpleFeatureType sft = new SimpleFeatureType();
                sft.setFeatureSource(fs);
                sft.setTypeName(l.getName());
                sft.setDescription(l.getTitle());
                sft.setWriteable(false);

                for(int i = 0; i < fields.length(); i++) {
                    JSONObject field = fields.getJSONObject(i);

                    AttributeDescriptor att = new AttributeDescriptor();
                    sft.getAttributes().add(att);
                    att.setName(field.getString("name"));
                    att.setAlias(field.getString("alias"));

                    String et = field.getString("type");
                    String type = AttributeDescriptor.TYPE_STRING;
                    if("esriFieldTypeOID".equals(et)) {
                        type = AttributeDescriptor.TYPE_INTEGER;
                    } else if("esriFieldTypeGeometry".equals(et)) {
                        if(sft.getGeometryAttribute() == null) {
                            sft.setGeometryAttribute(att.getName());
                        }
                        String gtype = agsl.getString("geometryType");
                        if("esriGeometryPoint".equals(gtype)) {
                            type = AttributeDescriptor.TYPE_GEOMETRY_POINT;
                        } else if("esriGeometryMultipoint".equals(gtype)) {
                            type = AttributeDescriptor.TYPE_GEOMETRY_MPOINT;
                        } else if("esriGeometryLine".equals(gtype) || "esriGeometryPolyline".equals(gtype)) {
                            type = AttributeDescriptor.TYPE_GEOMETRY_LINESTRING;
                        } else if("esriGeometryPolygon".equals(gtype)) {
                            type = AttributeDescriptor.TYPE_GEOMETRY_POLYGON;
                        } else {
                            // don't bother
                            type = AttributeDescriptor.TYPE_GEOMETRY;
                        }
                    } else if("esriFieldTypeDouble".equals(et)) {
                        type = AttributeDescriptor.TYPE_DOUBLE;
                    } else if("esriFieldTypeInteger".equals(et)
                            ||"esriFieldTypeSmallInteger".equals(et)) {
                        type = AttributeDescriptor.TYPE_INTEGER;
                    } else if("esriFieldTypeDate".equals(et)) {
                        type = AttributeDescriptor.TYPE_DATE;
                    }
                    att.setType(type);
                }
                fs.getFeatureTypes().add(sft);
                l.setFeatureType(sft);
                hasFields = true;
            }
        }

        /* We could check capabilities field for "Query", but don't bother,
         * group layers have Query in that property but no fields...
         */
        l.setQueryable(hasFields);
        l.setFilterable(hasFields);

        l.setVirtual(!NON_VIRTUAL_LAYER_TYPES.contains(l.getDetails().get(DETAIL_TYPE).getValue()));

        return l;
    }
    //</editor-fold>

    //<editor-fold desc="Updating">
    public static UpdateResult update(EntityManager em, ArcGISService s) {

        LayerHelper.initLayerCollectionsForUpdate(s);

        final UpdateResult result = new UpdateResult(s, em);

        try {

            Map params = new HashMap();
            params.put(PARAM_USERNAME, s.getUsername());
            params.put(PARAM_PASSWORD, s.getPassword());

            ArcGISService update = loadFromUrl(s.getUrl(), params, result.getWaitPageStatus().subtask("", 80),em);

            s.getDetails().put(DETAIL_CURRENT_VERSION, update.getDetails().get(DETAIL_CURRENT_VERSION));

            // Our virtual top layer doesn't have to be updated unless we put
            // extra stuff from the metadata in it

            // Remove old stuff from before GeoService.details was added
            s.getTopLayer().getDetails().remove(DETAIL_CURRENT_VERSION);

            // For updating - old toplayer may have had null name
            s.getTopLayer().setName(TOPLAYER_ID);
            result.getLayerStatus().put(s.getTopLayer().getName(), new MutablePair(s.getTopLayer(), UpdateResult.Status.UNMODIFIED));

            // Find auto-linked FeatureSource (manually linked feature sources
            // not updated automatically) (TODO: maybe provide option to do that)
            ArcGISFeatureSource linkedFS = null;
            try {
                linkedFS = (ArcGISFeatureSource) Stripersist.getEntityManager().createQuery(
                        "from FeatureSource where linkedService = :this")
                        .setParameter("this", s)
                        .getSingleResult();
            } catch(NoResultException nre) {
                // linked FeatureSource was removed by user
            }

            updateLayers(update, linkedFS, result, em, s );

            ArcGISServiceHelper.removeOrphanLayersAfterUpdate(result, s);

            if(linkedFS != null && linkedFS.getFeatureTypes().isEmpty()) {
                log.debug("Linked ArcGISFeatureSource has no type names anymore, removing it");
                Stripersist.getEntityManager().remove(linkedFS);
            }

            result.setStatus(UpdateResult.Status.UPDATED);
        } catch(Exception e) {
            result.failedWithException(e);
        }
        return result;
    }

    private static void updateLayers(final ArcGISService update, final ArcGISFeatureSource linkedFS,
                              final UpdateResult result, EntityManager em, ArcGISService service) {
        /* This is a lot simpler than WMS, because layers always have an id
         * (name in WMS and our Layer object)
         */

        Map<String,Layer> updatedLayersById = new HashMap();

        SimpleFeatureType ft;

        for(Layer updateLayer: update.layersById.values()) {

            MutablePair<Layer,UpdateResult.Status> layerStatus = result.getLayerStatus().get(updateLayer.getName());
            Layer updatedLayer = null;

            if(layerStatus == null) {
                // New layer
                ft = updateLayer.getFeatureType();
                if(updateLayer.getFeatureType() != null) {

                    if(linkedFS != null) {
                        updateLayer.setFeatureType(linkedFS.addOrUpdateFeatureType(updateLayer.getName(), ft, new MutableBoolean()));
                    } else {
                        // New FeatureSource to be persisted
                        ft.getFeatureSource().setLinkedService(service);
                    }
                }

                result.getLayerStatus().put(updateLayer.getName(), new MutablePair(updateLayer, UpdateResult.Status.NEW));

                updatedLayer = updateLayer;
            } else {

                assert(layerStatus.getRight() == UpdateResult.Status.MISSING);

                Layer old = layerStatus.getLeft();

                old.setParent(null);
                old.update(updateLayer, additionalUpdatableDetails);

                layerStatus.setRight(UpdateResult.Status.UNMODIFIED);

                // Do not overwrite manually set feature source
                if(old.getFeatureType() == null || old.getFeatureType().getFeatureSource().getLinkedService() == service) {
                    if(updateLayer.getFeatureType() == null) {
                        // If was set before the old feature type will be removed
                        // later when all orphan MISSING layers are removed
                        if(old.getFeatureType() != null) {
                            layerStatus.setRight(UpdateResult.Status.UPDATED);
                        }
                        old.setFeatureType(null);
                    } else {
                        if(linkedFS != null) {
                            MutableBoolean updated = new MutableBoolean(false);
                            ft = linkedFS.addOrUpdateFeatureType(updateLayer.getName(), updateLayer.getFeatureType(), updated);
                            if(old.getFeatureType() == null || updated.isTrue()) {
                                layerStatus.setRight(UpdateResult.Status.UPDATED);
                            }
                        } else {
                            ft = updateLayer.getFeatureType();
                            // New FeatureSource to be persisted
                            ft.getFeatureSource().setLinkedService(service);
                            layerStatus.setRight(UpdateResult.Status.UPDATED);
                        }
                        old.setFeatureType(ft);
                    }
                }

                updatedLayer = old;
            }

            // will be filled in setLayerTree()
            updatedLayer.getChildren().clear();
            updatedLayer.setParent(null);

            updatedLayer.setService(service);

            updatedLayersById.put(updateLayer.getName(), updatedLayer);
        }

        setLayerTree(service.getTopLayer(), updatedLayersById, update.childrenByLayerId, em);
    }

    private static void removeOrphanLayersAfterUpdate(UpdateResult result, ArcGISService service) {

        assert(result.getDuplicateOrNoNameLayers().size() == 1);
        assert(result.getDuplicateOrNoNameLayers().get(0) == service.getTopLayer());

        // Remove old layers from this service which are missing from updated
        // service

        // Feature types will be removed from linked feature source by createQuery(),
        // this causes the session to be flushed. This may cause a constraint
        // violation when a layer is removed which still has child layers, so
        // delete all layers first, then remove all feature types.
        Set<Layer> layerFeatureTypesToRemove = new HashSet();

        for(Pair<Layer,UpdateResult.Status> p: result.getLayerStatus().values()) {
            if(p.getRight() == UpdateResult.Status.MISSING) {
                Layer removed = p.getLeft();
                if(removed.getFeatureType() != null) {
                    if(removed.getFeatureType().getFeatureSource().getLinkedService().equals(removed.getService())) {
                        layerFeatureTypesToRemove.add(removed);
                    }
                }
                Stripersist.getEntityManager().remove(removed);
            }
        }

        for(Layer removed: layerFeatureTypesToRemove) {
            // The feature type may have been selected for use in
            // other entities. As it is removed from the service it
            // won't work anymore, so clear the references to it
            SimpleFeatureType ft = removed.getFeatureType();
            Stripersist.getEntityManager().createQuery("update ConfiguredAttribute set featureType = null where featureType = :ft")
                    .setParameter("ft", ft)
                    .executeUpdate();

            Stripersist.getEntityManager().createQuery("update Layer set featureType = null where featureType = :ft")
                    .setParameter("ft", ft)
                    .executeUpdate();

            Stripersist.getEntityManager().createQuery("update SolrConf set simpleFeatureType = null where simpleFeatureType = :ft")
                    .setParameter("ft", ft)
                    .executeUpdate();

            Stripersist.getEntityManager().createQuery("update FeatureTypeRelation set foreignFeatureType = null where foreignFeatureType = :ft")
                    .setParameter("ft", ft)
                    .executeUpdate();

            FeatureSourceFactoryHelper.removeFeatureType(removed.getFeatureType().getFeatureSource(), removed.getFeatureType());
        }
    }
    //</editor-fold>


    private static JSONObject issueRequest(String url, HTTPClient client) throws Exception {
        return new JSONObject(IOUtils.toString(client.get(new URL(url)).getResponseStream(), "UTF-8"));
    }

    public static JSONObject toJSONObject(ArcGISService geoService, boolean flatten, Set<String> layersToInclude, boolean validXmlTags, boolean includeAuthorizations, EntityManager em) throws JSONException {
        JSONObject o = GeoServiceHelper.toJSONObject(geoService, flatten, layersToInclude, validXmlTags, includeAuthorizations, em);

        // Add currentVersion info to service info

        // Assume 9.x by default

        JSONObject json = new JSONObject();
        o.put("arcGISVersion", json);
        json.put("s", "9.x");    // complete currentVersion string
        json.put("major", 9L);   // major version, integer
        json.put("number", 9.0); // version as as Number

        String cv = geoService.getCurrentVersion();

        if (cv != null) {
            json.put("s", cv);
            try {
                String[] parts = cv.split("\\.");
                json.put("major", Integer.parseInt(parts[0]));
                json.put("number", Double.parseDouble(cv));
            } catch (Exception e) {
                // keep defaults
            }
        }

        return o;
    }
}
