/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.tailormap.viewer.admin.stripes;

import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.config.app.ApplicationLayer;
import nl.tailormap.viewer.config.app.Level;
import nl.tailormap.viewer.config.app.StartLayer;
import nl.tailormap.viewer.config.app.StartLevel;
import nl.tailormap.viewer.helpers.app.ApplicationHelper;
import nl.tailormap.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * @author Meine Toonen
 */
public class ApplicationTreeLevelActionBeanTest extends TestUtil {

    private static final Log log = LogFactory.getLog(ApplicationTreeLevelActionBeanTest.class);

    private ApplicationTreeLevelActionBean instance;

    @BeforeEach
    public void setup() {
        instance = new ApplicationTreeLevelActionBean();
    }

    @Test
    public void testDeleteAppLayer() {
        initData(true);
        instance.setApplication(app);

        assertNotNull(testAppLayer);
        assertNotNull(testStartLayer);

        String selectedLayer = "";

        instance.updateApplayersInLevel(selectedLayer, testLevel, entityManager);

        try {
            entityManager.getTransaction().commit();
        } catch (Exception e) {
            log.error("Fout bij verwijderen", e);
            assert (false);
        }
        entityManager.getTransaction().begin();

        ApplicationLayer appLayerNull = entityManager.find(ApplicationLayer.class, testAppLayer.getId());
        StartLayer startLayerNull = entityManager.find(StartLayer.class, testStartLayer.getId());
        assertNull(appLayerNull);
        assertNull(startLayerNull);
    }

    @Test
    public void testRemoveAppLayerUsedInMashup() throws Exception {
        initData(true);
        instance.setApplication(app);
        Application mashup = ApplicationHelper.createMashup(app, "mashup", entityManager, false);
        entityManager.persist(mashup);
        String selectedLayer = "";

        instance.updateApplayersInLevel(selectedLayer, testLevel, entityManager);
        try {
            entityManager.getTransaction().commit();
        } catch (Exception e) {
            log.error("Fout bij verwijderen", e);
            assert (false);
        }
    }

    @Test
    public void testRemoveLevelUsedInMashup() throws Exception {
        initData(false);
        instance.setApplication(app);
        Long id = testLevel.getId();
        Application mashup = ApplicationHelper.createMashup(app, "mashup", entityManager, false);
        entityManager.persist(mashup);

        String error = instance.deleteLevel(entityManager, testLevel);
        assertNull(error);
        Level test = entityManager.find(Level.class, id);
        assertNull(test);
    }

    @Test
    public void testAddLayerToExistingLevel() {

        initData(true);
        int numStartLayers = app.getStartLayers().size();
        Application.TreeCache cache = app.loadTreeCache(entityManager);

        int numAppLayers = cache.getApplicationLayers().size();

        instance.setApplication(app);
        instance.setLevel(testLevel);
        instance.setSelectedlayers("l10,al6");
        assertNotNull(testAppLayer);
        assertNotNull(testLevel);

        instance.saveLevel(entityManager);

        Application application = entityManager.find(Application.class, app.getId());
        assertEquals(numStartLayers + 1, application.getStartLayers().size());

        app.setTreeCache(null);
        cache = app.loadTreeCache(entityManager);
        assertEquals(numAppLayers + 1, cache.getApplicationLayers().size());
    }

    @Test
    public void testAddLayerToExistingLevelUsedInMashup() throws Exception {
         /*
         This test is for the situation:
         
        Motherapp:
            Level A
                Layer B
        Create mashup
        
        In motherapp, add Layer C to Level A
        Mashup shouldn't be affected
        */
        initData(true);

        Application mashup = ApplicationHelper.createMashup(app, "mashup", entityManager, false);
        entityManager.persist(mashup);


        instance.setApplication(app);
        instance.setLevel(testLevel);

        instance.setSelectedlayers("l8," + "al" + testAppLayer.getId()); //begroeid_terreinvakonderdeel_plan
        instance.saveLevel(entityManager);

        ApplicationStartMapActionBean asm = new ApplicationStartMapActionBean();
        asm.setLevelId("n" + testLevel.getId());
        asm.setReaddedLayersString("[]");
        asm.setApplication(mashup);
        JSONArray children = asm.loadSelectedLayers(entityManager);
        assertEquals(1, children.length());
    }


    @Test
    public void testRemoveAndReaddLevelInMashup() throws Exception {
         /*
         This test is for the situation:
         
        Motherapp:
            Level A
                Layer B
        Create mashup
        
        In motherapp, add Layer C to Level A
        Mashup shouldn't be affected
        
        In mashup then: Remove level A, save, and readd level A
        Layer B and C should be present
        */
        initData(true);

        Application mashup = ApplicationHelper.createMashup(app, "mashup", entityManager, false);
        entityManager.persist(mashup);


        // Add layer to mother app
        instance.setApplication(app);
        instance.setLevel(testLevel);
        instance.setSelectedlayers("l8," + "al" + testAppLayer.getId());
        instance.saveLevel(entityManager);

        // test if mashup still has 1 layers in testlevel
        ApplicationStartMapActionBean asm = new ApplicationStartMapActionBean();
        asm.setLevelId("n" + testLevel.getId());
        asm.setApplication(mashup);
        asm.setReaddedLayersString("[]");
        JSONArray children = asm.loadSelectedLayers(entityManager);
        assertEquals(1, children.length());

        // remove level from mashup
        // save 
        asm = new ApplicationStartMapActionBean();
        asm.setApplication(mashup);
        entityManager.getTransaction().begin();
        asm.setRemovedRecordsString(" [{\"id\":" + testLevel.getId() + ",\"type\":\"level\"}]");
        asm.setSelectedContent(" []");
        asm.setCheckedLayersString("[]");
        asm.setReaddedLayersString("[]");
        asm.saveStartMap(entityManager);

        // check if still allright
        asm = new ApplicationStartMapActionBean();
        asm.setLevelId("n" + testLevel.getId());
        asm.setReaddedLayersString("[]");
        asm.setApplication(mashup);
        children = asm.loadSelectedLayers(entityManager);
        assertEquals(0, children.length());

        // add level to mashup
        entityManager.getTransaction().begin();
        asm = new ApplicationStartMapActionBean();
        asm.setApplication(mashup);
        asm.setCheckedLayersString("[]");
        asm.setSelectedContent(" [{\"id\":" + testLevel.getId() + ",\"type\":\"level\"}]");
        asm.setRemovedRecordsString(null);
        asm.setReaddedLayersString("[]");
        asm.saveStartMap(entityManager);


        asm = new ApplicationStartMapActionBean();
        asm.setReaddedLayersString("[]");
        asm.setApplication(mashup);
        asm.setLevelId("n" + testLevel.getId());
        children = asm.loadSelectedLayers(entityManager);
        assertEquals(2, children.length());
    }

    @Test
    public void testAddLayerToNewLevel() {

        initData(false);
        int numStartLayers = app.getStartLayers().size();
        int numStartLevels = app.getStartLevels().size();
        Application.TreeCache cache = app.loadTreeCache(entityManager);

        Level newLevel = new Level();
        newLevel.setName("pietje");
        newLevel.setParent(testLevel);

        int numAppLayers = cache.getApplicationLayers().size();
        int numLevels = cache.getLevels().size();

        instance.setApplication(app);
        instance.setLevel(newLevel);

        instance.saveLevel(entityManager);

        Application application = entityManager.find(Application.class, app.getId());

        application.setTreeCache(null);
        cache = application.loadTreeCache(entityManager);
        assertEquals(numLevels + 1, cache.getLevels().size());
        assertEquals(numStartLevels + 1, application.getStartLevels().size());
        Level reloadedLevel = entityManager.find(Level.class, newLevel.getId());
        StartLevel sl = reloadedLevel.getStartLevels().get(app);
        assertNotNull(sl);
        assertNull(sl.getSelectedIndex());
    }
}
