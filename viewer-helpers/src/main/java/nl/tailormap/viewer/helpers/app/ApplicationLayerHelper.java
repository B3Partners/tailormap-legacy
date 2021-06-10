package nl.tailormap.viewer.helpers.app;

import nl.tailormap.viewer.config.ClobElement;
import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.config.app.ApplicationLayer;
import nl.tailormap.viewer.config.app.ConfiguredAttribute;
import nl.tailormap.viewer.config.app.StartLayer;
import nl.tailormap.viewer.config.services.ArcGISFeatureSource;
import nl.tailormap.viewer.config.services.ArcGISService;
import nl.tailormap.viewer.config.services.AttributeDescriptor;
import nl.tailormap.viewer.config.services.FeatureTypeRelation;
import nl.tailormap.viewer.config.services.Layer;
import nl.tailormap.viewer.config.services.SimpleFeatureType;
import nl.tailormap.viewer.config.services.WMSService;
import org.apache.commons.beanutils.BeanUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class ApplicationLayerHelper {

    public static JSONObject toJSONObject(ApplicationLayer al, EntityManager em) throws JSONException {
        return toJSONObject(al, false, false, em, null);
    }

    public static JSONObject toJSONObject(ApplicationLayer al, boolean includeAttributes, boolean includeRelations,EntityManager em, Application app) throws JSONException {

        JSONObject o = new JSONObject();
        o.put("id", al.getId());
        o.put("layerName", al.getLayerName());
        if(al.getService() != null) {
            o.put("serviceId", al.getService().getId());
        }
        o.put("alias", al.getDisplayName(em));

        Layer l = al.getService() == null ? null : al.getService().getLayer(al.getLayerName(), em);
        if(l != null && l.getFeatureType() != null) {
            o.put("featureType", l.getFeatureType().getId());
        }
        /* TODO add attribute if writeable according to al.getWriters() */

        if(!al.getDetails().isEmpty()) {
            JSONObject d = new JSONObject();
            o.put("details", d);
            for(Map.Entry<String, ClobElement> e: al.getDetails().entrySet()) {
                d.put(e.getKey(), e.getValue().getValue());
            }
        }

        if(includeAttributes) {
            addAttributesJSON(al, o, includeRelations, em);
        }

        if(l != null) {
            addLayerListDetails(al, o, l);
        }
        StartLayer sl = al.getStartLayers().get(app);
        o.put("checked", sl != null && sl.isChecked());

        return o;
    }

    public static void addLayerListDetails(ApplicationLayer al, JSONObject json, Layer l){
        json.put("layerId", l.getId());
        if (l.getService() instanceof WMSService) {
            json.put("filterable", l.getFeatureType() != null);
        }else{
            json.put("filterable", l.isFilterable());
        }

        if( l.getService() instanceof ArcGISService){
            json.put("filterable", l.getFeatureType() != null && !(l.getFeatureType().getFeatureSource() instanceof ArcGISFeatureSource) );
        }

        boolean userLayer = l.isUserlayer() != null ? l.isUserlayer() : false;

        json.put("userlayer", userLayer);
        if(userLayer){
            json.put(Layer.DETAIL_USERLAYER_ORIGINAL_LAYERNAME, l.getDetails().get(Layer.DETAIL_USERLAYER_ORIGINAL_LAYERNAME) );
        }
        json.put("bufferable", l.isBufferable());
        json.put("editable", l.getFeatureType() != null && l.getFeatureType().isWriteable());
        json.put("influence", al.getDetails().containsKey("influenceradius"));
        json.put("arc", l.getService().getProtocol().startsWith("arc"));
        json.put("wfs", l.getFeatureType() != null && l.getFeatureType().getFeatureSource().getProtocol().equals("wfs"));
        json.put("attribute", !al.getAttributes().isEmpty());
    }

    public static void addAttributesJSON(ApplicationLayer al, JSONObject json, boolean includeRelations, EntityManager em) throws JSONException {
        Layer layer = al.getService().getSingleLayer(al.getLayerName(),em);
        Map<String, AttributeDescriptor> featureTypeAttributes = new HashMap<>();
        SimpleFeatureType ft = null;
        if(layer != null) {
            ft = layer.getFeatureType();
            if(ft != null) {
                featureTypeAttributes = makeAttributeDescriptorList(ft);
            }
        }

        Integer geometryAttributeIndex = null;
        JSONArray jattributes = new JSONArray();
        json.put("attributes", jattributes);

        for(ConfiguredAttribute ca: al.getAttributes()) {
            JSONObject j = ca.toJSONObject();
            AttributeDescriptor ad = featureTypeAttributes.get(ca.getFullName());
            if(ad != null) {
                j.put("alias", ad.getAlias());
                j.put("type", ad.getType());

                if(ft != null && ca.getAttributeName().equals(ft.getGeometryAttribute()) && ca.getFeatureType().getId() == ft.getId() ) {
                    geometryAttributeIndex = jattributes.length();
                }
            }
            jattributes.put(j);
        }

        if(ft != null) {
            json.put("geometryAttribute", ft.getGeometryAttribute());
            json.put("primaryKeyAttribute", ft.getPrimaryKeyAttribute());
            json.put("featureType", ft.getId());
            json.put("featureTypeName", ft.getTypeName());
            if(includeRelations) {

                json.put("relations", getRelationsJSON(layer));
                json.put("invertedRelations", getInvertedRelationsJSON(layer, em));
            }
        }
        if(geometryAttributeIndex != null) {
            json.put("geometryAttributeIndex", geometryAttributeIndex);
        }
    }

    /**
     * Get relations of this applayer to other featuretypes: 1-n (1 = current applayer, n are the relations
     * @param layer Layer for which relations must be retrievd
     * @return JSONArray with relations
     * @throws JSONException when an exception occurs
     */
    public static JSONArray getRelationsJSON(Layer layer) throws JSONException {
        JSONArray j = new JSONArray();

        if(layer != null && layer.getFeatureType() != null) {
            for(FeatureTypeRelation rel: layer.getFeatureType().getRelations()){
                JSONObject jRel = rel.toJSONObject();
                j.put(jRel);
            }
        }
        return j;
    }

    /**
     * Get all the relations of featuretypes that have this applayer as dependend n - 1 (n are other featuretypes, 1 = current layer)
     *
     * @param layer Layer for which relations must be retrievd
     * @param em EntityManager entitymanager to retrieve featuretyperelations
     * @return JSONArray with relations
     * @throws JSONException when an exception occurs
     */
    public static JSONArray getInvertedRelationsJSON(Layer layer, EntityManager em) throws JSONException {
        JSONArray relations = new JSONArray();

        if(layer != null && layer.getFeatureType() != null) {
            List<FeatureTypeRelation> frs = em.createQuery("from FeatureTypeRelation where foreignFeatureType = :ft", FeatureTypeRelation.class)
                    .setParameter("ft", layer.getFeatureType())
                    .getResultList();
            for (FeatureTypeRelation fr : frs) {
                relations.put(fr.toJSONObject());
            }
        }
        return relations;
    }

    /**
     * Makes a list of al the attributeDescriptors of the given FeatureType and
     * all the child FeatureTypes (related by join/relate)
     */
    private static Map<String, AttributeDescriptor> makeAttributeDescriptorList(SimpleFeatureType ft) {
        Map<String,AttributeDescriptor> featureTypeAttributes = new HashMap<>();
        for(AttributeDescriptor ad: ft.getAttributes()) {
            String name=ft.getId()+":"+ad.getName();
            //stop when already added. Stop a infinite configurated loop
            if (featureTypeAttributes.containsKey(name)){
                return featureTypeAttributes;
            }
            featureTypeAttributes.put(name, ad);
        }
        if (ft.getRelations()!=null){
            for (FeatureTypeRelation rel : ft.getRelations()){
                featureTypeAttributes.putAll(makeAttributeDescriptorList(rel.getForeignFeatureType()));
            }
        }
        return featureTypeAttributes;
    }

    public static void processStartLayers(ApplicationLayer appLayer, Application app, ApplicationLayer original, Application copyFrom) throws Exception{
        StartLayer sl = original.getStartLayers().get(copyFrom);

        if(sl != null){
            appLayer.getStartLayers().put(app, sl.deepCopy(appLayer, app));
        } else if (Objects.equals(app.getId(), copyFrom.getId())) {
            List<StartLayer> al = new ArrayList<>(original.getStartLayers().values());
            for (int i = 0; i < al.size(); i++) {
                StartLayer sl2 = al.get(i);
                appLayer.getStartLayers().put(app, sl2.deepCopy(appLayer, app));
            }
        }
    }

    public static ApplicationLayer deepCopy(ApplicationLayer al, Map originalToCopy, Application app, boolean processStartLayers) throws Exception {
        ApplicationLayer copy = (ApplicationLayer) BeanUtils.cloneBean(al);
        originalToCopy.put(al, copy);
        copy.setId(null);

        // service reference is not deep copied, of course
        copy.setReaders(new HashSet<>(al.getReaders()));
        copy.setWriters(new HashSet<>(al.getWriters()));
        copy.setDetails(new HashMap<>(al.getDetails()));

        copy.setAttributes( new ArrayList<>());
        for(ConfiguredAttribute a: al.getAttributes()) {
            copy.getAttributes().add(a.deepCopy());
        }
        copy.setStartLayers(new HashMap<>());
        if(processStartLayers){
            processStartLayers(copy, app,al, app);
        }

        return copy;
    }
}
