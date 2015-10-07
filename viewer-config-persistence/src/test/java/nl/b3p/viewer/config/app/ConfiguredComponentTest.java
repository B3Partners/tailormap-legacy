/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.config.app;

import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import org.junit.Test;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class ConfiguredComponentTest extends TestUtil {

    private static final Log log = LogFactory.getLog(ConfiguredComponentTest.class);

    @Test
    public void deleteSingleConfiguredComponent() {
        try {
            initData(true);
            long cId = testComponent.getId();
            app.getComponents().remove(testComponent);
            entityManager.remove(testComponent);
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            ConfiguredComponent cc = entityManager.find(ConfiguredComponent.class, cId);
            assertNull(cc);
        } catch (Exception e) {
            log.error("Error:", e);
            assert (false);
        }
    }

    @Test
    public void deleteLinkedConfiguredComponent() {
        initData(true);
        try {
            Application mashup = app.createMashup("mashup", entityManager);

            entityManager.persist(mashup);
            objectsToRemove.add(mashup);

            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            ConfiguredComponent cc = (ConfiguredComponent)mashup.getComponents().toArray()[0];

            long cId =testComponent.getId();

            mashup.getComponents().remove(cc);
            entityManager.remove(cc);

            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();

            assertEquals(1, app.getComponents().size());
            assertNotNull(entityManager.find(ConfiguredComponent.class, cId));
        } catch (Exception e) {
            log.error("Error:", e);
            assert (false);
        }


    }

    @Test
    public void deleteMotherConfiguredComponent() {
        initData(true);
        try {
            Application mashup = app.createMashup("mashup", entityManager);

            entityManager.persist(mashup);
            objectsToRemove.add(mashup);

            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            ConfiguredComponent cc = (ConfiguredComponent)mashup.getComponents().toArray()[0];
            long cId =cc.getId();

            app.getComponents().remove(testComponent);
            entityManager.remove(testComponent);

            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();

            assertEquals(1, mashup.getComponents().size());
            assertNotNull(entityManager.find(ConfiguredComponent.class, cId));
        } catch (Exception e) {
            log.error("Error:", e);
            assert (false);
        }

    }

}
