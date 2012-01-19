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

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.*;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */

@UrlBinding("/action/applicationtree/{$event}")
@StrictBinding
public class ApplicationTreeActionBean extends ApplicationActionBean {
    private static final String JSP = "/WEB-INF/jsp/application/applicationTree.jsp";
    
    @Validate(on="addLevel", required=true)
    private String parentId;
    
    @Validate
    private String nodeId;

    @Validate(on="addLevel",required=true)
    private String name;

    private Level rootlevel;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public Level getRootlevel() {
        return rootlevel;
    }
    
    public void setRootlevel(Level rootlevel) {
        this.rootlevel = rootlevel;
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
    
    public String getParentId() {
        return parentId;
    }
    
    public void setParentId(String parentId) {
        this.parentId = parentId;
    }
    //</editor-fold>
    
    @DefaultHandler
    public Resolution view() {
        Stripersist.getEntityManager().getTransaction().commit();
        
        return new ForwardResolution(JSP);
    }
    
    @Before(stages=LifecycleStage.BindingAndValidation)
    @SuppressWarnings("unchecked")
    public void load() {
        if(application != null){
            rootlevel = application.getRoot();
        }else{
            // melding geven
        }
    }
    
    public Resolution loadApplicationTree() throws JSONException {

        EntityManager em = Stripersist.getEntityManager();
        
        final JSONArray children = new JSONArray();
        
        if(!nodeId.equals("n")){
        
            String type = nodeId.substring(0, 1);
            int id = Integer.parseInt(nodeId.substring(1));
            if(type.equals("n")) {
                Level l = em.find(Level.class, new Long(id));
                for(Level sub: l.getChildren()) {
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
                    JSONObject j = new JSONObject();
                    j.put("id", "s" + layer.getId());
                    j.put("name", layer.getLayerName());
                    j.put("type", "layer");
                    j.put("isLeaf", true);
                    j.put("parentid", nodeId);
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
        LevelType type = LevelType.LEVEL;
        if(parent.getType() == LevelType.MAP || parent.getType() == LevelType.LAYER_GROUP){
            type = LevelType.LAYER_GROUP;
        }else if(parent.getType() == LevelType.BACKGROUND){
            type = LevelType.MAP;
        }
        
        Level l = new Level();
        l.setName(name);
        l.setParent(parent);
        l.setType(type);
        parent.getChildren().add(l);

        em.persist(l);
        em.persist(parent);
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
}
