/*
 * Copyright (C) 2012-2018 B3Partners B.V.
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
import nl.b3p.i18n.LocalizableActionBean;
import nl.b3p.i18n.ResourceBundleProvider;
import nl.b3p.mail.Mailer;
import nl.b3p.viewer.config.app.Application;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.json.JSONObject;

import javax.servlet.http.HttpServletResponse;
import java.text.MessageFormat;
import java.util.ResourceBundle;

/**
 *
 * @author Geert Plaisier
 */
@UrlBinding("/action/contact")
@StrictBinding
public class ContactActionBean extends LocalizableApplicationActionBean implements ActionBean {

    private static final Log log = LogFactory.getLog(ContactActionBean.class);

    @Validate
    private String params;

    @Validate
    private Application application;
    
    private ActionBeanContext context;
    
    @DefaultHandler
    public Resolution contact() throws JSONException, Exception {
        JSONObject req = new JSONObject(params);
        Mailer.sendMail(req.getString("name"), req.getString("email"), "chris@b3p.nl", "Message via contactform", req.getString("message"));
        StreamingResolution res = new StreamingResolution("application/json") {
            @Override
            public void stream(HttpServletResponse response) throws Exception {
                response.getWriter().println("success");
                response.getWriter().close();
                response.getWriter().flush();
            }
        };
        return res;
    }

    //<editor-fold defaultstate="collapsed" desc="Getters and Setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public String getParams() {
        return params;
    }

    public void setParams(String params) {
        this.params = params;
    }

    @Override
    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }
    //</editor-fold>


}
