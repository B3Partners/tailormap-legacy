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

import java.io.StringReader;
import java.util.List;
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.util.LayerListHelper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Roy Braam
 */
@UrlBinding("/action/componentConfigList")
@StrictBinding
@RolesAllowed({Group.ADMIN,Group.APPLICATION_ADMIN})
public class ComponentConfigListActionBean implements ActionBean {

    private static final Log log = LogFactory.getLog(ComponentConfigListActionBean.class);
    private ActionBeanContext context;

    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    @Validate
    private Long appId;
    @Validate
    private Boolean filterable = false;
    @Validate
    private Boolean bufferable = false;
    @Validate
    private Boolean editable = false;
    @Validate
    private Boolean influence = false;
    @Validate
    private Boolean arc = false;
    @Validate
    private Boolean wfs = false;
    @Validate
    private Boolean attribute = false;
    
    @Validate
    private String type;

    //<editor-fold defaultstate="collapsed" desc="Getters and setters">
    public Long getAppId() {
        return appId;
    }

    public void setAppId(Long appId) {
        this.appId = appId;
    }

    public Boolean getBufferable() {
        return bufferable;
    }

    public void setBufferable(Boolean bufferable) {
        this.bufferable = bufferable;
    }

    public Boolean getEditable() {
        return editable;
    }

    public void setEditable(Boolean editable) {
        this.editable = editable;
    }

    public Boolean getFilterable() {
        return filterable;
    }

    public void setFilterable(Boolean filterable) {
        this.filterable = filterable;
    }

    public Boolean getInfluence() {
        return influence;
    }

    public void setInfluence(Boolean influence) {
        this.influence = influence;
    }

    public Boolean getArc() {
        return arc;
    }

    public void setArc(Boolean arc) {
        this.arc = arc;
    }

    public Boolean getAttribute() {
        return attribute;
    }

    public void setAttribute(Boolean attribute) {
        this.attribute = attribute;
    }

    public Boolean getWfs() {
        return wfs;
    }

    public void setWfs(Boolean wfs) {
        this.wfs = wfs;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    //</editor-fold>
    
    @DefaultHandler
    public Resolution layerlist() {
        EntityManager em = Stripersist.getEntityManager();
        JSONArray jsonArray = new JSONArray();

        if (appId != null) {
            Application app = em.find(Application.class, appId);
            List<ApplicationLayer> layers =LayerListHelper.getLayers(app, filterable, bufferable, editable, influence, arc, wfs, attribute, false, null,em);
            for (ApplicationLayer layer : layers) {
                try {
                    jsonArray.put(layer.toJSONObject(em));
                } catch (JSONException je) {
                    log.error("Error while getting JSONObject of Layer with id: " + layer.getId(), je);
                }
            }
        }
        return new StreamingResolution("application/json", new StringReader(jsonArray.toString()));
    }
    
    public Resolution attributesources(){
        EntityManager em = Stripersist.getEntityManager();

        JSONObject result = new JSONObject();
        result.put("success", false);
        JSONArray fsArray = new JSONArray();
        JSONObject ftsObject = new JSONObject();
        List<FeatureSource> fses = em.createQuery("from FeatureSource where protocol = :protocol").setParameter("protocol", "wfs").getResultList();
        for (FeatureSource fs : fses) {
            JSONObject fsObject = fs.toJSONObject();
            List<SimpleFeatureType> fts = fs.getFeatureTypes();
            
            JSONArray ftsArray = new JSONArray();
            for (SimpleFeatureType ft : fts) {
                JSONObject ftObject = ft.toJSONObject();
                ftsArray.put(ftObject);
            }
            
            ftsObject.put(fs.getId().toString(), ftsArray);
            fsArray.put(fsObject);
        }
        
        result.put("featureTypes", ftsObject);
        result.put("featureSources", fsArray);
        result.put("success", true);
        return new StreamingResolution("application/json", new StringReader(result.toString()));
    }

}
