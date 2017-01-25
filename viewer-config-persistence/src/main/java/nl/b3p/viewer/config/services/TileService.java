/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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
package nl.b3p.viewer.config.services;

import java.io.IOException;
import java.util.*;
import javax.persistence.CascadeType;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.EntityManager;
import javax.persistence.FetchType;
import javax.persistence.OneToMany;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(TileService.PROTOCOL)
public class TileService extends GeoService {
    private static final Log log = LogFactory.getLog(TileService.class);
    public static final String PROTOCOL = "tiled";
    public static final String PARAM_RESOLUTIONS = "resolutions";
    public static final String PARAM_TILESIZE = "tileSize";
    public static final String PARAM_TILINGPROTOCOL = "tilingProtocol";
    public static final String PARAM_SERVICENAME = "ServiceName";
    public static final String PARAM_SERVICEBBOX= "serviceBbox";
    public static final String PARAM_IMAGEEXTENSION= "imageExtension";
    public static final String PARAM_CRS= "crs";
    
    public static final String TILING_PROTOCOL_WMTS = "WMTS";
    public static final String TILING_PROTOCOL_TMS = "TMS";
    
    @OneToMany(cascade=CascadeType.ALL, fetch=FetchType.LAZY, mappedBy="tileService")
    private List<TileMatrixSet> matrixSets = new ArrayList<>();

    public List<TileMatrixSet> getMatrixSets() {
        return matrixSets;
    }

    public void setMatrixSets(List<TileMatrixSet> matrixSets) {
        this.matrixSets = matrixSets;
    }
    
    private String tilingProtocol;


    public String getTilingProtocol() {
        return tilingProtocol;
    }

    public void setTilingProtocol(String tilingProtocol) {
        this.tilingProtocol = tilingProtocol;
    }

    @Override
    public void checkOnline(EntityManager em) throws Exception {
    }
    
    @Override
    public GeoService loadFromUrl(String url, Map params, WaitPageStatus status, EntityManager em) {
        status.setCurrentAction("Bezig met aanmaken tile service");
        try{
            String tp =(String) params.get(PARAM_TILINGPROTOCOL);
            TileService s = null;
            if(tp.equals(TILING_PROTOCOL_WMTS)){
                s = parseWMTSCapabilities(url, params, status, em);
            } else {
                s = new TileService();
                s.setUrl(url);

                String serviceName = (String) params.get(PARAM_SERVICENAME);
                s.setName(serviceName);
                s.setTilingProtocol(tp);

                //make fake top layer for tiling.
                Layer topLayer = new Layer();
                topLayer.setVirtual(true);
                topLayer.setService(s);

                Layer tilingLayer = new Layer();
                tilingLayer.setName(serviceName);
                tilingLayer.setTitle(serviceName);
                tilingLayer.setParent(topLayer);
                tilingLayer.setService(s);

                TileSet ts = new TileSet();
                Boolean unique = false;
                String tsName = serviceName;
                for (int i = 0; i < 100; i++) {
                    if (em.find(TileSet.class, tsName) == null) {
                        unique = true;
                        break;
                    }
                    tsName = serviceName + "(" + (i + 1) + ")";
                }
                ts.setName(tsName);
                if (params.containsKey(PARAM_RESOLUTIONS)) {
                    String resString = (String) params.get(PARAM_RESOLUTIONS);
                    ts.setResolutions(resString);
                }
                if (params.containsKey(PARAM_TILESIZE)) {
                    Integer size = (Integer) params.get(PARAM_TILESIZE);
                    ts.setHeight(size);
                    ts.setWidth(size);
                }

                if (params.containsKey(PARAM_SERVICEBBOX) && params.containsKey(PARAM_CRS)) {
                    String bounds = (String) params.get(PARAM_SERVICEBBOX);
                    BoundingBox bb = new BoundingBox();
                    bb.setBounds(bounds);
                    bb.setCrs(new CoordinateReferenceSystem((String) params.get(PARAM_CRS)));
                    tilingLayer.getBoundingBoxes().put(bb.getCrs(), bb);
                }

                if (params.containsKey(PARAM_IMAGEEXTENSION)
                        && params.get(PARAM_IMAGEEXTENSION) != null
                        && StringUtils.isNotBlank((String) params.get(PARAM_IMAGEEXTENSION))) {
                    tilingLayer.getDetails().put("image_extension", new ClobElement((String) params.get(PARAM_IMAGEEXTENSION)));
                }
                //set tiling layer as child of top layer
                topLayer.getChildren().add(tilingLayer);
                s.setTopLayer(topLayer);

                em.persist(ts);
                tilingLayer.setTileset(ts);
            }
            return s;
        }finally {
            status.setProgress(100);
            status.setCurrentAction("Service ingeladen");
            status.setFinished(true);
        }
    }
    
    protected TileService parseWMTSCapabilities(String url, Map params, WaitPageStatus status, EntityManager em){
        TileService s = null;
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(url);
            XPathFactory xPathfactory = XPathFactory.newInstance();
            XPath xpath = xPathfactory.newXPath();
            
            // Service info
            s = new TileService();
            s.setTilingProtocol(TILING_PROTOCOL_WMTS);
            
            XPathExpression expr = xpath.compile("/Capabilities/ServiceIdentification/Title");
            String serviceName = (String)expr.evaluate(doc, XPathConstants.STRING);;
            s.setName(serviceName);
            
            expr = xpath.compile("/Capabilities/OperationsMetadata/Operation[@name='GetTile']//Get/@href");
            String getTile = (String)expr.evaluate(doc, XPathConstants.STRING);;
            s.setUrl(getTile);
            
            
            List<TileMatrixSet>  matrices = parseMatrixSets(xpath, doc);
            s.setMatrixSets(matrices);
            
            // Create lookup list for later linking it to layers
            Map<String, TileMatrixSet> matricesByIdentifier = new HashMap<>();
            for (TileMatrixSet matrix : matrices) {
                matricesByIdentifier.put(matrix.getIdentifier(), matrix);
            }
            
            // Layers            
            //make fake top layer for tiling.
            Layer topLayer = new Layer();
            topLayer.setVirtual(true);
            topLayer.setService(s);
            
            List<Layer> layers = parseLayers(xpath, doc, topLayer, s);
              //set tiling layer as child of top layer
            topLayer.setChildren(layers);
            s.setTopLayer(topLayer);
            
            em.persist(s);
            
            // Matrices
            
            return s;
        }catch (ParserConfigurationException | SAXException | IOException | XPathExpressionException ex) {
            log.error("Error reading capabilities: ", ex);
        }
        return s;
    }
    
    private List<Layer> parseLayers(XPath xpath, Document doc, Layer topLayer, GeoService s) throws XPathExpressionException{
        List<Layer> layers = new ArrayList<Layer>();
        XPathExpression expr = xpath.compile("/Capabilities/Contents/Layer");
        NodeList nl = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
        
        for (int i = 0; i < nl.getLength(); i++) {
            Node l = nl.item(i);
            layers.add(parseLayer(xpath, l, topLayer, s));
            
        }
        return layers;
    }

    private Layer parseLayer(XPath xpath, Node l, Layer topLayer, GeoService s) throws XPathExpressionException {
        Layer layer = new Layer();
        layer.setParent(topLayer);
        layer.setService(s);

        XPathExpression expr = xpath.compile("Identifier"); 
        String name = (String) expr.evaluate(l, XPathConstants.STRING);
        layer.setName(name);
        
        expr = xpath.compile("Title");
        String title = (String) expr.evaluate(l, XPathConstants.STRING);
        layer.setTitle(title);
        
        
        expr = xpath.compile("Format");
        String format = (String) expr.evaluate(l, XPathConstants.STRING);
        layer.getDetails().put("image_extension", new ClobElement(format));
        return layer;
    }
    
    protected List<TileMatrixSet> parseMatrixSets(XPath xpath, Document doc) throws XPathExpressionException {
        List<TileMatrixSet> matrixSets = new ArrayList<>();

        XPathExpression expr = xpath.compile("/Capabilities/Contents/TileMatrixSet");
        NodeList tileMatrixSets = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < tileMatrixSets.getLength(); i++) {
            Node matrixSet = tileMatrixSets.item(i);
            matrixSets.add(parseTileMatrixSet(xpath, matrixSet));
        }

        return matrixSets;
    }

    
    protected TileMatrixSet parseTileMatrixSet(XPath xpath, Node matrixSet) throws XPathExpressionException{
        TileMatrixSet tms = new TileMatrixSet();
        List<TileMatrix> tileMatrices = new ArrayList<>();
        tms.setMatrices(tileMatrices);
        
        XPathExpression expr = xpath.compile("TileMatrix");
        NodeList tileMatricesNodes = (NodeList) expr.evaluate(matrixSet, XPathConstants.NODESET);
        for (int i = 0; i < tileMatricesNodes.getLength(); i++) {
            Node tileMatrix = tileMatricesNodes.item(i);
            tileMatrices.add(parseTileMatrix(xpath, tileMatrix));
        }
        return tms;
    }
    
    protected TileMatrix parseTileMatrix(XPath xpath, Node tileMatrix){
        TileMatrix tm = new TileMatrix();
        return tm;
    }
    /**
     * Get the layer that contains the tiling settings etc.
     * @return the layer with tiling settings
     */
    public Layer getTilingLayer(){
        if (this.getTopLayer()!=null && this.getTopLayer().getChildren().size()>0){
            return this.getTopLayer().getChildren().get(0);
        }
        return null;
    }
    
    @Override
    public JSONObject toJSONObject(boolean flatten, Set<String> layersToInclude,boolean validXmlTags, EntityManager em) throws JSONException {
        JSONObject o = super.toJSONObject(flatten, layersToInclude,validXmlTags,em);
        if(tilingProtocol != null) {
            o.put("tilingProtocol", tilingProtocol);
        }
        return o;
    }    
    
    @Override
    public JSONObject toJSONObject(boolean flatten, Set<String> layersToInclude,boolean validXmlTags, boolean includeAuthorizations, EntityManager em) throws JSONException {
        JSONObject o = super.toJSONObject(flatten, layersToInclude,validXmlTags, includeAuthorizations,em);
        if(tilingProtocol != null) {
            o.put("tilingProtocol", tilingProtocol);
        }
        return o;
    }    

}
