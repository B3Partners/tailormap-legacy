/*
 * Copyright (C) 2011 B3Partners B.V.
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

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.SimpleError;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.services.Category;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.WFSFeatureSource;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/attributesource/{$event}")
@StrictBinding
public class AttributeSourceActionBean implements ActionBean {

    private ActionBeanContext context;
    private static final String JSP = "/WEB-INF/jsp/geoservice.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/editattributesource.jsp";
   
    @Validate(on="editAttributeSource", required=false)
    private int sourceId;
    
    @Validate
    private int page;

    @Validate
    private int start;
    
    @Validate
    private int limit;
    
    @Validate
    private String sort;
    
    @Validate
    private String dir;

    @Validate
    private JSONArray filter;
    
    @Validate
    private String name;
    @Validate
    private String url;
    @Validate
    private String protocol;
    @Validate
    private String username;
    @Validate
    private String password;
    
    @Validate
    private FeatureSource featureSource;
    
    @DefaultHandler
    public Resolution view() throws JSONException {
        return new ForwardResolution(JSP);
    }
    
    public Resolution editAttributeSource() throws JSONException {
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution saveAttributeSource() throws JSONException {
        
        try {
            if(protocol.equals("wfs")) {
                featureSource = new WFSFeatureSource();
            } else if(protocol.equals("arcgis")) {
                
            } else if(protocol.equals("arcxml")) {
            
            } else if(protocol.equals("jdbc")) {
                
            } else {
                getContext().getValidationErrors().add("protocol", new SimpleError("Ongeldig"));
            }
        } catch(Exception e) {
            getContext().getValidationErrors().addGlobalError(new SimpleError(e.getClass().getName() + ": " + e.getMessage()));
            return new ForwardResolution(EDITJSP);
        }
        
        featureSource.setName(name);
        featureSource.setUrl(url);
        featureSource.setUsername(username);
        featureSource.setPassword(password);
        
        /*Stripersist.getEntityManager().persist(source);
        Stripersist.getEntityManager().getTransaction().commit();*/
        
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution getGridData() throws JSONException { 
        String[] types = { "WFS", "ArcXML", "ArcGIS", "JDBC" };
        
        JSONArray jsonData = new JSONArray();
        int i = this.getStart() + 1;
        int l = i + this.getLimit();
        
        String naam = "Attribuutbron ";
        String url = "http://www.example.org/";
        String filterType = "";
        /* 
         * FILTERING: filter is delivered by frontend as JSON array [{property, value}]
         * for demo purposes the value is now returned, ofcourse here should the DB
         * query be built to filter the right records
         */
        if(this.getFilter() != null) {
            for(int k = 0; k < this.getFilter().length(); k++) {
                JSONObject j = this.getFilter().getJSONObject(k);
                String property = j.getString("property");
                String value = j.getString("value");
                if(property.equals("naam")) {
                    naam = value;
                }
                if(property.equals("url")) {
                    url = value;
                }
                if(property.equals("type")) {
                    filterType = value;
                }
            }
        }
        
        /* Just for showing sorting, should ofcourse be dealt with by DB in
         * combination with sort variable. Sorting is delivered by the frontend
         * as two variables: sort which holds the column name and dir which
         * holds the direction (ASC, DESC).
         */
        if(this.getDir() == null || this.getDir().equals("DESC")) {
            for(; i <= l; i++)
            {
                String type = filterType;
                if(type.equals("")) {
                    type = types[(int)(Math.random()*3) + 1];
                }
                JSONObject j = this.getGridRow(i, naam, url, type);
                jsonData.put(j);
            }
        } else {
            for(; l >= i; l--)
            {
                String type = filterType;
                if(type.equals("")) {
                    type = types[(int)(Math.random()*3) + 1];
                }
                JSONObject j = this.getGridRow(l, naam, url, type);
                jsonData.put(j);
            }
        }
        
        final JSONObject grid = new JSONObject();
        grid.put("totalCount", 1000);
        grid.put("gridrows", jsonData);
    
        return new StreamingResolution("application/json") {
           @Override
           public void stream(HttpServletResponse response) throws Exception {
               response.getWriter().print(grid.toString());
           }
        };
    }
    
    private JSONObject getGridRow(int i, String name, String url, String type) throws JSONException {       
        JSONObject j = new JSONObject();
        j.put("id", i);
        j.put("status", Math.random() > 0.5 ? "ok" : "error");
        j.put("naam", name + " " + i);
        j.put("url", url + i);
        j.put("type", type);
        return j;
    }

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    
    public ActionBeanContext getContext() {
        return this.context;
    }
    
    public int getLimit() {
        return limit;
    }
    
    public void setLimit(int limit) {
        this.limit = limit;
    }
    
    public int getPage() {
        return page;
    }
    
    public void setPage(int page) {
        this.page = page;
    }
    
    public int getStart() {
        return start;
    }
    
    public void setStart(int start) {
        this.start = start;
    }
    
    public String getDir() {
        return dir;
    }
    
    public void setDir(String dir) {
        this.dir = dir;
    }
    
    public String getSort() {
        return sort;
    }
    
    public void setSort(String sort) {
        this.sort = sort;
    }
    
    public int getSourceId() {
        return sourceId;
    }
    
    public void setSourceId(int sourceId) {
        this.sourceId = sourceId;
    }
    
    public JSONArray getFilter() {
        return filter;
    }
    
    public void setFilter(JSONArray filter) {
        this.filter = filter;
    }

    public FeatureSource getFeatureSource() {
        return featureSource;
    }

    public void setFeatureSource(FeatureSource featureSource) {
        this.featureSource = featureSource;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
 //</editor-fold>
}
