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
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.security.Group;
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
    
    private List<Group> allGroups;
    
    private boolean layersAllowed;
    
    @Validate
    private List<String> groupsRead = new ArrayList<String>();
    
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
            }else if(level.getParent() != null && level.getParent().equals(rootLevel)){
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
        
        /*
         * background kan alleen submappen met layers hebben
         * in de eerste mappen na rootlevel kunnen geen layers zitten
         */
        
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
    
    public Level getLevel() {
        return level;
    }
    
    public void setLevel(Level level) {
        this.level = level;
    }
    //</editor-fold>
    
}
