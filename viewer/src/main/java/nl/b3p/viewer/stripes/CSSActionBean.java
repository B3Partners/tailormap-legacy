/*
 * Copyright (C) 2014 B3Partners B.V.
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
package nl.b3p.viewer.stripes;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.ErrorResolution;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Application;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Meine Toonen
 */
@UrlBinding("/action/style/")
@StrictBinding
public class CSSActionBean implements ActionBean {

    private ActionBeanContext context;
    
    private static final String CSS_FILE = "style.jsp";

    @Validate
    private String theme;

    private final String location = "/viewer-html/common/openlayers/theme/";

    @Validate
    private Application app;

    // <editor-fold defaultstate="collapsed" desc="Getters and Setters">
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public ActionBeanContext getContext() {
        return this.context;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getLocation() {
        return location;
    }

    public Application getApp() {
        return app;
    }

    public void setApp(Application app) {
        this.app = app;
    }

    //</editor-fold>
    @DefaultHandler
    public Resolution style() {
        HttpServletRequest request = getContext().getRequest();
        Resolution r = ApplicationActionBean.checkRestriction(context, app, Stripersist.getEntityManager());
        if (r != null) {
            return r;
        }
        // Session must exist
        HttpSession sess = request.getSession(false);
        if (sess == null) {
            return new ErrorResolution(HttpServletResponse.SC_FORBIDDEN, "Proxy requests forbidden");
        }

        return new ForwardResolution(location + theme + "/" + CSS_FILE);
    }
}
