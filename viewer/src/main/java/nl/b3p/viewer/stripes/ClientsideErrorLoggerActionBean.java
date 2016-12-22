/*
 * Copyright (C) 2016 B3Partners B.V.
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

import java.io.StringReader;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;

/**
 *
 * @author mprins
 */
@UrlBinding("/action/errorlog")
@StrictBinding
public class ClientsideErrorLoggerActionBean implements ActionBean {

    private static final Log LOG = LogFactory.getLog(ClientsideErrorLoggerActionBean.class);
    private ActionBeanContext context;
    @Validate
    private String msg;

    /**
     * Log the message to the application log with a WARN severity. The message
     * will only show up in the log if the logging is setup for warn logging or
     * lower.
     *
     * @return a success message {@code {"logged":true}} if warn level logging
     * is enabled
     */
    @DefaultHandler
    public Resolution log() {
        LOG.debug(msg);

        JSONObject json = new JSONObject();
        json.put("logged", LOG.isDebugEnabled());

        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    @Override
    public ActionBeanContext getContext() {
        return this.context;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

}
