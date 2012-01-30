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
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.config.app.*;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@UrlBinding("/action/applicationstartmap/{$event}")
@StrictBinding
public class ApplicationStartMapActionBean extends ApplicationActionBean {

    private static final String JSP = "/WEB-INF/jsp/application/applicationStartMap.jsp";
    @Validate
    private String selectedlayers;
    @Validate
    private String nodeId;
    private Level rootlevel;

    @DefaultHandler
    @HandlesEvent("default")
    @DontValidate
    public Resolution view() {
        if (application == null) {
            getContext().getMessages().add(new SimpleError("Er moet eerst een bestaande applicatie geactiveerd of een nieuwe applicatie gemaakt worden."));
            return new ForwardResolution("/WEB-INF/jsp/application/chooseApplication.jsp");
        } else {
            rootlevel = application.getRoot();
        }

        return new ForwardResolution(JSP);
    }
    
    public Resolution save() {
        rootlevel = application.getRoot();
        
        List<ApplicationLayer> checkedLayers = getSelectedLayers(rootlevel);
        if(checkedLayers != null){
            for (Iterator it = checkedLayers.iterator(); it.hasNext();) {
                ApplicationLayer layer = (ApplicationLayer) it.next();
                layer.setChecked(false);
                Stripersist.getEntityManager().persist(layer);
            }
        }
        
        if(selectedlayers != null && selectedlayers.length() > 0){
            String[] layers = selectedlayers.split(",");
            for(int i = 0; i < layers.length; i++){
                Long id = new Long(layers[i].substring(1));
                ApplicationLayer appLayer = Stripersist.getEntityManager().find(ApplicationLayer.class, id);
                appLayer.setChecked(true);
                Stripersist.getEntityManager().persist(appLayer);
            }
        }
        Stripersist.getEntityManager().getTransaction().commit();
        getContext().getMessages().add(new SimpleMessage("Het startkaartbeeld is opgeslagen"));
        
        return new ForwardResolution(JSP);
    }

    public Resolution loadApplicationTree() throws JSONException {

        EntityManager em = Stripersist.getEntityManager();

        final JSONArray children = new JSONArray();

        if (!nodeId.equals("n")) {

            String type = nodeId.substring(0, 1);
            int id = Integer.parseInt(nodeId.substring(1));
            if (type.equals("n")) {
                Level l = em.find(Level.class, new Long(id));
                for (Level sub : l.getChildren()) {
                    JSONObject j = new JSONObject();
                    j.put("id", "n" + sub.getId());
                    j.put("name", sub.getName());
                    j.put("type", "level");
                    j.put("isLeaf", sub.getChildren().isEmpty() && sub.getLayers().isEmpty());
                    if (sub.getParent() != null) {
                        j.put("parentid", sub.getParent().getId());
                    }
                    children.put(j);
                }

                for (ApplicationLayer layer : l.getLayers()) {
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

    public Resolution loadSelectedLayers() throws JSONException {
        EntityManager em = Stripersist.getEntityManager();

        final JSONArray children = new JSONArray();
        
        rootlevel = application.getRoot();

        List<ApplicationLayer> layers = getSelectedLayers(rootlevel);
        if(layers != null){
            for (Iterator it = layers.iterator(); it.hasNext();) {
                ApplicationLayer layer = (ApplicationLayer) it.next();
                
                JSONObject j = new JSONObject();
                j.put("id", "s" + layer.getId());
                j.put("name", layer.getLayerName());
                j.put("type", "layer");
                j.put("isLeaf", true);
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

    private List<ApplicationLayer> getSelectedLayers(Level level) {
        List<ApplicationLayer> children = new ArrayList();
        
        if (level.getLayers() != null) {
            List<ApplicationLayer> appLayers = level.getLayers();
        
            for (Iterator it = appLayers.iterator(); it.hasNext();) {
                ApplicationLayer layer = (ApplicationLayer) it.next();

                if(layer.isChecked()){
                    
                    children.add(layer);
                }
            }
        }
        
        if(level.getChildren() != null){
            List<Level> childLevels = level.getChildren();
        
            for(Iterator it = childLevels.iterator(); it.hasNext();){
                Level childLevel = (Level)it.next();
                children.addAll(getSelectedLayers(childLevel));
            }
        }

        return children;
    }

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public String getSelectedlayers() {
        return selectedlayers;
    }

    public void setSelectedlayers(String selectedlayers) {
        this.selectedlayers = selectedlayers;
    }

    public Level getRootlevel() {
        return rootlevel;
    }

    public void setRootlevel(Level rootlevel) {
        this.rootlevel = rootlevel;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }
    //</editor-fold>
}
