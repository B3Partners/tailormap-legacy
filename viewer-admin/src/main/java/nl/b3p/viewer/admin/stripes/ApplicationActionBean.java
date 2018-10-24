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

import java.util.List;
import java.util.ResourceBundle;
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.action.Before;
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

    private ResourceBundle bundle;
            
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

    /**
     * @return the bundle
     */
    public ResourceBundle getBundle() {
        return bundle;
    }

    /**
     * @param bundle the bundle to set
     */
    public void setBundle(ResourceBundle bundle) {
        this.bundle = bundle;
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

    @Before
    protected void initBundle() {
        setBundle(ResourceBundle.getBundle("ViewerResources", context.getRequest().getLocale()));
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
            EntityManager em = Stripersist.getEntityManager();
        if(applicationId != null && applicationId != -1L ){
            application = em.find(Application.class, applicationId);
            setApplication(application);
        }
        allGroups = em.createQuery("from Group").getResultList();
    }
}
