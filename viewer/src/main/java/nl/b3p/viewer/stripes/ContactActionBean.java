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
import nl.b3p.viewer.config.app.ConfiguredComponent;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import java.text.MessageFormat;
import java.util.Iterator;
import java.util.ResourceBundle;
import java.util.Set;

/**
 *
 * @author Geert Plaisier
 */
@UrlBinding("/action/contact")
@StrictBinding
public class ContactActionBean extends LocalizableApplicationActionBean implements ActionBean {

    private static final Log log = LogFactory.getLog(ContactActionBean.class);
    private static final String COMPONENT_NAME = "viewer.components.Contactform";

    @Validate
    private String params;

    @Validate
    private Application application;
    
    private ActionBeanContext context;
    
    @DefaultHandler
    public Resolution contact() throws JSONException, Exception {
        JSONObject req = new JSONObject(params);
        JSONObject config = getContactformConfig();
        JSONObject resp = new JSONObject();
        resp.put("success", false);
        if (config != null && config.has("receiverTo") && StringUtils.isNotEmpty(config.getString("receiverTo"))) {
            String subject = getBundle().getString("viewer.contactactionbean.default_subject");
            if (config.has("receiverSubject") && StringUtils.isNotEmpty(config.getString("receiverSubject"))) {
                subject = config.getString("receiverSubject");
            }
            Mailer.sendMail(req.getString("name"), req.getString("email"), config.getString("receiverTo"), subject, req.getString("message"));
            resp.put("success", true);
        } else {
            resp.put("message", getBundle().getString("viewer.contactactionbean.not_configured"));
        }
        return new StreamingResolution("application/json", resp.toString());
    }

    private JSONObject getContactformConfig() throws JSONException{
        JSONObject obj = new JSONObject();
        if (application == null) {
            return null;
        }
        Set components = application.getComponents();
        for(Iterator it = components.iterator(); it.hasNext();){
            ConfiguredComponent comp = (ConfiguredComponent)it.next();
            if (comp.getClassName().equals(COMPONENT_NAME)) {
                return new JSONObject(comp.getConfig());

            }
        }
        return null;
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
