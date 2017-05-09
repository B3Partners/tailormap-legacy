/*
 * Copyright (C) 2013-2017 B3Partners B.V.
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

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.FeatureTypeRelation;
import nl.b3p.viewer.config.services.FeatureTypeRelationKey;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import static nl.b3p.viewer.stripes.FeatureInfoActionBean.FID;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.data.wfs.WFSDataStore;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.factory.GeoTools;
import org.geotools.feature.FeatureIterator;
import org.geotools.filter.text.cql2.CQL;
import org.geotools.filter.visitor.SimplifyingFilterVisitor;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.filter.sort.SortBy;
import org.opengis.filter.sort.SortOrder;

/**
 *
 * @author Roy Braam
 */


public class FeatureToJson {
    public static final int MAX_FEATURES = 1000;
    private boolean arrays = false;
    private boolean edit = false;
    private boolean graph = false;
    private boolean aliases = true;
    private List<Long> attributesToInclude = new ArrayList();
    private static final int TIMEOUT = 5000;
    private FilterFactory2 ff2 = CommonFactoryFinder.getFilterFactory2(GeoTools.getDefaultHints());

    public FeatureToJson(boolean arrays,boolean edit){
        this.arrays=arrays;
        this.edit=edit;
    }

    public FeatureToJson(boolean arrays, boolean edit, boolean graph, List<Long> attributesToInclude) {
        this.arrays=arrays;
        this.edit=edit;
        this.graph = graph;
        this.attributesToInclude=attributesToInclude;
    }

    public FeatureToJson(boolean arrays, boolean edit, boolean graph, boolean aliases, List<Long> attributesToInclude) {
        this.arrays = arrays;
        this.edit = edit;
        this.graph = graph;
        this.attributesToInclude = attributesToInclude;
        this.aliases = aliases;
    }

    /**
     * Get the features as JSONArray with the given params
     * @param al The application layer(if there is a application layer)
     * @param ft The featuretype that must be used to get the features
     * @param fs The featureSource
     * @param q  The query
     * @param sort The attribute name that is used to sort
     * @param dir Sort direction (DESC or ASC)
     * @return JSONArray with features.
     * @throws IOException if any
     * @throws JSONException if transforming to json fails
     * @throws Exception if any
     */
    public JSONArray getJSONFeatures(ApplicationLayer al,SimpleFeatureType ft, FeatureSource fs, Query q, String sort, String dir) throws IOException, JSONException, Exception{
        Map<String,String> attributeAliases = new HashMap<String,String>();
        if(!edit) {
            for(AttributeDescriptor ad: ft.getAttributes()) {
                if(ad.getAlias() != null) {
                    attributeAliases.put(ad.getName(), ad.getAlias());
                }
            }
        }
        List<String> propertyNames;
        if(al != null) {
            propertyNames = this.setPropertyNames(al, q, ft,edit);
        } else {
            propertyNames = new ArrayList<String>();
            for(AttributeDescriptor ad: ft.getAttributes()) {
                propertyNames.add(ad.getName());
            }
        }
        
        if (sort!=null){
            setSortBy(q, propertyNames, sort, dir);
        }
        /* Use the first property as sort field, otherwise geotools while give a error when quering
         * a JDBC featureType without a primary key.
         */
        else if ( (fs instanceof org.geotools.jdbc.JDBCFeatureSource || fs.getDataStore() instanceof WFSDataStore ) && !propertyNames.isEmpty()){
            setSortBy(q, propertyNames.get(0),dir);
        }
        Integer start = q.getStartIndex();
        if (start==null){
            start=0;
        }
        boolean offsetSupported = fs.getQueryCapabilities().isOffsetSupported();
        //if offSet is not supported, get more features (start + the wanted features)
        if (!offsetSupported && q.getMaxFeatures() < MAX_FEATURES || fs.getDataStore() instanceof WFSDataStore){
            q.setMaxFeatures(q.getMaxFeatures()+start);
        }
        FeatureIterator<SimpleFeature> it = null;
        JSONArray features = new JSONArray();
        try{
            it=fs.getFeatures(q).features();
            int featureIndex=0;
            while(it.hasNext()){
                SimpleFeature feature = it.next();
                /* if offset not supported and there are more features returned then
                 * only get the features after index >= start*/
                if (offsetSupported || featureIndex >= start){
                    JSONObject j = this.toJSONFeature(new JSONObject(),feature,ft,al,propertyNames,attributeAliases,0);
                    features.put(j);
                }
                featureIndex++;
            }
        }finally{
            if (it!=null){
                it.close();
            }
            fs.getDataStore().dispose();
        }
        return features;
    }

    private JSONObject toJSONFeature(JSONObject j,SimpleFeature f, SimpleFeatureType ft, ApplicationLayer al, List<String> propertyNames,Map<String,String> attributeAliases, int index) throws JSONException, Exception{
        if(arrays) {
            for(String name: propertyNames) {
                Object value = f.getAttribute(name);
                j.put("c" + index++, formatValue(value));
            }
        } else {
            for (String name : propertyNames) {
                if (!aliases) {
                    j.put(name, formatValue(f.getAttribute(name)));
                } else {
                    String alias = null;
                    if (attributeAliases != null) {
                        alias = attributeAliases.get(name);
                    }
                    j.put(alias != null ? alias : name, formatValue(f.getAttribute(name)));
                }
            }
        }
        //if edit and not yet set
        // removed check for edit variable here because we need to compare features in edit component and feature info attributes
        // was if(edit && j.optString(FID,null)==null) {
        if(j.optString(FID,null)==null) {
            String id = f.getID();
            j.put(FID, id);
        }
        if (ft.hasRelations()){
            j = populateWithRelatedFeatures(j,f,ft,al,index);
        }
        return j;
    }
    /**
     * Populate the json object with related featues
     */
    private JSONObject populateWithRelatedFeatures(JSONObject j,SimpleFeature feature,SimpleFeatureType ft,ApplicationLayer al, int index) throws Exception{
        if (ft.hasRelations()){
            JSONArray related_featuretypes = new JSONArray();
            for (FeatureTypeRelation rel :ft.getRelations()){
                boolean isJoin=rel.getType().equals(FeatureTypeRelation.JOIN);
                if (isJoin){
                    FeatureSource foreignFs = rel.getForeignFeatureType().openGeoToolsFeatureSource(TIMEOUT);
                    FeatureIterator<SimpleFeature> foreignIt=null;
                    try{
                        Query foreignQ = new Query(foreignFs.getName().toString());
                        //create filter
                        Filter filter = createFilter(feature,rel);
                        if (filter==null){
                            continue;
                        }
                        //if join only get 1 feature
                        foreignQ.setMaxFeatures(1);
                        foreignQ.setFilter(filter);
                        //set propertynames
                        List<String> propertyNames;
                        if (al!=null){
                            propertyNames=setPropertyNames(al, foreignQ, rel.getForeignFeatureType(), edit);
                        }else{
                            propertyNames = new ArrayList<String>();
                            for(AttributeDescriptor ad: rel.getForeignFeatureType().getAttributes()) {
                                propertyNames.add(ad.getName());
                            }
                        }
                        if (propertyNames.isEmpty()) {
                            // if there are no properties to retrieve just get out
                            continue;
                        }
                        //get aliases
                        Map<String,String> attributeAliases = new HashMap<String,String>();
                        if(!edit) {
                            for(AttributeDescriptor ad: rel.getForeignFeatureType().getAttributes()) {
                                if(ad.getAlias() != null) {
                                    attributeAliases.put(ad.getName(), ad.getAlias());
                                }
                            }
                        }
                        //Get Feature and populate JSON object with the values.
                        foreignIt=foreignFs.getFeatures(foreignQ).features();
                        while (foreignIt.hasNext()){
                            SimpleFeature foreignFeature = foreignIt.next();
                            //join it in the same json
                            j= toJSONFeature(j,foreignFeature, rel.getForeignFeatureType(), al,propertyNames,attributeAliases,index);
                        }
                    }finally{
                        if (foreignIt!=null){
                            foreignIt.close();
                        }
                        foreignFs.getDataStore().dispose();
                    }
                }else{
                    Filter filter = createFilter(feature,rel);
                    if (filter==null){
                        continue;
                    }
                    JSONObject related_ft = new JSONObject();
                    related_ft.put("filter", CQL.toCQL(filter));
                    related_ft.put("id",rel.getForeignFeatureType().getId());
                    related_ft.put("foreignFeatureTypeName",rel.getForeignFeatureType().getTypeName());
                    related_featuretypes.put(related_ft);
                }
            }
            if (related_featuretypes.length()>0){
                j.put("related_featuretypes",related_featuretypes);
            }
        }
        return j;
    }

    HashMap<Long,List<String>> propertyNamesQueryCache = new HashMap<Long,List<String>>();
    HashMap<Long,Boolean> haveInvisiblePropertiesCache = new HashMap<Long,Boolean>();
    HashMap<Long,List<String>> propertyNamesReturnCache = new HashMap<Long,List<String>>();
    /**
     * Get the propertynames and add the needed propertynames to the query.
     */
    private List<String> setPropertyNames(ApplicationLayer appLayer, Query q, SimpleFeatureType sft,boolean edit) {
        List<String> propertyNames = new ArrayList<String>();
        boolean haveInvisibleProperties = false;
        if (propertyNamesQueryCache.containsKey(sft.getId())){
            haveInvisibleProperties= haveInvisiblePropertiesCache.get(sft.getId());
            if(haveInvisibleProperties){
                q.setPropertyNames(propertyNamesQueryCache.get(sft.getId()));
            }
            return propertyNamesReturnCache.get(sft.getId());
        }else{
            for(ConfiguredAttribute ca: appLayer.getAttributes(sft)) {
                if((!edit && !graph && ca.isVisible()) || (edit && ca.isEditable()) || (graph && attributesToInclude.contains(ca.getId()))) {
                    propertyNames.add(ca.getAttributeName());
                } else {
                    haveInvisibleProperties = true;
                }
            }
            haveInvisiblePropertiesCache.put(sft.getId(),haveInvisibleProperties);
            propertyNamesReturnCache.put(sft.getId(),propertyNames);
            propertyNamesQueryCache.put(sft.getId(),propertyNames);
            if(haveInvisibleProperties) {
                // By default Query retrieves Query.ALL_NAMES
                // Query.NO_NAMES is an empty String array
                q.setPropertyNames(propertyNames);
                // If any related featuretypes are set, add the leftside names in the query
                // don't add them to propertynames, maybe they are not visible
                if (sft.getRelations()!=null){
                    List<String> withRelations= new ArrayList<String>();
                    withRelations.addAll(propertyNames);
                    for (FeatureTypeRelation ftr : sft.getRelations()){
                        if (ftr.getRelationKeys()!=null){
                            for (FeatureTypeRelationKey key : ftr.getRelationKeys()){
                                if (!withRelations.contains(key.getLeftSide().getName())){
                                    withRelations.add(key.getLeftSide().getName());
                                }
                            }
                        }
                    }
                    propertyNamesQueryCache.put(sft.getId(), withRelations);
                    q.setPropertyNames(withRelations);
                }
            }
            propertyNamesReturnCache.put(sft.getId(),propertyNames);
            return propertyNames;
        }
    }
    /**
     * Set sort in query based on the index of the propertynames list.
     * @param q the query on which the sort is added
     * @param propertyNames a list of propertynames for this featuretype
     * @param sort a Stringified integer. The index of the propertyname
     * @param dir sorting direction DESC or ASC
     */
    private void setSortBy(Query q, List<String> propertyNames, String sort, String dir) {
        if(sort != null) {

            String sortAttribute = null;
            if(arrays) {
                int i = Integer.parseInt(sort.substring(1));

                int j = 0;
                for(String name: propertyNames) {
                    if(j == i) {
                        sortAttribute = name;
                        break;
                    }
                    j++;
                }
            } else {
                sortAttribute = sort;
            }
            this.setSortBy(q,sortAttribute,dir);
        }
    }
    /**
     * Set sort on query
     * @param q the query on which the sort is added
     * @param sort the name of the sort column
     * @param dir sorting direction DESC or ASC
     */
    private void setSortBy(Query q,String sort, String dir){

        if(sort != null) {
            q.setSortBy(new SortBy[] {
                ff2.sort(sort, "DESC".equals(dir) ? SortOrder.DESCENDING : SortOrder.ASCENDING)
            });
        }

    }

    private DateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");

    private Object formatValue(Object value) {
        if(value instanceof Date) {
            // JSON has no date type so format the date as it is used for
            // display, not calculation
            return dateFormat.format((Date)value);
        } else {
            return value;
        }
    }

    private Filter createFilter(SimpleFeature feature,FeatureTypeRelation rel) {
        List<Filter> filters = new ArrayList<Filter>();
        for (FeatureTypeRelationKey key : rel.getRelationKeys()){
            AttributeDescriptor rightSide = key.getRightSide();
            AttributeDescriptor leftSide = key.getLeftSide();
            Object value= feature.getAttribute(leftSide.getName());
            if (value==null){
                continue;
            }
            if (AttributeDescriptor.GEOMETRY_TYPES.contains(rightSide.getType()) &&
                    AttributeDescriptor.GEOMETRY_TYPES.contains(leftSide.getType())){
                filters.add(ff2.not(ff2.isNull(ff2.property(rightSide.getName()))));
                filters.add(ff2.intersects(ff2.property(rightSide.getName()),ff2.literal(value)));
            }else{
                filters.add(ff2.equals(ff2.property(rightSide.getName()),ff2.literal(value)));
            }
        }
        if (filters.size()>1){
            return ff2.and(filters);
        }else if (filters.size()==1){
            return filters.get(0);
        }else{
            return null;
        }
    }

    /**
     *
     * Optimze and reformat filter. Delegates to
     * {@link #reformatFilter(org.opengis.filter.Filter, nl.b3p.viewer.config.services.SimpleFeatureType, boolean)}
     * with the {@code includeRelations} set to {@code true}.
     *
     * @param filter the filter to process
     * @param ft featuretype to apply filter
     * @return reformatted / optimised filter
     * @throws Exception if any
     * @see #reformatFilter(org.opengis.filter.Filter,
     * nl.b3p.viewer.config.services.SimpleFeatureType, boolean)
     */
    public static Filter reformatFilter(Filter filter, SimpleFeatureType ft) throws Exception {
        return reformatFilter(filter, ft, true);
    }

    /**
     * Optimze and reformat filter.
     *
     * @param filter the filter to process
     * @param ft featuretype to apply filter
     * @param includeRelations whether to include related (joined) data
     * @return reformatted / optimised filter
     * @throws Exception if any
     */
    public static Filter reformatFilter(Filter filter, SimpleFeatureType ft, boolean includeRelations) throws Exception {
        if (Filter.INCLUDE.equals(filter) || Filter.EXCLUDE.equals(filter)) {
            return filter;
        }
        if (includeRelations) {
            for (FeatureTypeRelation rel : ft.getRelations()) {
                if (FeatureTypeRelation.JOIN.equals(rel.getType())) {
                    filter = reformatFilter(filter, rel.getForeignFeatureType(), includeRelations);
                    filter = (Filter) filter.accept(new ValidFilterExtractor(rel), filter);
                }
            }
        }
        filter = (Filter) filter.accept(new SimplifyingFilterVisitor(), null);
        return filter;
    }

}
