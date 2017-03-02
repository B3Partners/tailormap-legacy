/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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
package nl.b3p.viewer.config.services;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.json.JSONArray;
import org.json.JSONObject;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

/**
 * Belonging to GeoService, the configuration of a style library available for
 * use for this service's layers.
 * 
 * @author Matthijs Laan
 */
@Entity
public class StyleLibrary {
    @Id
    private Long id;    
    
    /**
     * Title for display/selection.
     */
    @Basic(optional=false)
    private String title;
    
    private boolean defaultStyle;
    
    @Column(length=1000)
    private String externalUrl;
    
    @Lob
    @org.hibernate.annotations.Type(type="org.hibernate.type.StringClobType")    
    private String sldBody;
    
    /**
     * JSON object with per &lt;NamedLayer&gt; a property with an Object with title 
     * property and a styles array of Objects with name and title properties 
     * with the values of the &lt;UserStyle&gt; elements in the 
     * &lt;NamedLayer&gt;. Used to find out the value of the STYLE/STYLES 
     * parameters for GetMap/GetLegendGraphic requests, required for ArcGIS 
     * Server. The title property can be used as display name of an 
     * ApplicationLayer.
     */
    @Lob
    @org.hibernate.annotations.Type(type="org.hibernate.type.StringClobType")    
    private String namedLayerUserStylesJson;
    
    /**
     * Extra parameters for GetLegendGraphic requests for layers using this SLD.
     */
    private String extraLegendParameters;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public boolean isDefaultStyle() {
        return defaultStyle;
    }
    
    public void setDefaultStyle(boolean defaultStyle) {
        this.defaultStyle = defaultStyle;
    }
    
    public String getExternalUrl() {
        return externalUrl;
    }
    
    public void setExternalUrl(String externalUrl) {
        this.externalUrl = externalUrl;
    }
    
    public String getSldBody() {
        return sldBody;
    }
    
    public void setSldBody(String sldBody) {
        this.sldBody = sldBody;
    }
    
    public String getNamedLayerUserStylesJson() {
        return namedLayerUserStylesJson;
    }
    
    public void setNamedLayerUserStylesJson(String namedLayerUserStylesJson) {
        this.namedLayerUserStylesJson = namedLayerUserStylesJson;
    }
    
    public String getExtraLegendParameters() {
        return extraLegendParameters;
    }
    
    public void setExtraLegendParameters(String extraLegendParameters) {
        this.extraLegendParameters = extraLegendParameters;
    }
    //</editor-fold>

    /** 
     * Parse SLD XML and create the JSON object as described for the 
     * namedLayerUserStylesJson property.
     *
     * @param sldBody SLD to parse
     * @return a json representation of the sld
     * @throws java.lang.Exception is any
     */
    public static JSONObject parseSLDNamedLayerUserStyles(InputSource sldBody) throws Exception {
        JSONObject j = new JSONObject();
        
        // parse SLD document
        
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setNamespaceAware(true);
        DocumentBuilder db = dbf.newDocumentBuilder();   
        org.w3c.dom.Document sld = db.parse(sldBody);

        // Walk all NamedLayer elements
        NodeList namedLayers = sld.getDocumentElement().getElementsByTagName("NamedLayer");
        for(int i = 0; i < namedLayers.getLength(); i++) {
            Node namedLayer = namedLayers.item(i);
            // Find the Name child element
            Node child = namedLayer.getFirstChild();
            while(child != null && !"Name".equals(child.getLocalName())) {
                child = child.getNextSibling();
            }
            if(child != null) {
                String layerName = child.getTextContent();
                JSONObject layer = new JSONObject();
                JSONArray styles = new JSONArray();
                layer.put("styles", styles);
                
                // Find Description element, SLD 1.1.0 only
                child = child.getNextSibling();
                if(child != null && !("Description".equals(child.getLocalName()) || "UserStyle".equals(child.getLocalName()))) {
                    child = child.getNextSibling();
                }
                 
                if(child != null && "Description".equals(child.getLocalName())) {
                    Node descNode = child.getFirstChild();
                    while(descNode != null && !"Title".equals(descNode.getLocalName())) {
                        descNode = descNode.getNextSibling();
                    }
                    if(descNode != null) {
                        layer.put("title", descNode.getTextContent());
                    }
                }
                
                do {
                    // Find UserStyle elements which are always following 
                    // siblings of Name elements
                    while(child != null && !"UserStyle".equals(child.getLocalName())) {
                        child = child.getNextSibling();
                    }
                    if(child != null) {
                        // Likewise find the Name child element of the UserStyle
                        Node child2 = child.getFirstChild();
                        while(child2 != null && !"Name".equals(child2.getLocalName())) {
                            child2 = child2.getNextSibling();
                        }
                        JSONObject style = null;
                        if(child2 != null) {
                            style = new JSONObject();
                            style.put("name", child2.getTextContent());
                            styles.put(style);
                            
                            // Find Title (SLD 1.0.0) or Title in Description (SLD 1.1.0)
                            child2 = child2.getNextSibling();
                            while(child2 != null && !("Description".equals(child2.getLocalName()) || "Title".equals(child2.getLocalName()))) {
                                child2 = child2.getNextSibling();
                            }
                            if(child2 != null) {
                                if("Title".equals(child2.getLocalName())) {
                                    style.put("title", child2.getTextContent());
                                } else {
                                    Node descNode = child2.getFirstChild();
                                    while(descNode != null && !"Title".equals(descNode.getLocalName())) {
                                        descNode = descNode.getNextSibling();
                                    }
                                    if(descNode != null) {
                                        style.put("title", descNode.getTextContent());
                                    }
                                }
                            }
                        }
                        child = child.getNextSibling();
                    }
                } while(child != null);
                
                j.put(layerName, layer);
            }
        }        
        
        return j;
    }
}
