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
import java.util.logging.Level;
import java.util.logging.Logger;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.SimpleError;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.ConfiguredComponent;
import org.apache.commons.io.IOUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/layoutmanager/{$event}")
@StrictBinding
public class LayoutManagerActionBean extends ApplicationActionBean {

    private JSONArray components;
    @Validate(on = "config")
    private String configPageUrl;
    @Validate(on = "saveComponentConfig")
    private String configObject;
    @Validate
    private String name;
    @Validate
    private String className;
    @Validate
    private String div;
    @Validate(on="saveComponentConfig")
    private ConfiguredComponent component;

    // <editor-fold defaultstate="collapsed" desc="getters and setters">
    public JSONArray getComponents() {
        return components;
    }

    public void setComponents(JSONArray components) {
        this.components = components;
    }

    public String getConfigPageUrl() {
        return configPageUrl;
    }

    public void setConfigPageUrl(String configPageUrl) {
        this.configPageUrl = configPageUrl;
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

    public String getDiv() {
        return div;
    }

    public void setDiv(String div) {
        this.div = div;
    }

    public ConfiguredComponent getComponent() {
        return component;
    }

    public void setComponent(ConfiguredComponent component) {
        this.component = component;
    }

    //</editor-fold>
    
    @DefaultHandler
    public Resolution view() throws JSONException {
        Stripersist.getEntityManager().getTransaction().commit();

        components = getComponentList();

        return new ForwardResolution("/WEB-INF/jsp/application/layoutmanager.jsp");
    }

    public Resolution config() {
        Stripersist.getEntityManager().getTransaction().commit();
        return new ForwardResolution("/WEB-INF/jsp/application/configPage.jsp");
    }

    public Resolution saveComponentConfig() {
        int a = 0;
        if(component == null){
            component = new ConfiguredComponent();
        }
        component.setConfig(configObject);
        component.setName(name);
        component.setClassName(className);

        application.getComponents().add(component);
        component.getDetails().put("div", div);

        Stripersist.getEntityManager().getTransaction().commit();

        return new ForwardResolution("/WEB-INF/jsp/application/configPage.jsp");
    }

    private JSONArray getComponentList() {
        InputStream fis = null;
        try {
            URL url = new URL("http://localhost/config.json");
            fis = url.openStream();
            StringWriter sw = new StringWriter();
            IOUtils.copy(fis, sw);
            JSONArray json = new JSONArray(sw.toString());
            return json;
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
}
