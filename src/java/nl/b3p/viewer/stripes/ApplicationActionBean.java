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
package nl.b3p.viewer.stripes;

import java.util.logging.Level;
import java.util.logging.Logger;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.criteria.*;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.LocalizableError;
import net.sourceforge.stripes.validation.SimpleError;
import net.sourceforge.stripes.validation.Validate;
import org.stripesstuff.stripersist.Stripersist;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ConfiguredComponent;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/app/{name}/v{version}")
@StrictBinding
public class ApplicationActionBean implements ActionBean {

    private ActionBeanContext context;
    @Validate
    private String name;
    @Validate
    private String version;
    private Application application;
    private JSONObject compConfigs;

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public ActionBeanContext getContext() {
        return context;
    }
    
    public JSONObject getCompConfigs() {
        return compConfigs;
    }

    public void setCompConfigs(JSONObject compConfigs) {
        this.compConfigs = compConfigs;
    }
    //</editor-fold>


    public Resolution view() {
        EntityManager em = Stripersist.getEntityManager();

        if (name != null) {
            CriteriaBuilder cb = em.getCriteriaBuilder();
            CriteriaQuery q = cb.createQuery(Application.class);
            Root<Application> root = q.from(Application.class);
            Predicate namePredicate = cb.equal(root.get("name"), name);
            Predicate versionPredicate = version != null
                    ? cb.equal(root.get("version"), version)
                    : cb.isNull(root.get("version"));
            q.where(cb.and(namePredicate, versionPredicate));
            try {
                application = (Application) em.createQuery(q).getSingleResult();
            } catch (NoResultException nre) {
            }
        }

        if (application == null) {
            getContext().getValidationErrors().addGlobalError(new LocalizableError("app.notfound", name + (version != null ? " v" + version : "")));
            return new ForwardResolution("/WEB-INF/jsp/error.jsp");
        }
        try {
            compConfigs = new JSONObject();
            for (ConfiguredComponent comp : application.getComponents()) {
                compConfigs.put(comp.getName(), comp.getConfig());
            }
        } catch (JSONException ex) {
            getContext().getValidationErrors().addGlobalError(new SimpleError("Configuraties niet kunnen samenstellen: ",ex));
        }

        getContext().getMessages().add(new SimpleMessage("test!"));

        return new ForwardResolution("/WEB-INF/jsp/app.jsp");
    }
}
