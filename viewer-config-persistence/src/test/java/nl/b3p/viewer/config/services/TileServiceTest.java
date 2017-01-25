/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.config.services;

import java.io.IOException;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import nl.b3p.viewer.util.TestUtil;
import nl.b3p.web.WaitPageStatus;
import org.junit.Test;
import static org.junit.Assert.*;
import org.xml.sax.SAXException;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class TileServiceTest extends TestUtil{
    
    private TileService instance = new TileService();

    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    DocumentBuilder builder = null;
    XPathFactory xPathfactory = XPathFactory.newInstance();
    XPath xpath = xPathfactory.newXPath();
        
    public TileServiceTest() throws ParserConfigurationException {
        builder = factory.newDocumentBuilder();
    }
    

    /**
     * Test of loadFromUrl method, of class TileService.
     */
    @Test
    public void testLoadFromUrl() {
        System.out.println("loadFromUrl");
        String url = "http://www.openbasiskaart.nl/mapcache/tms/1.0.0/osm-nb@rd";
        Map params = new HashMap();
        params.put(TileService.PARAM_SERVICENAME, "osm");
        params.put(TileService.PARAM_RESOLUTIONS, "1,2,4");
        params.put(TileService.PARAM_SERVICEBBOX, "16,32,18,34");
        params.put(TileService.PARAM_CRS, "28992");
        params.put(TileService.PARAM_IMAGEEXTENSION, "png");
        params.put(TileService.PARAM_TILESIZE, 256);
        params.put(TileService.PARAM_TILINGPROTOCOL, "TMS");
        WaitPageStatus status = new WaitPageStatus();
        
        GeoService result = instance.loadFromUrl(url, params, status, entityManager);
        assertEquals("tiled", result.getProtocol());
        assertEquals(url, result.getUrl());
        
        TileService ts =(TileService)result;
        assertEquals("osm", ts.getTilingLayer().getName());
        assertEquals("TMS", ts.getTilingProtocol());
        Layer l = ts.getTilingLayer();
        TileSet tileSet =l.getTileset();
        assertEquals(3, tileSet.getResolutions().size());
        assertEquals(256, tileSet.getHeight());
        assertEquals("osm", tileSet.getName());
        assertEquals("png",l.getDetails().get("image_extension").getValue());
        assertEquals(0, ts.getMatrixSets().size());
    }

    /**
     * Test of parseWMTSCapabilities method, of class TileService.
     */
    @Test
    public void testParseWMTSCapabilities() {
        URL u = TileServiceTest.class.getResource("singleLayer.xml");
        String url = u.toString();
        Map params = new HashMap();
        params.put(TileService.PARAM_TILINGPROTOCOL, "WMTS");
        WaitPageStatus status = new WaitPageStatus();
        
        GeoService result = instance.parseWMTSCapabilities(url, params, status, entityManager);
        compareWMTS (result, url);
    }
    
    @Test
    public void testLoadWMTSFromURL() {
        URL u = TileServiceTest.class.getResource("singleLayer.xml");
        String url = u.toString();
        Map params = new HashMap();
        params.put(TileService.PARAM_TILINGPROTOCOL, "WMTS");
        params.put(TileService.PARAM_SERVICENAME, "Web Map Tile Service - GeoWebCache");
        WaitPageStatus status = new WaitPageStatus();
        
        GeoService result = instance.loadFromUrl(url, params, status, entityManager);
        compareWMTS (result, url);
        
    }
    
    private void compareWMTS(GeoService result, String url){
            
        assertEquals("tiled", result.getProtocol());
        assertEquals("http://localhost:8084/geoserver/gwc/service/wmts?", result.getUrl());
        
        TileService ts =(TileService)result;
        assertEquals("Web Map Tile Service - GeoWebCache", ts.getName());
        
        assertEquals("WMTS", ts.getTilingProtocol());
        Layer l = ts.getTilingLayer();
        assertEquals("image/png",l.getDetails().get("image_extension").getValue());
        
        Layer topLayer = ts.getTopLayer();
        assertEquals(1,topLayer.getChildren().size());
        
        Layer layer = topLayer.getChildren().get(0);
        assertEquals("test:gemeente", layer.getName());
        assertEquals("gem_2014_new", layer.getTitle());
        assertNotNull(ts.getMatrixSets());
        assertEquals(6,ts.getMatrixSets().size());
        assertEquals(16,ts.getMatrixSets().get(1).getMatrices().size());
        assertEquals("epsg:28992",layer.getMatrixSets().get(0).getIdentifier());
        assertEquals(16,layer.getMatrixSets().get(0).getMatrices().size());
    }
    
    @Test
    public void testParseMultipleTileMatrixSets() throws ParserConfigurationException, SAXException, IOException, XPathExpressionException{
        
        URL u = TileServiceTest.class.getResource("singleLayer.xml");
        String url = u.toString();        
        org.w3c.dom.Document doc = builder.parse(url);
        
        List<TileMatrixSet> sets = instance.parseMatrixSets(xpath, doc);
        assertNotNull(sets);
        assertEquals(6, sets.size());
    }
    
    @Test
    public void testParseTileMatrixSet() throws ParserConfigurationException, SAXException, IOException, XPathExpressionException{
        
        URL u = TileServiceTest.class.getResource("tilematrixset.xml");
        String url = u.toString();
        org.w3c.dom.Document doc = builder.parse(url);
        
        TileMatrixSet tms = instance.parseTileMatrixSet(xpath, doc.getChildNodes().item(0));
        assertNotNull(tms);
        assertEquals("GlobalCRS84Pixel", tms.getIdentifier());
        assertEquals("urn:ogc:def:crs:EPSG::4326", tms.getCrs());
        
        List<TileMatrix> matrices = tms.getMatrices();
        assertNotNull(matrices);
        assertEquals(18, matrices.size());
        
        TileMatrix first = matrices.get(0);
        assertNotNull(first);
        assertEquals("GlobalCRS84Pixel:0", first.getIdentifier());
        assertEquals("7.951392199519542E8", first.getScaleDenominator());
        assertEquals("90.0 -180.0", first.getTopLeftPoint());
        assertEquals(256, first.getTileHeight());
        assertEquals(256, first.getTileWitdh());
        assertEquals(1, first.getMatrixHeight());
        assertEquals(1, first.getMatrixWitdh());
        assertNull(first.getTitle());
        assertNull(first.getDescription());
    }
}
