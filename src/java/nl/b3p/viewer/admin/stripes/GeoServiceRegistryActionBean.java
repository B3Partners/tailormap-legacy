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

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.services.Category;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.Layer;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/geoserviceregistry/{$event}")
@StrictBinding
public class GeoServiceRegistryActionBean implements ActionBean {

    private ActionBeanContext context;

    private String id;
    private String parentId;

    @Validate
    private Category category;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    
    public ActionBeanContext getContext() {
        return context;
    }
    
    public Category getCategory() {
        return category;
    }
    
    public void setCategory(Category category) {
        this.category = category;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getParentId() {
        return parentId;
    }
    
    public void setParentId(String parentId) {
        this.parentId = parentId;
    }
    //</editor-fold>
    
    public Resolution editGeoService() throws JSONException {
        this.setId(this.getContext().getRequest().getParameter("service"));
        this.setParentId(this.getContext().getRequest().getParameter("parentId"));
        return new ForwardResolution("/WEB-INF/jsp/geoservice.jsp");
    }
    
    public Resolution editLayer() throws JSONException {
        this.setId(this.getContext().getRequest().getParameter("layer"));
        this.setParentId(this.getContext().getRequest().getParameter("parentId"));
        return new ForwardResolution("/WEB-INF/jsp/layer.jsp");
    }

    public Resolution addCategory() throws JSONException {
        EntityManager em = Stripersist.getEntityManager();
        
        String name = this.getContext().getRequest().getParameter("name");
        String parentId = this.getContext().getRequest().getParameter("parent");
        
        /*int id = Integer.parseInt(parentId.substring(1));
        Category parent = em.find(Category.class, new Long(id));
        
        // save category
        Category c = new Category();
        c.setName(name);
        c.setParent(parent);
        em.persist(c);*/
        /* De children_order word niet opgeslagen en de category verschijnt niet in de boom bij herladen pagina. */
        
        final JSONObject j = new JSONObject();
        j.put("id", (int)(Math.random() * 100)+1);
        j.put("name", name);
        j.put("type", "category");
        j.put("parentid", parentId);
        
        Stripersist.getEntityManager().getTransaction().commit();
        
        return new StreamingResolution("application/json") {
           @Override
           public void stream(HttpServletResponse response) throws Exception {
               response.getWriter().print(j.toString());
           }
        };
    }
    
    public Resolution loadCategoryTree() throws JSONException {

        EntityManager em = Stripersist.getEntityManager();
        
        final JSONArray children = new JSONArray();
        
        String nodeId = this.getContext().getRequest().getParameter("nodeid");
        String type = nodeId.substring(0, 1);
        int id = Integer.parseInt(nodeId.substring(1));
        if(type.equals("c")) {
            if(id == 0) {
                if(!em.contains(category)) {
                    category = Category.getRootCategory();
                }
                for(Category sub: category.getChildren()) {
                    JSONObject j = new JSONObject();
                    j.put("id", "c" + sub.getId());
                    j.put("name", sub.getName());
                    j.put("type", "category");
                    j.put("parentid", "0");
                    children.put(j);
                }
            } else {
                Category c = em.find(Category.class, new Long(id));
                for(Category sub: c.getChildren()) {
                    JSONObject j = new JSONObject();
                    j.put("id", "c" + sub.getId());
                    j.put("name", sub.getName());
                    j.put("type", "category");
                    j.put("parentid", "0");
                    children.put(j);
                }
                
                for(GeoService service: c.getServices()) {
                    JSONObject j = new JSONObject();
                    j.put("id", "s" + service.getId());
                    j.put("name", service.getName());
                    j.put("type", "service");
                    j.put("status", Math.random() > 0.5 ? "ok" : "error");
                    j.put("parentid", nodeId);
                    children.put(j);
                }
            }
        }
        if(type.equals("s")) {
            GeoService gs = em.find(GeoService.class, new Long(id));
            Layer toplayer = gs.getTopLayer();
            for(Layer sublayer: toplayer.getChildren()) {
                JSONObject j = new JSONObject();
                j.put("id", "l" + sublayer.getId());
                j.put("name", sublayer.getName());
                j.put("type", "layer");
                j.put("parentid", nodeId);
                children.put(j);
            }
        }
        if(type.equals("l")) {
            Layer layer = em.find(Layer.class, new Long(id));
            for(Layer sublayer: layer.getChildren()) {
                //if(sublayer != null){
                    JSONObject j = new JSONObject();
                    j.put("id", "l" + sublayer.getId());
                    j.put("name", sublayer.getName());
                    j.put("type", "layer");
                    j.put("parentid", nodeId);
                    children.put(j);
                //}
            }
        }
        
        return new StreamingResolution("application/json") {
           @Override
           public void stream(HttpServletResponse response) throws Exception {
               response.getWriter().print(children.toString());
           }
        };
    }

    @DefaultHandler
    public Resolution view() throws JSONException {
        Stripersist.getEntityManager().getTransaction().commit();
        
        return new ForwardResolution("/WEB-INF/jsp/geoserviceregistry.jsp");
    }
}
