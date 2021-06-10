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
package nl.tailormap.viewer.admin.stripes;

import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.tailormap.i18n.LocalizableActionBean;
import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.config.security.Group;
import org.stripesstuff.plugin.session.Session;
import org.stripesstuff.stripersist.Stripersist;

import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import java.util.List;

/**
 *
 * @author Meine Toonen
 */
@StrictBinding
@RolesAllowed({Group.ADMIN,Group.APPLICATION_ADMIN}) 
public abstract class ApplicationActionBean extends LocalizableActionBean {

    protected ActionBeanContext context;
            
    @Validate
    protected Application application;
    
    @Session(key = "applicationId")
    protected Long applicationId;
    
    @Session(key = "applicationName")
    private String applicationName;


    protected List<Group> allGroups;


    // <editor-fold defaultstate="collapsed" desc="Getters and Setters">
    public void setContext(ActionBeanContext abc) {
        this.context = abc;
    }

    public ActionBeanContext getContext() {
        return context;
    }

    public Application getApplication() {
        return application;
    }

    public String getApplicationName() {
        return applicationName;
    }

    public void setApplicationName(String applicationName) {
        this.applicationName = applicationName;
    }

    public List<Group> getAllGroups() {
        return allGroups;
    }

    public void setAllGroups(List<Group> allGroups) {
        this.allGroups = allGroups;
    }
    // </editor-fold>
    
    public void setApplication(Application application) {
        this.application = application;
        if(application != null) {
            this.applicationId = application.getId();
            this.applicationName = application.getName();
            if(application.getVersion() != null) {
                this.applicationName += " v" + application.getVersion();
            }
        } else {
            this.applicationId = null;
            this.applicationName = null;
        }
    }

    @After(stages = {LifecycleStage.BindingAndValidation})
    public void initApplication() {
            EntityManager em = Stripersist.getEntityManager();
        if(applicationId != null && applicationId != -1L ){
            application = em.find(Application.class, applicationId);
            setApplication(application);
        }
        allGroups = em.createQuery("from Group").getResultList();
    }
}
