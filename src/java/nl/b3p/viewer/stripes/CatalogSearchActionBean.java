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

import java.io.StringReader;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import org.json.*;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/csw/search")
@StrictBinding
public class CatalogSearchActionBean implements ActionBean {
    
    private ActionBeanContext context;
    
    @Validate
    private String url;
    
    @Validate
    private String q;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getQ() {
        return q;
    }

    public void setQ(String q) {
        this.q = q;
    }
    //</editor-fold>        
    
    public Resolution search() throws JSONException {    
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);
        String error = null;
        
        JSONArray results = new JSONArray();
        
        
        json.put("results", results);                
        
        json.put("success", Boolean.TRUE);
        
        if(error != null) {
            json.put("error", error);
        }
        
        return new StreamingResolution("application/json", new StringReader(json.toString(4)));          
    }
        
}
