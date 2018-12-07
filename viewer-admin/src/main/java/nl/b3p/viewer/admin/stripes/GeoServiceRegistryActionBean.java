/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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

import java.io.StringReader;
import java.text.MessageFormat;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.ResourceBundle;
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.i18n.LocalizableActionBean;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.Category;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.Layer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/geoserviceregistry")
@StrictBinding
@RolesAllowed({Group.ADMIN,Group.REGISTRY_ADMIN})
public class GeoServiceRegistryActionBean extends LocalizableActionBean {
    private static final Log log = LogFactory.getLog(GeoServiceRegistryActionBean.class);
    
    private static final String JSP = "/WEB-INF/jsp/services/geoserviceregistry.jsp";
    private ActionBeanContext context;

    @Validate
    private String nodeId;

    @Validate
    private String name;

    private Category category;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    
    public ActionBeanContext getContext() {
        return context;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Category getCategory() {
        return category;
    }
    
    public void setCategory(Category category) {
        this.category = category;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }
    //</editor-fold>
        
    @DefaultHandler
    public Resolution view() {
        category = Category.getRootCategory();
                
        return new ForwardResolution(JSP);
    }
    
    @After(on={"addSubcategory","saveCategory","removeCategory"}, stages= LifecycleStage.BindingAndValidation)
    public void loadCategory() {
        EntityManager em = Stripersist.getEntityManager();

        if(nodeId != null) {
            // Demangle id
            Long id;
            if(nodeId.equals("0")) {
                id = 0L;
            } else {
                id = Long.parseLong(nodeId.substring(1));
            }

            category = em.find(Category.class, id);
        }
    }
    
    private String checkCategoryAndNameError() {
        if(category == null) {
            return getBundle().getString("viewer_admin.geoserviceregistryactionbean.nocat");
        } else if(name == null) {
            return getBundle().getString("viewer_admin.geoserviceregistryactionbean.noname");
        } else {        
            return null;
        }
    }
    
    public Resolution addSubcategory() throws JSONException {
        EntityManager em = Stripersist.getEntityManager();
        
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        
        String error = checkCategoryAndNameError();
        
        if(error == null) {
            for(Category child: category.getChildren()) {
                if(name.equals(child.getName())) {
                    error = getBundle().getString("viewer_admin.geoserviceregistryactionbean.dupname");
                }
            }            
        }
        
        if(error == null) {
            try {
                Category c = new Category();
                c.setName(name);
                c.setParent(category);
                category.getChildren().add(c);

                em.persist(c);
                em.getTransaction().commit();

                JSONObject node = new JSONObject();
                node.put("id", "c" + c.getId());
                node.put("name", c.getName());
                node.put("type", "category");
                node.put("isLeaf", true);
                node.put("parentid", nodeId);
                json.put("node", node);

                json.put("success", Boolean.TRUE);
            } catch(Exception e) {
                log.error("Error adding category:", e);
                error =  MessageFormat.format(getBundle().getString("viewer_admin.geoserviceregistryactionbean.noadd"), e);
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
    
    public Resolution saveCategory() throws JSONException {
        
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        
        String error = checkCategoryAndNameError();
        
        if(error == null) {
            if(category.getParent() != null) {	
                for(Category sibling: category.getParent().getChildren()) {
                     if(sibling != category && name.equals(sibling.getName())) {
                         error = getBundle().getString("viewer_admin.geoserviceregistryactionbean.dupname");
                     }
                 }            
            }
        }
        
        if(error == null) {
            try {
                category.setName(name);
                Stripersist.getEntityManager().getTransaction().commit();
                json.put("success", Boolean.TRUE);
                json.put("name", category.getName());
            } catch(Exception e) {
                log.error("Error changing name category", e);
                error =  MessageFormat.format(getBundle().getString("viewer_admin.geoserviceregistryactionbean.nonamechg"), e);
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
    
    public Resolution removeCategory() throws JSONException {
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        String error = null;

        if(category == null) {
            error = getBundle().getString("viewer_admin.geoserviceregistryactionbean.nocat");
        } else if(category.getParent() == null) {
            error = getBundle().getString("viewer_admin.geoserviceregistryactionbean.noupcatrem");
        } else if(category.getChildren().size() > 0) {
            error = getBundle().getString("viewer_admin.geoserviceregistryactionbean.catnotempty");
        } else if(category.getServices().size() > 0) {
            error = getBundle().getString("viewer_admin.geoserviceregistryactionbean.cathassrv");
        }

        if(error == null) {
            try {
                Category p = category.getParent();
                p.getChildren().remove(category);
                Stripersist.getEntityManager().remove(category);
                Stripersist.getEntityManager().getTransaction().commit();
                json.put("success", Boolean.TRUE);
            } catch(Exception e) {
                log.error("Error deleting category: ", e);
                error =  MessageFormat.format(getBundle().getString("viewer_admin.geoserviceregistryactionbean.catremerr"), e);
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
    
    public Resolution tree() throws JSONException {

        EntityManager em = Stripersist.getEntityManager();
        
        final JSONArray children = new JSONArray();
        
        String type = nodeId.substring(0, 1);
        int id = Integer.parseInt(nodeId.substring(1));
        if(type.equals("c")) {
            Category c = em.find(Category.class, new Long(id));
            for(Category sub: c.getChildren()) {
                JSONObject j = new JSONObject();
                j.put("id", "c" + sub.getId());
                j.put("name", sub.getName());
                j.put("type", "category");
                j.put("isLeaf", sub.getChildren().isEmpty() && sub.getServices().isEmpty());
                if(sub.getParent() != null) {
                    j.put("parentid", sub.getParent().getId());
                }
                children.put(j);
            }

            for(GeoService service: c.getServices()) {
                JSONObject j = new JSONObject();
                j.put("id", "s" + service.getId());
                j.put("name", service.getName());
                j.put("type", "service");
                j.put("isLeaf", service.getTopLayer() == null);
                j.put("status", service.isMonitoringStatusOK() ? "ok" : "error");
                j.put("parentid", nodeId);
                children.put(j);
            }
        } else if(type.equals("s")) {
            GeoService gs = em.find(GeoService.class, new Long(id));
            // GeoService may be invalid and not have a top layer
            if(gs.getTopLayer() != null) {
                List<Layer> layers;
                if(!gs.getTopLayer().isVirtual()) {
                    layers = Collections.singletonList(gs.getTopLayer());
                } else {
                    layers = gs.getTopLayer().getChildren();
                }
                for(Layer sublayer: layers) {
                    JSONObject j = new JSONObject();
                    j.put("id", "l" + sublayer.getId());
                    if(sublayer.getTitleAlias() != null){
                        j.put("name", sublayer.getTitleAlias());
                    }else if(sublayer.getTitle() != null){
                        j.put("name", sublayer.getTitle());
                    }else{
                        j.put("name", sublayer.getName());
                    }
                    j.put("type", "layer");
                    j.put("isLeaf", sublayer.getChildren().isEmpty());
                    j.put("parentid", nodeId);
                    j.put("isVirtual", sublayer.isVirtual());
                    children.put(j);
                }
            }
        }
        if(type.equals("l")) {
            Layer layer = em.find(Layer.class, new Long(id));
            for(Layer sublayer: layer.getChildren()) {
                JSONObject j = new JSONObject();
                j.put("id", "l" + sublayer.getId());
                if(sublayer.getTitleAlias() != null){
                    j.put("name", sublayer.getTitleAlias());
                }else if(sublayer.getTitle() != null){
                    j.put("name", sublayer.getTitle());
                }else{
                    j.put("name", sublayer.getName());
                }
                j.put("type", "layer");
                j.put("isLeaf", sublayer.getChildren().isEmpty());
                j.put("parentid", nodeId);
                j.put("isVirtual", sublayer.isVirtual());
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
}
