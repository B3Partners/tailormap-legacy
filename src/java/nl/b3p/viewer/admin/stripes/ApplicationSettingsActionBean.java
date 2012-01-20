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
import nl.b3p.viewer.config.app.*;
import nl.b3p.viewer.config.security.User;
import nl.b3p.viewer.config.services.BoundingBox;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@UrlBinding("/action/applicationsettings/{$event}")
@StrictBinding
public class ApplicationSettingsActionBean extends ApplicationActionBean{
    private static final String JSP = "/WEB-INF/jsp/application/applicationSettings.jsp";
   
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
    
    @ValidateNestedProperties({
                @Validate(field="minx", maxlength=255),
                @Validate(field="miny", maxlength=255),
                @Validate(field="maxx", maxlength=255),
                @Validate(field="maxy", maxlength=255)
    })
    private BoundingBox startExtent;
    
    @ValidateNestedProperties({
                @Validate(field="minx", maxlength=255),
                @Validate(field="miny", maxlength=255),
                @Validate(field="maxx", maxlength=255),
                @Validate(field="maxy", maxlength=255)
    })
    private BoundingBox maxExtent;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">

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

    public BoundingBox getStartExtent() {
        return startExtent;
    }

    public void setStartExtent(BoundingBox startExtent) {
        this.startExtent = startExtent;
    }

    public BoundingBox getMaxExtent() {
        return maxExtent;
    }

    public void setMaxExtent(BoundingBox maxExtent) {
        this.maxExtent = maxExtent;
    }
    //</editor-fold>
    
    @DefaultHandler
    @HandlesEvent("default")
    @DontValidate
    public Resolution view(){
        if(application == null){
            getContext().getMessages().add(new SimpleError("Er moet eerst een bestaande applicatie geactiveerd of een nieuwe applicatie gemaakt worden."));
            return new ForwardResolution("/WEB-INF/jsp/application/chooseApplication.jsp");
        }
        return new ForwardResolution(JSP);
    }
    
    @DontValidate
    public Resolution newApplication(){
        application = null;
        return new ForwardResolution(JSP);
    }
    
    @DontValidate
    public Resolution edit(){
        if(application != null){
            details = application.getDetails();
            if(application.getOwner() != null){
                owner = application.getOwner().getUsername();
            }
            if(application.getStartExtent() != null){
                startExtent = application.getStartExtent();
            }
            if(application.getMaxExtent() != null){
                maxExtent = application.getMaxExtent();
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
            
            /*
             * A new application always had a root and a background level.
             */
            Level root = new Level();
            root.setName("root");
            
            Level background = new Level();
            background.setName("Achtergrond");
            background.setBackground(true);
            root.getChildren().add(background);
            background.setParent(root);
            
            Stripersist.getEntityManager().persist(background);
            Stripersist.getEntityManager().persist(root);
            application.setRoot(root);
        }
        application.setName(name);
        application.setVersion(version);
        
        if(owner != null){
            User appOwner = Stripersist.getEntityManager().find(User.class, owner);
            application.setOwner(appOwner);
        }
        if(startExtent != null){
            application.setStartExtent(startExtent);
        }
        if(maxExtent != null){
            application.setMaxExtent(maxExtent);
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
            Long foundId = null;
            if(version == null){
                foundId = (Long)Stripersist.getEntityManager().createQuery("select id from Application where name = :name and version is null")
                        .setMaxResults(1)
                        .setParameter("name", name)
                        .getSingleResult();
            }else{                   
                foundId = (Long)Stripersist.getEntityManager().createQuery("select id from Application where name = :name and version = :version")
                        .setMaxResults(1)
                        .setParameter("name", name)
                        .setParameter("version", version)
                        .getSingleResult();
            }

            if(application != null && application.getId() != null){
                if( !foundId.equals(application.getId()) ){
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
        if(startExtent != null){
            if(startExtent.getMinx() == null || startExtent.getMiny() == null || startExtent.getMaxx() == null || startExtent.getMaxy() == null ){
                errors.add("startExtent", new SimpleError("Alle velden van de start extentie moeten ingevult worden."));
            }
        }
        if(maxExtent != null){
            if(maxExtent.getMinx() == null || maxExtent.getMiny() == null || maxExtent.getMaxx() == null || maxExtent.getMaxy() == null ){
                errors.add("maxExtent", new SimpleError("Alle velden van de max extentie moeten ingevult worden."));
            }
        }
    }
}
