/*
 * Copyright (C) 2011-2017 B3Partners B.V.
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
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.mutable.MutableObject;
import org.hibernate.annotations.Type;

import javax.persistence.Basic;
import javax.persistence.CascadeType;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.DiscriminatorValue;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.EntityManager;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.NoResultException;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.OrderColumn;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorColumn(name="protocol")
public abstract class GeoService implements Serializable {
    public static final String PARAM_ONLINE_CHECK_ONLY = "onlineCheckOnly";
    public static final String PARAM_MUST_LOGIN = "mustLogin";
    
    public static final String DETAIL_OVERRIDDEN_URL = "overridenUrl";
    public static final String DETAIL_ORIGINAL_NAME = "originalName";
    
    public static final String DETAIL_USE_INTERSECT = "useIntersect";
    public static final String DETAIL_USE_PROXY = "useProxy";

    /** 
    * HTTP Basic authentication username to use with pre-emptive
     * authentication.
     */
    public static final String PARAM_USERNAME = "username";

    /**
     * HTTP Basic authentication password to use with pre-emptive
     * authentication.
     */
    public static final String PARAM_PASSWORD = "password";
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Basic(optional=false)
    private String name;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "category")
    private Category category;

    @Basic(optional=false)
    private String url;

    private String username;
    private String password;
    
    private String geofenceHeader;
    private String version;

    private boolean monitoringEnabled;
    
    private boolean monitoringStatusok = true;

    @OneToOne(cascade=CascadeType.PERSIST)
    @JoinColumn(name = "top_layer")
    private Layer topLayer;

    @ElementCollection
    @CollectionTable(
            joinColumns = @JoinColumn(name = "geo_service")
    )
    @Column(name="keyword")
    private Set<String> keywords = new HashSet<>();
    
    @Transient
    private List<Layer> layers;
    
    @Transient
    private Map<Layer,List<Layer>> childrenByParent = null;
    
    @Basic(optional=false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date authorizationsModified = new Date();

    @ElementCollection    
    @JoinTable(joinColumns=@JoinColumn(name="geoservice"))
    // Element wrapper required because of http://opensource.atlassian.com/projects/hibernate/browse/JPA-11
    private Map<String, ClobElement> details = new HashMap<>();


    @JoinTable(
            name = "geo_service_style_libraries",
            joinColumns = @JoinColumn(name ="geo_service" ),
            inverseJoinColumns=@JoinColumn(name="style_library"))
    @OneToMany(cascade=CascadeType.PERSIST) // Actually @OneToMany, workaround for HHH-1268
    @OrderColumn(name="list_index")
    private List<StyleLibrary> styleLibraries = new ArrayList<>();
    
    
    @ElementCollection
    @CollectionTable(joinColumns = @JoinColumn(name = "geo_service"))
    @Column(name="role_name")
    private Set<String> readers = new HashSet<>();

    /**
     * the capabilities document of the service.
     */
    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Type(type = "org.hibernate.type.TextType")
    @Column(name="capabilities_doc")
    private String capabilitiesDoc;

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
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

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Layer getTopLayer() {
        return topLayer;
    }

    public void setTopLayer(Layer topLayer) {
        this.topLayer = topLayer;
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

    public Set<String> getKeywords() {
        return keywords;
    }

    public void setKeywords(Set<String> keywords) {
        this.keywords = keywords;
    }

    public boolean isMonitoringEnabled() {
        return monitoringEnabled;
    }

    public void setMonitoringEnabled(boolean monitoringEnabled) {
        this.monitoringEnabled = monitoringEnabled;
    }

    public Date getAuthorizationsModified() {
        return authorizationsModified;
    }

    public void setAuthorizationsModified(Date authorizationsModified) {
        this.authorizationsModified = authorizationsModified;
    }

    public boolean isMonitoringStatusok() {
        return monitoringStatusok;
    }

    public void setMonitoringStatusok(boolean monitoringStatusOK) {
        this.monitoringStatusok = monitoringStatusOK;
    }

    public Map<String, ClobElement> getDetails() {
        return details;
    }

    public void setDetails(Map<String, ClobElement> details) {
        this.details = details;
    }

    public List<StyleLibrary> getStyleLibraries() {
        return styleLibraries;
    }

    public void setStyleLibraries(List<StyleLibrary> styleLibraries) {
        this.styleLibraries = styleLibraries;
    }

    public Set<String> getReaders() {
        return readers;
    }

    public void setReaders(Set<String> readers) {
        this.readers = readers;
    }

    public String getGeofenceHeader() {
        return geofenceHeader;
    }

    public void setGeofenceHeader(String geofenceHeader) {
        this.geofenceHeader = geofenceHeader;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getCapabilitiesDoc() {
        return capabilitiesDoc;
    }

    public void setCapabilitiesDoc(String capabilitiesDoc) {
        this.capabilitiesDoc = capabilitiesDoc;
    }

    //</editor-fold>

    public String getProtocol() {
        return getClass().getAnnotation(DiscriminatorValue.class).value();
    }


    public void authorizationsModified() {
        authorizationsModified = new Date();
    }    
    
    /** To prevent a lot of SQL requests walking a tree structure of entities,
     * load all layers using an efficient query. The Layers.children collections
     * are not initialized, but can be reconstructed from the list of all Layers
     * for this service returned by the query. Call Layer.getLayerChildrenCache() 
     * to retrieve it without causing a SQL query.
     * 
     * The cache is not updated on changes, so will only represent the database
     * state when loadLayerTree() was last called.
     *
     * @param em the entity manager to use
     * @return the list of layers of this service
     */
    public List<Layer> loadLayerTree(EntityManager em) {
        if(layers != null) {
            return layers;
        }
        
        if(!em.contains(this)) {
            // Not a persistent entity (for example when loading user specified 
            // service)
            return Collections.EMPTY_LIST;
        }
        
        // Retrieve layer tree structure in single query
        layers = em.createNamedQuery("getLayerTree")
            .setParameter("rootId", topLayer.getId())
            .getResultList();   
      
        childrenByParent = new HashMap<>();
        for(Layer l: layers) {               
            if(l.getParent() != null) {
                List<Layer> parentChildren = childrenByParent.get(l.getParent());
                if(parentChildren == null) {
                    parentChildren = new ArrayList<>();
                    childrenByParent.put(l.getParent(), parentChildren);
                }
                parentChildren.add(l);
            }
        }      
        return layers;
    }
    
    public List<Layer> getLayerChildrenCache(Layer l, EntityManager em) {
        if(childrenByParent != null) {
            
            if(!em.getEntityManagerFactory().getPersistenceUnitUtil().isLoaded(l.getChildren())) {
                List<Layer> childrenList = childrenByParent.get(l);
                if(childrenList == null) {
                    return Collections.EMPTY_LIST;
                } else {
                    return childrenList;
                }
            } else {
                return l.getChildren();
            }
        } else {
            return l.getChildren();
        }
    }


    /**
     * Gets a single layer without loading all layers. If multiple layers exist
     * with the same name, a random non-virtual layer is returned.
     *
     * @param layerName the name of the layer to find
     * @param em the EntityManager to use
     * @return the named layer
     */
    public Layer getSingleLayer(final String layerName, EntityManager em) {
        try {
            return (Layer)em.createQuery(
                      "from Layer where service = :service "
                    + "and name = :n order by virtual desc")
                    .setParameter("service", this)
                    .setParameter("n", layerName)
                    .setMaxResults(1)
                    .getSingleResult();

        } catch (NoResultException nre) {
            return null;
        }        
    }

    /**
     * Returns the layer with the given name in this server. The first layer in
     * a depth-first tree traversal with the name is returned. If a child has
     * the same name as its parent, the child is returned.
     *
     * @param layerName the layer name to search for
     * @param em the entity manager to use
     * @return the Layer or null if not found
     */
    public Layer getLayer(final String layerName, EntityManager em) {
        loadLayerTree(em);
        
        if(layerName == null || topLayer == null) {
            return null;
        }
        
        final MutableObject<Layer> layer = new MutableObject<>(null);
        
        topLayer.accept((l, em1) -> {
            if(StringUtils.equals(l.getName(),layerName)) {
                layer.setValue(l);
                return false;
            }
            return true;
        },em);
        
        return layer.getValue();
    }
}