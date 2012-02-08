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

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
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
import nl.b3p.viewer.components.ComponentRegistry;
import nl.b3p.viewer.config.app.ConfiguredComponent;
import nl.b3p.viewer.config.security.Group;
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
    @Validate(on = {"config", "removeComponent"})
    private String name;
    @Validate(on = "config")
    private String className;
    @Validate(on = "saveComponentConfig")
    private ConfiguredComponent component;
    @Validate(on = "saveComponentConfig")
    private String configObject;
    @Validate(on = "saveComponentConfig")
    private List<String> groups = new ArrayList<String>();
    @Validate(on = "saveApplicationLayout")
    private String layout;

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

    public String getLayout() {
        return layout;
    }

    public void setLayout(String layout) {
        this.layout = layout;
    }
    //</editor-fold>

    @DefaultHandler
    public Resolution view() throws JSONException {
        if (application == null) {
            getContext().getMessages().add(new SimpleError("Er moet eerst een bestaande applicatie geactiveerd of een nieuwe applicatie gemaakt worden."));
            return new ForwardResolution("/WEB-INF/jsp/application/chooseApplication.jsp");
        }
        Stripersist.getEntityManager().getTransaction().commit();

        return new ForwardResolution("/WEB-INF/jsp/application/layoutmanager.jsp");
    }

    public Resolution config() {
        EntityManager em = Stripersist.getEntityManager();

        allGroups = Stripersist.getEntityManager().createQuery("from Group").getResultList();

        try {
            component = (ConfiguredComponent) em.createQuery(
                    "from ConfiguredComponent where application = :application and name = :name").setParameter("application", application).setParameter("name", name).getSingleResult();
            groups = new ArrayList<String>(component.getReaders());
        } catch (NoResultException ex) {
            getContext().getValidationErrors().addGlobalError(new SimpleError(ex.getClass().getName() + ": " + ex.getMessage()));
        }
        metadata = ComponentRegistry.getInstance().getViewerComponent(className).getMetadata();

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

    public Resolution removeComponent() {

        EntityManager em = Stripersist.getEntityManager();

        try {
            component = (ConfiguredComponent) em.createQuery(
                    "from ConfiguredComponent where application = :application and name = :name").setParameter("application", application).setParameter("name", name).getSingleResult();

            em.remove(component);
        } catch (NoResultException e) {
            
        }
        em.getTransaction().commit();
        return new ForwardResolution("/WEB-INF/jsp/application/layoutmanager.jsp");
    }

    public Resolution saveApplicationLayout() {
        try {
            EntityManager em = Stripersist.getEntityManager();
            JSONObject jsonLayout = new JSONObject(layout);

            for (Iterator it = jsonLayout.keys(); it.hasNext();) {
                String key = (String) it.next();
                JSONObject layoutItem = jsonLayout.getJSONObject(key);
                if (layoutItem.has("components")) {
                    JSONArray layoutItemComponents = layoutItem.getJSONArray("components");
                    for (int i = 0; i < layoutItemComponents.length(); i++) {
                        JSONObject layoutComponent = layoutItemComponents.getJSONObject(i);
                        String compName = layoutComponent.getString("name");
                        String compClassName = layoutComponent.getString("componentClass");
                        Query q = em.createQuery("from ConfiguredComponent where application = :application and name = :name").setParameter("application", application).setParameter("name", compName);
                        // Check if the component is already saved. If not, return error
                        try {
                            q.getSingleResult();
                        } catch (NoResultException nre) {
                            ConfiguredComponent cc = new ConfiguredComponent();
                            cc.setClassName(compClassName);
                            cc.setName(compName);
                            cc.setApplication(application);
                            em.persist(cc);
                        }
                    }
                }
            }

            application.setLayout(layout);
            em.persist(application);
            em.getTransaction().commit();
        } catch (JSONException ex) {
            Logger.getLogger(LayoutManagerActionBean.class.getName()).log(Level.SEVERE, null, ex);
        }
        return new ForwardResolution("/WEB-INF/jsp/application/layoutmanager.jsp");
    }

    @Before(stages = {LifecycleStage.HandlerResolution})
    public void getComponentList() {
        components = new JSONArray();
        for (String cn : ComponentRegistry.getInstance().getSortedComponentClassNameList()) {
            components.put(ComponentRegistry.getInstance().getViewerComponent(cn).getMetadata());
        }
    }
}
