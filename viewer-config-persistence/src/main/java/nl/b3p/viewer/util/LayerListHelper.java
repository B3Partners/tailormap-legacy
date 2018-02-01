/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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

import java.util.ArrayList;
import java.util.List;
import javax.persistence.EntityManager;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.services.ArcGISFeatureSource;
import nl.b3p.viewer.config.services.ArcGISService;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.WMSService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

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
