package nl.tailormap.viewer.helpers.services;

import nl.tailormap.viewer.config.ClobElement;
import nl.tailormap.viewer.config.security.Authorizations;
import nl.tailormap.viewer.config.services.GeoService;
import nl.tailormap.viewer.config.services.Layer;
import nl.tailormap.viewer.config.services.StyleLibrary;
import nl.tailormap.viewer.config.services.UpdateResult;
import nl.tailormap.viewer.config.services.WMSExceptionType;
import nl.tailormap.viewer.config.services.WMSService;
import nl.tailormap.viewer.helpers.AuthorizationsHelper;
import nl.tailormap.viewer.util.DB;
import nl.tailormap.web.WaitPageStatus;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.persistence.EntityManager;
import java.util.List;
import java.util.Map;
import java.util.Set;

public interface GeoServiceHelper {

    static JSONObject toJSONObject(GeoService geoService, boolean includeLayerTree, Set<String> layersToInclude, boolean validXmlTags, boolean includeAuthorizations, EntityManager em) throws JSONException {
        JSONObject o = new JSONObject();
        o.put("id", geoService.getId());
        o.put("name", geoService.getName());
        o.put("url", geoService.getUrl());
        o.put("protocol", geoService.getProtocol());
        o.put("readers", geoService.getReaders());
        o.put("version", geoService.getVersion());

        if (geoService.getDetails().containsKey(GeoService.DETAIL_USE_PROXY)) {
            ClobElement ce = geoService.getDetails().get(GeoService.DETAIL_USE_PROXY);
            boolean useProxy = Boolean.parseBoolean(ce.getValue());
            o.put(GeoService.DETAIL_USE_PROXY, useProxy);
            if (geoService.getPassword() != null && geoService.getUsername() != null) {
                o.put(GeoService.PARAM_MUST_LOGIN, true);
            }
        } else {
            o.put(GeoService.DETAIL_USE_PROXY, false);
        }
        if (geoService instanceof WMSService) {
            WMSExceptionType extype = ((WMSService) geoService).getException_type() != null ? ((WMSService) geoService).getException_type() : WMSExceptionType.Inimage;
            o.put("exception_type", extype.getDescription());
        }

        if (!validXmlTags) {
            JSONObject jStyleLibraries = new JSONObject();
            for (StyleLibrary sld : geoService.getStyleLibraries()) {
                JSONObject jsld = new JSONObject();
                String styleName = sld.getId().toString();
                jStyleLibraries.put("sld:" + styleName, jsld);
                jsld.put("id", sld.getId());
                jsld.put("title", sld.getTitle());
                jsld.put("default", sld.isDefaultStyle());
                if (sld.isDefaultStyle()) {
                    o.put("defaultStyleLibrary", jsld);
                }
                if (sld.getExternalUrl() != null) {
                    jsld.put("externalUrl", sld.getExternalUrl());
                }
                JSONObject userStylesPerNamedLayer = new JSONObject();
                if (sld.getNamedLayerUserStylesJson() != null) {
                    userStylesPerNamedLayer = new JSONObject(sld.getNamedLayerUserStylesJson());
                }
                jsld.put("userStylesPerNamedLayer", userStylesPerNamedLayer);
                if (sld.getExtraLegendParameters() != null) {
                    jsld.put("extraLegendParameters", sld.getExtraLegendParameters());
                }
                jsld.put("hasBody", sld.getExternalUrl() == null);
            }
            o.put("styleLibraries", jStyleLibraries);
        }

        if (geoService.getTopLayer() != null) {

            if (em.contains(geoService)) {

                List<Layer> layerEntities = geoService.loadLayerTree(em);

                if (!layerEntities.isEmpty()) {
                    // Prevent n+1 queries
                    int i = 0;
                    do {
                        List<Layer> subList = layerEntities.subList(i, Math.min(layerEntities.size(), i + DB.MAX_LIST_EXPRESSIONS));
                        em.createQuery("from Layer l "
                                        + "left join fetch l.details "
                                        + "where l in (:layers)")
                                .setParameter("layers", subList)
                                .getResultList();
                        i += subList.size();
                    } while (i < layerEntities.size());
                }
            }

            JSONObject layers = new JSONObject();
            o.put("layers", layers);
            walkLayerJSONFlatten(geoService.getTopLayer(), layers, layersToInclude, validXmlTags, includeAuthorizations, em);

            if (includeLayerTree) {
                o.put("topLayer", walkLayerJSONTree(geoService.getTopLayer(), em));
            }

        }
        return o;
    }

    private static void walkLayerJSONFlatten(Layer l, JSONObject layers, Set<String> layersToInclude, boolean validXmlTags, boolean includeAuthorizations, EntityManager em) throws JSONException {

        /* TODO check readers (and include readers in n+1 prevention query */

        /* Flatten tree structure, currently depth-first - later traversed layers
         * do not overwrite earlier layers with the same name - do not include
         * virtual layers
         */

        if (layersToInclude == null || layersToInclude.contains(l.getName())) {
            if (!l.isVirtual() && l.getName() != null && !layers.has(l.getName())) {
                String name = l.getName();
                if (validXmlTags) {
                    /*name="layer_"+name;
                    name=name.replaceAll(" ", "_");*/
                    name = "layer" + layers.length();
                }
                JSONObject layer = l.toJSONObject();
                if (includeAuthorizations) {
                    AuthorizationsHelper.ReadWrite rw = AuthorizationsHelper.getLayerAuthorizations(l, em);
                    layer.put(Authorizations.AUTHORIZATIONS_KEY, rw != null ? rw.toJSON() : new JSONObject());
                }
                layers.put(name, layer);
            }
        }

        for (Layer child : l.getCachedChildren(em)) {
            walkLayerJSONFlatten(child, layers, layersToInclude, validXmlTags, includeAuthorizations, em);
        }
    }

    private static JSONObject walkLayerJSONTree(Layer l, EntityManager em) throws JSONException {
        JSONObject j = l.toJSONObject();

        List<Layer> children = l.getCachedChildren(em);
        if (!children.isEmpty()) {
            JSONArray jc = new JSONArray();
            j.put("children", jc);
            for (Layer child : children) {
                jc.put(walkLayerJSONTree(child, em));
            }
        }
        return j;
    }

    GeoService loadServiceFromURL(String url, Map params, WaitPageStatus status, EntityManager em) throws Exception;

    UpdateResult updateService(EntityManager em, GeoService service) throws Exception;
}
