/*
 * Copyright (C) 2015 B3Partners B.V.
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
package nl.b3p.viewer.config.app;

import java.util.HashSet;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
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
            Application mashup = app.createMashup("mashup", entityManager, true);

            entityManager.persist(mashup);
            objectsToRemove.add(mashup);

            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            ConfiguredComponent cc = (ConfiguredComponent) mashup.getComponents().toArray()[0];

            long cId = testComponent.getId();

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
            Application mashup = app.createMashup("mashup", entityManager, true);

            entityManager.persist(mashup);
            objectsToRemove.add(mashup);

            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            ConfiguredComponent cc = (ConfiguredComponent) mashup.getComponents().toArray()[0];
            long cId = cc.getId();

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

    @Test
    public void testUpdateComponentsInMotherApplication() throws Exception {
        initData(true);
        Application mashup = app.createMashup("mashup", entityManager, true);
        objectsToRemove.add(mashup);
        entityManager.persist(mashup);

        String newConfig = "{value: 'different'}";
        for (ConfiguredComponent component : app.getComponents()) {
            component.setConfig(newConfig);
            entityManager.persist(component);
        }

        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();

        for (ConfiguredComponent component : mashup.getComponents()) {
            assertTrue(component.getConfig().equals(newConfig));
        }
    }

    @Test
    public void testUpdateHTMLComponentsInMotherApplication() throws Exception {
        try {
            initData(true);
            app.getComponents().remove(testComponent);
            entityManager.remove(testComponent);

            String expectedConfig = "{ change: false}";
            ConfiguredComponent cc = new ConfiguredComponent();
            cc.setClassName("viewer.components.HTML");
            cc.setConfig(expectedConfig);
            cc.setName("htmlComponent1");
            cc.setApplication(app);
            persistEntityTest(cc, ConfiguredComponent.class, true);
            
            app.getComponents().add(cc);

            Application mashup = app.createMashup("mashup", entityManager, true);
            objectsToRemove.add(mashup);
            entityManager.persist(mashup);

            String newConfig = "{value: 'different'}";
            for (ConfiguredComponent component : app.getComponents()) {
                component.setConfig(newConfig);
                entityManager.persist(component);
            }

            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();

            for (ConfiguredComponent component : mashup.getComponents()) {
                assertTrue(component.getConfig().equals(expectedConfig));
            }
        } catch (Exception e) {
            log.error("Error:", e);
            assert (false);
        }
    }

}
