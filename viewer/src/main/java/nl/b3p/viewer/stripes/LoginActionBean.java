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
package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/login")
@StrictBinding
public class LoginActionBean implements ActionBean {
    
    private ActionBeanContext context;

    @Validate
    private boolean actuallyLogin;
    
    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public boolean isActuallyLogin() {
        return actuallyLogin;
    }

    public void setActuallyLogin(boolean actuallyLogin) {
        this.actuallyLogin = actuallyLogin;
    }
    
    @DefaultHandler
    public Resolution forward() {
        return new RedirectResolution(ApplicationActionBean.class).includeRequestParameters(true);
    }
    
    public Resolution logout() {
        if(actuallyLogin) {
            return forward();
        }
        
        context.getRequest().getSession().invalidate();

        // Avoid immediately logging out again because include request parameters
        // includes logout=true parameter leading to this handler being executed
        return new RedirectResolution(ApplicationActionBean.class).includeRequestParameters(true).addParameter("actuallyLogin", true);
    }
}
