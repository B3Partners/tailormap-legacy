/*
 * Copyright (C) 2015-2016 B3Partners B.V.
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
package nl.b3p.viewer.util.databaseupdate;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import javax.persistence.NoResultException;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.Application.TreeCache;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.app.StartLayer;
import nl.b3p.viewer.config.app.StartLevel;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.util.SelectedContentCache;
import org.json.JSONException;
import org.json.JSONObject;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;
import org.junit.Before;
import org.junit.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class DatabaseSynchronizerEMTest extends DatabaseSynchronizerTestInterface {

    static DatabaseSynchronizer ds;

    private static boolean setupIsDone = false;
    private Long levelId = 5L;

    @Test
    public void convertTestStartLevels() throws URISyntaxException, IOException, SQLException {
        List<StartLevel> sls = entityManager.createQuery("FROM StartLevel", StartLevel.class).getResultList();
        assertEquals(6, sls.size());
    }

    @Test
    public void convertTestStartLayers() {
        List<StartLayer> startLayers = entityManager.createQuery("FROM StartLayer", StartLayer.class).getResultList();
        assertEquals(5, startLayers.size());
    }

    @Test
    public void convertTestStartLevel() {
        Level level = entityManager.find(Level.class, levelId);
        Application app = entityManager.find(Application.class, applicationId);
        assertNotNull(level);
        StartLevel sl = null;
        try {
            sl = entityManager.createQuery("FROM StartLevel where level = :level", StartLevel.class).setParameter("level", level).getSingleResult();

        } catch (NoResultException ex) {
        }
        assertNotNull("StartLevel not found: conversion not correct", sl);
        assertEquals(new Integer(1), sl.getSelectedIndex());
        assertEquals(level, sl.getLevel());
        assertEquals(app, sl.getApplication());
    }

    @Test
    public void applicationDeepCopyLevelTest() throws Exception {
        Application app = entityManager.find(Application.class, applicationId);
        TreeCache tcOld = app.loadTreeCache(entityManager);
        List<Level> oldLevels = tcOld.getLevels();

        Application copy = app.deepCopy();
        copy.setVersion("" + 14);
        entityManager.detach(app);
        entityManager.persist(copy);

        TreeCache tcCopy = copy.loadTreeCache(entityManager);
        List<Level> levelsCopy = tcCopy.getLevels();

        assertEquals(oldLevels.size(), levelsCopy.size());

        for (Level level : levelsCopy) {
            assertEquals(1, level.getStartLevels().size());
            for (StartLevel startLevel : level.getStartLevels().values()) {
                assertEquals(copy, startLevel.getApplication());
            }
        }
    }

    @Test
    public void applicationDeepCopyAppLayerTest() throws Exception {
        Application app = entityManager.find(Application.class, applicationId);
        TreeCache tcOld = app.loadTreeCache(entityManager);
        List<ApplicationLayer> oldAppLayers = tcOld.getApplicationLayers();

        Application copy = app.deepCopy();
        copy.setVersion("" + 14);
        entityManager.detach(app);
        entityManager.persist(copy);
        TreeCache tcCopy = copy.loadTreeCache(entityManager);
        List<ApplicationLayer> appLayers = tcCopy.getApplicationLayers();

        assertEquals(oldAppLayers.size(), appLayers.size());

        for (ApplicationLayer appLayer : appLayers) {
            assertEquals(1, appLayer.getStartLayers().size());
        }
    }

    @Test
    public void testSelectedContentGeneration() throws SQLException, FileNotFoundException, IOException, URISyntaxException, JSONException {
        String expectedString =  "{\"rootLevel\":\"2\",\"selectedContent\":[{\"id\":\"3\",\"type\":\"level\"},{\"id\":\"5\",\"type\":\"level\"},{\"id\":\"6\",\"type\":\"level\"}],\"appLayers\":{\"1\":{\"background\":true,\"editAuthorizations\":{},\"authorizations\":{},\"checked\":true,\"alias\":\"Openbasiskaart\",\"id\":1,\"layerName\":\"Openbasiskaart\",\"serviceId\":1},\"2\":{\"background\":false,\"editAuthorizations\":{},\"featureType\":2,\"authorizations\":{},\"checked\":false,\"alias\":\"begroeid_terreinvakonderdeel_bestaand\",\"id\":2,\"layerName\":\"begroeid_terreinvakonderdeel_bestaand\",\"serviceId\":2},\"3\":{\"background\":false,\"editAuthorizations\":{},\"featureType\":5,\"authorizations\":{},\"checked\":false,\"alias\":\"begroeid_terreindeel\",\"id\":3,\"layerName\":\"begroeid_terreindeel\",\"serviceId\":2},\"4\":{\"background\":false,\"editAuthorizations\":{},\"featureType\":1,\"authorizations\":{},\"checked\":false,\"alias\":\"begroeid_terreinvakonderdeel\",\"id\":4,\"layerName\":\"begroeid_terreinvakonderdeel\",\"serviceId\":2},\"5\":{\"background\":false,\"editAuthorizations\":{},\"featureType\":6,\"authorizations\":{},\"checked\":false,\"alias\":\"woonplaats\",\"id\":5,\"layerName\":\"woonplaats\",\"serviceId\":3}},\"services\":{\"1\":{\"protocol\":\"tiled\",\"name\":\"Openbasiskaart\",\"styleLibraries\":{},\"layers\":{\"Openbasiskaart\":{\"filterable\":false,\"virtual\":false,\"bbox\":{\"miny\":22598,\"crs\":\"28992\",\"minx\":-285401,\"maxy\":903401,\"maxx\":595401},\"hasFeatureType\":false,\"authorizations\":{},\"resolutions\":\"3440.64,1720.32,860.16,430.08,215.04,107.52,53.76,26.88,13.44,6.72,3.36,1.68,0.84,0.42,0.21,0.105\",\"tileWidth\":256,\"title\":\"Openbasiskaart\",\"queryable\":false,\"name\":\"Openbasiskaart\",\"details\":{\"image_extension\":\"png\"},\"id\":2,\"serviceId\":1,\"tileHeight\":256}},\"id\":1,\"useProxy\":false,\"tilingProtocol\":\"TMS\",\"url\":\"http://www.openbasiskaart.nl/mapcache/tms/1.0.0/osm-nb@rd\"},\"2\":{\"protocol\":\"wms\",\"name\":\"Groen\",\"exception_type\":\"application/vnd.ogc.se_inimage\",\"styleLibraries\":{},\"layers\":{\"begroeid_terreinvakonderdeel\":{\"filterable\":false,\"virtual\":false,\"hasFeatureType\":true,\"authorizations\":{},\"featureTypeName\":\"begroeid_terreinvakonderdeel\",\"title\":\"begroeid_terreinvakonderdeel\",\"queryable\":true,\"name\":\"begroeid_terreinvakonderdeel\",\"details\":{\"wms.styles\":\"[{\\\"name\\\":\\\"default\\\",\\\"legendURLs\\\":[\\\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel&format=image/png&STYLE=default\\\"],\\\"title\\\":\\\"default\\\"}]\"},\"id\":5,\"featureTypeId\":1,\"serviceId\":2,\"legendImageUrl\":\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel&format=image/png&STYLE=default\"},\"begroeid_terreinvakonderdeel_bestaand\":{\"filterable\":false,\"virtual\":false,\"hasFeatureType\":true,\"authorizations\":{},\"featureTypeName\":\"begroeid_terreinvakonderdeel_bestaand\",\"title\":\"begroeid_terreinvakonderdeel_bestaand\",\"queryable\":true,\"name\":\"begroeid_terreinvakonderdeel_bestaand\",\"details\":{\"wms.styles\":\"[{\\\"name\\\":\\\"default\\\",\\\"legendURLs\\\":[\\\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel_bestaand&format=image/png&STYLE=default\\\"],\\\"title\\\":\\\"default\\\"}]\"},\"id\":6,\"featureTypeId\":2,\"serviceId\":2,\"legendImageUrl\":\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel_bestaand&format=image/png&STYLE=default\"},\"begroeid_terreindeel\":{\"filterable\":false,\"virtual\":false,\"hasFeatureType\":true,\"authorizations\":{},\"featureTypeName\":\"begroeid_terreindeel\",\"title\":\"begroeid_terreindeel\",\"queryable\":true,\"name\":\"begroeid_terreindeel\",\"details\":{\"wms.styles\":\"[{\\\"name\\\":\\\"default\\\",\\\"legendURLs\\\":[\\\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreindeel&format=image/png&STYLE=default\\\"],\\\"title\\\":\\\"default\\\"}]\"},\"id\":4,\"featureTypeId\":5,\"serviceId\":2,\"legendImageUrl\":\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreindeel&format=image/png&STYLE=default\"}},\"id\":2,\"useProxy\":false,\"url\":\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&\",\"mustLogin\":true},\"3\":{\"protocol\":\"wms\",\"name\":\"woonplaatsen\",\"exception_type\":\"application/vnd.ogc.se_inimage\",\"styleLibraries\":{},\"layers\":{\"woonplaats\":{\"filterable\":false,\"virtual\":false,\"hasFeatureType\":true,\"authorizations\":{},\"featureTypeName\":\"woonplaats\",\"title\":\"woonplaats\",\"queryable\":true,\"name\":\"woonplaats\",\"details\":{\"wms.styles\":\"[{\\\"name\\\":\\\"default\\\",\\\"legendURLs\\\":[\\\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/woonplaats_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=woonplaats&format=image/png&STYLE=default\\\"],\\\"title\\\":\\\"default\\\"}]\"},\"id\":10,\"featureTypeId\":6,\"serviceId\":3,\"legendImageUrl\":\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/woonplaats_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=woonplaats&format=image/png&STYLE=default\"}},\"id\":3,\"useProxy\":false,\"url\":\"http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/woonplaats_productie.map&\",\"mustLogin\":true}},\"levels\":{\"1\":{\"children\":[{\"authorizations\":{},\"child\":\"3\"}],\"background\":true,\"name\":\"Achtergrond\",\"authorizations\":{},\"id\":1},\"2\":{\"children\":[{\"authorizations\":{},\"child\":\"1\"},{\"authorizations\":{},\"child\":\"4\"}],\"background\":false,\"name\":\"Applicatie\",\"authorizations\":{},\"id\":2},\"3\":{\"background\":true,\"name\":\"OSM\",\"layers\":[\"1\"],\"authorizations\":{},\"id\":3},\"4\":{\"children\":[{\"authorizations\":{},\"child\":\"5\"},{\"authorizations\":{},\"child\":\"6\"}],\"background\":false,\"name\":\"Thema\",\"authorizations\":{},\"id\":4},\"5\":{\"background\":false,\"name\":\"Groen\",\"layers\":[\"2\",\"3\",\"4\"],\"authorizations\":{},\"id\":5},\"6\":{\"background\":false,\"name\":\"Woonplaatsen\",\"layers\":[\"5\"],\"authorizations\":{},\"id\":6}}}";
        Application app = entityManager.find(Application.class, applicationId);

        app.loadTreeCache(entityManager);
        assert (true);
        assertEquals(6, app.getTreeCache().getLevels().size());
        assertEquals(5, app.getTreeCache().getApplicationLayers().size());
        SelectedContentCache scc = new SelectedContentCache();
        JSONObject actual = scc.createSelectedContent(app, false, false, false, entityManager);
        JSONObject expected = new JSONObject(expectedString);

        JSONAssert.assertEquals(expected.getJSONArray("selectedContent"), actual.getJSONArray("selectedContent"), JSONCompareMode.STRICT_ORDER);
        assertEquals(expected.getString("rootLevel"), actual.getString("rootLevel"));
        JSONAssert.assertEquals(expected.getJSONObject("appLayers"), actual.getJSONObject("appLayers"), JSONCompareMode.LENIENT);
        JSONAssert.assertEquals(expected.getJSONObject("services"), actual.getJSONObject("services"), JSONCompareMode.LENIENT);
        JSONAssert.assertEquals(expected.getJSONObject("levels"), actual.getJSONObject("levels"), JSONCompareMode.LENIENT);
        assertEquals(6, entityManager.createQuery("FROM Level").getResultList().size());
    }
    
    @Test
    public void testUpdateApplicationLayerAttributesOrder(){
        DatabaseSynchronizerEM instance = new DatabaseSynchronizerEM();
        instance.updateApplicationLayersAttributesOrder(entityManager);
        List<ApplicationLayer> appLayers = entityManager.createQuery("From ApplicationLayer").getResultList();
        for (ApplicationLayer appLayer : appLayers) {
            
            List<ConfiguredAttribute> attrs = appLayer.getAttributes();
            if (!areInCorrectOrder(attrs)) {
                fail("Attributes of "  + appLayer.getLayerName() + " not in correct order (should be alphabetically");
            }
        }
        
    }
    
    @Test
    public void testUpdateAttributeOrder(){
        DatabaseSynchronizerEM instance = new DatabaseSynchronizerEM();
        instance.updateApplicationLayersAttributesOrder(entityManager);
        
        ApplicationLayer applicationLayer = entityManager.find(ApplicationLayer.class, 2L);
        Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName(), entityManager);
        instance.updateAttributeOrder(applicationLayer, layer.getFeatureType(), entityManager);

        List<ConfiguredAttribute> attrs = applicationLayer.getAttributes();
        if (!areInCorrectOrder(attrs)) {
            fail("Attributes not in correct order (should be alphabetically");
        }
    }
    
    private boolean areInCorrectOrder(List<ConfiguredAttribute> attrs ){
         String prevNaam = null;
        for (ConfiguredAttribute attr : attrs) {
            if (prevNaam != null && attr.getAttributeName().compareTo(prevNaam) < 1) {
                return false;
            } else {
                prevNaam = attr.getAttributeName();
            }
        }
        return true;
    }
}
