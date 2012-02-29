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
package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Application;
import org.json.JSONException;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/login")
@StrictBinding
public class LoginActionBean implements ActionBean {
    
    private ActionBeanContext context;
    
    @Validate
    private String bookmarkParams;
    
    @Validate
    private String name;

    @Validate
    private String version;

    @Validate
    private boolean debug;

    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public String getBookmarkParams() {
        return bookmarkParams;
    }

    public void setBookmarkParams(String bookmarkParams) {
        this.bookmarkParams = bookmarkParams;
    }

    public boolean isDebug() {
        return debug;
    }

    public void setDebug(boolean debug) {
        this.debug = debug;
    }

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
    
    public Resolution forward() throws JSONException {
        return new RedirectResolution(ApplicationActionBean.class).includeRequestParameters(true);  
    }
}
