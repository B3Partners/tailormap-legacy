/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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

import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;


/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
@UrlBinding("/action/cyclorama")
@StrictBinding
public class CycloramaActionBean implements ActionBean {

    private static final Log log = LogFactory.getLog(LayerListActionBean.class);
    private ActionBeanContext context;

    //<editor-fold defaultstate="collapsed" desc="Getters and Setters">
    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    // </editor-fold>


    @DefaultHandler
    public Resolution sign(){
        String token = "";
        JSONObject json = new JSONObject();
        return new StreamingResolution("application/json", json.toString());
    }
}
