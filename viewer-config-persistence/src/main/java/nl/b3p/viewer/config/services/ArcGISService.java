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

import nl.b3p.viewer.config.ClobElement;
import org.json.JSONException;
import org.json.JSONObject;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.EntityManager;
import javax.persistence.Transient;
import java.util.*;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(ArcGISService.PROTOCOL)
public class ArcGISService extends GeoService{
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

    public static final String TOPLAYER_ID = "-1";

    // Layer types are not specified in the ArcGIS API reference, so these are guesses.
    // See {nl.b3p.viewer.config.services.Layer#virtual}
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
