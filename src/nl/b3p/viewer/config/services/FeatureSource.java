/*
 * Copyright (C) 2011 B3Partners B.V.
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
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.visitor.CalcResult;
import org.geotools.feature.visitor.MaxVisitor;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.filter.expression.Expression;
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

    @Column(unique=true)
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
    
    @OneToMany(orphanRemoval=true, cascade=CascadeType.ALL)
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
        FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2(null);
        Function unique = ff.function("Collection_Unique", ff.property(attributeName));
        Filter notNull = ff.not( ff.isNull( ff.property(attributeName) ));
        FeatureCollection f = this.getFeatures(sft,notNull, maxFeatures);
        Object o = unique.evaluate( f);
        sft.openGeoToolsFeatureSource().getDataStore().dispose();
        Set<String> uniqueValues  = (Set<String>)o;
        if(uniqueValues == null){
            uniqueValues = new HashSet<String>();
        }
        return new ArrayList<String>(uniqueValues);
    }
    
    public Object getMaxValue(SimpleFeatureType sft, String attributeName, int maxFeatures) throws Exception{
      FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2(null);
        /*  Function unique = ff.function("Collection_Max", ff.property(attributeName));
        */
        FeatureCollection f = this.getFeatures(sft,null, maxFeatures);
        
        Function max = ff.function("Collection_Max", ff.property(attributeName));

        Object value = max.evaluate( f );
        sft.openGeoToolsFeatureSource().getDataStore().dispose();
   
        return value;
    }
    
    public Object getMinValue(SimpleFeatureType sft, String attributeName, int maxFeatures) throws Exception{
        FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2(null);
        Function minFunction = ff.function("Collection_Min", ff.property(attributeName));
        
        FeatureCollection f = this.getFeatures(sft,null, maxFeatures);
        
        Object o = minFunction.evaluate( f );
        sft.openGeoToolsFeatureSource().getDataStore().dispose();
       
        return o;
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
    
    /**
     * Checks if a FeatureSource with given name already exists and if needed
     * returns name with sequence number in brackets added to make it unique.
     * @param name Name to make unique
     * @return A unique name for a FeatureSource
     */
    public static String findUniqueName(String name) {
        int uniqueCounter = 0;
        while(true) {
            String testName;
            if(uniqueCounter == 0) {
                testName = name;
            } else {
                testName = name + " (" + uniqueCounter + ")";
            }
            try {
                Stripersist.getEntityManager().createQuery("select 1 from FeatureSource where name = :name")
                    .setParameter("name", testName)
                    .setMaxResults(1)
                    .getSingleResult();

                uniqueCounter++;
            } catch(NoResultException nre) {
                name = testName;
                break;
            }
        }  
        return name;
    }
}
