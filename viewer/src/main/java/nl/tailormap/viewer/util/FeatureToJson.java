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
package nl.tailormap.viewer.util;

import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.config.app.ApplicationLayer;
import nl.tailormap.viewer.config.app.ConfiguredAttribute;
import nl.tailormap.viewer.config.services.AttributeDescriptor;
import nl.tailormap.viewer.config.services.FeatureTypeRelation;
import nl.tailormap.viewer.config.services.FeatureTypeRelationKey;
import nl.tailormap.viewer.config.services.SimpleFeatureType;
import nl.tailormap.viewer.helpers.featuresources.FeatureSourceFactoryHelper;
import nl.tailormap.viewer.stripes.FileUploadActionBean;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.data.wfs.WFSDataStore;
import org.geotools.feature.FeatureIterator;
import org.geotools.filter.text.cql2.CQL;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static nl.tailormap.viewer.stripes.FeatureInfoActionBean.FID;

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
    /**
     * Set to {@code true} to return an JSONArray with attributes per feature instead of JSONObject to maintain order of attributes
     */
    private boolean ordered = false;
    /**
     * set to {@code true} to return empty string for null value.
     */
    private boolean returnNullval = false;
    private List<Long> attributesToInclude = new ArrayList();
    private static final int TIMEOUT = 5000;

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

    public FeatureToJson(boolean arrays, boolean edit, boolean graph, boolean aliases, boolean returnNullval, List<Long> attributesToInclude) {
        this.arrays = arrays;
        this.edit = edit;
        this.graph = graph;
        this.attributesToInclude = attributesToInclude;
        this.aliases = aliases;
        this.returnNullval = returnNullval;
    }

    /**
     *
     * @param arrays {@code true} when???
     * @param edit {@code true} to return editable data
     * @param graph {@code true} when??
     * @param aliases {@code true} to return aliases in the response
     * @param returnNullval {@code true} to return empty string for null value
     * @param attributesToInclude List of attributes to return in the response
     * @param ordered {@code true} to return an JSONArray with attributes per
     * feature instead of JSONObject to maintain order of attributes
     */
    public FeatureToJson(boolean arrays, boolean edit, boolean graph, boolean aliases, boolean returnNullval, List<Long> attributesToInclude, boolean ordered) {
        this.arrays = arrays;
        this.edit = edit;
        this.graph = graph;
        this.attributesToInclude = attributesToInclude;
        this.aliases = aliases;
        this.returnNullval = returnNullval;
        this.ordered = ordered;
    }

    /**
     * Get the features, unsorted, as JSONArray with the given params.
     *
     * @param al The application layer(if there is a application layer)
     * @param ft The featuretype that must be used to get the features
     * @param fs The featureSource
     * @param q The query
     * @param em The entitymanager of the session, for retrieving uploads
     * @param application The application from which this request originates
     * @param request The current request to look if the user has rights to view the uploads
     * @return JSONArray with features.
     * @throws IOException if any
     * @throws JSONException if transforming to json fails
     * @throws Exception if any
     *
     * @see #getJSONFeatures(ApplicationLayer,
     * SimpleFeatureType,
     * org.geotools.data.FeatureSource, org.geotools.data.Query,
     * java.lang.String, java.lang.String, javax.persistence.EntityManager, Application, HttpServletRequest)
     */
    public JSONArray getJSONFeatures(ApplicationLayer al, SimpleFeatureType ft, FeatureSource fs, Query q, EntityManager em, Application application, HttpServletRequest request) throws IOException, JSONException, Exception {
        return this.getJSONFeatures(al, ft, fs, q, null, null, em, application,request);
    }

    /**
     * Get the features, optionally sorted, as JSONArray with the given params.
     * <strong>Note</strong> that the FeatureSource fs will be closed and
     * disposed.
     *
     * @param al The application layer(if there is a application layer)
     * @param ft The featuretype that must be used to get the features
     * @param fs The featureSource
     * @param q  The query
     * @param sort The attribute name that is used to sort
     * @param dir Sort direction (DESC or ASC)
     * @param em entitymanager
     * @param application the application for the feature
     * @param request http request used for retrieving features
     * @return JSONArray with features.
     * @throws IOException if any
     * @throws JSONException if transforming to json fails
     * @throws Exception if any
     */
    public JSONArray getJSONFeatures(ApplicationLayer al, SimpleFeatureType ft, FeatureSource fs, Query q, String sort, String dir, EntityManager em, Application application, HttpServletRequest request) throws IOException, JSONException, Exception{
        Map<String,String> attributeAliases = new HashMap<>();
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
            propertyNames = new ArrayList<>();
            for(AttributeDescriptor ad: ft.getAttributes()) {
                propertyNames.add(ad.getName());
            }
        }

        setSort(q, propertyNames, sort, dir, ft, fs);
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
                    JSONObject uploads = null;
                    if (al != null
                            && al.getDetails().containsKey("summary.retrieveUploads")
                            && Boolean.parseBoolean(al.getDetails().get("summary.retrieveUploads").getValue())
                            && application != null && request != null) {
                        // 'al' can be null when this method is called from DirectSearch
                        uploads = FileUploadActionBean.retrieveUploads(feature.getID(), al,em, application, request);
                    }
                    JSONObject jsonFeature = new JSONObject();
                    jsonFeature.put("__UPLOADS__", uploads);
                    if(this.ordered) {
                        JSONArray j = this.toJSONFeatureOrdered(jsonFeature,feature,ft,al,propertyNames,attributeAliases,0, true, null);
                        features.put(j);
                    } else {
                        JSONObject j = this.toJSONFeature(jsonFeature,feature,ft,al,propertyNames,attributeAliases,0, true, null);
                        features.put(j);
                    }
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

    private JSONObject toJSONFeature(JSONObject j,SimpleFeature f, SimpleFeatureType ft, ApplicationLayer al, List<String> propertyNames,Map<String,String> attributeAliases, int index, boolean findNextRelations, SimpleFeatureType head) throws JSONException, Exception{
        if(arrays) {
            for(String name: propertyNames) {
                Object value = f.getAttribute(name);
                j.put("c" + index++, formatValue(value));
            }
        } else {
            for (String name : propertyNames) {
                this.addKeyValue(j, f, name, attributeAliases);
            }
        }
        //if edit and not yet set
        // removed check for edit variable here because we need to compare features in edit component and feature info attributes
        // was if(edit && j.optString(FID,null)==null) {
        if(j.optString(FID,null)==null) {
            String id = f.getID();
            j.put(FID, id);
        }
        if (ft.hasRelations() && findNextRelations){
            if (head == null) {
                j = populateWithRelatedFeatures(j,f,ft,al,index, null, ft);
            } else if (!head.getTypeName().equals(ft.getTypeName())) {
                j = populateWithRelatedFeatures(j,f,ft,al,index, null, head);
            }
        }
        return j;
    }

    private JSONArray toJSONFeatureOrdered(JSONObject j,SimpleFeature f, SimpleFeatureType ft, ApplicationLayer al, List<String> propertyNames,Map<String,String> attributeAliases, int index, boolean findNextRelations, SimpleFeatureType head) throws JSONException, Exception{
        JSONArray ordered = new JSONArray();
        ordered.put(j);
        for (String name : propertyNames) {
            ordered.put(this.addKeyValue(new JSONObject(), f, name, attributeAliases));
        }
        if(!FeaturePropertiesArrayHelper.containsKey(ordered, FID)) {
            JSONObject fidObject = new JSONObject();
            String id = f.getID();
            fidObject.put(FID, id);
            ordered.put(fidObject);
        }
        if (ft.hasRelations() && findNextRelations){
            if (head == null) {
                populateWithRelatedFeatures(j,f,ft,al,index, ordered, ft);
            } else if (!head.getTypeName().equals(ft.getTypeName())) {
                populateWithRelatedFeatures(j,f,ft,al,index, ordered, head);
            }
        }
        return ordered;
    }

    private JSONObject addKeyValue(JSONObject j, SimpleFeature f, String name, Map<String,String> attributeAliases) {
        String alias = name;
        if (aliases && attributeAliases != null && attributeAliases.get(name)!=null) {
            alias = attributeAliases.get(name);
        }
        j.put(alias, formatValue(f.getAttribute(name)));
        return j;
    }

    /**
     * Populate the json object with related featues
     */
    private JSONObject populateWithRelatedFeatures(JSONObject j,SimpleFeature feature,SimpleFeatureType ft,ApplicationLayer al, int index, JSONArray ordered, SimpleFeatureType head) throws Exception{
        if (ft.hasRelations()){
            JSONArray related_featuretypes = new JSONArray();
            for (FeatureTypeRelation rel :ft.getRelations()){
                boolean isJoin=rel.getType().equals(FeatureTypeRelation.JOIN);
                if (isJoin){
                    FeatureSource foreignFs = FeatureSourceFactoryHelper.openGeoToolsFeatureSource(rel.getForeignFeatureType(), TIMEOUT);
                    FeatureIterator<SimpleFeature> foreignIt=null;
                    try{
                        Query foreignQ = new Query(foreignFs.getName().toString());
                        //create filter
                        Filter filter = FilterHelper.createFilter(feature,rel);
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
                            if(ordered == null) {
                                j = toJSONFeature(j, foreignFeature, rel.getForeignFeatureType(), al, propertyNames, attributeAliases, index, rel.isSearchNextRelation(), head);
                            } else {
                                this.concatArray(ordered, toJSONFeatureOrdered(j, foreignFeature, rel.getForeignFeatureType(), al, propertyNames, attributeAliases, index, rel.isSearchNextRelation(), head));
                            }
                        }
                    }finally{
                        if (foreignIt!=null){
                            foreignIt.close();
                        }
                        foreignFs.getDataStore().dispose();
                    }
                }else{
                    Filter filter = FilterHelper.createFilter(feature,rel);
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
                if(ordered == null) {
                    j.put("related_featuretypes",related_featuretypes);
                } else {
                    JSONObject relatedFeatures = new JSONObject();
                    relatedFeatures.put("related_featuretypes", related_featuretypes);
                    ordered.put(relatedFeatures);
                }
            }
        }
        return j;
    }

    private void concatArray(JSONArray arr1, JSONArray arr2) throws JSONException {
        for (int i = 0; i < arr2.length(); i++) {
            arr1.put(arr2.get(i));
        }
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
    private void setSort(Query q, List<String> propertyNames, String sort, String dir, SimpleFeatureType ft, FeatureSource fs) {
        String sortAttribute = null;
        if (sort != null) {
            if (arrays) {
                int i = Integer.parseInt(sort.substring(1));

                int j = 0;
                for (String name : propertyNames) {
                    if (j == i) {
                        sortAttribute = name;
                        break;
                    }
                    j++;
                }
            } else {
                sortAttribute = sort;
            }
        } else {
            /* Use the first property as sort field, otherwise geotools while give a error when quering
             * a featureType without a primary key.
             */
            if ((fs instanceof org.geotools.jdbc.JDBCFeatureSource || fs.getDataStore() instanceof WFSDataStore) && !propertyNames.isEmpty()) {
                int index = 0;
                if (fs.getSchema().getGeometryDescriptor() != null && fs.getSchema().getGeometryDescriptor().getLocalName().equals(propertyNames.get(0))) {
                    if (propertyNames.size() > 1) {
                        index = 1;
                    } else {
                        index = -1;
                    }
                }
                if (index != -1) {
                    sortAttribute = propertyNames.get(index);
                } else if (index == -1 && fs.getSchema().getGeometryDescriptor() != null && fs.getSchema().getGeometryDescriptor().getLocalName().equals(propertyNames.get(0))) {
                    // only requested attribute is the geometry, so figure out a non-requested non-geometry attribute for sorting
                    for (AttributeDescriptor attribute : ft.getAttributes()) {
                        if(!attribute.getName().equals(fs.getSchema().getGeometryDescriptor().getLocalName())){
                            sortAttribute = attribute.getName();
                            break;
                        }
                    }
                }
            }
        }
        FilterHelper.setSortBy(q, sortAttribute, dir);
    }

    private DateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");

    private Object formatValue(Object value) {
        if (this.returnNullval && value == null) {
            return "";
        }
        if(value instanceof Date) {
            // JSON has no date type so format the date as it is used for
            // display, not calculation
            return dateFormat.format((Date)value);
        } else {
            return value;
        }
    }

}
