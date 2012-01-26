/*
 * Copyright (C) 2012 B3Partners B.V.
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
package nl.b3p.viewer.admin.stripes;

import java.util.*;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import net.sourceforge.stripes.validation.ValidateNestedProperties;
import nl.b3p.viewer.config.app.*;
import nl.b3p.viewer.config.security.*;
import nl.b3p.viewer.config.services.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */

@UrlBinding("/action/applicationtreelevel/{$event}")
@StrictBinding
public class ApplicationTreeLevelActionBean extends ApplicationActionBean {
    private static final String JSP = "/WEB-INF/jsp/application/applicationTreeLevel.jsp";
    
    @Validate
    @ValidateNestedProperties({
                @Validate(field="info"),
                @Validate(field="name",required=true)
    })
    private Level level;
    
    private String documentRoot = "d0";
    
    private List<Group> allGroups;
    
    private boolean layersAllowed;
    
    @Validate
    private List<String> groupsRead = new ArrayList<String>();
    
    @Validate
    private String selectedlayers;
    
    @DefaultHandler
    public Resolution view() {
        Stripersist.getEntityManager().getTransaction().commit();
        
        return new ForwardResolution(JSP);
    }
    
    @DontValidate
    public Resolution edit() {
        Level rootLevel = application.getRoot();
        
        if(level != null){
            groupsRead.addAll(level.getReaders());
            
            if(level.isBackground()){
                layersAllowed = false;
            }else if(level.getParent() != null && level.getParent().getId().equals(rootLevel.getId())){
                layersAllowed = false;
            }else{
                layersAllowed = true;
            }
        }
        
        return new ForwardResolution(JSP);
    }
    
    @Before(stages=LifecycleStage.BindingAndValidation)
    @SuppressWarnings("unchecked")
    public void load() {
        allGroups = Stripersist.getEntityManager().createQuery("from Group").getResultList();
    }
    
    public Resolution save() {                
        level.getReaders().clear();
        for(String groupName: groupsRead) {
            level.getReaders().add(groupName);
        }
        
        level.getLayers().clear();
        if(selectedlayers != null && selectedlayers.length() > 0){
            String[] layerIds = selectedlayers.split(",");
            for(int i = 0; i < layerIds.length; i++){
                Long id = new Long(layerIds[i].substring(1));
                Layer layer = Stripersist.getEntityManager().find(Layer.class, id);
                ApplicationLayer appLayer = null;
                if(layer == null){
                    appLayer = Stripersist.getEntityManager().find(ApplicationLayer.class, id);
                }else{
                    appLayer = new ApplicationLayer();
                    appLayer.setService(layer.getService());
                    appLayer.setLayerName(layer.getName());
                }
                
                level.getLayers().add(appLayer);
            }
        }
        
        Stripersist.getEntityManager().persist(level);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Het niveau is opgeslagen"));
        
        return new ForwardResolution(JSP);
    }

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public List<Group> getAllGroups() {
        return allGroups;
    }

    public void setAllGroups(List<Group> allGroups) {
        this.allGroups = allGroups;
    }

    public List<String> getGroupsRead() {
        return groupsRead;
    }

    public void setGroupsRead(List<String> groupsRead) {
        this.groupsRead = groupsRead;
    }

    public boolean isLayersAllowed() {
        return layersAllowed;
    }

    public void setLayersAllowed(boolean layersAllowed) {
        this.layersAllowed = layersAllowed;
    }

    public String getSelectedlayers() {
        return selectedlayers;
    }

    public void setSelectedlayers(String selectedlayers) {
        this.selectedlayers = selectedlayers;
    }

    public String getDocumentRoot() {
        return documentRoot;
    }

    public void setDocumentRoot(String documentRoot) {
        this.documentRoot = documentRoot;
    }
    
    public Level getLevel() {
        return level;
    }
    
    public void setLevel(Level level) {
        this.level = level;
    }
    //</editor-fold>
    
}
