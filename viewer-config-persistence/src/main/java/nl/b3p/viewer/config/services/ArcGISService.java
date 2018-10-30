/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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
package nl.b3p.viewer.config.services;

import java.net.URL;
import java.util.*;
import javax.persistence.*;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.MutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.geotools.data.ows.HTTPClient;
import org.geotools.data.ows.SimpleHttpClient;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;
import static nl.b3p.viewer.config.RemoveEmptyMapValuesUtil.removeEmptyMapValues;
import org.apache.commons.lang3.mutable.MutableBoolean;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(ArcGISService.PROTOCOL)
public class ArcGISService extends GeoService implements Updatable {
    private static final org.apache.commons.logging.Log log = org.apache.commons.logging.LogFactory.getLog(ArcGISService.class);

    public static final String PROTOCOL = "arcgis";

    /** Parameter to avoid the call to /ArcGIS/rest/services?f=json to determine
     * the version (10 or 9). Some sites have this URL hidden but the service
     * itself is available. String with "9" or "10", null or any other value
     * means get it from /ArcGIS/rest/services?f=json.
     */
    public static final String PARAM_ASSUME_VERSION = "assumeVersion";

    /** GeoService.details map key for ArcGIS currentVersion property */
    public static final String DETAIL_CURRENT_VERSION = "arcgis_currentVersion";

    /** GeoService.details map key to save assume version to pass on to datastore */
    public static final String DETAIL_ASSUME_VERSION = "arcgis_assumeVersion";

    /** Layer.details map key for ArcGIS type property */
    public static final String DETAIL_TYPE = "arcgis_type";
    /** Layer.details map key for ArcGIS description property */
    public static final String DETAIL_DESCRIPTION = "arcgis_description";
    /** Layer.details map key for ArcGIS geometryType property */
    public static final String DETAIL_GEOMETRY_TYPE = "arcgis_geometryType";
    /** Layer.details map key for ArcGIS capabilities property */
    public static final String DETAIL_CAPABILITIES = "arcgis_capabilities";
    /** Layer.details map key for ArcGIS defaultVisibility property */
    public static final String DETAIL_DEFAULT_VISIBILITY = "arcgis_defaultVisibility";
    /** Layer.details map key for ArcGIS definitionExpression property */
    public static final String DETAIL_DEFINITION_EXPRESSION = "arcgis_definitionExpression";

    private static final String TOPLAYER_ID = "-1";

    // Layer types are not specified in the ArcGIS API reference, so these are guesses.
    // See {nl.b3p.viewer.config.services.Layer#virtual}
    // Group layers are thus virtual layers. Sometimes ArcGIS even has layers
    // without a type...
    public static final Set<String> NON_VIRTUAL_LAYER_TYPES = Collections.unmodifiableSet(new HashSet(Arrays.asList(new String[] {
        "Feature Layer",
        "Raster Layer",
        "Annotation Layer" // not sure about this one...
    })));

    private static Set<String> additionalUpdatableDetails = new HashSet<String>(Arrays.asList(new String[] {
        DETAIL_TYPE,
        DETAIL_DESCRIPTION,
        DETAIL_GEOMETRY_TYPE,
        DETAIL_CAPABILITIES,
        DETAIL_DEFAULT_VISIBILITY,
        DETAIL_DEFINITION_EXPRESSION,
        DETAIL_CURRENT_VERSION
    }));

    private static JSONObject issueRequest(String url, HTTPClient client) throws Exception {
        return new JSONObject(IOUtils.toString(client.get(new URL(url)).getResponseStream(), "UTF-8"));
    }

    @Transient
    private JSONObject serviceInfo;
    @Transient
    private String currentVersion;
    @Transient
    private int currentVersionMajor;
    @Transient
    private SortedMap<String,Layer> layersById;
    @Transient
    private Map<String,List<String>> childrenByLayerId;

    //<editor-fold defaultstate="collapsed" desc="Loading service metadata from ArcGIS">
    @Override
    public ArcGISService loadFromUrl(String url, Map params, WaitPageStatus status, EntityManager em) throws Exception {
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
            s.loadServiceInfo(client, (String)params.get(PARAM_ASSUME_VERSION));

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
            s.load(client, status, em);

            return s;
        } finally {
            status.setProgress(90);
            status.setCurrentAction("Service ingeladen");
        }
    }

    private void loadServiceInfo(HTTPClient client, String assumeVersion) throws Exception {

        if("9.x".equals(assumeVersion)) {
            currentVersion = "9.x";
            currentVersionMajor = 9;
            getDetails().put(DETAIL_ASSUME_VERSION, new ClobElement("9.x"));
        } else if("10.x".equals(assumeVersion)) {
            currentVersion = "10.x";
            currentVersionMajor = 10;
            getDetails().put(DETAIL_ASSUME_VERSION, new ClobElement("10.x"));
        } else {
            // currentVersion not included in MapServer/ JSON in 9.3.1, get it
            // from the root services JSON
            int i = getUrl().indexOf("/rest/services");
            String servicesUrl = getUrl().substring(0, i) + "/rest/services";
            serviceInfo = issueRequest(servicesUrl + "?f=json", client);
            currentVersion = serviceInfo.get("currentVersion").toString();
            currentVersionMajor = Integer.parseInt(currentVersion.split("\\.")[0]);
        }

        if(currentVersionMajor >= 10) {
            // In version 10, get full layers info immediately
            // The MapServer/ JSON is not very interesing by itself
            serviceInfo = issueRequest(getUrl() + "/layers?f=json", client);
        } else {
            // In 9.x, MapServer/layers is not supported
            serviceInfo = issueRequest(getUrl() + "?f=json", client);
        }

        getDetails().put(DETAIL_CURRENT_VERSION, new ClobElement(currentVersion));
    }

    private void load(HTTPClient client, WaitPageStatus status, EntityManager em) throws Exception {
        int layerCount = serviceInfo.getJSONArray("layers").length();

        status.setProgress((int)Math.round(100.0/(layerCount+1)));

        status.setCurrentAction("Inladen layers...");

        /* Automatically create featuresource */
        ArcGISFeatureSource fs = new ArcGISFeatureSource();
        fs.setLinkedService(this);
        fs.setUrl(getUrl());
        fs.setUsername(client.getUser());
        fs.setPassword(client.getPassword());

        Layer top = new Layer();

        top.setVirtual(true);       // set to false later if any defaultVisible children
        top.setName(TOPLAYER_ID);   // name needed for possible non-virtual layer
        top.setTitle(getName());
        top.setService(this);
        setTopLayer(top);

        layersById = new TreeMap();
        childrenByLayerId = new HashMap();

        layersById.put(top.getName(), top);

        if(currentVersionMajor >= 10) {
            // info is the MapServer/layers response, all layers JSON info
            // immediately available
            JSONArray layers = serviceInfo.getJSONArray("layers");
            for(int i = 0; i < layers.length(); i++) {
                JSONObject layer = layers.getJSONObject(i);

                Layer l = parseArcGISLayer(layer, this, fs, childrenByLayerId);
                layersById.put(l.getName(), l);
            }
        } else {
            // In 9.x, request needed for each layer
            JSONArray layers = serviceInfo.getJSONArray("layers");
            for(int i = 0; i < layers.length(); i++) {
                JSONObject layer = layers.getJSONObject(i);
                String id = layer.getString("id");
                status.setCurrentAction("Inladen laag \"" + layer.optString("name", id) + "\"");
                layer = issueRequest(getUrl() + "/" + id + "?f=json", client);

                Layer l = parseArcGISLayer(layer, this, fs, childrenByLayerId);
                layersById.put(l.getName(), l);
                status.setProgress((int)Math.round( 100.0/(layerCount+1) * i+2 ));
            }
        }

        setLayerTree(getTopLayer(), layersById, childrenByLayerId, em);
        setAllChildrenDetail(getTopLayer(), em);

        // FeatureSource is navigable via Layer.featureType CascadeType.PERSIST relation
        if(!fs.getFeatureTypes().isEmpty()) {
            fs.setName(getName());
        }
    }

    private static void setLayerTree(Layer topLayer, Map<String,Layer> layersById, Map<String,List<String>> childrenByLayerId, EntityManager em) {
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

    private Layer parseArcGISLayer(JSONObject agsl, GeoService service, ArcGISFeatureSource fs, Map<String,List<String>> childrenByLayerId) throws JSONException {
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
        l.getDetails().put(DETAIL_CURRENT_VERSION, new ClobElement(agsl.optString("currentVersion", currentVersion)));
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
    @Override
    public UpdateResult update(EntityManager em) {

        initLayerCollectionsForUpdate();

        final UpdateResult result = new UpdateResult(this, em);

        try {

            Map params = new HashMap();
            params.put(PARAM_USERNAME, getUsername());
            params.put(PARAM_PASSWORD, getPassword());

            ArcGISService update = loadFromUrl(getUrl(), params, result.getWaitPageStatus().subtask("", 80),em);

            getDetails().put(DETAIL_CURRENT_VERSION, update.getDetails().get(DETAIL_CURRENT_VERSION));

            // Our virtual top layer doesn't have to be updated unless we put
            // extra stuff from the metadata in it

            // Remove old stuff from before GeoService.details was added
            getTopLayer().getDetails().remove(DETAIL_CURRENT_VERSION);

            // For updating - old toplayer may have had null name
            getTopLayer().setName(TOPLAYER_ID);
            result.getLayerStatus().put(getTopLayer().getName(), new MutablePair(getTopLayer(), UpdateResult.Status.UNMODIFIED));

            // Find auto-linked FeatureSource (manually linked feature sources
            // not updated automatically) (TODO: maybe provide option to do that)
            ArcGISFeatureSource linkedFS = null;
            try {
                linkedFS = (ArcGISFeatureSource)Stripersist.getEntityManager().createQuery(
                    "from FeatureSource where linkedService = :this")
                    .setParameter("this", this)
                    .getSingleResult();
            } catch(NoResultException nre) {
                // linked FeatureSource was removed by user
            }

            updateLayers(update, linkedFS, result, em   );

            removeOrphanLayersAfterUpdate(result);

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

    private void updateLayers(final ArcGISService update, final ArcGISFeatureSource linkedFS, final UpdateResult result, EntityManager em) {
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
                        ft.getFeatureSource().setLinkedService(this);
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
                if(old.getFeatureType() == null || old.getFeatureType().getFeatureSource().getLinkedService() == this) {
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
                            ft.getFeatureSource().setLinkedService(this);
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

            updatedLayer.setService(this);

            updatedLayersById.put(updateLayer.getName(), updatedLayer);
        }

        setLayerTree(getTopLayer(), updatedLayersById, update.childrenByLayerId, em);
    }

    private void removeOrphanLayersAfterUpdate(UpdateResult result) {

        assert(result.getDuplicateOrNoNameLayers().size() == 1);
        assert(result.getDuplicateOrNoNameLayers().get(0) == getTopLayer());

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

            Stripersist.getEntityManager().createQuery("update LayarSource set featureType = null where featureType = :ft")
                    .setParameter("ft", ft)
                    .executeUpdate();

            Stripersist.getEntityManager().createQuery("update SolrConf set simpleFeatureType = null where simpleFeatureType = :ft")
                    .setParameter("ft", ft)
                    .executeUpdate();

            Stripersist.getEntityManager().createQuery("update FeatureTypeRelation set foreignFeatureType = null where foreignFeatureType = :ft")
                    .setParameter("ft", ft)
                    .executeUpdate();

            removed.getFeatureType().getFeatureSource().removeFeatureType(removed.getFeatureType());
        }
    }
    //</editor-fold>

    public String getCurrentVersion() {
        ClobElement ce = getDetails().get(DETAIL_CURRENT_VERSION);
        String cv = ce != null ? ce.getValue() : null;

        if(cv == null && getTopLayer() != null) {
            // get it from the topLayer, was saved there before GeoService.details
            // was added
            ce = getTopLayer().getDetails().get(DETAIL_CURRENT_VERSION);
            cv = ce != null ? ce.getValue() : null;

            // try the first actual layer where may have been saved in version < 4.1
            if(cv == null && !getTopLayer().getChildren().isEmpty()) {
                ce = getTopLayer().getChildren().get(0).getDetails().get(DETAIL_CURRENT_VERSION);
                cv = ce != null ? ce.getValue() : null;
            }
        }
        return cv;
    }

    //<editor-fold desc="Add currentVersion to toJSONObject()">

    @Override
    public JSONObject toJSONObject(boolean flatten, Set<String> layersToInclude, boolean validXmlTags, EntityManager em) throws JSONException {
        return toJSONObject(validXmlTags, layersToInclude, validXmlTags, false, em);
    }

    @Override
    public JSONObject toJSONObject(boolean flatten, Set<String> layersToInclude, boolean validXmlTags, boolean includeAuthorizations, EntityManager em) throws JSONException {
        JSONObject o = super.toJSONObject(flatten, layersToInclude,validXmlTags,includeAuthorizations, em);

        // Add currentVersion info to service info

        // Assume 9.x by default

        JSONObject json = new JSONObject();
        o.put("arcGISVersion", json);
        json.put("s", "9.x");    // complete currentVersion string
        json.put("major", 9L);   // major version, integer
        json.put("number", 9.0); // version as as Number

        String cv = getCurrentVersion();

        if(cv != null) {
            json.put("s", cv);
            try {
                String[] parts = cv.split("\\.");
                json.put("major", Integer.parseInt(parts[0]));
                json.put("number", Double.parseDouble(cv));
            } catch(Exception e) {
                // keep defaults
            }
        }

        return o;
    }

    @Override
    public JSONObject toJSONObject(boolean flatten, EntityManager em) throws JSONException {
        return toJSONObject(flatten, null,false, em);
    }
    //</editor-fold>

}
