/*
 * Copyright (C) 2012-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config.app;

import nl.tailormap.viewer.config.services.Document;
import org.apache.commons.beanutils.BeanUtils;
import org.hibernate.annotations.Type;

import javax.persistence.Basic;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.Lob;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.MapKey;
import javax.persistence.OneToMany;
import javax.persistence.OrderColumn;
import javax.persistence.Table;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@Table(name="level_")
public class Level implements Comparable{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "parent")
    private Level parent;
    
    @Basic(optional=false)
    private String name;

    @ManyToMany(cascade=CascadeType.ALL) // Actually @OneToMany, workaround for HHH-1268    
    @JoinTable(
            name="level_children",
            joinColumns=@JoinColumn(name = "level_", referencedColumnName = "id"),
            inverseJoinColumns=@JoinColumn(name="child"))
    @OrderColumn(name="list_index")
    private List<Level> children = new ArrayList<Level>();

    private boolean background;

    @ManyToMany(cascade=CascadeType.ALL) // Actually @OneToMany, workaround for HHH-1268
    @JoinTable(
            name="level_layers",
            joinColumns=@JoinColumn(name = "level_", referencedColumnName = "id"),
            inverseJoinColumns=@JoinColumn(name="layer"))
    @OrderColumn(name="list_index")
    @org.hibernate.annotations.Cascade(org.hibernate.annotations.CascadeType.DELETE_ORPHAN)
    private List<ApplicationLayer> layers = new ArrayList<ApplicationLayer>();

    @ManyToMany
    @JoinTable(
            name="level_documents",
            inverseJoinColumns=@JoinColumn(name="document"),
            joinColumns=@JoinColumn(name = "level_", referencedColumnName = "id")
    )
    @OrderColumn(name="list_index")
    private List<Document> documents = new ArrayList<Document>();

    @Lob
    @Type(type = "org.hibernate.type.TextType")
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
    
    public void processForWorkversion(Application workversion, Application base) throws Exception{
        for (Level child : children) {
            child.processForWorkversion(workversion, base);
        }
        for (ApplicationLayer layer : layers) {
            layer.processStartLayers(workversion, (ApplicationLayer)workversion.originalToCopy.get(layer), base);
        }
        processStartLevels(workversion, (Level)workversion.originalToCopy.get(this), base);
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

    public Level deepCopy(Level parent, Map originalToCopy, Application app, boolean processStartMap) throws Exception {
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