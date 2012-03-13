/*
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.util;

import java.util.ArrayList;
import java.util.List;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.Level; 
import nl.b3p.viewer.config.services.Layer;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class LayerListHelper {

    /**
     * Get a list of Layers from the level and its subLevels
     *
     * @param level
     * @return A list of Layer objects
     */
    public static List<Layer> getLayers(Level level,Boolean filterable, Boolean bufferable, Boolean editable ,Boolean influence ,Boolean arc ,Boolean wfs ,Boolean attribute,Boolean hasConfiguredLayers, List<Long> possibleLayers) {
        List<Layer> layers = new ArrayList<Layer>();
        //get all the layers of this level
        for (ApplicationLayer appLayer : level.getLayers()) {
            Layer l = appLayer.getService().getLayer(appLayer.getLayerName());
            if (filterable && !l.isFilterable()
                    || bufferable && !l.isBufferable()) {
                continue;
            }
            if (editable && (l.getFeatureType() == null || !l.getFeatureType().isWriteable())) {
                continue;
            }
            if (influence && !appLayer.getDetails().containsKey("straalinvloedsgebied")) {
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
            if(hasConfiguredLayers && !possibleLayers.contains(l.getId())){
                continue;
            }            

            layers.add(l);
        }
        //get all the layers of the level children.
        for (Level childLevel : level.getChildren()) {
            layers.addAll(getLayers(childLevel, filterable, bufferable, editable, influence, arc, wfs, attribute,hasConfiguredLayers,possibleLayers));
        }
        return layers;

    }
}
