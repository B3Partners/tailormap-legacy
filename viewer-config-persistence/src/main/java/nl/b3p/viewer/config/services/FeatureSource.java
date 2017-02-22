/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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
package nl.b3p.viewer.config.services;

import java.util.*;
import javax.persistence.*;
import org.apache.commons.lang3.mutable.MutableBoolean;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.FeatureCollection;
import org.geotools.filter.text.ecql.ECQL;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.Feature;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.filter.expression.Function;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorColumn(name="protocol")
public abstract class FeatureSource {

    @Id
    private Long id;

    @Basic(optional=false)
    private String name;
    
    @Basic(optional=false)
    private String url;

    private String username;
    private String password;
    
    /**
     * GeoService for which this FeatureSource was automatically created - to
     * enable updating of both at the same time
     */
    @ManyToOne
    private GeoService linkedService;
    
    @ManyToMany(cascade=CascadeType.ALL) // Actually @OneToMany, workaround for HHH-1268
    @JoinTable(inverseJoinColumns=@JoinColumn(name="feature_type"))
    @OrderColumn(name="list_index")
    private List<SimpleFeatureType> featureTypes = new ArrayList<SimpleFeatureType>();

    //<editor-fold defaultstate="collapsed" desc="getters en setters">

    public List<SimpleFeatureType> getFeatureTypes() {
        return featureTypes;
    }

    public void setFeatureTypes(List<SimpleFeatureType> featureTypes) {
        this.featureTypes = featureTypes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public GeoService getLinkedService() {
        return linkedService;
    }

    public void setLinkedService(GeoService linkedService) {
        this.linkedService = linkedService;
    }
    //</editor-fold>

    public String getProtocol() {
        return getClass().getAnnotation(DiscriminatorValue.class).value();
    }    
    
    List<String> calculateUniqueValues(SimpleFeatureType sft, String attributeName, int maxFeatures) throws Exception{
        org.geotools.data.FeatureSource fs = null;
        try {
            FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2(null);
            Function unique = ff.function("Collection_Unique", ff.property(attributeName));
            Filter notNull = ff.not( ff.isNull( ff.property(attributeName) ));
            
            org.geotools.data.Query q = new org.geotools.data.Query(sft.getTypeName(), notNull);
            q.setMaxFeatures(maxFeatures);
            fs = sft.openGeoToolsFeatureSource();
            FeatureCollection fc = fs.getFeatures(q);
            
            Object o = unique.evaluate( fc);
            Set<String> uniqueValues  = (Set<String>)o;
            if(uniqueValues == null){
                uniqueValues = new HashSet<String>();
            }
            List<String> l = new ArrayList<String>(uniqueValues);
            Collections.sort(l);
            return l;
        } catch (Exception ex) {
            throw ex;
        }finally{
            if(fs != null && fs.getDataStore() != null){
                fs.getDataStore().dispose();
            }
        }
    }

    public Map<String, String> getKeyValuePairs(SimpleFeatureType sft, String key, String label, int maxFeatures) throws Exception {
        Map<String, String> output = new TreeMap< String, String>();
        SimpleFeatureSource fs = null;

        try {
            fs = (SimpleFeatureSource) sft.openGeoToolsFeatureSource();

            FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2(null);
            Filter notNull = ff.not(ff.isNull(ff.property(key)));
            org.geotools.data.Query q = new org.geotools.data.Query(sft.getTypeName(), notNull);
            q.setMaxFeatures(maxFeatures);
            q.setPropertyNames(new String[]{key, label});

            SimpleFeatureIterator iterator = fs.getFeatures(q).features();
            try {
                while (iterator.hasNext()) {
                    SimpleFeature f = iterator.next();
                    output.put(
                            f.getAttribute(key).toString(),
                            f.getAttribute(label).toString()
                    );
                }
            } finally {
                iterator.close();
            }
            return output;
        } catch (Exception ex) {
            throw ex;
        } finally {
            if (fs != null && fs.getDataStore() != null) {
                fs.getDataStore().dispose();
            }
        }
    }

    public Object getMaxValue(SimpleFeatureType sft, String attributeName, int maxFeatures) throws Exception {
        org.geotools.data.FeatureSource fs = null;
        try {
            FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2(null);
            Function max = ff.function("Collection_Max", ff.property(attributeName));

            fs = sft.openGeoToolsFeatureSource();
            FeatureCollection fc = fs.getFeatures();
            Object value = max.evaluate(fc);
            return value;
        } catch (Exception ex) {
            throw ex;
        } finally {
            if (fs != null && fs.getDataStore() != null) {
                fs.getDataStore().dispose();
            }
        }
    }

    public Object getMinValue(SimpleFeatureType sft, String attributeName, int maxFeatures) throws Exception {
        org.geotools.data.FeatureSource fs = null;
        try {
            FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2(null);
            Function minFunction = ff.function("Collection_Min", ff.property(attributeName));
            fs = sft.openGeoToolsFeatureSource();
            
            FeatureCollection f = fs.getFeatures();

            Object o = minFunction.evaluate(f);
            return o;
        } catch (Exception ex) {
            throw ex;
        } finally {
            if (fs != null && fs.getDataStore() != null) {
                fs.getDataStore().dispose();
            }
        }
    }
    
    /* package */ abstract org.geotools.data.FeatureSource openGeoToolsFeatureSource(SimpleFeatureType sft) throws Exception;
    
    /* package */ abstract FeatureCollection getFeatures(SimpleFeatureType sft, Filter f, int maxFeatures) throws Exception;
    
    /* package */ abstract org.geotools.data.FeatureSource openGeoToolsFeatureSource(SimpleFeatureType sft, int timeout) throws Exception;

    public SimpleFeatureType getFeatureType(String typeName) {
        for(SimpleFeatureType sft: getFeatureTypes()) {
            if(sft.getTypeName().equals(typeName)) {
                return sft;
            }
        }
        return null;
    }
    
    public SimpleFeatureType addOrUpdateFeatureType(String typeName, SimpleFeatureType newType, MutableBoolean updated) {
        SimpleFeatureType old = getFeatureType(typeName);
        if(old != null) {
            updated.setValue(old.update(newType));
            return old;
        }

        newType.setFeatureSource(this);
        getFeatureTypes().add(newType);
        
        return newType; 
    }
    
    public void removeFeatureType(SimpleFeatureType featureType) {
        Stripersist.getEntityManager().remove(featureType);
        getFeatureTypes().remove(featureType);
    }

    public JSONObject toJSONObject() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("id", this.getId());
        json.put("name",this.getName());
        json.put("protocol",this.getProtocol());
        json.put("url",this.getUrl());
        return json;
    }
}
