/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.util;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.SQLException;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.util.databaseupdate.ScriptRunner;
import org.hibernate.Session;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;


/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class SelectedContentCacheTest extends TestUtil{

    public SelectedContentCacheTest() {
    }

    @BeforeClass
    public static void setUpClass() {
    }

    @AfterClass
    public static void tearDownClass() {
    }

    @After
    public void tearDown() {
    }

    @Test
    public void testSelectedContentGeneration() throws SQLException, FileNotFoundException, IOException, URISyntaxException, JSONException{
        Connection conn =  null;

        try{
            Session session = (Session)entityManager.getDelegate();
            conn = (Connection)session.connection();
            ScriptRunner sr = new ScriptRunner(conn, true, true);

            File f = new File(this.getClass().getResource("testdata.sql").toURI());
            sr.runScript(new FileReader(f));
            String expectedString = "{\"rootLevel\":\"2\",\"selectedContent\":[{\"id\":\"3\",\"type\":\"level\"},{\"id\":\"5\",\"type\":\"level\"},{\"id\":\"6\",\"type\":\"level\"}],\"appLayers\":{\"1\":{\"background\":true,\"editAuthorizations\":{},\"authorizations\":{},\"checked\":true,\"alias\":\"Openbasiskaart\",\"id\":1,\"layerName\":\"Openbasiskaart\",\"serviceId\":1},\"2\":{\"background\":false,\"editAuthorizations\":{},\"featureType\":2,\"authorizations\":{},\"checked\":false,\"alias\":\"begroeid_terreinvakonderdeel_bestaand\",\"id\":2,\"layerName\":\"begroeid_terreinvakonderdeel_bestaand\",\"serviceId\":2},\"3\":{\"background\":false,\"editAuthorizations\":{},\"featureType\":5,\"authorizations\":{},\"checked\":false,\"alias\":\"begroeid_terreindeel\",\"id\":3,\"layerName\":\"begroeid_terreindeel\",\"serviceId\":2},\"4\":{\"background\":false,\"editAuthorizations\":{},\"featureType\":1,\"authorizations\":{},\"checked\":false,\"alias\":\"begroeid_terreinvakonderdeel\",\"id\":4,\"layerName\":\"begroeid_terreinvakonderdeel\",\"serviceId\":2},\"5\":{\"background\":false,\"editAuthorizations\":{},\"featureType\":6,\"authorizations\":{},\"checked\":false,\"alias\":\"woonplaats\",\"id\":5,\"layerName\":\"woonplaats\",\"serviceId\":3}},\"services\":{\"1\":{\"protocol\":\"tiled\",\"name\":\"Openbasiskaart\",\"styleLibraries\":{},\"layers\":{\"Openbasiskaart\":{\"filterable\":false,\"virtual\":false,\"bbox\":{\"miny\":22598,\"crs\":\"28992\",\"minx\":-285401,\"maxy\":903401,\"maxx\":595401},\"hasFeatureType\":false,\"authorizations\":{},\"resolutions\":\"3440.64,1720.32,860.16,430.08,215.04,107.52,53.76,26.88,13.44,6.72,3.36,1.68,0.84,0.42,0.21,0.105\",\"tileWidth\":256,\"title\":\"Openbasiskaart\",\"queryable\":false,\"name\":\"Openbasiskaart\",\"details\":{\"image_extension\":\"png\"},\"id\":2,\"serviceId\":1,\"tileHeight\":256}},\"id\":1,\"useProxy\":false,\"tilingProtocol\":\"TMS\",\"url\":\"http://www.openbasiskaart.nl/mapcache/tms/1.0.0/osm-nb@rd\"},\"2\":{\"protocol\":\"wms\",\"name\":\"Groen\",\"exception_type\":\"application/vnd.ogc.se_inimage\",\"styleLibraries\":{},\"layers\":{\"begroeid_terreinvakonderdeel\":{\"filterable\":false,\"virtual\":false,\"hasFeatureType\":true,\"authorizations\":{},\"featureTypeName\":\"begroeid_terreinvakonderdeel\",\"title\":\"begroeid_terreinvakonderdeel\",\"queryable\":true,\"name\":\"begroeid_terreinvakonderdeel\",\"details\":{\"wms.styles\":\"[{\\\"name\\\":\\\"default\\\",\\\"legendURLs\\\":[\\\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel&format=image/png&STYLE=default\\\"],\\\"title\\\":\\\"default\\\"}]\"},\"id\":5,\"featureTypeId\":1,\"serviceId\":2,\"legendImageUrl\":\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel&format=image/png&STYLE=default\"},\"begroeid_terreinvakonderdeel_bestaand\":{\"filterable\":false,\"virtual\":false,\"hasFeatureType\":true,\"authorizations\":{},\"featureTypeName\":\"begroeid_terreinvakonderdeel_bestaand\",\"title\":\"begroeid_terreinvakonderdeel_bestaand\",\"queryable\":true,\"name\":\"begroeid_terreinvakonderdeel_bestaand\",\"details\":{\"wms.styles\":\"[{\\\"name\\\":\\\"default\\\",\\\"legendURLs\\\":[\\\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel_bestaand&format=image/png&STYLE=default\\\"],\\\"title\\\":\\\"default\\\"}]\"},\"id\":6,\"featureTypeId\":2,\"serviceId\":2,\"legendImageUrl\":\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel_bestaand&format=image/png&STYLE=default\"},\"begroeid_terreindeel\":{\"filterable\":false,\"virtual\":false,\"hasFeatureType\":true,\"authorizations\":{},\"featureTypeName\":\"begroeid_terreindeel\",\"title\":\"begroeid_terreindeel\",\"queryable\":true,\"name\":\"begroeid_terreindeel\",\"details\":{\"wms.styles\":\"[{\\\"name\\\":\\\"default\\\",\\\"legendURLs\\\":[\\\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreindeel&format=image/png&STYLE=default\\\"],\\\"title\\\":\\\"default\\\"}]\"},\"id\":4,\"featureTypeId\":5,\"serviceId\":2,\"legendImageUrl\":\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreindeel&format=image/png&STYLE=default\"}},\"id\":2,\"useProxy\":false,\"url\":\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&\",\"mustLogin\":true},\"3\":{\"protocol\":\"wms\",\"name\":\"woonplaatsen\",\"exception_type\":\"application/vnd.ogc.se_inimage\",\"styleLibraries\":{},\"layers\":{\"woonplaats\":{\"filterable\":false,\"virtual\":false,\"hasFeatureType\":true,\"authorizations\":{},\"featureTypeName\":\"woonplaats\",\"title\":\"woonplaats\",\"queryable\":true,\"name\":\"woonplaats\",\"details\":{\"wms.styles\":\"[{\\\"name\\\":\\\"default\\\",\\\"legendURLs\\\":[\\\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/woonplaats_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=woonplaats&format=image/png&STYLE=default\\\"],\\\"title\\\":\\\"default\\\"}]\"},\"id\":10,\"featureTypeId\":6,\"serviceId\":3,\"legendImageUrl\":\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/woonplaats_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=woonplaats&format=image/png&STYLE=default\"}},\"id\":3,\"useProxy\":false,\"url\":\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/woonplaats_productie.map&\",\"mustLogin\":true}},\"levels\":{\"1\":{\"children\":[{\"authorizations\":{},\"child\":\"3\"}],\"background\":true,\"name\":\"Achtergrond\",\"authorizations\":{},\"id\":1},\"2\":{\"children\":[{\"authorizations\":{},\"child\":\"1\"},{\"authorizations\":{},\"child\":\"4\"}],\"background\":false,\"name\":\"Applicatie\",\"authorizations\":{},\"id\":2},\"3\":{\"background\":true,\"name\":\"OSM\",\"layers\":[\"1\"],\"authorizations\":{},\"id\":3,\"selectedIndex\":0},\"4\":{\"children\":[{\"authorizations\":{},\"child\":\"5\"},{\"authorizations\":{},\"child\":\"6\"}],\"background\":false,\"name\":\"Thema\",\"authorizations\":{},\"id\":4},\"5\":{\"background\":false,\"name\":\"Groen\",\"layers\":[\"2\",\"3\",\"4\"],\"authorizations\":{},\"id\":5,\"selectedIndex\":1},\"6\":{\"background\":false,\"name\":\"Woonplaatsen\",\"layers\":[\"5\"],\"authorizations\":{},\"id\":6,\"selectedIndex\":2}}}";
            Application app = entityManager.find(Application.class, 1L);

            app.loadTreeCache(entityManager);
            assert(true);
            assertEquals(6, app.getTreeCache().getLevels().size());
            assertEquals(5, app.getTreeCache().getApplicationLayers().size());
            SelectedContentCache scc = new SelectedContentCache();
            JSONObject actual = scc.createSelectedContent(app, false, false, false, entityManager);
            JSONObject expected = new JSONObject(expectedString);
            
            JSONAssert.assertEquals(expected.getJSONArray("selectedContent"), actual.getJSONArray("selectedContent"), JSONCompareMode.LENIENT);
            assertEquals(expected.getString("rootLevel"), actual.getString("rootLevel"));
            JSONAssert.assertEquals(expected.getJSONObject("appLayers"), actual.getJSONObject("appLayers"), JSONCompareMode.LENIENT);
//            JSONAssert.assertEquals(expected.getJSONObject("services"), actual.getJSONObject("services"), JSONCompareMode.LENIENT);
            // TODO: ClobElement in toJSONObject niet als clobelement toevoegen, maar als string? Kan nu niet testen.
            JSONAssert.assertEquals(expected.getJSONObject("levels"), actual.getJSONObject("levels"), JSONCompareMode.LENIENT);
        }finally
        {
            if(conn != null){
                conn.close();
            }
        }
    }
}
