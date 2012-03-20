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
package nl.b3p.viewer.config.app;

import java.util.*;
import javax.persistence.*;
import nl.b3p.viewer.config.security.User;
import nl.b3p.viewer.config.services.BoundingBox;
import nl.b3p.viewer.config.services.GeoService;
import org.apache.commons.beanutils.BeanUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@Table(
        uniqueConstraints=
            @UniqueConstraint(columnNames={"name", "version"})
)
public class Application {
    @Id
    private Long id;

    @Basic(optional=false)
    private String name;

    @Column(length=30)
    private String version;

    @Lob
    private String layout;

    @ElementCollection
    @JoinTable(joinColumns=@JoinColumn(name="application"))
    private Map<String,String> details = new HashMap<String,String>();

    @ManyToOne
    private User owner;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "crs.name", column = @Column(name="start_crs")),
        @AttributeOverride(name = "minx", column = @Column(name="start_minx")),
        @AttributeOverride(name = "maxx", column = @Column(name="start_maxx")),
        @AttributeOverride(name = "miny", column = @Column(name="start_miny")),
        @AttributeOverride(name = "maxy", column = @Column(name="start_maxy"))
    })
    private BoundingBox startExtent;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "crs.name", column = @Column(name="max_crs")),
        @AttributeOverride(name = "minx", column = @Column(name="max_minx")),
        @AttributeOverride(name = "maxx", column = @Column(name="max_maxx")),
        @AttributeOverride(name = "miny", column = @Column(name="max_miny")),
        @AttributeOverride(name = "maxy", column = @Column(name="max_maxy"))
    })
    private BoundingBox maxExtent;

    private boolean authenticatedRequired;

    @ManyToOne(cascade=CascadeType.ALL, fetch=FetchType.LAZY)
    private Level root;

    @OneToMany(orphanRemoval=true, cascade=CascadeType.ALL, mappedBy="application")
    private Set<ConfiguredComponent> components = new HashSet<ConfiguredComponent>();

    // <editor-fold defaultstate="collapsed" desc="getters and setters">
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

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getLayout() {
        return layout;
    }

    public void setLayout(String layout) {
        this.layout = layout;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    public void setDetails(Map<String, String> details) {
        this.details = details;
    }

    public boolean isAuthenticatedRequired() {
        return authenticatedRequired;
    }

    public void setAuthenticatedRequired(boolean authenticatedRequired) {
        this.authenticatedRequired = authenticatedRequired;
    }

    public Set<ConfiguredComponent> getComponents() {
        return components;
    }

    public void setComponents(Set<ConfiguredComponent> components) {
        this.components = components;
    }

    public BoundingBox getMaxExtent() {
        return maxExtent;
    }

    public void setMaxExtent(BoundingBox maxExtent) {
        this.maxExtent = maxExtent;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public Level getRoot() {
        return root;
    }

    public void setRoot(Level root) {
        this.root = root;
    }

    public BoundingBox getStartExtent() {
        return startExtent;
    }

    public void setStartExtent(BoundingBox startExtent) {
        this.startExtent = startExtent;
    }
    //</editor-fold>

    /**
     * Create a JSON representation for use in browser to start this application
     * @return
     */
    public String toJSON() throws JSONException {
        JSONObject o = new JSONObject();

        o.put("id", id);
        o.put("name", name);
        if(layout != null) {
            o.put("layout", new JSONObject(layout));
        }

        JSONObject d = new JSONObject();
        o.put("details", d);
        for(Map.Entry<String,String> e: details.entrySet()) {
            d.put(e.getKey(), e.getValue());
        }

        if(startExtent != null) {
            o.put("startExtent", startExtent.toJSONObject());
        }
        if(maxExtent != null) {
            o.put("maxExtent", maxExtent.toJSONObject());
        }
        
        /* TODO check readers */
        
        if(root != null) {
            o.put("rootLevel", root.getId().toString());
            
            // XXX Oracle specific
            // Retrieve level tree structure in single query
            
            List<Level> levelEntities = Stripersist.getEntityManager().createNativeQuery(
                "select * from level_ start with id = :rootId connect by parent = prior id",
                Level.class)
                .setParameter("rootId", root.getId())
                .getResultList();
            
            // Prevent n+1 queries for each level            
            Stripersist.getEntityManager().createQuery("from Level l "
                    + "left join fetch l.documents "
                    + "left join fetch l.layers "
                    + "left join fetch l.readers "
                    + "where l in (:levels) ")
                    .setParameter("levels", levelEntities)
                    .getResultList();
            
            Map<Level,List<Level>> childrenByParent = new HashMap<Level,List<Level>>();
            List<ApplicationLayer> appLayerEntities = new ArrayList<ApplicationLayer>();
            
            for(Level l: levelEntities) {
                appLayerEntities.addAll(l.getLayers());
                
                if(l.getParent() != null) {
                    List<Level> parentChildren = childrenByParent.get(l.getParent());
                    if(parentChildren == null) {
                        parentChildren = new ArrayList<Level>();
                        childrenByParent.put(l.getParent(), parentChildren);
                    }
                    parentChildren.add(l);
                }
            }

            if(!appLayerEntities.isEmpty()) {
                // Prevent n+1 queries for each ApplicationLayer            
                Stripersist.getEntityManager().createQuery("from ApplicationLayer al "
                        + "left join fetch al.details "
                        + "left join fetch al.readers "
                        + "left join fetch al.writers "
                        + "where al in (:alayers) ")
                        .setParameter("alayers", appLayerEntities)
                        .getResultList();
            }

            JSONObject levels = new JSONObject();
            o.put("levels", levels);
            JSONObject appLayers = new JSONObject();
            o.put("appLayers", appLayers);
            JSONArray selectedContent = new JSONArray();
            o.put("selectedContent", selectedContent);         
            
            List selectedObjects = new ArrayList();
            walkAppTreeForJSON(levels, appLayers, selectedObjects, root, childrenByParent, false);

            Collections.sort(selectedObjects, new Comparator() {

                @Override
                public int compare(Object lhs, Object rhs) {
                    Integer lhsIndex, rhsIndex;
                    if(lhs instanceof Level) {
                        lhsIndex = ((Level)lhs).getSelectedIndex();
                    } else {
                        lhsIndex = ((ApplicationLayer)lhs).getSelectedIndex();
                    }
                    if(rhs instanceof Level) {
                        rhsIndex = ((Level)rhs).getSelectedIndex();
                    } else {
                        rhsIndex = ((ApplicationLayer)rhs).getSelectedIndex();
                    }
                    return lhsIndex.compareTo(rhsIndex);
                }
            });
            for(Object obj: selectedObjects) {
                JSONObject j = new JSONObject();
                if(obj instanceof Level) {
                    j.put("type", "level");
                    j.put("id", ((Level)obj).getId().toString());
                } else {
                    j.put("type", "appLayer");
                    j.put("id", ((ApplicationLayer)obj).getId().toString());
                }
                selectedContent.put(j);
            }
           
            Map<GeoService,Set<String>> usedLayersByService = new HashMap<GeoService,Set<String>>();
            visitLevelForUsedServicesLayers(root, childrenByParent, usedLayersByService);

            if(!usedLayersByService.isEmpty()) {
                JSONObject services = new JSONObject();
                o.put("services", services);
                for(Map.Entry<GeoService,Set<String>> entry: usedLayersByService.entrySet()) {
                    GeoService gs = entry.getKey();
                    Set<String> usedLayers = entry.getValue();
                    services.put(gs.getId().toString(), gs.toJSONObject(false, usedLayers));
                }
            }           
        }

        // Prevent n+1 query for ConfiguredComponent.details
        Stripersist.getEntityManager().createQuery(
                "from ConfiguredComponent cc left join fetch cc.details where application = :this")
                .setParameter("this", this)
                .getResultList();
        
        JSONObject c = new JSONObject();
        o.put("components", c);
        for(ConfiguredComponent comp: components) {
            c.put(comp.getName(), comp.toJSON());
        }

        return o.toString(4);
    }
    
    private static void walkAppTreeForJSON(JSONObject levels, JSONObject appLayers, List selectedContent, Level l, Map<Level,List<Level>> childrenByParent, boolean parentIsBackground) throws JSONException {
        JSONObject o = l.toJSONObject(false);
        o.put("background", l.isBackground() || parentIsBackground);
        levels.put(l.getId().toString(), o);
        
        if(l.getSelectedIndex() != null) {
            selectedContent.add(l);
        }
        
        for(ApplicationLayer al: l.getLayers()) {
            JSONObject p = al.toJSONObject();
            p.put("background", l.isBackground() || parentIsBackground);
            appLayers.put(al.getId().toString(), p);
            
            if(al.getSelectedIndex() != null) {
                selectedContent.add(al);
            }
        }
        
        List<Level> children = childrenByParent.get(l);
        if(children != null) {
            JSONArray jsonChildren = new JSONArray();
            o.put("children", jsonChildren);
            for(Level child: children) {
                jsonChildren.put(child.getId().toString());
                walkAppTreeForJSON(levels, appLayers, selectedContent, child, childrenByParent, l.isBackground());
            }
        }
    }
    
    private static void visitLevelForUsedServicesLayers(Level l, Map<Level,List<Level>> childrenByParent, Map<GeoService,Set<String>> usedLayersByService) {
                
        for(ApplicationLayer al: l.getLayers()) {
            GeoService gs = al.getService();
            
            Set<String> usedLayers = usedLayersByService.get(gs);
            if(usedLayers == null) {
                usedLayers = new HashSet<String>();
                usedLayersByService.put(gs, usedLayers);
            }
            usedLayers.add(al.getLayerName());
        }
        List<Level> children = childrenByParent.get(l);
        if(children != null) {        
            for(Level child: children) {
                visitLevelForUsedServicesLayers(child, childrenByParent, usedLayersByService);
            }        
        }
    }

    public Application deepCopy() throws Exception {
        
        Application copy = (Application) BeanUtils.cloneBean(this);   
        copy.setId(null);
        
        // user reference is not deep copied, of course
        
        copy.setDetails(new HashMap<String,String>(details));
        if(startExtent != null) {
            copy.setStartExtent(startExtent.clone());
        }
        if(maxExtent != null) {
            copy.setMaxExtent(maxExtent.clone());
        }
        
        copy.setComponents(new HashSet<ConfiguredComponent>());
        for(ConfiguredComponent cc: components) {
            copy.getComponents().add(cc.deepCopy(copy));
        }
        
        if(root != null) {
            copy.setRoot(root.deepCopy(null));
        }
        
        return copy;
    }
}
