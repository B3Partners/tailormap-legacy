/*
 * Copyright (C) 2017 B3Partners B.V.
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

import nl.b3p.viewer.util.TestUtil;
import nl.b3p.web.WaitPageStatus;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.*;
import org.junit.Ignore;

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
        assertEquals(ts.getUrl(), url);
        Layer l = ts.getTilingLayer();
        TileSet tileSet =l.getTileset();
        assertEquals(3, tileSet.getResolutions().size());
        assertEquals(256, tileSet.getHeight());
        assertEquals("osm", tileSet.getName());
        assertEquals("png",l.getDetails().get("image_extension").getValue());
        assertEquals(0, ts.getMatrixSets().size());
        JSONObject serviceObj = ts.toJSONObject(false, entityManager);
        assertTrue(serviceObj.has("matrixSets"));
        JSONArray matrixSets = serviceObj.getJSONArray("matrixSets");
        assertEquals(0, matrixSets.length());
        
    }

    
    @Test
    public void testLoadBRTWMTSFromURL() throws MalformedURLException {
        URL u = new URL("http://geodata.nationaalgeoregister.nl/tiles/service/wmts?request=getcapabilities");
        String url = u.toString();
        Map params = new HashMap();
        params.put(TileService.PARAM_TILINGPROTOCOL, "WMTS");
        params.put(TileService.PARAM_SERVICENAME, "Web Map Tile Service - GeoWebCache");
        WaitPageStatus status = new WaitPageStatus();
        
        GeoService result = instance.loadFromUrl(url, params, status, entityManager);
        assertEquals("https://geodata.nationaalgeoregister.nl/tiles/service/wmts?",result.getUrl());
        Layer topLayer = result.getTopLayer();
        assertEquals(45, topLayer.getChildren().size());
        
        Layer brt = topLayer.getChildren().get(0);
        assertEquals("brtachtergrondkaart", brt.getName());
        JSONArray styles = new JSONArray(brt.getDetails().get(Layer.DETAIL_WMS_STYLES).getValue());
        JSONObject style = (JSONObject)styles.get(0);
        assertEquals("",  style.getString("identifier"));
        assertEquals(1, brt.getBoundingBoxes().size());

        BoundingBox bbox = brt.getBoundingBoxes().get(new CoordinateReferenceSystem("urn:ogc:def:crs:EPSG::28992"));
        assertEquals(595401.9, bbox.getMaxx(), 0.1);
        assertEquals(903401.9, bbox.getMaxy(), 0.1);
        assertEquals(-370406.0, bbox.getMinx(), 0.1);
        assertEquals(5328.8, bbox.getMiny(), 0.1);
        
        JSONObject serviceObj = result.toJSONObject(false, entityManager);
        assertTrue(serviceObj.has("matrixSets"));
        JSONArray matrixSets = serviceObj.getJSONArray("matrixSets");
        assertEquals(4, matrixSets.length());
        JSONObject matrix = matrixSets.getJSONObject(1);
        JSONArray matrices = matrix.getJSONArray("matrices");
        assertEquals(15, matrices.length());
        assertTrue(serviceObj.has("layers"));
        JSONObject layers = serviceObj.getJSONObject("layers");
        JSONObject jsonLayer = layers.getJSONObject("brtachtergrondkaart");
        assertNotNull(jsonLayer);
        assertTrue(jsonLayer.has("bbox"));
    }
    
    @Test
    public void testLoadArcGisWMTSFromURL() throws MalformedURLException {
        URL u = new URL("http://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/Historische_tijdreis_1950/MapServer/WMTS?request=getcapabilities");
        String url = u.toString();
        Map params = new HashMap();
        params.put(TileService.PARAM_TILINGPROTOCOL, "WMTS");
        
        WaitPageStatus status = new WaitPageStatus();
        
        GeoService result = instance.loadFromUrl(url, params, status, entityManager);
        assertEquals("http://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/Historische_tijdreis_1950/MapServer/WMTS?",result.getUrl());
        Layer topLayer = result.getTopLayer();
        assertEquals(1, topLayer.getChildren().size());
        
        Layer tijdreis = topLayer.getChildren().get(0);
        assertEquals("Historische_tijdreis_1950", tijdreis.getName());
        JSONArray styles = new JSONArray(tijdreis.getDetails().get(Layer.DETAIL_WMS_STYLES).getValue());
        JSONObject style = (JSONObject)styles.get(0);
        assertEquals("default",  style.getString("identifier"));
        assertEquals(1, tijdreis.getBoundingBoxes().size());

        BoundingBox bbox = tijdreis.getBoundingBoxes().get(new CoordinateReferenceSystem("urn:ogc:def:crs:EPSG::28992"));
        assertEquals(-7170.5, bbox.getMiny(), 0.1);
        assertEquals(-22869.1, bbox.getMinx(), 0.1);
        assertEquals(312667.7, bbox.getMaxx(), 0.1);
        assertEquals(662419.8, bbox.getMaxy(), 0.1);
        
        JSONObject serviceObj = result.toJSONObject(false, entityManager);
        assertTrue(serviceObj.has("matrixSets"));
        JSONArray matrixSets = serviceObj.getJSONArray("matrixSets");
        assertEquals(1, matrixSets.length());
        JSONObject matrix = matrixSets.getJSONObject(0);
        JSONArray matrices = matrix.getJSONArray("matrices");
        assertEquals(12, matrices.length());
        assertTrue(serviceObj.has("layers"));
        JSONObject layers = serviceObj.getJSONObject("layers");
        JSONObject jsonLayer = layers.getJSONObject("Historische_tijdreis_1950");
        assertNotNull(jsonLayer);
        assertTrue(jsonLayer.has("bbox"));
    }
    
    @Test
    public void testLoadTopoWMTSFromURL() throws MalformedURLException {
        URL u = new URL("http://geodata.nationaalgeoregister.nl/tiles/service/wmts?request=getcapabilities");
        String url = u.toString();
        Map params = new HashMap();
        params.put(TileService.PARAM_TILINGPROTOCOL, "WMTS");
        params.put(TileService.PARAM_SERVICENAME, "Web Map Tile Service - GeoWebCache");
        WaitPageStatus status = new WaitPageStatus();
        
        GeoService result = instance.loadFromUrl(url, params, status, entityManager);
        Layer topLayer = result.getTopLayer();
        assertEquals(45, topLayer.getChildren().size());
        assertEquals("https://geodata.nationaalgeoregister.nl/tiles/service/wmts?", result.getUrl());
        
        Layer brt = topLayer.getChildren().get(0);
        assertEquals("brtachtergrondkaart", brt.getName());
        assertEquals(1, brt.getBoundingBoxes().size());

        BoundingBox bbox = brt.getMatrixSets().get(0).getBbox();
        assertEquals(4046516.59, bbox.getMaxx(), 0.01);
        assertEquals(8298457.58, bbox.getMaxy(), 0.01);
        assertEquals(-2404683.40, bbox.getMinx(), 0.01);
        assertEquals(3997657.58, bbox.getMiny(), 0.01);
        
        JSONObject serviceObj = result.toJSONObject(false, entityManager);
        assertTrue(serviceObj.has("matrixSets"));
        JSONArray matrixSets = serviceObj.getJSONArray("matrixSets");
        assertEquals(4, matrixSets.length());
        JSONObject matrix = matrixSets.getJSONObject(1);
        JSONArray matrices = matrix.getJSONArray("matrices");
        assertEquals(15, matrices.length());
        assertTrue(serviceObj.has("layers"));
        JSONObject layers = serviceObj.getJSONObject("layers");
        JSONObject jsonLayer = layers.getJSONObject("brtachtergrondkaart");
        assertNotNull(jsonLayer);
        assertTrue(jsonLayer.has("bbox"));

    }

    @Test
    @Ignore("Meine knows why..")
    public void testLoadLufoWMTSFromURL() throws MalformedURLException {
        URL u = new URL("http://webservices.gbo-provincies.nl/lufo/services/wmts?request=GetCapabilities");
        String url = u.toString();
        Map params = new HashMap();
        params.put(TileService.PARAM_TILINGPROTOCOL, "WMTS");
        params.put(TileService.PARAM_SERVICENAME, "luchtfoto");
        WaitPageStatus status = new WaitPageStatus();
        
        GeoService result = instance.loadFromUrl(url, params, status, entityManager);
        Layer topLayer = result.getTopLayer();
        assertEquals(12, topLayer.getChildren().size());
        assertEquals("http://webservices.gbo-provincies.nl/lufo/services/wmts?", result.getUrl());
        
        Layer actueelWinter = topLayer.getChildren().get(0);
        assertEquals("actueel_winter", actueelWinter.getName());
        assertEquals(1, actueelWinter.getBoundingBoxes().size());

        BoundingBox bbox = actueelWinter.getMatrixSets().get(0).getBbox();
        assertEquals(595401.92, bbox.getMaxx(), 0.01);
        assertEquals(903401.92, bbox.getMaxy(), 0.01);
        assertEquals(-285401.92, bbox.getMinx(), 0.01);
        assertEquals(22598.08, bbox.getMiny(), 0.01);
        
        JSONObject serviceObj = result.toJSONObject(false, entityManager);
        assertTrue(serviceObj.has("matrixSets"));
        JSONArray matrixSets = serviceObj.getJSONArray("matrixSets");
        assertEquals(1, matrixSets.length());
        JSONObject matrix = matrixSets.getJSONObject(0);
        JSONArray matrices = matrix.getJSONArray("matrices");
        assertEquals(16, matrices.length());
        assertTrue(serviceObj.has("layers"));
        JSONObject layers = serviceObj.getJSONObject("layers");
        JSONObject jsonLayer = layers.getJSONObject("actueel_winter");
        assertNotNull(jsonLayer);
        assertTrue(jsonLayer.has("bbox"));
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
        JSONArray styles = new JSONArray(layer.getDetails().get(Layer.DETAIL_WMS_STYLES).getValue());
        JSONObject style = (JSONObject)styles.get(0);
        assertEquals("",  style.getString("identifier"));
        assertNotNull(ts.getMatrixSets());
        assertEquals(6,ts.getMatrixSets().size());
        assertEquals(16,ts.getMatrixSets().get(1).getMatrices().size());
        assertEquals("epsg:28992",layer.getMatrixSets().get(0).getIdentifier());
        assertEquals(16,layer.getMatrixSets().get(0).getMatrices().size());
        JSONObject serviceObj = ts.toJSONObject(false, entityManager);
        assertTrue(serviceObj.has("matrixSets"));
        JSONArray matrixSets = serviceObj.getJSONArray("matrixSets");
        assertEquals(6, matrixSets.length());
        JSONObject matrix = matrixSets.getJSONObject(1);
        JSONArray matrices = matrix.getJSONArray("matrices");
        assertEquals(16, matrices.length());
        assertTrue(serviceObj.has("layers"));
        JSONObject layers = serviceObj.getJSONObject("layers");
        JSONObject jsonLayer = layers.getJSONObject("test:gemeente");
        assertNotNull(jsonLayer);
        assertTrue(!jsonLayer.has("bbox"));
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
        
        assertNotNull(tms.getBbox());
        assertEquals("urn:ogc:def:crs:EPSG::4326", tms.getBbox().getCrs().getName());
        assertEquals(-180.0, tms.getBbox().getMaxy(),0.01);
        assertEquals(new Double(90), tms.getBbox().getMinx(),0.01);
        assertEquals(-20037688.34, tms.getBbox().getMiny(),0.01);
        assertEquals(40075106.68, tms.getBbox().getMaxx(),0.01);
        
        List<TileMatrix> matrices = tms.getMatrices();
        assertNotNull(matrices);
        assertEquals(18, matrices.size());
        
        TileMatrix first = matrices.get(0);
        assertNotNull(first);
        assertEquals("GlobalCRS84Pixel:0", first.getIdentifier());
        assertEquals("7.951392199519542E8", first.getScaleDenominator());
        assertEquals("90.0 -180.0", first.getTopLeftCorner());
        assertEquals(256, first.getTileHeight());
        assertEquals(256, first.getTileWidth());
        assertEquals(1, first.getMatrixHeight());
        assertEquals(1, first.getMatrixWidth());
        assertEquals("",first.getTitle());
        assertEquals("",first.getDescription());
    }
}
