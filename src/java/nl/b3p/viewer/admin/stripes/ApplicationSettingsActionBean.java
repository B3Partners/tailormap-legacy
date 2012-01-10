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

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.config.app.Application;
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
    @ValidateNestedProperties({
                @Validate(field="name", required=true, maxlength=255),
                @Validate(field="version", maxlength=255),
    })
    private Application application;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public Application getApplication() {
        return application;
    }
    
    public void setApplication(Application application) {
        this.application = application;
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
        return new ForwardResolution(JSP);
    }
    
    @DontBind
    public Resolution cancel() {        
        return new ForwardResolution(JSP);
    }
    
    public Resolution save() {
        Stripersist.getEntityManager().persist(application);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Applicatie is opgeslagen"));
        
        return new ForwardResolution(JSP);
    }
}
