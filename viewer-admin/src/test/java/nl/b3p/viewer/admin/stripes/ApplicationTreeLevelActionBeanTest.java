/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.admin.stripes;

import net.sourceforge.stripes.action.ActionBeanContext;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.app.StartLayer;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import org.junit.Before;
import org.junit.Test;

/**
 *
 * @author Meine Toonen
 */
public class ApplicationTreeLevelActionBeanTest extends TestUtil {

    private static final Log log = LogFactory.getLog(ApplicationTreeLevelActionBeanTest.class);

    private ApplicationTreeLevelActionBean instance;

    @Before
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
        Application mashup = app.createMashup("mashup", entityManager, false);
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
    public void testRemoveLevelUsedInMashup() throws Exception{
        initData(true, false);
        instance.setApplication(app);
        Long id = testLevel.getId();
        Application mashup = app.createMashup("mashup", entityManager, false);
        entityManager.persist(mashup);
        
        String error = instance.deleteLevel(entityManager, testLevel);
        assertNull(error);
        Level test = entityManager.find(Level.class, id);
        assertNull(test);        
    }
}
