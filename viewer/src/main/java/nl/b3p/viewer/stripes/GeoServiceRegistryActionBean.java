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
package nl.b3p.viewer.stripes;

import java.io.StringReader;
import java.util.List;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.security.Authorizations;
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
@UrlBinding("/action/geoserviceregistry/")
@StrictBinding
public class GeoServiceRegistryActionBean implements ActionBean {
    
    private ActionBeanContext context;

    @Validate
    private String nodeId;
    
    @Validate
    private String q;
    
    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    
    public String getNodeId() {
        return nodeId;
    }
    
    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getQ() {
        return q;
    }

    public void setQ(String q) {
        this.q = q;
    }
    //</editor-fold>
    
    @DefaultHandler
    public Resolution load() throws JSONException {

        EntityManager em = Stripersist.getEntityManager();
        
        final JSONArray children = new JSONArray();
        
        String type = nodeId.substring(0, 1);
        int id = Integer.parseInt(nodeId.substring(1));
        
        if(type.equals("c")) {
            Category c = em.find(Category.class, new Long(id));
            
            // TODO check readers            
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
                j.put("service", service.toJSONObject(false, em));
                j.put("name", service.getName());
                j.put("type", "service");
                j.put("isLeaf", service.getTopLayer() == null);
                j.put("status", service.isMonitoringStatusOK() ? "ok" : "error");
                j.put("parentid", nodeId);
                children.put(j);
            }
        } else if(type.equals("s")) {
            // TODO check readers
            
            GeoService gs = em.find(GeoService.class, new Long(id));
            // GeoService may be invalid and not have a top layer
            if(gs.getTopLayer() != null && Authorizations.isLayerReadAuthorized(gs.getTopLayer(), context.getRequest(), em)) {
                
                for(Layer sublayer: gs.getTopLayer().getChildren()) {
                    if(Authorizations.isLayerReadAuthorized(sublayer, context.getRequest(), em)) {
                        JSONObject j = layerJSON(sublayer);
                        j.put("parentid", nodeId);
                        children.put(j);
                    }
                }
            }
        } else if(type.equals("l")) {
            Layer layer = em.find(Layer.class, new Long(id));
            if(Authorizations.isLayerReadAuthorized(layer, context.getRequest(), em)) {
                for(Layer sublayer: layer.getChildren()) {

                    if(Authorizations.isLayerReadAuthorized(sublayer, context.getRequest(), em)) {
                        JSONObject j = layerJSON(sublayer);
                        j.put("parentid", nodeId);
                        children.put(j);
                    }
                }
            }
        }
        
        return new StreamingResolution("application/json", new StringReader(children.toString()));          
    }    
    
    private static JSONObject layerJSON(Layer l) throws JSONException {
        JSONObject j = new JSONObject();
        j.put("id", "l" + l.getId());
        j.put("layerName", l.getName());
        String alias = l.getName();
        if(l.getTitleAlias() != null){
            alias = l.getTitleAlias();
        }else if(l.getTitle() != null){
            alias = l.getTitle();
        }
        j.put("name", alias);
        j.put("type", "layer");
        j.put("isLeaf", l.getChildren().isEmpty());
        j.put("isVirtual", l.isVirtual());
        return j;
    }
    
    public Resolution search() throws JSONException {
        
        EntityManager em = Stripersist.getEntityManager();
        
        q = "%" + q.toLowerCase() + "%";
        List<GeoService> results = em.createQuery("select distinct gs from GeoService gs "
                + "left join gs.keywords kw "
                + "where lower(gs.name) like :q "
                + "or lower(kw) like :q2")
                .setParameter("q", q)
                .setParameter("q2", q)
                .setMaxResults(10)
                .getResultList();
        
        JSONArray jresults = new JSONArray();
        
        for(GeoService service: results) {
            JSONObject j = new JSONObject();
            j.put("id", "s" + service.getId());
            j.put("service", service.toJSONObject(false, em));
            j.put("name", service.getName());
            j.put("type", "service");
            j.put("isLeaf", service.getTopLayer() == null);
            j.put("status", service.isMonitoringStatusOK() ? "ok" : "error");
            jresults.put(j);
        }
        
        return new StreamingResolution("application/json", new StringReader(jresults.toString(4)));          
    }
}
