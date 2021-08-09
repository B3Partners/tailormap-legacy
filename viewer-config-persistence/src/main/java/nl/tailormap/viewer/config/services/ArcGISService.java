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
package nl.tailormap.viewer.config.services;

import nl.tailormap.viewer.config.ClobElement;
import org.json.JSONObject;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.Transient;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(ArcGISService.PROTOCOL)
public class ArcGISService extends GeoService{

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

    public static final String TOPLAYER_ID = "-1";

    // Layer types are not specified in the ArcGIS API reference, so these are guesses.
    // See {Layer#virtual}
    // Group layers are thus virtual layers. Sometimes ArcGIS even has layers
    // without a type...
    public static final Set<String> NON_VIRTUAL_LAYER_TYPES = Collections.unmodifiableSet(new HashSet(Arrays.asList(new String[] {
        "Feature Layer",
        "Raster Layer",
        "Annotation Layer" // not sure about this one...
    })));


    @Transient
    public JSONObject serviceInfo;
    @Transient
    public String currentVersion;
    @Transient
    public int currentVersionMajor;
    @Transient
    public SortedMap<String,Layer> layersById;
    @Transient
    public Map<String,List<String>> childrenByLayerId;

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


}
