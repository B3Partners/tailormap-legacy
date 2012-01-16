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
package nl.b3p.viewer.admin.stripes;

import java.util.*;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.Layer;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
public class LayerActionBean implements ActionBean{
    private static final String JSP = "/WEB-INF/jsp/services/layer.jsp";
    
    private ActionBeanContext context;
    
    @Validate
    private Layer layer;
    
    @Validate
    private String parentId;
    
    private List<Group> allGroups;
    
    @Validate
    private List<String> groupsRead = new ArrayList<String>();
    
    @Validate
    private List<String> groupsWrite = new ArrayList<String>();
    
    @Validate
    private Map<String,String> details = new HashMap<String,String>();

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    public void setDetails(Map<String, String> details) {
        this.details = details;
    }

    public Layer getLayer() {
        return layer;
    }

    public void setLayer(Layer layer) {
        this.layer = layer;
    }

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

    public List<String> getGroupsWrite() {
        return groupsWrite;
    }

    public void setGroupsWrite(List<String> groupsWrite) {
        this.groupsWrite = groupsWrite;
    }
    
    public String getParentId() {
        return parentId;
    }
    
    public void setParentId(String parentId) {
        this.parentId = parentId;
    }
    //</editor-fold>
    
    @DefaultHandler
    public Resolution view() {
        return new ForwardResolution(JSP);
    }
    
    @Before(stages=LifecycleStage.BindingAndValidation)
    @SuppressWarnings("unchecked")
    public void load() {
        allGroups = Stripersist.getEntityManager().createQuery("from Group").getResultList();
    }
    
    public Resolution edit() {
        if(layer != null){
            details = layer.getDetails();
            
            groupsRead.addAll(layer.getReaders());
            groupsWrite.addAll(layer.getWriters());
        }
        return new ForwardResolution(JSP);
    }
    
    public Resolution save() {                
        layer.getDetails().clear();
        layer.getDetails().putAll(details);
        
        layer.getReaders().clear();
        for(String groupName: groupsRead) {
            layer.getReaders().add(groupName);
        }
        
        layer.getWriters().clear();
        for(String groupName: groupsWrite) {
            layer.getWriters().add(groupName);
        }
        
        Stripersist.getEntityManager().persist(layer);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("De kaartlaag is opgeslagen"));
        
        return new ForwardResolution(JSP);
    }
}
