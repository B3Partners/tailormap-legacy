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

import java.io.IOException;
import java.io.StringReader;
import java.math.BigInteger;
import java.net.URI;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.ResourceBundle;
import java.util.Set;
import javax.persistence.EntityManager;
import javax.xml.bind.JAXBException;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.csw.client.CswClient;
import static nl.b3p.csw.client.CswRequestCreator.createCswRequest;
import static nl.b3p.csw.client.CswRequestCreator.createPropertyName;
import static nl.b3p.csw.client.CswRequestCreator.createQueryString;
import nl.b3p.csw.client.FilterCreator;
import nl.b3p.csw.client.InputBySearch;
import nl.b3p.csw.client.OutputBySearch;
import nl.b3p.csw.client.OwsException;
import nl.b3p.csw.jaxb.csw.GetRecords;
import nl.b3p.csw.jaxb.filter.And;
import nl.b3p.csw.jaxb.filter.BinaryLogicOpType;
import nl.b3p.csw.jaxb.filter.FilterType;
import nl.b3p.csw.jaxb.filter.Or;
import nl.b3p.csw.jaxb.filter.PropertyIsEqualTo;
import nl.b3p.csw.jaxb.filter.PropertyIsLike;
import nl.b3p.csw.jaxb.filter.SortBy;
import nl.b3p.csw.server.CswServable;
import nl.b3p.csw.server.GeoNetworkCswServer;
import nl.b3p.csw.util.OnlineResource;
import nl.b3p.csw.util.Protocol;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.Layer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.nl.DutchAnalyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.apache.lucene.analysis.tokenattributes.OffsetAttribute;
import org.apache.lucene.util.Version;
import org.jdom2.Element;
import org.jdom2.JDOMException;

import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 * @author Meine Toonen
 */
@UrlBinding("/action/csw/search")
@StrictBinding
public class CatalogSearchActionBean implements ActionBean {
    
    private ActionBeanContext context;
    private ResourceBundle bundle;
    private static final Log log = LogFactory.getLog(CatalogSearchActionBean.class);
    private static final String defaultWildCard = "*";
    
    private BigInteger maxRecords = new BigInteger("1000");
    
    @Validate
    private String url;
    
    @Validate
    private String q;
    
    @Validate
    private String advancedString;
    
    @Validate
    private String advancedProperty;
    
    @Validate
    private Application application;
    

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    /**
     * @return the bundle
     */
    public ResourceBundle getBundle() {
        if (bundle==null) {
            bundle = ResourceBundle.getBundle("ViewerResources");
        }
        return bundle;
    }

    /**
     * @param bundle the bundle to set
     */
    public void setBundle(ResourceBundle bundle) {
        this.bundle = bundle;
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

    public String getAdvancedString() {
        return advancedString;
    }

    public void setAdvancedString(String advancedString) {
        this.advancedString = advancedString;
    }

    public String getAdvancedProperty() {
        return advancedProperty;
    }

    public void setAdvancedProperty(String advancedProperty) {
        this.advancedProperty = advancedProperty;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }
    
    //</editor-fold>        
    
    @Before
    protected void initBundle() {
        setBundle(ResourceBundle.getBundle("ViewerResources", context.getRequest().getLocale()));
    }
    
    @DefaultHandler
    public Resolution search() throws JSONException {    
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);
        String error = null;
        Resolution r = ApplicationActionBean.checkRestriction(context, application, Stripersist.getEntityManager());
        if (r != null) {
            error = getBundle().getString("viewer.catalogsearchactionbean.1");
        } else {
            try {
                CswServable server = new GeoNetworkCswServer(null,
                        url,
                        null,
                        null
                );

                CswClient client = new CswClient(server);
                InputBySearch input = new InputBySearch(q);
                OutputBySearch output = client.search(input);

                List<OnlineResource> map = output.getResourcesFlattened();
                JSONArray results = getResults(map, output);

                json.put("results", results);

                json.put("success", Boolean.TRUE);
            } catch (Exception e) {

                error = MessageFormat.format(getBundle().getString("viewer.catalogsearchactionbean.2"), e.toString() );
                log.error("Error searching:", e);
                if (e.getCause() != null) {
                    error += "; cause: " + e.getCause().toString();
                }
            }
        }
                
        if(error != null) {
            json.put("error", error);
        }
        
        return new StreamingResolution("application/json", new StringReader(json.toString(4)));               
    }

    public Resolution advancedSearch() throws JSONException {
        EntityManager em = Stripersist.getEntityManager();
        
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);
         Resolution r = ApplicationActionBean.checkRestriction(context, application, Stripersist.getEntityManager());
        if (r != null) {
            json.put("message",getBundle().getString("viewer.general.noauth"));
            return new StreamingResolution("application/json", new StringReader(json.toString(4)));
        }
        CswServable server = new GeoNetworkCswServer(null, url, null, null);
        CswClient client = new CswClient(server);
        try {
            OutputBySearch output = client.search(new InputBySearch(createAdvancedCswRequest(q, advancedString, advancedProperty, null, maxRecords, null)));
            List<Element> els = output.getSearchResults();
            List<Protocol> prots = new ArrayList();
            prots.add(Protocol.WMS);
            List<OnlineResource> list = new ArrayList();
            for (Iterator<Element> it = els.iterator(); it.hasNext();) {
                Element element = it.next();
                Map<URI, List<OnlineResource>> orMap = output.getResourcesMap(element, prots);
                Set<URI> uris = orMap.keySet();
                for (Iterator<URI> uriIt = uris.iterator(); uriIt.hasNext();) {
                    URI uri = uriIt.next();
                    List<OnlineResource> orList = orMap.get(uri);
                    list.addAll(orList);
                }
            }
            Map<Layer, String> descriptionsByLayer = new HashMap();
            List<Layer> layers = getLayers(list,descriptionsByLayer,output);
            
            Map<ApplicationLayer, String> descriptionsByApplayer = new HashMap();
            List<ApplicationLayer> appLayers = getAppLayers(layers,descriptionsByApplayer, descriptionsByLayer);
            
            Map<Level, String> descriptionsByLevel = new HashMap();
            List<Level> levels = getLevels(appLayers,descriptionsByApplayer,descriptionsByLevel);
            
            JSONArray found = new JSONArray();
            for (Level level : levels) {
                JSONObject obj = level.toJSONObject(false, application, context.getRequest(), em);
                found.put(obj);
            }            
            List <Level> children = application.getRoot().getChildren();
            JSONArray childs = new JSONArray();
            for (Level child : children) {
                childs.put(child.toJSONObject(false, application, context.getRequest(), em));
            }

            Set<Level> levelDesc = descriptionsByLevel.keySet();
            JSONObject descriptions = new JSONObject();
            for (Iterator<Level> LevelIterator = levelDesc.iterator(); LevelIterator.hasNext();) {
                Level level = LevelIterator.next();
                JSONObject obj = new JSONObject();
                obj.put("level", level.getId());
                obj.put("description", descriptionsByLevel.get(level));
                descriptions.put(""+level.getId(),obj);
            }
            JSONObject results = new JSONObject();
            results.put("found", found);
            results.put("children", childs);
            results.put("descriptions", descriptions);
            json.put("results", results);    
            json.put("success", Boolean.TRUE);
        } catch (IOException ex) {
            log.error("Fout bij zoeken in csw:",ex);
        } catch (JDOMException ex) {
            log.error("Fout bij zoeken in csw:",ex);
        } catch (JAXBException ex) {
            log.error("Fout bij zoeken in csw:",ex);
        } catch (OwsException ex) {
            log.error("Fout bij zoeken in csw:",ex);
        }
           
        return new StreamingResolution("application/json", new StringReader(json.toString(4)));
    }
    
    private List<Level> getLevels(List<ApplicationLayer> appLayers,Map<ApplicationLayer, String> descriptionsByApplayer,Map<Level, String> descriptionsByLevel){
        List<Level> foundLevels = new ArrayList();
        Level root = application.getRoot();
        for (ApplicationLayer applicationLayer : appLayers) {
            Level l =root.getParentInSubtree(applicationLayer);
            if(l != null){
                foundLevels.add(l);
                if(descriptionsByApplayer.containsKey(applicationLayer)){
                    descriptionsByLevel.put(l, descriptionsByApplayer.get(applicationLayer));
                }
            }
        }
        return foundLevels;
    }
    
    private List<ApplicationLayer> getAppLayers(List<Layer> layers,Map<ApplicationLayer, String> descriptionsByApplayer, Map<Layer, String> descriptionsByLayer){
        EntityManager em = Stripersist.getEntityManager();
        List<ApplicationLayer> foundAppLayers = new ArrayList();
        Level root = application.getRoot();
        for (Layer layer : layers) {
            List<ApplicationLayer> appLayers = em.createQuery("FROM ApplicationLayer WHERE service = :geoservice and layerName = :name", ApplicationLayer.class).setParameter("geoservice", layer.getService()).setParameter("name", layer.getName()).getResultList();
            for (ApplicationLayer applicationLayer : appLayers) {
                if(root.containsLayerInSubtree(applicationLayer)){
                    foundAppLayers.add(applicationLayer);
                    if(descriptionsByLayer.containsKey(layer)){
                        descriptionsByApplayer.put(applicationLayer, descriptionsByLayer.get(layer));
                    }
                }
                
            }
        }
        return foundAppLayers;
    }
    
    private List<Layer> getLayers(List<OnlineResource> lijst,Map<Layer, String> descriptions,OutputBySearch output){
        EntityManager em = Stripersist.getEntityManager();
        List<Layer> foundLayers = new ArrayList();
        for (OnlineResource resource : lijst) {
            String rurl = resource.getUrl() != null ? resource.getUrl().toString() : null;
            String layerName = resource.getName();
            String protocol = resource.getProtocol() != null ? resource.getProtocol().getName() : null;
            
            if (rurl != null && protocol != null) {
                if (protocol.toLowerCase().indexOf("wms") != -1) {
                    List<GeoService> foundServices = em.createQuery("FROM GeoService WHERE url = :url",GeoService.class).setParameter("url", rurl).getResultList();
                    for (GeoService geoService : foundServices) {
                        List<Layer> layers = geoService.loadLayerTree(em);
                        for (Layer layer : layers) {
                            if(!layer.isVirtual()){
                                if (layer.getName().equalsIgnoreCase(layerName)) {
                                    try {
                                        String abstractText = output.getAbstractText(resource.getMetadata());
                                        descriptions.put(layer, abstractText);
                                        
                                    } catch (JDOMException ex) {
                                    }
                                    
                                    foundLayers.add(layer);
                                }
                            }
                        }
                    }
                }
            }
        }
        return foundLayers;
    }
    
    private JSONArray getResults(List<OnlineResource> resourceList, OutputBySearch output) throws JDOMException, JSONException {
        JSONArray results = new JSONArray();
        for (OnlineResource resource : resourceList) {

            String title = output.getTitle(resource.getMetadata());
            String rurl = resource.getUrl() != null ? resource.getUrl().toString() : null;
            String layer = resource.getName();
            String protocol = resource.getProtocol() != null ? resource.getProtocol().getName() : null;

            if (title != null && rurl != null && protocol != null) {
                if (protocol.toLowerCase().indexOf("wms") != -1) {
                    JSONObject result = new JSONObject();
                    result.put("label", title + (layer != null ? " (laag: " + layer + ")" : ""));
                    result.put("url", rurl);
                    result.put("protocol", "wms");
                    results.put(result);
                }
            }
        }
        return results;
    }

    private static GetRecords createAdvancedCswRequest(String queryString, String advancedValue,String propertyName,BigInteger startPosition,BigInteger maxRecords,SortBy sortBy) throws IOException {

        FilterType filterType = new FilterType();
        boolean emptySearchStrings = true;
        
        List andList = new ArrayList();
        Or queryOr = null;
        Or typeringOr = null;
        
        if(queryString != null){
            emptySearchStrings = false;
            queryOr = createOrFilter(queryString, null);
            andList.add(queryOr);
        }
        if(advancedValue != null){
            emptySearchStrings = false;
            
            PropertyIsEqualTo propertyIsEqualTo = FilterCreator.createPropertyIsEqualTo(advancedValue, propertyName);
            List orList = new ArrayList();
            orList.add(propertyIsEqualTo);          
            typeringOr = new Or(new BinaryLogicOpType(orList));
            
            andList.add(propertyIsEqualTo);
        }

        if (emptySearchStrings) {
            return createCswRequest("*", propertyName, startPosition, maxRecords, sortBy, null, null, null);
        }

        And and = new And(new BinaryLogicOpType(andList));

        if(queryOr != null && typeringOr != null){
            filterType.setLogicOps(and);
        }else if(queryOr != null){
            filterType.setLogicOps(queryOr);
        }else if(typeringOr != null){
            filterType.setLogicOps(typeringOr);
        }

        return createCswRequest(filterType, startPosition, maxRecords, sortBy);
    }
    
    private static Or createOrFilter(String queryString, String propertyName) {
        List orList = new ArrayList();
        queryString = createQueryString(queryString, false);
        if (queryString != null && !queryString.trim().equals(defaultWildCard)) {

            propertyName = createPropertyName(propertyName);

            PropertyIsEqualTo propertyIsEqualTo = FilterCreator.createPropertyIsEqualTo(queryString, propertyName);

            StandardAnalyzer standardAnalyzer = new StandardAnalyzer(Version.LUCENE_46, DutchAnalyzer.getDefaultStopSet());

            orList.add(propertyIsEqualTo);
            try {
                
                TokenStream tokenStream = standardAnalyzer.tokenStream("", queryString);
                OffsetAttribute offsetAttribute = tokenStream.addAttribute(OffsetAttribute.class);
                CharTermAttribute charTermAttribute = tokenStream.addAttribute(CharTermAttribute.class);

                tokenStream.reset();
                while (tokenStream.incrementToken()) {
                    int startOffset = offsetAttribute.startOffset();
                    int endOffset = offsetAttribute.endOffset();
                    String term = charTermAttribute.toString();
                    PropertyIsLike propertyIsLike = FilterCreator.createPropertyIsLike(term, propertyName);
                    orList.add(propertyIsLike);
                }
                tokenStream.close();
            } catch (IOException e) {
                PropertyIsLike propertyIsLike = FilterCreator.createPropertyIsLike(queryString, propertyName);
                orList.add(propertyIsLike);
            }
        }
        
        Or or = new Or(new BinaryLogicOpType(orList));
                
        return or;
    }
}
