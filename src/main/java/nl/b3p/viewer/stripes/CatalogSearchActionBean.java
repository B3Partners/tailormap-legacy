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
import java.net.URI;
import java.util.List;
import java.util.Map;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.csw.client.CswClient;
import nl.b3p.csw.client.InputBySearch;
import nl.b3p.csw.client.OutputBySearch;
import nl.b3p.csw.server.CswServable;
import nl.b3p.csw.server.GeoNetworkCswServer;
import nl.b3p.csw.util.OnlineResource;
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
    
    @DefaultHandler
    public Resolution search() throws JSONException {    
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);
        String error = null;
    
        try {
            JSONArray results = new JSONArray();
        
            CswServable server = new GeoNetworkCswServer(null,
                    url,
                    null, 
                    null
            );        
            
            CswClient client = new CswClient(server);
            InputBySearch input = new InputBySearch(q);
            OutputBySearch output = client.search(input);            

            Map<URI, List<OnlineResource>> map = output.getResourcesMap();
            for (List<OnlineResource> resourceList : map.values()) {
                for (OnlineResource resource : resourceList) {

                    
                    String title = output.getTitle(resource.getMetadata());
                    String rurl = resource.getUrl() != null ? resource.getUrl().toString() : null;
                    String layer = resource.getName();
                    String protocol = resource.getProtocol() != null ? resource.getProtocol().getName() : null;
                    
                    if(title != null && rurl != null && protocol != null) {
                        if(protocol.toLowerCase().indexOf("wms") != -1) {
                            JSONObject result = new JSONObject();
                            result.put("label", title + (layer != null ? " (laag: " + layer + ")" : ""));
                            result.put("url", rurl);
                            result.put("protocol", "wms");
                            results.put(result);
                        }
                    }
                }
            }

            json.put("results", results);                

            json.put("success", Boolean.TRUE);
        } catch(Exception e) {

            error = "Fout bij zoeken in CSW: " + e.toString();
            if(e.getCause() != null) {
                error += "; oorzaak: " + e.getCause().toString();
            }
        }
                
        if(error != null) {
            json.put("error", error);
        }
        
        return new StreamingResolution("application/json", new StringReader(json.toString(4)));          
    }
        
}
