/*
 * Copyright (C) 2012-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.util;

import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.config.app.ApplicationLayer;
import nl.tailormap.viewer.config.services.ArcGISFeatureSource;
import nl.tailormap.viewer.config.services.ArcGISService;
import nl.tailormap.viewer.config.services.Layer;
import nl.tailormap.viewer.config.services.WMSService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class LayerListHelper {

    private static final Log log = LogFactory.getLog(LayerListHelper.class);

    /**
     * Get a list of Layers from the level and its subLevels.
     *
     * @param application the application
     * @param filterable {@code true} to get filterable layers
     * @param bufferable {@code true} to get bufferable layers
     * @param editable {@code true} to get editable layers
     * @param influence {@code true} to get influence map layers
     * @param arc {@code true} to get arc layers
     * @param wfs {@code true} to get wfs layers
     * @param attribute {@code true} to get attribute
     * @param hasConfiguredLayers {@code true} to get configured layers
     * @param possibleLayers a list of layers
     * @param em the entity manager to use
     * @return A list of Layer objects
     */
    public static List<ApplicationLayer> getLayers(Application application, Boolean filterable, Boolean bufferable, Boolean editable, Boolean influence, Boolean arc, Boolean wfs, Boolean attribute,
                                                   Boolean hasConfiguredLayers, List<Long> possibleLayers, EntityManager em) {
        List<ApplicationLayer> layers = new ArrayList<ApplicationLayer>();

        long startTime = System.currentTimeMillis();
        Application.TreeCache tc = application.loadTreeCache(em);

        long end = System.currentTimeMillis();
        log.info("TreeCache load time:" + (end - startTime) + " millis");
        for (ApplicationLayer appLayer : tc.getApplicationLayers()) {
            Layer l = appLayer.getService().getLayer(appLayer.getLayerName(), em);
            if (l == null) {
                continue;
            }

            if(appLayer.getStartLayers().get(application) == null || appLayer.getStartLayers().get(application).isRemoved()){
                continue;
            }

            if (filterable) {
                // The value of l.isFilterable() for WMS layers is not meaningful
                // at the moment... Always assume a WMS layer is filterable if
                // the layer has a feature type. There is a checkbox for an admin
                // to specify manually if a layer supports SLD filtering for GetMap
                if (l.getService() instanceof WMSService) {
                    if (l.getFeatureType() == null) {
                        continue;
                    }
                } else {
                    if (!l.isFilterable()) {
                        continue;
                    }
                }
            }

            if (bufferable && !l.isBufferable()) {
                continue;
            }
            if (filterable && l.getService() instanceof ArcGISService) {
                if (l.getFeatureType() == null) {
                    continue;
                } else if (!(l.getFeatureType().getFeatureSource() instanceof ArcGISFeatureSource)) {
                    continue;
                }
            }

            if (editable && (l.getFeatureType() == null || !l.getFeatureType().isWriteable())) {
                continue;
            }
            if (influence && !appLayer.getDetails().containsKey("influenceradius")) {
                continue;
            }
            if (arc && !l.getService().getProtocol().startsWith("arc")) {
                continue;
            }
            if (wfs && (l.getFeatureType() == null || !l.getFeatureType().getFeatureSource().getProtocol().equals("wfs"))) {
                continue;
            }
            if (attribute && appLayer.getAttributes().isEmpty()) {
                continue;
            }
            if (hasConfiguredLayers && !possibleLayers.contains(appLayer.getId())) {
                continue;
            }

            layers.add(appLayer);
        }
        return layers;

    }
}
