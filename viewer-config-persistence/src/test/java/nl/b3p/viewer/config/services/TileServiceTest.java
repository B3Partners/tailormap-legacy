/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.config.services;

import java.util.HashMap;
import java.util.Map;
import nl.b3p.viewer.util.TestUtil;
import nl.b3p.web.WaitPageStatus;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class TileServiceTest extends TestUtil{
    
    public TileServiceTest() {
    }
    

    /**
     * Test of loadFromUrl method, of class TileService.
     */
    @Test
    public void testLoadFromUrl() {
        initData(true);
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
        TileService instance = new TileService();
        
        
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
    }

    /**
     * Test of parseWMTSCapabilities method, of class TileService.
     */
   // @Test
    public void testParseWMTSCapabilities() {
        System.out.println("parseWMTSCapabilities");
        String url = "";
        Map params = null;
        WaitPageStatus status = null;
        TileService instance = new TileService();
        instance.parseWMTSCapabilities(url, params, status);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }
    
}
