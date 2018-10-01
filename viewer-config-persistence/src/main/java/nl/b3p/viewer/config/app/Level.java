/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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
package nl.b3p.viewer.config.app;

import java.util.*;
import javax.persistence.*;
import javax.servlet.http.HttpServletRequest;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.Document;
import org.apache.commons.beanutils.BeanUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@Table(name="level_")
public class Level implements Comparable{
    @Id
    private Long id;

    @ManyToOne
    private Level parent;
    
    @Basic(optional=false)
    private String name;

    @ManyToMany(cascade=CascadeType.ALL) // Actually @OneToMany, workaround for HHH-1268    
    @JoinTable(name="level_children", inverseJoinColumns=@JoinColumn(name="child"))
    @OrderColumn(name="list_index")
    private List<Level> children = new ArrayList<Level>();

    private boolean background;

    @ManyToMany(cascade=CascadeType.ALL) // Actually @OneToMany, workaround for HHH-1268    
    @JoinTable(name="level_layers", inverseJoinColumns=@JoinColumn(name="layer"))
    @OrderColumn(name="list_index")
    @org.hibernate.annotations.Cascade(org.hibernate.annotations.CascadeType.DELETE_ORPHAN) // cannot use orphanRemoval=true due to workaround
    private List<ApplicationLayer> layers = new ArrayList<ApplicationLayer>();

    @ManyToMany
    @JoinTable(name="level_documents", inverseJoinColumns=@JoinColumn(name="document"))
    @OrderColumn(name="list_index")
    private List<Document> documents = new ArrayList<Document>();

    @Lob
    @org.hibernate.annotations.Type(type="org.hibernate.type.StringClobType")
    private String info;

    @ElementCollection
    @JoinTable(joinColumns=@JoinColumn(name="level_"))
    @Column(name="role_name")
    private Set<String> readers = new HashSet<String>();

    private String url;

    @OneToMany(mappedBy = "level",orphanRemoval = true, cascade = CascadeType.ALL)
    @MapKey(name = "application")
    private Map<Application, StartLevel> startLevels = new HashMap<Application, StartLevel>();

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public List<Level> getChildren() {
        return children;
    }
    
    public void setChildren(List<Level> children) {
        this.children = children;
    }
    
    public String getInfo() {
        return info;
    }
    
    public void setInfo(String info) {
        this.info = info;
    }
    
    public List<ApplicationLayer> getLayers() {
        return layers;
    }
    
    public void setLayers(List<ApplicationLayer> layers) {
        this.layers = layers;
    }
    
    public Level getParent() {
        return parent;
    }
    
    public void setParent(Level parent) {
        this.parent = parent;
    }
    
    public Set<String> getReaders() {
        return readers;
    }
    
    public void setReaders(Set<String> readers) {
        this.readers = readers;
    }
    
    public boolean isBackground() {
        return background;
    }
    
    public void setBackground(boolean background) {
        this.background = background;
    }
    
    public List<Document> getDocuments() {
        return documents;
    }
    
    public void setDocuments(List<Document> documents) {
        this.documents = documents;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Map<Application, StartLevel> getStartLevels() {
        return startLevels;
    }

    public void setStartLevels(Map<Application, StartLevel> startLevels) {
        this.startLevels = startLevels;
    }

    //</editor-fold>

    
    public JSONObject toJSONObject(boolean includeChildrenIds, Application app, HttpServletRequest request, EntityManager em) throws JSONException {
        JSONObject o = new JSONObject();
 
        /* TODO check readers */
        
        o.put("id", id);
        o.put("name", name);
        o.put("background", background);
        o.put("info", info);
        o.put("url",url);
        
        if(!documents.isEmpty()) {
            JSONArray docs = new JSONArray();
            o.put("documents", docs);
            for(Document d: documents) {
                docs.put(d.toJSONObject());
            }
        }
        
        if(!layers.isEmpty()) {
            JSONArray ls = new JSONArray();
            o.put("layers", ls);
            for(ApplicationLayer l: layers) {
                if((request == null || Authorizations.isAppLayerReadAuthorized(app, l, request, em)) && l.getStartLayers().containsKey(app)) {
                    ls.put(l.getId().toString());
                }
            }            
        }
        
        if(includeChildrenIds) {
            if(!children.isEmpty()) {
                JSONArray cs = new JSONArray();
                o.put("children", cs);
                for(Level l: children) {
                    if(request == null || Authorizations.isLevelReadAuthorized(app, l, request, em)) {
                        cs.put(l.getId().toString());
                    }
                }
            }
        }
        
        return o;
    }    
    
    /**
     * Find the applications this level is used in. Because of mashups a level
     * can be used in more than one application.
     *
     * @param em the entity manager to use
     * @return the applications this level is part of
     */
    public Set<Application> findApplications(EntityManager em) {
        Level l = this;
        while(l.getParent() != null) {
            l = l.getParent();
        }
        
        Set<Application> apps = new HashSet();
        apps.addAll(em.createQuery(
                    "from Application where root = :level")
                    .setParameter("level", l)
                    .getResultList());        
        return apps;
    }

    public String getPath() {
        Level l = this;
        
        String s = "";
        do {
            s = l.getName() + (s.length() == 0 ? "" : "/" + s);
            l = l.getParent();
        } while(l != null);
        
        return s;            
    }
    
    public Level getParentInSubtree(ApplicationLayer appLayer){
        for(ApplicationLayer al: layers) {
            if(al.equals(appLayer)) {
                return this;
            }
        }
        for(Level child: children) {
            Level parent = child.getParentInSubtree(appLayer);
            if(parent!=null) {
                return parent;
            }
        }
        return null;
    }
    
    public Level getParentInSubtree(Level level){
        for(Level child: children) {
            if(child.equals(level)) {
                return this;
            }
            Level parent = child.getParentInSubtree(level);
            if(parent !=null) {
                return parent;
            }
        }        
        return null;
    }
    
    public boolean containsLayerInSubtree(ApplicationLayer appLayer) {
        return this.getParentInSubtree(appLayer)!=null;
    }

    public boolean containsLevelInSubtree(Level level) {
        return this.getParentInSubtree(level)!=null;
    }
    
    public boolean hasLayerInSubtree(){
        if(!layers.isEmpty()){
            return true;
        }else{
            for (Level level : children) {
                if(level.hasLayerInSubtree()){
                    return true;
                }
            }
        }
        return false;
    }

    public boolean isInSubtreeOf(Level level) {
        Level parentLevel = parent;
        do {
            if(parentLevel.equals(level)) {
                return true;
            }
            parentLevel = parentLevel.getParent();
        } while(parentLevel != null);
        return false;
    }

    public void processForMashup(Application mashup, Application motherApp) throws Exception{
        for (Level child : children) {
            child.processForMashup(mashup, motherApp);
        }
        for (ApplicationLayer layer : layers) {
            layer.processStartLayers(mashup, layer, motherApp);
        }
        processStartLevels(mashup, this, motherApp);
    }
    
    private void processStartLevels(Application app, Level original, Application copyFrom) throws Exception{
       StartLevel sl = original.getStartLevels().get(copyFrom);
       if(sl != null){
           this.getStartLevels().put(app, sl.deepCopy(app, this));
       }else if (Objects.equals(app.getId(), copyFrom.getId())){
            List<StartLevel> sls = new ArrayList<>(original.startLevels.values());
            for (int i = 0; i < sls.size(); i++) {
                StartLevel value = sls.get(i);
                this.getStartLevels().put(app, value.deepCopy(app, this));
            }
        }
    }

    Level deepCopy(Level parent, Map originalToCopy, Application app, boolean processStartMap) throws Exception {
        Level copy = (Level)BeanUtils.cloneBean(this);
        originalToCopy.put(this, copy);
        copy.setId(null);
        copy.setParent(parent);
        
        copy.setChildren(new ArrayList<>());
        for(Level child: children) {
            copy.getChildren().add(child.deepCopy(copy, originalToCopy, app,processStartMap));
        }
        
        copy.setLayers(new ArrayList<>());
        for(ApplicationLayer appLayer: layers) {
            copy.getLayers().add(appLayer.deepCopy(originalToCopy, app,processStartMap));
        }
        
        copy.setStartLevels(new HashMap<>());
        if(processStartMap){
            copy.processStartLevels(app, this, app);
        }
        
        // do not clone documents, only the list
        copy.setDocuments(new ArrayList<>(documents));
        
        copy.setReaders(new HashSet<>(readers));
        
        copy.setInfo(info);
        
        copy.setUrl(url);
        
        return copy;
    }
    
    @Override
    public String toString() {
        return String.format("Level [id=%d, name=%s, parent=%d]",
                id,
                name,
                parent == null ? null : parent.getId());
    }    

    public int compareTo(Object o) {
        Level rhs = (Level)o;
        return this.getName().compareTo(rhs.getName());
    }

}