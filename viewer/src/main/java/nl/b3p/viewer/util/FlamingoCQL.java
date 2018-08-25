/*
 * Copyright (C) 2017 B3Partners B.V.
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

import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryCollection;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import javax.persistence.EntityManager;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.Layer;
import static nl.b3p.viewer.util.FeatureToJson.MAX_FEATURES;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.feature.FeatureIterator;
import org.geotools.filter.text.cql2.CQLException;
import org.geotools.filter.text.ecql.ECQL;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;

/**
 * Parser for creating valid cql filters, even when passing the invented APPLAYER filter.
 * The APPLAYER filter is used to filter layer1 based on feature from layer2.
 * Definition of the APPLAYER filter:
 * APPLAYER(geom,applayerid,filter)
 * geom: the geometry on which the geometries from applayerid and filter should work
 * applayerid: the applayerid with a featuresource from which all geometries should be retrieved (and unioned) to create an intersects filter to be applied on the geom column from another layer
 * filter: a cql filter to be applied when retrieving features from applayerid
 * 
 * @author Meine Toonen
 */
public class FlamingoCQL {

    private static final Log LOG = LogFactory.getLog(FlamingoCQL.class);

    private final static String BEGIN_PART = "APPLAYER(";

    public static Filter toFilter(String filter, EntityManager em) throws CQLException {
        filter = processFilter(filter, em);

        return ECQL.toFilter(filter);
    }

    public static String processFilter(String filter, EntityManager em) throws CQLException {
        if (filter.contains(BEGIN_PART)) {
            filter = replaceApplayerFilter(filter, em);
        }
        return filter;
    }

    private static String replaceApplayerFilter(String filter, EntityManager em) throws CQLException {
        //String input = "APPLAYER(the_geom, 1,'')";
        // zoek index op van APPLAYER(
        // ga naar rechts in de string tot einde string of foundOpenBrackets == foundClosingBrackets
        // tel alle openhaakjes op
        // zoek alle sluithaakjes
        int begin = filter.indexOf(BEGIN_PART);
        int startIndex = begin + BEGIN_PART.length();
        int closingBrackets = 0;
        int openBrackets = 1;
        int endIndex = 0;

        for (int i = startIndex; i < filter.length(); i++) {
            char c = filter.charAt(i);
            if (c == '(') {
                openBrackets++;
            }
            if (c == ')') {
                closingBrackets++;
            }
            if (openBrackets == closingBrackets) {
                endIndex = i;
                break;
            }
        }
        // Part with the APPLAYER filter, possibly with nested APPLAYER/GEOMETRY/ATTRIBUTE filters
        String appLayerPart = filter.substring(startIndex, endIndex);

        // call recursively to parse out all the nested applayer filters
        appLayerPart = processFilter(appLayerPart, em);

        // Rewrite APPLAYER filter to GEOMETRY filter, so it can be used for filtering other features
        String geometryFilter = rewriteAppLayerFilter(appLayerPart, em);

        String beginpart = filter.substring(0, begin);
        String endpart = filter.substring(endIndex + 1);
        String result = beginpart + geometryFilter + endpart;
        return result;
    }

    private static String rewriteAppLayerFilter(String applayerfilter, EntityManager em) throws CQLException {
        int firstIndex = applayerfilter.indexOf(", ");
        int secondIndex = applayerfilter.indexOf(",", firstIndex + 1);

        String attribute = applayerfilter.substring(0, firstIndex);
        String appLayerId = applayerfilter.substring(firstIndex + 1, secondIndex);
        String filter = applayerfilter.substring(secondIndex + 1);
        
        filter = filter.trim();
        appLayerId = appLayerId.trim();
        Long id = Long.parseLong(appLayerId);
        
        String geom = getUnionedFeatures(filter, id, em);
        String nieuwFilter = "intersects (" + attribute + ", " + geom + ")";
        return nieuwFilter;
    }

    private static String getUnionedFeatures(String filter, Long appLayerId, EntityManager em) throws CQLException {
        try {
            ApplicationLayer al = em.find(ApplicationLayer.class, appLayerId);

            GeoService gs = al.getService();
            Layer l = gs.getLayer(al.getLayerName(), em);

            if (l.getFeatureType() == null) {
                throw new Exception("Layer has no feature type");
            }

            FeatureSource fs = l.getFeatureType().openGeoToolsFeatureSource();
            GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 28992);

            Query q = new Query(fs.getName().toString());
            if (filter != null && !filter.isEmpty()) {
                Filter attributeFilter = ECQL.toFilter(filter);
                attributeFilter = (Filter) attributeFilter.accept(new ChangeMatchCase(false), null);

                q.setFilter(attributeFilter);
            }

            q.setMaxFeatures(MAX_FEATURES);

            FeatureIterator<SimpleFeature> it = fs.getFeatures(q).features();

            try {
                Geometry gc = new GeometryCollection(null, gf);
                while (it.hasNext()) {
                    SimpleFeature f = it.next();
                    Geometry g = (Geometry) f.getDefaultGeometry();
                    if (g != null) {
                        gc = gc.union(g);
                    }
                }

                return gc.union().toText();

            } finally {
                it.close();
                fs.getDataStore().dispose();
            }
        } catch (Exception ex) {
            LOG.error("retrieving geometry for intersects filter in flamingoCQL failed: " + ex);
        }
        return null;
    }
}
