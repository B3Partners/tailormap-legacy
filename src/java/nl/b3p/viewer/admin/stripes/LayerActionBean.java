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
import javax.annotation.security.RolesAllowed;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.*;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.*;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@UrlBinding("/action/layer")
@StrictBinding
@RolesAllowed("RegistryAdmin")
public class LayerActionBean implements ActionBean{
    private static final String JSP = "/WEB-INF/jsp/services/layer.jsp";
    
    private ActionBeanContext context;
    
    @Validate
    private Layer layer;
    
    @Validate
    private String parentId;
    
    private List<Group> allGroups;
    
    private List<String> applicationsUsedIn = new ArrayList();
    
    @Validate
    private List<String> groupsRead = new ArrayList<String>();
    
    @Validate
    private List<String> groupsWrite = new ArrayList<String>();
    
    @Validate
    private Map<String,String> details = new HashMap<String,String>();
    
    @Validate
    private SimpleFeatureType simpleFeatureType;
    @Validate
    private Long featureSourceId;
    
    private List featureSources;

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

    public List<String> getApplicationsUsedIn() {
        return applicationsUsedIn;
    }

    public void setApplicationsUsedIn(List<String> applicationsUsedIn) {
        this.applicationsUsedIn = applicationsUsedIn;
    }

    public SimpleFeatureType getSimpleFeatureType() {
        return simpleFeatureType;
    }

    public void setSimpleFeatureType(SimpleFeatureType simpleFeatureType) {
        this.simpleFeatureType = simpleFeatureType;
    }

    public Long getFeatureSourceId() {
        return featureSourceId;
    }

    public void setFeatureSourceId(Long featureSourceId) {
        this.featureSourceId = featureSourceId;
    }

    public List getFeatureSources() {
        return featureSources;
    }

    public void setFeatureSources(List featureSources) {
        this.featureSources = featureSources;
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
        featureSources = Stripersist.getEntityManager().createQuery("from FeatureSource").getResultList();
    }
    
    public Resolution edit() {
        if(layer != null){
            details = layer.getDetails();
            
            groupsRead.addAll(layer.getReaders());
            groupsWrite.addAll(layer.getWriters());
            
            if(layer.getFeatureType() != null){
                simpleFeatureType = layer.getFeatureType();
                featureSourceId = simpleFeatureType.getFeatureSource().getId();
            }
            
            findApplicationsUsedIn();
        }
        return new ForwardResolution(JSP);
    }
    
    private void findApplicationsUsedIn(){
        GeoService service = layer.getService();
        String layerName = layer.getName();
        
        List<ApplicationLayer> applicationLayers = Stripersist.getEntityManager().createQuery("from ApplicationLayer where service = :service"
                + " and layerName = :layerName").setParameter("service", service)
                .setParameter("layerName", layerName).getResultList();
        
        for(Iterator it = applicationLayers.iterator(); it.hasNext();){
            ApplicationLayer appLayer = (ApplicationLayer)it.next();
            /*
             * The parent level of the applicationLayer is needed to find out in which application the Layer is used.
             * This solution is not good when there are many levels.
             */
            List<Level> levels = Stripersist.getEntityManager().createQuery("from Level").getResultList();
            for(Iterator iter = levels.iterator(); iter.hasNext();){
                Level level = (Level)iter.next();
                if(level != null && level.getLayers().contains(appLayer)){
                    String name = getApplicationName(level);
                    if(!applicationsUsedIn.contains(name)){
                        applicationsUsedIn.add(name);
                    }
                }
            }
        }
    }
    
    private String getApplicationName(Level level){
        String applicationName = null;
        
        if(level.getParent() == null){
            Application application = (Application)Stripersist.getEntityManager().createQuery("from Application where root = :level")
                    .setParameter("level", level).getSingleResult();
            if(application.getVersion() != null){
                applicationName = application.getName() +" V"+ application.getVersion();
            }else{
                applicationName = application.getName();
            }
            
        }else{
            applicationName = getApplicationName(level.getParent());
        }
        
        return applicationName;
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
        
        if(simpleFeatureType != null){
           layer.setFeatureType(simpleFeatureType); 
        }
        
        Stripersist.getEntityManager().persist(layer);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("De kaartlaag is opgeslagen"));
        
        return new ForwardResolution(JSP);
    }
}
