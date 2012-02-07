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
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@Table(
        uniqueConstraints=
            @UniqueConstraint(columnNames={"name", "version"})
)
public class Application  {
    @Id
    private Long id;

    @Basic(optional=false)
    private String name;

    @Column(length=30)
    private String version;

    @Lob
    private String layout;

    @ElementCollection
    @JoinTable(joinColumns=@JoinColumn(name="username"))
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

    @ManyToOne
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

            JSONObject levels = new JSONObject();
            o.put("levels", levels);
            JSONObject appLayers = new JSONObject();
            o.put("appLayers", appLayers);
            JSONArray selectedContent = new JSONArray();
            o.put("selectedContent", selectedContent);         
            
            List selectedObjects = new ArrayList();
            walkAppTreeForJSON(levels, appLayers, selectedObjects, root);

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
            visitLevelForUsedServicesLayers(root, usedLayersByService);

            if(!usedLayersByService.isEmpty()) {
                JSONObject services = new JSONObject();
                o.put("services", services);
                for(Map.Entry<GeoService,Set<String>> entry: usedLayersByService.entrySet()) {
                    GeoService gs = entry.getKey();
                    Set<String> usedLayers = entry.getValue();
                    services.put(gs.getId().toString(), gs.toJSONObject(usedLayers));
                }
            }            
        }

        JSONObject c = new JSONObject();
        o.put("components", c);
        for(ConfiguredComponent comp: components) {
            c.put(comp.getName(), comp.toJSON());
        }

        return o.toString(4);
    }
    
    private static void walkAppTreeForJSON(JSONObject levels, JSONObject appLayers, List selectedContent, Level l) throws JSONException {
        levels.put(l.getId().toString(), l.toJSONObject());
        
        if(l.getSelectedIndex() != null) {
            selectedContent.add(l);
        }
        
        for(ApplicationLayer al: l.getLayers()) {
            appLayers.put(al.getId().toString(), al.toJSONObject());
            
            if(al.getSelectedIndex() != null) {
                selectedContent.add(al);
            }
        }
        
        for(Level child: l.getChildren()) {
            walkAppTreeForJSON(levels, appLayers, selectedContent, child);
        }
    }
    
    private static void visitLevelForUsedServicesLayers(Level l, Map<GeoService,Set<String>> usedLayersByService) {
                
        for(ApplicationLayer al: l.getLayers()) {
            GeoService gs = al.getService();
            
            Set<String> usedLayers = usedLayersByService.get(gs);
            if(usedLayers == null) {
                usedLayers = new HashSet<String>();
                usedLayersByService.put(gs, usedLayers);
            }
            usedLayers.add(al.getLayerName());
        }
        for(Level child: l.getChildren()) {
            visitLevelForUsedServicesLayers(child, usedLayersByService);
        }        
    }
}
