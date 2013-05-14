/*
 * Copyright (C) 2013 B3Partners B.V.
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
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.factory.GeoTools;
import org.geotools.feature.FeatureIterator;
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
    
    private boolean arrays = false;
    private boolean edit = false;
    private static final int TIMEOUT=5000;
    
    public FeatureToJson(boolean arrays,boolean edit){
        this.arrays=arrays;
        this.edit=edit;        
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
     * @throws IOException
     * @throws JSONException
     * @throws Exception 
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
        FeatureIterator<SimpleFeature> it = null;
        JSONArray features = new JSONArray();
        try{                        
            it=fs.getFeatures(q).features();
            while(it.hasNext()){
                SimpleFeature feature = it.next();
                JSONObject j = this.toJSONFeature(new JSONObject(),feature,ft,al,propertyNames,attributeAliases,0);                                            
                if (j!=null){
                    features.put(j);
                }
            }
        }finally{
            it.close();
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
            for(String name: propertyNames) {
                String alias = null;
                if (attributeAliases!=null){
                    alias=attributeAliases.get(name);
                }
                j.put(alias != null ? alias : name, formatValue(f.getAttribute(name)));
            }                     
        }
        //if edit and not yet set
        if(edit && j.optString(FID,null)==null) {
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
            FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();        
            for (FeatureTypeRelation rel :ft.getRelations()){
                boolean isJoin=rel.getType().equals(FeatureTypeRelation.JOIN);

                FeatureSource foreignFs = rel.getForeignFeatureType().openGeoToolsFeatureSource(TIMEOUT);
                FeatureIterator<SimpleFeature> foreignIt=null;
                try{
                    Query foreignQ = new Query(foreignFs.getName().toString());                    
                    //create filter
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
                            filters.add(ff.not(ff.isNull(ff.property(rightSide.getName()))));                            
                            filters.add(ff.intersects(ff.property(rightSide.getName()),ff.literal(value)));
                        }else{
                            filters.add(ff.equals(ff.property(rightSide.getName()),ff.literal(value)));
                        }
                        
                    }
                    if (filters.size()>1){
                        foreignQ.setFilter(ff.and(filters));
                    }else if (filters.size()==1){
                        foreignQ.setFilter(filters.get(0));
                    }else{
                        continue;
                    }
                    if (isJoin){
                        //if join only get 1 feature
                        foreignQ.setMaxFeatures(1);                   
                    }
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
                    JSONArray relatedFeatures = new JSONArray();
                    while (foreignIt.hasNext()){
                        SimpleFeature foreignFeature = foreignIt.next();
                        if(isJoin){
                            //join it in the same json
                            j= toJSONFeature(j,foreignFeature, rel.getForeignFeatureType(), al,propertyNames,attributeAliases,index);
                            
                        }else{
                            //it's a relate
                            JSONObject newJson = toJSONFeature(new JSONObject(), foreignFeature, rel.getForeignFeatureType(),al,propertyNames, attributeAliases,index);                                
                            relatedFeatures.put(newJson);
                        }
                    }
                    if (!isJoin && relatedFeatures.length()>0){
                        j.put("related_features",relatedFeatures);
                    }
                }finally{
                    if (foreignIt!=null){
                        foreignIt.close();
                    }
                    foreignFs.getDataStore().dispose();
                }
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
                if((!edit && ca.isVisible()) || (edit && ca.isEditable())) {
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
     * Set sort order
     */
    private void setSortBy(Query q, List<String> propertyNames, String sort, String dir) {
        FilterFactory2 ff2 = CommonFactoryFinder.getFilterFactory2(GeoTools.getDefaultHints());                
        
        if(sort != null) {

            String sortAttribute = null;
            if(arrays) {
                int i = Integer.parseInt(sort.substring(1));

                int j = 0;
                for(String name: propertyNames) {
                    if(j == i) {
                        sortAttribute = name;
                    }
                    j++;
                }
            } else {
                sortAttribute = sort;
            }
            if(sortAttribute != null) {
                q.setSortBy(new SortBy[] {
                    ff2.sort(sortAttribute, "DESC".equals(dir) ? SortOrder.DESCENDING : SortOrder.ASCENDING)
                });
            }
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
}
