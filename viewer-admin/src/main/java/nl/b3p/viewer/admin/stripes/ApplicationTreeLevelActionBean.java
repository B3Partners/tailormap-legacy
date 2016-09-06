/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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

import java.io.StringReader;
import java.util.*;
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.SimpleError;
import net.sourceforge.stripes.validation.Validate;
import net.sourceforge.stripes.validation.ValidateNestedProperties;
import nl.b3p.viewer.config.app.*;
import nl.b3p.viewer.config.security.*;
import nl.b3p.viewer.config.services.*;
import nl.b3p.viewer.util.SelectedContentCache;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */

@UrlBinding("/action/applicationtreelevel")
@StrictBinding
@RolesAllowed({Group.ADMIN,Group.APPLICATION_ADMIN}) 
public class ApplicationTreeLevelActionBean extends ApplicationActionBean {
    private static final Log log = LogFactory.getLog(ApplicationTreeLevelActionBean.class);
    
    private static final String JSP = "/WEB-INF/jsp/application/applicationTreeLevel.jsp";
    
    @Validate
    @ValidateNestedProperties({
                @Validate(field="info", label="Info"),
                @Validate(field="name", label="Naam"),
                @Validate(field="url", label="url")
    })
    private Level level;
        
    private boolean layersAllowed;
    
    @Validate
    private List<String> groupsRead = new ArrayList<String>();
    
    @Validate
    private String selectedlayers;
    
    @Validate
    private String selecteddocs;
    
    @DefaultHandler
    @DontValidate
    public Resolution view() {
        
        return new ForwardResolution(JSP);
    }
    
    public Resolution delete() {
        EntityManager em = Stripersist.getEntityManager();
        String error = deleteLevel(em, level);
        if(error != null){
            getContext().getValidationErrors().add("niveau", new SimpleError(error));
        }else{
            Level parent = level.getParent();
            parent.getChildren().remove(level);
            em.persist(parent);
            em.remove(level);
            getContext().getMessages().add(new SimpleMessage("Het niveau is verwijderd"));
        }
        
        application.authorizationsModified();        
        SelectedContentCache.setApplicationCacheDirty(application, true, false,em);
        em.getTransaction().commit();
        
        return new ForwardResolution(JSP);
    }
    
    @DontValidate
    public Resolution edit() {
        Level rootLevel = application.getRoot();
        
        if(level != null){
            groupsRead.addAll(level.getReaders());
            
            if(level.isBackground()){
                layersAllowed = false;
            }else if(level.getParent() == null || level.getParent().getId().equals(rootLevel.getId())){
                layersAllowed = false;
            }else{
                layersAllowed = true;
            }
        }
        
        return new ForwardResolution(JSP);
    }

    @DontValidate
    public Resolution saveName() throws JSONException {
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        String error = null;
        
        if(level == null) {
            error = "Niveau niet gevonden";
        } else if(level.getName() == null) {
            error = "Naam moet zijn ingevuld";
        } else {
            try {
                EntityManager em = Stripersist.getEntityManager();
                em.persist(level);
                SelectedContentCache.setApplicationCacheDirty(application, true, false, em);
                em.getTransaction().commit();
                json.put("name", level.getName());
                json.put("success", Boolean.TRUE);
            } catch(Exception e) {
                log.error("Fout bij opslaan niveau", e);
                error = "Kan niveau niet opslaan: " + e;
                Throwable t = e;
                while(t.getCause() != null) {
                    t = t.getCause();
                    error += "; " + t;
                }                
            }
        }
        if(error != null) {
            json.put("error", error);
        }              
        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }
    
    @DontValidate
    public Resolution deleteAjax() throws JSONException {
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);

        String error = deleteLevel(Stripersist.getEntityManager(), level);
        
        if (error != null) {
            json.put("error", error);
        } else {

            json.put("success", Boolean.TRUE);
        }
        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    protected String deleteLevel(EntityManager em, Level level){
        String error = null;

        StartLevel sl = level.getStartLevels().get(application);
        if(level == null) {
            error = "Niveau niet gevonden";
        } else if(level.getParent() == null) {
            error = "Bovenste niveau kan niet worden verwijderd";
        } else if(level.getChildren().size() > 0) {
            error = "Het niveau kan niet worden verwijderd omdat deze sub-niveau's heeft.";
        } else if(sl != null && sl.getSelectedIndex() != null) {
            error = "Het niveau kan niet worden verwijderd omdat deze kaart in de TOC is opgenomen";
        } else if(level.getLayers().size() > 0) {
            error = "Het niveau kan niet worden verwijderd omdat deze kaartlagen bevat.";
        } else {
            try {
                Level parent = level.getParent();
                parent.getChildren().remove(level);
                List<Application> mashups = application.getMashups(em);
                mashups.add(application);
                for (Application mashup : mashups) {
                    List<StartLevel> startlevels = mashup.getStartLevels();
                    for (Iterator<StartLevel> iterator = startlevels.iterator(); iterator.hasNext();) {
                        StartLevel next = iterator.next();
                        if( sl != null && next.getLevel().getId().equals(sl.getLevel().getId())){
                            iterator.remove();
                        }
                    }
                }
                
                em.remove(level);
                application.authorizationsModified();
                SelectedContentCache.setApplicationCacheDirty(application, true, false, em);
                em.getTransaction().commit();

            } catch(Exception e) {
                log.error("Fout bij verwijderen niveau", e);
                error = "Kan niveau niet verwijderen: " + e;
                Throwable t = e;
                while(t.getCause() != null) {
                    t = t.getCause();
                    error += "; " + t;
                }
            }
        }
        return error;
    }
    
    public Resolution save() {                
        level.getReaders().clear();
        for(String groupName: groupsRead) {
            level.getReaders().add(groupName);
        }
        
        updateApplayersInLevel(selectedlayers, level, Stripersist.getEntityManager());
        
        level.getDocuments().clear();
        if(selecteddocs != null && selecteddocs.length() > 0){
            String[] docIds = selecteddocs.split(",");
             for(int i = 0; i < docIds.length; i++){
                Long id = new Long(docIds[i].substring(1));
                Document doc = Stripersist.getEntityManager().find(Document.class, id);
                level.getDocuments().add(doc);
             }
        }
        
        EntityManager em = Stripersist.getEntityManager();
        em.persist(level);
        application.authorizationsModified();
        SelectedContentCache.setApplicationCacheDirty(application, true, false, em);
        em.getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Het niveau is opgeslagen"));
        return edit();
    }
    
     protected void updateApplayersInLevel(String selectedLayers, Level level, EntityManager em){
        List<ApplicationLayer> layersToBeRemoved = new ArrayList(level.getLayers());
        
        List<Application> apps = application.getMashups(em);
        apps.add(application);
        
        level.getLayers().clear();
        if(selectedLayers != null && selectedLayers.length() > 0){
            String[] layerIds = selectedLayers.split(",");
            for(int i = 0; i < layerIds.length; i++){
                ApplicationLayer appLayer = null;
                if(layerIds[i].startsWith("al")){
                    Long id = new Long(layerIds[i].substring(2));
                    appLayer = em.find(ApplicationLayer.class, id);
                    layersToBeRemoved.remove(appLayer);
                }else if(layerIds[i].startsWith("l")){
                    Long id = new Long(layerIds[i].substring(1));
                    Layer layer = em.find(Layer.class, id);
                    if(layer != null && !layer.isVirtual()){
                        appLayer = new ApplicationLayer();
                        appLayer.setService(layer.getService());
                        appLayer.setLayerName(layer.getName());
                        
                        if(layer.getFeatureType() != null){
                            SimpleFeatureType sft = layer.getFeatureType();
                            for(Iterator it = sft.getAttributes().iterator(); it.hasNext();){
                                AttributeDescriptor ad = (AttributeDescriptor)it.next();
                                ConfiguredAttribute confAttribute = new ConfiguredAttribute();
                                confAttribute.setAttributeName(ad.getName());
                                // default visible if not geometry type
                                confAttribute.setVisible(! AttributeDescriptor.GEOMETRY_TYPES.contains(ad.getType()));
                                appLayer.getAttributes().add(confAttribute);
                            }
                        }
                    }
                }                
                level.getLayers().add(appLayer);
            }
        }
        for (Application app : apps) {
            List<StartLayer> startlayers = app.getStartLayers();
            for (Iterator<StartLayer> iterator = startlayers.iterator(); iterator.hasNext();) {
                StartLayer next = iterator.next();

                for (ApplicationLayer applicationLayer : layersToBeRemoved) {
                    if (Objects.equals(next.getApplicationLayer().getId(), applicationLayer.getId())) {
                        iterator.remove();
                    }
                }
            }
        }
    }

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
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

    public String getSelecteddocs() {
        return selecteddocs;
    }

    public void setSelecteddocs(String selecteddocs) {
        this.selecteddocs = selecteddocs;
    }
    
    public Level getLevel() {
        return level;
    }
    
    public void setLevel(Level level) {
        this.level = level;
    }
    //</editor-fold>
    
}
