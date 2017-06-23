/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
package nl.b3p.viewer.admin.stripes;

import java.util.*;
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.config.app.*;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.*;
import nl.b3p.viewer.util.SelectedContentCache;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */

@UrlBinding("/action/applicationtree")
@StrictBinding
@RolesAllowed({Group.ADMIN,Group.APPLICATION_ADMIN}) 
public class ApplicationTreeActionBean extends ApplicationActionBean {
    private static final String JSP = "/WEB-INF/jsp/application/applicationTree.jsp";
    
    @Validate(on="addLevel", required=true)
    private String parentId;
    
    @Validate
    private String nodeId;
    
    @Validate
    private String levelId;
    
    @Validate(on="moveLevel",required=true)
    private String targetLevelId;

    @Validate(on="addLevel",required=true)
    private String name;

    private Level rootLevel;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public Level getRootLevel() {
        return rootLevel;
    }

    public void setRootLevel(Level rootLevel) {
        this.rootLevel = rootLevel;
    }

    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getNodeId() {
        return nodeId;
    }
    
    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }
    
    public String getLevelId() {
        return levelId;
    }
    
    public void setLevelId(String levelId) {
        this.levelId = levelId;
    }
    
    public String getParentId() {
        return parentId;
    }
    
    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public String getTargetLevelId() {
        return targetLevelId;
    }

    public void setTargetLevelId(String targetLevelId) {
        this.targetLevelId = targetLevelId;
    }
    
    //</editor-fold>
    
    @DefaultHandler
    public Resolution view() {
        if(application == null){
            getContext().getMessages().add(new SimpleError("Er moet eerst een bestaande applicatie geactiveerd of een nieuwe applicatie gemaakt worden."));
            return new ForwardResolution("/WEB-INF/jsp/application/chooseApplication.jsp");
        }else{
            rootLevel = application.getRoot();
        }
        
        return new ForwardResolution(JSP);
    }
    
    public Resolution tree() throws JSONException {

        EntityManager em = Stripersist.getEntityManager();
        
        final JSONArray children = new JSONArray();
        
        if(!nodeId.equals("n")){
        
            String type = nodeId.substring(0, 1);
            int id = Integer.parseInt(nodeId.substring(1));
            if(type.equals("n")) {
                Level l = em.find(Level.class, new Long(id));
                List<Level> levels = l.getChildren();
                Collections.sort(levels);
                for(Level sub: levels) {
                    JSONObject j = new JSONObject();
                    j.put("id", "n" + sub.getId());
                    j.put("name", sub.getName());
                    j.put("type", "level");
                    j.put("isLeaf", sub.getChildren().isEmpty() && sub.getLayers().isEmpty());
                    if(sub.getParent() != null) {
                        j.put("parentid", sub.getParent().getId());
                    }
                    children.put(j);
                }

                for(ApplicationLayer layer: l.getLayers()) {
                    
                    // XXX code duplication with loadSelectedLayers()
                    
                    JSONObject j = new JSONObject();
                    j.put("id", "s" + layer.getId()); // XXX WTF? other id prefix than in loadSelectedLayers()
                    j.put("type", "layer");
                    j.put("isLeaf", true);
                    j.put("parentid", nodeId);
                    j.put("name", layer.getDisplayName(em));
                    children.put(j);
                }
            } 
        }
        
        return new StreamingResolution("application/json") {
           @Override
           public void stream(HttpServletResponse response) throws Exception {
               response.getWriter().print(children.toString());
           }
        };
    }
    
    public Resolution loadSelectedLayers() throws JSONException {

        EntityManager em = Stripersist.getEntityManager();
        
        final JSONArray children = new JSONArray();
        
        if(!levelId.equals("")){
            int id = Integer.parseInt(levelId);
            Level l = em.find(Level.class, new Long(id));
            for(ApplicationLayer appl: l.getLayers()) {
                JSONObject j = new JSONObject();                
                j.put("id", "al" + appl.getId());
                j.put("type", "layer");
                j.put("isLeaf", true);
                j.put("name", appl.getDisplayName(em));
                children.put(j);

                Layer serviceLayer = appl.getService().getLayer(appl.getLayerName(), em);
                j.put("status", serviceLayer != null && appl.getService().isMonitoringStatusOK() ? "ok" : "error");
            }
        }
        
        return new StreamingResolution("application/json") {
           @Override
           public void stream(HttpServletResponse response) throws Exception {
               response.getWriter().print(children.toString());
           }
        };
    }
    
    public Resolution loadDocumentTree() throws JSONException {
        EntityManager em = Stripersist.getEntityManager();
        
        final JSONArray children = new JSONArray();
        
        List documents = em.createQuery("from Document").getResultList();
        for(Iterator it = documents.iterator(); it.hasNext();){
            Document doc = (Document)it.next();
            JSONObject j = new JSONObject();
            j.put("id", "d" + doc.getId());
            j.put("name", doc.getName());
            j.put("type", "document");
            j.put("isLeaf", true);
            j.put("parentid", nodeId);
            children.put(j);
        }
        
        return new StreamingResolution("application/json") {
            @Override
            public void stream(HttpServletResponse response) throws Exception {
                response.getWriter().print(children.toString());
            }
        }; 
    }
            
    public Resolution loadSelectedDocuments() throws JSONException {
        EntityManager em = Stripersist.getEntityManager();

        final JSONArray children = new JSONArray();
        if(!levelId.equals("")){
            int id = Integer.parseInt(levelId);
            Level l = em.find(Level.class, new Long(id));
            for(Document doc: l.getDocuments()) {
                JSONObject j = new JSONObject();
                j.put("id", "d" + doc.getId());
                j.put("name", doc.getName());
                j.put("type", "document");
                j.put("isLeaf", true);
                children.put(j);
            }
        }

        return new StreamingResolution("application/json") {
            @Override
            public void stream(HttpServletResponse response) throws Exception {
                response.getWriter().print(children.toString());
            }
        }; 
    }
    
    public Resolution addLevel() throws JSONException {
        EntityManager em = Stripersist.getEntityManager();

        // Demangle id
        Long parentIdLong;
        if(!parentId.contains("n")){
            parentIdLong = new Long(parentId);
        }else{
            parentIdLong = Long.parseLong(parentId.substring(1));
        }

        Level parent = em.find(Level.class, parentIdLong);
        
        if(!parent.isBackground() && parent.getParent() != null){
            if(parent.getParent().isBackground()){
                /*
                 * Checks if the new level is not a sub sub level of background. 
                 * A background can only have sub levels with layers.
                 */
                return null;
            }
        }
        
        Level l = new Level();
        l.setName(name);
        l.setParent(parent);
        parent.getChildren().add(l);

        em.persist(l);
        em.persist(parent);
        SelectedContentCache.setApplicationCacheDirty(application, true,false,em);
        application.authorizationsModified();
        em.getTransaction().commit();

        final JSONObject j = new JSONObject();
        j.put("id", "n" + l.getId());
        j.put("name", l.getName());
        j.put("type", "level");
        j.put("isLeaf", true);
        j.put("parentid", parentId);
        
        return new StreamingResolution("application/json") {
           @Override
           public void stream(HttpServletResponse response) throws Exception {
               response.getWriter().print(j.toString());
           }
        };
    }
    
    public Resolution moveLevel() {
        final JSONObject j = new JSONObject();
        return new StreamingResolution("application/json") {
            @Override
            public void stream(HttpServletResponse response) throws Exception {
                response.getWriter().print(j.toString());
            }
        };
    }
    
    protected void moveLevel(String levelToMove, String targetLevel){
        
    }
}
