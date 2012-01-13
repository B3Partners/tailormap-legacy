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
import javax.persistence.NoResultException;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.security.User;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@UrlBinding("/action/applicationsettings/{$event}")
@StrictBinding
public class ApplicationSettingsActionBean implements ActionBean {
    private ActionBeanContext context;
    private static final String JSP = "/WEB-INF/jsp/application/applicationSettings.jsp";
    
    @Validate
    private Application application;
    
    @Validate
    private String name;
    @Validate
    private String version;
    @Validate
    private String owner;
    @Validate
    private boolean authenticatedRequired;
    
    @Validate
    private Map<String,String> details = new HashMap<String,String>();

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public Application getApplication() {
        return application;
    }
    
    public void setApplication(Application application) {
        this.application = application;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    public void setDetails(Map<String, String> details) {
        this.details = details;
    }

    public boolean getAuthenticatedRequired() {
        return authenticatedRequired;
    }

    public void setAuthenticatedRequired(boolean authenticatedRequired) {
        this.authenticatedRequired = authenticatedRequired;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
    
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    //</editor-fold>
    
    @DefaultHandler
    @HandlesEvent("default")
    @DontValidate
    public Resolution view(){
        return new ForwardResolution(JSP);
    }
    
    @DontValidate
    public Resolution edit(){
        if(application != null){
            details = application.getDetails();
            if(application.getOwner() != null){
                owner = application.getOwner().getUsername();
            }
        }
        
        return new ForwardResolution(JSP);
    }
    
    @DontBind
    public Resolution cancel() {        
        return new ForwardResolution(JSP);
    }
    
    public Resolution save() {
        if(application == null){
            application = new Application();
        }
        application.setName(name);
        application.setVersion(version);
        
        if(owner != null){
            User appOwner = Stripersist.getEntityManager().find(User.class, owner);
            application.setOwner(appOwner);
        }
        application.setAuthenticatedRequired(authenticatedRequired);
        
        application.getDetails().clear();
        application.getDetails().putAll(details);
        
        Stripersist.getEntityManager().persist(application);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Applicatie is opgeslagen"));
        
        return new ForwardResolution(JSP);
    }
    
    @ValidationMethod(on="save")
    public void validate(ValidationErrors errors) throws Exception {
        if(name == null) {
            errors.add("name", new LocalizableError("validation.required.valueNotPresent"));
            return;
        }
        
        try {
            Long founId = null;
            if(version == null){
                founId = (Long)Stripersist.getEntityManager().createQuery("select id from Application where name = :name and version is null")
                        .setMaxResults(1)
                        .setParameter("name", name)
                        .getSingleResult();
            }else{                   
                founId = (Long)Stripersist.getEntityManager().createQuery("select id from Application where name = :name and version = :version")
                        .setMaxResults(1)
                        .setParameter("name", name)
                        .setParameter("version", version)
                        .getSingleResult();
            }

            if(application != null && application.getId() != null){
                if( !founId.equals(application.getId()) ){
                    errors.add("name", new SimpleError("Naam en versie moeten een unieke combinatie vormen.")); 
                }
            }else{
                errors.add("name", new SimpleError("Naam en versie moeten een unieke combinatie vormen."));
            }
        } catch(NoResultException nre) {
            // name version combination is unique
        }
        
        /*
         * Check if owner is an excisting user
         */
        if(owner != null){
            try {
                User appOwner = Stripersist.getEntityManager().find(User.class, owner);
                if(appOwner == null){
                    errors.add("owner", new SimpleError("Gebruiker met deze naam bestaat niet."));
                }
            } catch(NoResultException nre) {
                errors.add("owner", new SimpleError("Gebruiker met deze naam bestaat niet."));
            }
        }
    }
}
