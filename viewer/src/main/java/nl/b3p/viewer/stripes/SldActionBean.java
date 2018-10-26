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

import java.awt.Color;
import java.io.*;
import java.net.URL;
import java.text.MessageFormat;
import java.util.Map;
import java.util.ResourceBundle;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.StyleLibrary;
import nl.b3p.viewer.util.ChangeMatchCase;
import nl.b3p.viewer.util.FeatureToJson;
import nl.b3p.viewer.util.FlamingoCQL;
import nl.b3p.web.SharedSessionData;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eclipse.emf.common.util.URI;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.filter.text.cql2.CQL;
import org.geotools.filter.text.cql2.CQLException;
import org.geotools.filter.text.ecql.ECQL;
import org.geotools.styling.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.stripesstuff.stripersist.Stripersist;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * Create a SLD using GeoTools.
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/sld")
@StrictBinding
public class SldActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(SldActionBean.class);
    
    private ActionBeanContext context;
    private ResourceBundle bundle;
    /**
     * @return the bundle
     */
    public ResourceBundle getBundle() {
        return bundle;
    }

    /**
     * @param bundle the bundle to set
     */
    public void setBundle(ResourceBundle bundle) {
        this.bundle = bundle;
    }
    
    public static final String FORMAT_JSON = "json";
    public static final String FORMAT_XML = "xml";
    
    @Validate
    private Long id;
    
    @Validate
    private String layer;
    
    @Validate
    private String style;
    
    @Validate
    private String filter;

    @Validate
    private String color;
    
    @Validate
    private String commonAndFilter;
    
    @Validate
    private String commonOrFilter;
    
    @Validate
    private Boolean useRuleFilter=false;
    
    @Validate
    private String featureTypeName;
    
    @Validate
    private String format;

    @Validate
    private String sldId;

    @Validate
    private String sessId;
    
    @Validate 
    private ApplicationLayer applicationLayer;
    
    private byte[] sldXml;
    private StyledLayerDescriptor newSld;
    private StyleFactory sldFactory;
    
    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    @Override
    public ActionBeanContext getContext() {
        return context;
    }
    
    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFilter() {
        return filter;
    }

    public void setFilter(String filter) {
        this.filter = filter;
    }

    public String getFeatureTypeName() {
        return featureTypeName;
    }

    public void setFeatureTypeName(String featureTypeName) {
        this.featureTypeName = featureTypeName;
    }
    
    public String getLayer() {
        return layer;
    }

    public void setLayer(String layer) {
        this.layer = layer;
    }

    public String getStyle() {
        return style;
    }

    public void setStyle(String style) {
        this.style = style;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }
    
    public ApplicationLayer getApplicationLayer(){
        return applicationLayer;
    }
    
    public void setApplicationLayer(ApplicationLayer appLayer){
        this.applicationLayer=appLayer;
    }    

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getCommonAndFilter() {
        return commonAndFilter;
    }

    public void setCommonAndFilter(String commonAndFilter) {
        this.commonAndFilter = commonAndFilter;
    }

    public String getCommonOrFilter() {
        return commonOrFilter;
    }

    public void setCommonOrFilter(String commonOrFilter) {
        this.commonOrFilter = commonOrFilter;
    }

    public String getSldId() {
        return sldId;
    }

    public void setSldId(String sldId) {
        this.sldId = sldId;
    }

    public String getSessId() {
        return sessId;
    }

    public void setSessId(String sessId) {
        this.sessId = sessId;
    }
    //</editor-fold>
    
    @Before
    protected void initBundle() {
        setBundle(ResourceBundle.getBundle("ViewerResources", context.getRequest().getLocale()));
    }
    private void getSldXmlOrCreateNewSld() throws Exception {
        
        EntityManager em = Stripersist.getEntityManager();
        if (id != null) {
            StyleLibrary sld = em.find(StyleLibrary.class, id);
            if(sld == null) {
                throw new IllegalArgumentException(MessageFormat.format(getBundle().getString("viewer.sldactionbean.1"), id)  );
            }
            if(sld.getExternalUrl() == null) {
                sldXml = sld.getSldBody().getBytes("UTF8");
            } else {
                // retrieve external sld
                try {
                    InputStream externalSld = new URL(sld.getExternalUrl()).openStream();
                    ByteArrayOutputStream bos = new ByteArrayOutputStream();
                    IOUtils.copy(externalSld, bos);
                    externalSld.close();
                    bos.flush();
                    bos.close();
                    sldXml = bos.toByteArray();
                } catch(IOException e) {
                    throw new IOException(MessageFormat.format(getBundle().getString("viewer.sldactionbean.2"), sld.getExternalUrl(), e ));
                }
            }
        } else {
            // No SLD from database or external SLD; create new empty SLD

            newSld = sldFactory.createStyledLayerDescriptor();
            
            FilterFactory2 filterFactory = CommonFactoryFinder.getFilterFactory2();
            String[] layers=null;
            String[] filters=null;
            String[] styles=null;
            String[] colors=null;
            
            if (layer!=null){
                layers = layer.split(",");
            }if (filter!=null){
                try{
                    JSONArray jsonFilters= new JSONArray(filter);
                    filters=new String[jsonFilters.length()];
                for (int i=0; i < jsonFilters.length(); i++){
                    filters[i] = jsonFilters.getString(i);
                }
                }catch (JSONException je){
                    log.warn("error while parsing filters to JSON",je);
                    filters = filter.split(",");
                }
                
            }if(color!=null){
                colors = color.split(",");
            }if(style!=null){
                styles = style.split(",");
            }
            
            Filter andFilter = null;
            Filter orFilter = null;
            if (commonAndFilter!=null){
                //GeoServer encodes the sld url even if its a valid url
                if (commonAndFilter.indexOf("%")>0){
                    commonAndFilter = URI.decode(commonAndFilter);  
                }
                andFilter = FlamingoCQL.toFilter(commonAndFilter, em);
            }
            if (commonOrFilter!=null){
                //GeoServer encodes the sld url even if its a valid url
                if (commonOrFilter.indexOf("%")>0){
                    commonOrFilter = URI.decode(commonOrFilter);
                }
                orFilter = FlamingoCQL.toFilter(commonOrFilter, em);
            }
            if(layers != null) {
                
                for(int i = 0; i < layers.length; i++) {
                    Filter filter=null;
                    if(filters != null && i < filters.length && !"none".equals(filters[i]) && filters[i].length()>0) {
                         filter = FlamingoCQL.toFilter(filters[i], em);
                    }
                    NamedLayer nl = sldFactory.createNamedLayer();
                    nl.setName(layers[i]);                    
                    
                    newSld.addStyledLayer(nl);
                    //Combine filter with allAndFilter and allOrFilter                     
                    if (andFilter!=null){
                        if (filter==null){
                            filter=andFilter;
                        }else{
                            filter=filterFactory.and(filter, andFilter);
                        }
                    }if (orFilter!=null){
                        if (filter==null){
                            filter=orFilter;
                        }else{
                            filter=filterFactory.or(filter,orFilter);
                        }
                    }
                    if(styles != null && i < styles.length && !"none".equals(styles[i])) {
                        NamedStyle ns = sldFactory.createNamedStyle();
                        ns.setName(styles[i]);
                        nl.addStyle(ns);
                    }
                    else if (colors!=null && i < colors.length){      
                        //create featureTypeStyle
                        FeatureTypeStyle fts=sldFactory.createFeatureTypeStyle();
                        Rule r=sldFactory.createRule();
                        if (useRuleFilter && filter!=null){
                            r.setFilter(filter);                        
                        }
                        PolygonSymbolizer ps = createPolygonSymbolizer(sldFactory,colors[i]);                        
                        r.symbolizers().add(ps);
                        fts.rules().add(r);      
                        // add style to namedlayer
                        Style style = sldFactory.createStyle();
                        style.setDefault(true);
                        style.setName("default");
                        style.featureTypeStyles().add(fts);
                        nl.addStyle(style);
                    }else{
                        NamedStyle ns = sldFactory.createNamedStyle();
                        ns.setName("default");
                        nl.addStyle(ns);
                    }
                    
                    //if no featuretypestyle (created with color) then make featuretypeconstraint
                    if (!useRuleFilter && filter!=null){
                        // XXX name should be a feature type name from DescribeLayer response
                        // use extra parameter...
                        FeatureTypeConstraint ftc = sldFactory.createFeatureTypeConstraint(layers[i], filter, new Extent[] {});
                        nl.setLayerFeatureConstraints(new FeatureTypeConstraint[] { ftc });
                    }
                }
            }
        }
    }
    
    private static final String NS_SLD = "http://www.opengis.net/sld";
    private static final String NS_SE = "http://www.opengis.net/se";
    
    private void addFilterToExistingSld() throws Exception {
        EntityManager em = Stripersist.getEntityManager();
        Filter f = FlamingoCQL.toFilter(filter, em);
        
        f = (Filter) f.accept(new ChangeMatchCase(false),null);
        
        if(featureTypeName == null) {
            featureTypeName = layer;
        }
        FeatureTypeConstraint ftc = sldFactory.createFeatureTypeConstraint(featureTypeName, f, new Extent[] {});
        
        if(newSld == null) {

            SLDTransformer sldTransformer = new SLDTransformer();             
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            sldTransformer.transform(ftc, bos);

            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setNamespaceAware(true);
            DocumentBuilder db = dbf.newDocumentBuilder();
            
            Document sldXmlDoc = db.parse(new ByteArrayInputStream(sldXml));
            
            Document ftcDoc = db.parse(new ByteArrayInputStream(bos.toByteArray()));
            
            String sldVersion = sldXmlDoc.getDocumentElement().getAttribute("version");
            if("1.1.0".equals(sldVersion)) {
                // replace sld:FeatureTypeName element generated by GeoTools
                // by se:FeatureTypeName
                NodeList sldFTNs = ftcDoc.getElementsByTagNameNS(NS_SLD, "FeatureTypeName");
                if(sldFTNs.getLength() == 1) {
                    Node sldFTN = sldFTNs.item(0);
                    Node seFTN = ftcDoc.createElementNS(NS_SE, "FeatureTypeName");
                    seFTN.setTextContent(sldFTN.getTextContent());
                    sldFTN.getParentNode().replaceChild(seFTN, sldFTN);
                }
            }

            // Ignore namespaces to tackle both SLD 1.0.0 and SLD 1.1.0
            // Add constraint to all NamedLayers, not only to the layer specified
            // in layers parameter
            
            NodeList namedLayers = sldXmlDoc.getElementsByTagNameNS(NS_SLD, "NamedLayer");
            for(int i = 0; i < namedLayers.getLength(); i++) {
                Node namedLayer = namedLayers.item(i);

                // Search where to insert the FeatureTypeConstraint from our ftcDoc
                
                // Insert LayerFeatureConstraints after sld:Name, se:Name or se:Description
                // and before sld:NamedStyle or sld:UserStyle so search backwards.
                // If we find an existing LayerFeatureConstraints, use that
                NodeList childs = namedLayer.getChildNodes();
                Node insertBefore = null;
                Node layerFeatureConstraints = null;
                int j = childs.getLength() - 1;
                do {
                    Node child = childs.item(j);
                    
                    if("LayerFeatureConstraints".equals(child.getLocalName())) {
                        layerFeatureConstraints = child;
                        break;
                    }
                    if("Description".equals(child.getLocalName()) || "Name".equals(child.getLocalName())) {
                        break;
                    }
                    insertBefore = child;
                    j--;
                } while(j >= 0);
                Node featureTypeConstraint = sldXmlDoc.adoptNode(ftcDoc.getDocumentElement().cloneNode(true));
                if(layerFeatureConstraints == null) {
                    layerFeatureConstraints = sldXmlDoc.createElementNS(NS_SLD, "LayerFeatureConstraints");
                    layerFeatureConstraints.appendChild(featureTypeConstraint);
                    namedLayer.insertBefore(layerFeatureConstraints, insertBefore);
                } else {
                    layerFeatureConstraints.appendChild(featureTypeConstraint);
                }
            }

            TransformerFactory tf = TransformerFactory.newInstance();
            Transformer t = tf.newTransformer();
            DOMSource source = new DOMSource(sldXmlDoc);
            bos =  new ByteArrayOutputStream();
            StreamResult result = new StreamResult(bos);
            t.transform(source, result);
            sldXml = bos.toByteArray();
        }
    }
    
    private PolygonSymbolizer createPolygonSymbolizer(StyleFactory styleFactory,String color) { 
        FilterFactory2 filterFactory = CommonFactoryFinder.getFilterFactory2();
            
        Color col = Color.GRAY;
        if (color.startsWith("#")){
            col= new Color(Integer.parseInt(color.substring(1),16));
        }
        // create a partially opaque outline stroke
        Stroke stroke = styleFactory.createStroke(
                filterFactory.literal(col),
                filterFactory.literal(1),
                filterFactory.literal(0.9));

        // create a partial opaque fill
        Fill fill = styleFactory.createFill(
                filterFactory.literal(col),
                filterFactory.literal(0.9));
        
        PolygonSymbolizer sym = styleFactory.createPolygonSymbolizer(stroke, fill, null);
        return sym;
    } 
    
    @DefaultHandler
    public Resolution create() throws JSONException, UnsupportedEncodingException {
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);
        String error = null;

        try {
            sldFactory = CommonFactoryFinder.getStyleFactory();
            
            getSldXmlOrCreateNewSld();

            if(newSld ==null && filter != null) {
                addFilterToExistingSld();
            }
            
            if(newSld != null) {
                SLDTransformer sldTransformer = new SLDTransformer();             
                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                sldTransformer.transform(newSld, bos);
                sldXml = bos.toByteArray();
            }
            
        } catch(Exception e) {
            log.error(String.format("Error creating sld for layer=%s, style=%s, filter=%s, id=%d",
                    layer,
                    style,
                    filter,
                    id), e);
            
            error = e.toString();
            if(e.getCause() != null) {
                error += "; cause: " + e.getCause().toString();
            }
        }
        
        if(error != null) {
            if(FORMAT_JSON.equals(format)) {
                json.put("error", error);
                return new StreamingResolution("application/json", new StringReader(json.toString()));                     
            } else {
                return new ErrorResolution(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, error);
            }
        } else {
            if(FORMAT_JSON.equals(format)) {
                json.put("sld", new String(sldXml, "UTF8"));
                json.put("success", Boolean.TRUE);
                return new StreamingResolution("application/json", new StringReader(json.toString()));
            } else {
                return new StreamingResolution("text/xml", new ByteArrayInputStream(sldXml));             
            }
        }
    }
    /*
     * Reformat the filter with the relations of this featureType
     */
    public Resolution transformFilter() throws JSONException{
        JSONObject json = new JSONObject();
        String error=null;
        EntityManager em = Stripersist.getEntityManager();
        try{
            json.put("success", Boolean.FALSE);
            if (filter!=null && applicationLayer!=null){
                Layer layer = applicationLayer.getService().getLayer(applicationLayer.getLayerName(), em);
                if (layer==null){
                    error = getBundle().getString("viewer.sldactionbean.3");
                }else{
                    SimpleFeatureType sft=layer.getFeatureType();
                    Filter f =FlamingoCQL.toFilter(filter, em);
                    f = (Filter) f.accept(new ChangeMatchCase(false), null);
                    f = FeatureToJson.reformatFilter(f, sft);
                    String cqlFilter = ECQL.toCQL(f);
                    if(f == Filter.EXCLUDE){
                        String attributeName = sft.getAttributes().get(0).getName();
                        cqlFilter = attributeName + " = 1 and " + attributeName + " <> 1";
                    }
                    // flt CQL opslaan in sessie,
                    // per kaartlaag is er 1 flt in de sessie, dus iedere keer overschrijven
                    String sId = context.getRequest().getSession().getId();
                    Map<String, String> sharedData = SharedSessionData.find(sId);
                    log.debug(MessageFormat.format(getBundle().getString("viewer.sldactionbean.4"), cqlFilter, applicationLayer.getId().toString(), sId ));
                    sharedData.put(applicationLayer.getId().toString(), cqlFilter);
                    json.put("sessId", sId);
                    json.put("sldId", applicationLayer.getId().toString());
                    json.put("success", Boolean.TRUE);
                }
            }else{
                log.debug("No filter to transform or no applicationlayer, removing existing filter.");
                String sId = context.getRequest().getSession().getId();
                Map<String, String> sharedData = SharedSessionData.find(sId);
                sharedData.remove(applicationLayer.getId().toString());
                json.put("success", Boolean.TRUE);
            }
        }catch(Exception e){
            log.error("Error while reformating filter",e);
            error = e.toString();
        }
        if (error!=null){
            json.put("error",error);
        }
        return new StreamingResolution("application/json",new StringReader(json.toString()));
    }

    public Resolution findSLD() throws CQLException, JSONException, UnsupportedEncodingException {
        Map<String, String> sharedData = SharedSessionData.find(sessId);
        String cqlFilter = sharedData.get(sldId);
        JSONArray filterArray = new JSONArray();
        filterArray.put(cqlFilter);
        filter = filterArray.toString();
        log.debug(String.format("Filter (id: %s) retrieved for shared session data (%s): %s", sessId, sldId, filter));
        return this.create();
    }

}
