/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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

import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.security.Group;
import org.stripesstuff.plugin.session.Session;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Meine Toonen
 */
@StrictBinding
@RolesAllowed({Group.ADMIN,Group.APPLICATION_ADMIN}) 
public abstract class ApplicationActionBean implements ActionBean {

    protected ActionBeanContext context;
    
    @Validate
    protected Application application;
    
    @Session(key = "applicationId")
    protected Long applicationId;
    
    @Session(key = "applicationName")
    private String applicationName;

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
        if(applicationId != null && applicationId != -1L ){
            EntityManager em = Stripersist.getEntityManager();
            application = em.find(Application.class, applicationId);
            setApplication(application);
        }
    }
}
