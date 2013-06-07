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
import java.net.URL;
import java.util.*;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.*;
import org.apache.commons.io.IOUtils;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@UrlBinding("/action/search")
@StrictBinding
public class SearchActionBean implements ActionBean {
    private ActionBeanContext context;
    
    @Validate
    private String searchText;
    @Validate
    private String searchName;
    @Validate
    private Long appId;
    @Validate
    private String componentName;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    
    public String getSearchName() {
        return searchName;
    }
    
    public void setSearchName(String searchName) {
        this.searchName = searchName;
    }

    public String getComponentName() {
        return componentName;
    }

    public void setComponentName(String componentName) {
        this.componentName = componentName;
    }

    public Long getAppId() {
        return appId;
    }

    public void setAppId(Long appId) {
        this.appId = appId;
    }
    
    public String getSearchText() {
        return searchText;
    }
    
    public void setSearchText(String searchText) {
        this.searchText = searchText;
    }
    //</editor-fold>
    
    public Resolution source() throws Exception {
        EntityManager em = Stripersist.getEntityManager();
        JSONArray jsonArray = new JSONArray();
        String url = "";

        if (appId != null) {
            Application app = em.find(Application.class, appId);
            Set components = app.getComponents();
            for(Iterator it = components.iterator(); it.hasNext();){
                ConfiguredComponent comp = (ConfiguredComponent)it.next();
                if(comp.getName().equals(componentName)){
                    JSONObject config = new JSONObject(comp.getConfig());
                    if (config.has("searchconfigs")){
                        JSONArray searchConfig = config.getJSONArray("searchconfigs");
                        for(int i = 0; i < searchConfig.length(); i++){
                            JSONObject search = (JSONObject)searchConfig.get(i);
                            if(search.get("id").equals(searchName)){
                                url = search.get("url").toString();
                            }
                        }
                    }else if (config.has("searchUrl")){
                        url=config.getString("searchUrl");
                    }
                }
            }
        }
        
        if(url != null && !url.equals("")){
            url = url.replace("[ZOEKWOORD]", searchText);
            
            JSONObject info = issueRequest(url);
            if(url.toLowerCase().contains("arcgis")){
                jsonArray = (JSONArray)info.get("candidates");
            }else{
                // not arcGis services
            }
            
        }
        
        return new StreamingResolution("application/json", new StringReader(jsonArray.toString())); 
    }
    
    private static JSONObject issueRequest(String url) throws Exception {
        return new JSONObject(IOUtils.toString(new URL(url).openStream(), "UTF-8"));
    }
}
