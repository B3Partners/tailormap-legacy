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

import nl.b3p.viewer.config.services.*;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryCollection;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import javax.persistence.EntityManager;
import nl.b3p.viewer.config.app.ApplicationLayer;

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

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

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

    private final static String BEGIN_APPLAYER_PART = "APPLAYER(";
    private final static String BEGIN_RELATED_PART = "RELATED_LAYER(";

    public static Filter toFilter(String filter, EntityManager em) throws CQLException {
        return toFilter(filter, em, true);
    }

    public static Filter toFilter(String filter, EntityManager em, boolean simplify) throws CQLException {
        filter = processFilter(filter, em, simplify);

        return getFilter(filter, em);
    }

    private static String processFilter(String filter, EntityManager em, boolean simplify) throws CQLException {
        if (filter.contains(BEGIN_APPLAYER_PART)) {
            filter = replaceApplayerFilter(filter, em);
        }

        if(simplify && filter.contains(BEGIN_RELATED_PART)){
            filter = replaceRelatedFilter(filter, em);
        }
        return filter;
    }

    private static Filter getFilter(String filter, EntityManager em) throws CQLException {
        Filter f = null;
        if(filter.contains(BEGIN_RELATED_PART)){
            f = createSubselect(filter, em);
        }else {
            f =  ECQL.toFilter(filter);
        }

        return f;
    }

    private static Subselect createSubselect(String filter, EntityManager em) throws CQLException {
        FeatureTypeRelation relation = FlamingoCQL.parseSubselectFilter(filter, em);
        SimpleFeatureType subSft = relation.getForeignFeatureType();
        FeatureTypeRelationKey key = relation.getRelationKeys().get(0);
        String relatedColumn = key.getRightSide().getName();
        String mainColumn = key.getLeftSide().getName();
        String relatedTable = subSft.getTypeName();

        Filter relatedFilter = FlamingoCQL.toFilter(retrieveRelatedFilter(filter), em, false);
        Subselect s = new Subselect(relatedFilter, relatedColumn, mainColumn, relatedTable);
        return s;

    }

    private static String retrieveRelatedFilter (String filter){
        int endSubFilter = filter.lastIndexOf(",");
        String relatedFilterString = filter.substring(endSubFilter + 1, filter.indexOf(";"));
        return relatedFilterString;
    }

    private static FeatureTypeRelation parseSubselectFilter(String filter, EntityManager em) throws CQLException {
             /*
          RELATED_LAYER(<LAYERID_MAIN>, <SIMPLEFEATURETYPEID_SUB>, <FILTER>)
                LAYERID_MAIN number  id of application layer (!) main layer in tailormap db: on this layer the filter will be set
                SIMPLEFEATURETYPEID_SUB number  id of related simplefeaturetype in tailormap db
                FILTER: string  FlamingoCQL filter

			haal featuretype op
                haal relations op
                 check of in relations of LAYERID_MAIN er is (zo nee, crash)

                haal met behulp van de relatie de kolom uit main op waar de relatie op ligt: kolom_main
                haal met behulp van de relatie de kolom uit sub op waar de relatie op ligt: kolom_sub
                maak filter op LAYER_SUB, en haal alle values voor kolom_sub op: values
         */
        int beginPartLength = BEGIN_RELATED_PART.length();
        int endMainLayer = filter.indexOf( ",",beginPartLength +1);
        int endSubLayer = filter.indexOf( ",",endMainLayer +1);
       if(endMainLayer == - 1 || endSubLayer == -1 ){
            throw new CQLException("Related layer filter incorrectly formed. Must be of form: RELATED_LAYER(<LAYERID_MAIN>, <SIMPLEFEATURETYPEID_SUB>, <FILTER>)");
        }
        String appLayerIdMain = filter.substring(beginPartLength, endMainLayer);
        String layerIdSub = filter.substring(endMainLayer+1, endSubLayer);

        if(appLayerIdMain.isEmpty() || layerIdSub.isEmpty() ){
            throw new CQLException("Related layer filter incorrectly formed. Must be of form: RELATED_LAYER(<LAYERID_MAIN>, <SIMPLEFEATURETYPEID_SUB>, <FILTER>)");
        }
        appLayerIdMain = appLayerIdMain.trim();
        layerIdSub = layerIdSub.trim();
        try {

            ApplicationLayer appLayer = em.find(ApplicationLayer.class, Long.parseLong(appLayerIdMain));
            SimpleFeatureType sub = em.find(SimpleFeatureType.class, Long.parseLong(layerIdSub));
            Layer main = appLayer.getService() == null ? null : appLayer.getService().getLayer(appLayer.getLayerName(), em);
            List<FeatureTypeRelation> rels = main.getFeatureType().getRelations();
            AtomicReference<FeatureTypeRelation> atomRel = new AtomicReference<>();
            rels.forEach(rel -> {
                if (rel.getForeignFeatureType().getId().equals(sub.getId())) {
                    atomRel.set(rel);
                }
            });

            if(atomRel.get() == null){
                throw new CQLException("Applicationlayer does not have a relation");
            }
            return atomRel.get();
        }catch (NumberFormatException nfe){
            throw new CQLException("Related layer filter incorrectly formed. Ids are not parsable to Longs. Must be of form: RELATED_LAYER(<LAYERID_MAIN>, <SIMPLEFEATURETYPEID_SUB>, <FILTER>)");
        }
    }

    private static String replaceRelatedFilter(String filter, EntityManager em) throws CQLException {
        FeatureTypeRelation relation = FlamingoCQL.parseSubselectFilter(filter, em);
        FeatureTypeRelationKey key = relation.getRelationKeys().get(0);
        String relatedFilter= retrieveRelatedFilter(filter);

        List<Object> ids = FlamingoCQL.getFIDSFromRelatedFeatures(relation.getForeignFeatureType(), relatedFilter, key.getRightSide().getName());
        String cql;
        if(ids.isEmpty()){
            cql = "1 = 0";
            return cql;
        }
        cql = key.getLeftSide().getName();
        cql += " IN (";
        CharSequence cs = ",";
        String escapChar = key.getLeftSide().getType().equals("string") ? "'" : "";
        for (Object id: ids) {

            cql += escapChar + id + escapChar + ",";
        }
        cql = cql.substring(0, cql.length() - 1);
        cql += ")";
        return cql;
    }

    private static List<Object> getFIDSFromRelatedFeatures(SimpleFeatureType sft, String filter, String column){
        List<Object> fids = new ArrayList<>();
        try {
            FeatureSource fs = sft.openGeoToolsFeatureSource();

            Query q = new Query(fs.getName().toString());
            if (filter != null && !filter.isEmpty()) {
                Filter attributeFilter = ECQL.toFilter(filter);
                attributeFilter = (Filter) attributeFilter.accept(new ChangeMatchCase(false), null);

                q.setFilter(attributeFilter);
            }

            q.setMaxFeatures(MAX_FEATURES);

            FeatureIterator<SimpleFeature> it = fs.getFeatures(q).features();

            try {
                while (it.hasNext()) {
                    SimpleFeature f = it.next();
                    fids.add(f.getAttribute(column));

                }

                return fids;

            } finally {
                it.close();
                fs.getDataStore().dispose();
            }
        } catch (Exception ex) {
            LOG.error("retrieving fids for RELATED_LAYER filter in flamingoCQL failed: " + ex);
        }

        return fids;
    }

    private static String replaceApplayerFilter(String filter, EntityManager em) throws CQLException {
        //String input = "APPLAYER(the_geom, 1,'')";
        // zoek index op van APPLAYER(
        // ga naar rechts in de string tot einde string of foundOpenBrackets == foundClosingBrackets
        // tel alle openhaakjes op
        // zoek alle sluithaakjes
        int begin = filter.indexOf(BEGIN_APPLAYER_PART);
        int startIndex = begin + BEGIN_APPLAYER_PART.length();
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
        appLayerPart = processFilter(appLayerPart, em, true);

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
