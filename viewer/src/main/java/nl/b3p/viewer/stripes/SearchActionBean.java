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

import java.io.StringReader;
import java.util.*;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.OneToManyTypeConverter;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.*;
import nl.b3p.viewer.search.ArcGisRestSearchClient;
import nl.b3p.viewer.search.OpenLSSearchClient;
import nl.b3p.viewer.search.PDOKSearchClient;
import nl.b3p.viewer.search.SearchClient;
import nl.b3p.viewer.search.SearchResult;
import nl.b3p.viewer.search.SolrSearchClient;
import nl.b3p.viewer.search.AttributeSourceSearchClient;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 * @author Roy Braam
 * @author Meine Toonen
 */
@UrlBinding("/action/search")
@StrictBinding
public class SearchActionBean extends LocalizableActionBean implements ActionBean {
    private ActionBeanContext context;

    @Validate
    private String searchText;
    @Validate
    private String searchName;
    @Validate
    private Long appId;
    @Validate
    private String componentName;
    @Validate
    private String searchRequestId;
    @Validate(converter = OneToManyTypeConverter.class)
    private List<String> visibleLayers = new ArrayList();

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
    
    public String getSearchRequestId() {
        return searchRequestId;
    }

    public void setSearchRequestId(String searchRequestId) {
        this.searchRequestId = searchRequestId;
    }

    public List<String> getVisibleLayers() {
        return visibleLayers;
    }

    public void setVisibleLayers(List<String> visibleLayers) {
        this.visibleLayers = visibleLayers;
    }

    //</editor-fold>

    @DefaultHandler
    public Resolution source() throws Exception {
        JSONObject result = new JSONObject();        
        JSONObject request = new JSONObject();
        request.put("appId",appId);
        request.put("componentName",componentName);
        request.put("searchName", searchName);
        request.put("searchText", searchText);
        request.put("searchRequestId",searchRequestId);
        result.put("request",request);
        String error="";
        JSONObject search =  getSearchConfig();
        if(search == null){
            error += getBundle().getString("viewer.searchactionbean.1");
        }else{
            JSONArray resultsArray = new JSONArray();
            SearchClient client = getSearchClient(search);
            SearchResult response = new SearchResult();
            if (client != null) {
                response = client.search(searchText);
                resultsArray =response.getResults();
            }
            result.put("limitReached", response.getLimitReached());
            result.put("results",resultsArray);
            result.put("error",error);
        }
        return new StreamingResolution("application/json", new StringReader(result.toString())); 
    }
    
    public Resolution autosuggest() throws JSONException {
        JSONObject result = new JSONObject();        
        JSONObject request = new JSONObject();
        request.put("appId",appId);
        request.put("componentName",componentName);
        request.put("searchName", searchName);
        request.put("searchText", searchText);
        request.put("searchRequestId",searchRequestId);
        result.put("request",request);
        String error="";
        JSONObject search =  getSearchConfig();
        if(search == null){
            error += getBundle().getString("viewer.searchactionbean.2");
        }else{
            JSONArray results = new JSONArray();
            SearchClient client = getSearchClient(search);

            if (client != null) {
                results = client.autosuggest(searchText);
            }

            result.put("results",results);
            result.put("error",error);
        }
        return new StreamingResolution("application/json", new StringReader(result.toString())); 
    }
    
    private JSONObject getSearchConfig() throws JSONException{
        JSONObject obj = new JSONObject();
         if (appId != null) {
            EntityManager em = Stripersist.getEntityManager();
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
                              obj = search;
                            }
                        }
                    }else if (config.has("searchUrl")){
                        obj.put("url", config.get("searchUrl"));
                    }
                }
            }
        }else{
            return null;
        }
        return obj;
    }

    private SearchClient getSearchClient(JSONObject config) throws JSONException {
        SearchClient client;
        if(config == null){
            client = null;
        }else{
            String type = config.getString("type");
            String url = config.has("searchUrl") ? config.getString("searchUrl") : config.getString("url");
            if (type == null || "arcgisrest".equalsIgnoreCase(type)) {
                client = new ArcGisRestSearchClient(url);
            } else if (type.equalsIgnoreCase("openls")) {
                client = new OpenLSSearchClient(url);
            } else if(type.equalsIgnoreCase("solr")){
                client = new SolrSearchClient();
                ((SolrSearchClient)client).setConfig(config);
                List<Long> visLayers = new ArrayList();
                for (String visibleLayer : visibleLayers) {
                    try{
                        visLayers.add(new Long(visibleLayer));
                    }catch(NumberFormatException e){}
                }
                ((SolrSearchClient)client).setVisibleLayers(visLayers);
            }else if (type.equalsIgnoreCase("pdok")) {
                String filter = config.optString("filter");
                client = new PDOKSearchClient(filter);
            } else if(type.equalsIgnoreCase("attributesource")){
                client = new AttributeSourceSearchClient(config);
            }else{
                client = null;
            }
        }
        return client;
    }
}
