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
        String name = this.getContext().getRequest().getParameter("name");
        String parentId = this.getContext().getRequest().getParameter("parent");
        
        final JSONObject j = new JSONObject();
        j.put("id", (int)(Math.random() * 100)+1);
        j.put("name", name);
        j.put("type", "category");
        j.put("parentid", parentId);
        
        return new StreamingResolution("application/json") {
           @Override
           public void stream(HttpServletResponse response) throws Exception {
               response.getWriter().print(j.toString());
           }
        };
    }
    
    public Resolution loadCategoryTree() throws JSONException {

        /* EntityManager em = Stripersist.getEntityManager();

        if(!em.contains(category)) {
            category = Category.getRootCategory();
        }

        final JSONArray children = new JSONArray();
        for(Category sub: category.getChildren()) {
            JSONObject j = new JSONObject();
            j.put("id", sub.getId());
            j.put("name", sub.getName());
            j.put("type", "category");
            children.put(j);
        }

        for(GeoService s: category.getServices()) {
            JSONObject j = new JSONObject();
            j.put("id", "s" + s.getId());
            j.put("name", s.getName());
            j.put("type", "service");
            j.put("status", Math.random() > 0.5 ? "ok" : "error");
            j.put("class", s.getClass().getName());
            children.put(j);
        } */
        
        final JSONArray children = new JSONArray();
        
        String nodeId = this.getContext().getRequest().getParameter("nodeid");
        String type = nodeId.substring(0, 1);
        int id = Integer.parseInt(nodeId.substring(1));
        if(type.equals("c")) {
            if(id == 0) {
                for(int i = 1; i < 4; i++) {
                    JSONObject j = new JSONObject();
                    j.put("id", "c" + id + i);
                    j.put("name", "Categorie " + i);
                    j.put("type", "category");
                    j.put("parentid", "0");
                    children.put(j);
                }
            } else {
                JSONObject jc = new JSONObject();
                jc.put("id", "c" + id + 1);
                jc.put("name", "Subcategorie " + 1);
                jc.put("type", "category");
                jc.put("parentid", nodeId);
                children.put(jc);
                
                for(int i = 1; i < 4; i++) {
                    JSONObject j = new JSONObject();
                    j.put("id", "s" + id + i);
                    j.put("name", "Service " + i);
                    j.put("type", "service");
                    j.put("status", Math.random() > 0.5 ? "ok" : "error");
                    j.put("parentid", nodeId);
                    children.put(j);
                }
            }
        }
        if(type.equals("s")) {
            for(int i = 1; i < 4; i++) {
                JSONObject j = new JSONObject();
                j.put("id", "l" + id + i);
                j.put("name", "Layer " + i);
                j.put("type", "layer");
                j.put("parentid", nodeId);
                children.put(j);
            }
        }
        if(type.equals("l")) {
            if(id > 300) {
                JSONObject j = new JSONObject();
                j.put("id", "l" + id + 1);
                j.put("name", "Layer " + 1);
                j.put("type", "layer");
                j.put("parentid", nodeId);
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

    @DefaultHandler
    public Resolution view() throws JSONException {
        return new ForwardResolution("/WEB-INF/jsp/geoserviceregistry.jsp");
    }
}
