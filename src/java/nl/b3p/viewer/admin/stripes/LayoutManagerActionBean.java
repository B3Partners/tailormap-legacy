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

import java.io.*;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.Query;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.SimpleError;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.ConfiguredComponent;
import nl.b3p.viewer.config.security.Group;
import org.apache.commons.io.IOUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/layoutmanager/{$event}")
@StrictBinding
public class LayoutManagerActionBean extends ApplicationActionBean {

    private JSONObject metadata;
    private JSONArray components;
    private List<Group> allGroups;
    
    @Validate(on = "config")
    private String name;// = "testComponent1";
    @Validate(on = "config")
    private String className;
    @Validate(on = "saveComponentConfig")
    private ConfiguredComponent component;
    @Validate(on = "saveComponentConfig")
    private String configObject;
    @Validate(on = "saveComponentConfig")
    private List<String> groups = new ArrayList<String>();

    // <editor-fold defaultstate="collapsed" desc="getters and setters">
    public JSONArray getComponents() {
        return components;
    }

    public void setComponents(JSONArray components) {
        this.components = components;
    }

    public String getConfigObject() {
        return configObject;
    }

    public void setConfigObject(String configObject) {
        this.configObject = configObject;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ConfiguredComponent getComponent() {
        return component;
    }

    public void setComponent(ConfiguredComponent component) {
        this.component = component;
    }

    public JSONObject getMetadata() {
        return metadata;
    }

    public void setMetadata(JSONObject metadata) {
        this.metadata = metadata;
    }

    public List<Group> getAllGroups() {
        return allGroups;
    }

    public void setAllGroups(List<Group> allGroups) {
        this.allGroups = allGroups;
    }

    public List<String> getGroups() {
        return groups;
    }

    public void setGroups(List<String> groups) {
        this.groups = groups;
    }

    //</editor-fold>
    
    @DefaultHandler
    public Resolution view() throws JSONException {
        Stripersist.getEntityManager().getTransaction().commit();
        components = getComponentList();
        return new ForwardResolution("/WEB-INF/jsp/application/layoutmanager.jsp");
    }

    public Resolution config() {
        EntityManager em = Stripersist.getEntityManager();
        try {
            metadata = getMetadata(className);
            if (metadata == null) {
                getContext().getValidationErrors().addGlobalError(new SimpleError("Geen metadata gevonden bij componentclassname: " + className));
            }
        } catch (JSONException ex) {
            getContext().getValidationErrors().addGlobalError(new SimpleError(ex.getClass().getName() + ": " + ex.getMessage()));
        }
        
        allGroups = Stripersist.getEntityManager().createQuery("from Group").getResultList();
        
        Query q = em.createQuery("FROM ConfiguredComponent WHERE application = :application AND name = :name").setParameter("application", application).setParameter("name", name);
        try {
            component = (ConfiguredComponent) q.getSingleResult();
            em.getTransaction().commit();
        } catch (NoResultException ex) {
            getContext().getValidationErrors().addGlobalError(new SimpleError(ex.getClass().getName() + ": " + ex.getMessage()));
        }
        return new ForwardResolution("/WEB-INF/jsp/application/configPage.jsp");
    }

    public Resolution saveComponentConfig() {
        EntityManager em = Stripersist.getEntityManager();
        if (component == null) {
            component = new ConfiguredComponent();
        }
        component.setConfig(configObject);
        component.setName(name);
        component.setClassName(className);
        component.setApplication(application);
        
        component.getReaders().clear();
        component.setReaders(new HashSet<String>(groups));

        em.persist(component);
        em.getTransaction().commit();

        return new ForwardResolution("/WEB-INF/jsp/application/configPage.jsp");
    }

    @Before(stages = {LifecycleStage.HandlerResolution})
    private JSONArray getComponentList() {
        InputStream fis = null;
        try {
            URL url = new URL("http://localhost/config.json");
            fis = url.openStream();
            StringWriter sw = new StringWriter();
            IOUtils.copy(fis, sw);
            components = new JSONArray(sw.toString());
            return components;
        } catch (IOException ex) {
            getContext().getValidationErrors().addGlobalError(new SimpleError(ex.getClass().getName() + ": " + ex.getMessage()));
        } catch (JSONException ex) {
            getContext().getValidationErrors().addGlobalError(new SimpleError(ex.getClass().getName() + ": " + ex.getMessage()));
        } finally {
            try {
                fis.close();
            } catch (IOException ex) {
                Logger.getLogger(LayoutManagerActionBean.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        return null;
    }

    private JSONObject getMetadata(String className) throws JSONException {
        for (int i = 0; i < components.length(); i++) {
            JSONObject ob = components.getJSONObject(i);
            if (ob.has("className")) {
                if (ob.get("className").equals(className)) {
                    return ob;
                }
            }
        }
        return null;
    }
}
