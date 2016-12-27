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

import java.util.List;
import nl.b3p.viewer.config.app.Application.TreeCache;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import org.junit.Test;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class ApplicationTest extends TestUtil {

    private static final Log log = LogFactory.getLog(ApplicationTest.class);

    @Test
    public void testDeepCopy() throws Exception {
        initData(true);

        int expectedStartLayerSize = app.getStartLayers().size();
        int expectedStartLevelSize = app.getStartLevels().size();

        Application copy = app.deepCopy();
        copy.setVersion("" + 666);
        entityManager.detach(app);
        entityManager.persist(copy);

        assertFalse(app.getId().equals(copy.getId()));
        assertEquals(expectedStartLayerSize, copy.getStartLayers().size());
        assertEquals(expectedStartLevelSize, copy.getStartLevels().size());

        for (StartLayer startLayer : copy.getStartLayers()) {
            assertEquals(copy.getId(), startLayer.getApplication().getId());
        }

        for (StartLevel startLevel : copy.getStartLevels()) {
            assertEquals(copy.getId(), startLevel.getApplication().getId());
        }
        app = entityManager.merge(app);
    }

    @Test
    public void testDeepCopyReaders() throws Exception{
       initData(true);
       Application copy = app.deepCopy();
       assertEquals(2, copy.getReaders().size());
        for (String reader : app.getReaders()) {
            assertTrue(copy.getReaders().contains(reader));
        }
    }
    
    @Test
    public void testDeleteApplications() throws Exception {
        initData(true);
        Application application = entityManager.find(Application.class, app.getId());
        Application copy = application.deepCopy();
        entityManager.detach(application);
        copy.setVersion("123");
        entityManager.persist(copy);

        application = entityManager.merge(application);
    }

    @Test
    public void testMakeMashupLinkComponents() throws Exception {
        initData(true);
        try {
            int expectedStartLayerSize = app.getStartLayers().size();
            int expectedStartLevelSize = app.getStartLevels().size();
            int expectedRootStartLevelSize = app.getRoot().getStartLevels().size() * 2;

            Application mashup = app.createMashup("mashup", entityManager,true);
            entityManager.persist(mashup);

            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();

            assertFalse(app.getId().equals(mashup.getId()));
            assertEquals(expectedStartLayerSize, mashup.getStartLayers().size());
            assertEquals(expectedStartLevelSize, mashup.getStartLevels().size());

            for (StartLayer startLayer : mashup.getStartLayers()) {
                assertEquals(mashup.getId(), startLayer.getApplication().getId());
            }

            for (StartLevel startLevel : mashup.getStartLevels()) {
                assertEquals(mashup.getId(), startLevel.getApplication().getId());
            }

            assertEquals(expectedRootStartLevelSize, app.getRoot().getStartLevels().size());
            assertEquals(app.getRoot(), mashup.getRoot());

            TreeCache tc = mashup.loadTreeCache(entityManager);
            List<Level> levels = tc.getLevels();
            List<ApplicationLayer> appLayers = tc.getApplicationLayers();
            for (ApplicationLayer appLayer : appLayers) {
                assertTrue(appLayer.getStartLayers().containsKey(mashup));
            }

            for (Level level : levels) {
                if(level.getParent() != null){
                    assertTrue(level.getStartLevels().containsKey(mashup));
                }
            }
        } catch (Exception e) {
            log.error("Fout", e);
            assert (false);
        }
    }
    
    @Test
    public void testMakeMashupDontDuplicateStartLayers(){
         initData(true);
        try {
            int expectedStartLayerSize = app.getStartLayers().size();
            

            Application mashup = app.createMashup("mashup", entityManager,false);
            entityManager.persist(mashup);

            Application secondMashup = app.createMashup("mashup2", entityManager,false);
            entityManager.persist(secondMashup);

            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();

            // Check first mashup
            assertFalse(app.getId().equals(mashup.getId()));
            assertEquals(expectedStartLayerSize, mashup.getStartLayers().size());

            for (StartLayer startLayer : mashup.getStartLayers()) {
                assertEquals(mashup.getId(), startLayer.getApplication().getId());
            }

            TreeCache tc = mashup.loadTreeCache(entityManager);
            List<ApplicationLayer> appLayers = tc.getApplicationLayers();
            for (ApplicationLayer appLayer : appLayers) {
                assertTrue(appLayer.getStartLayers().containsKey(mashup));
            }
            
            // second mashup
            assertFalse(app.getId().equals(secondMashup.getId()));
            assertEquals(expectedStartLayerSize, secondMashup.getStartLayers().size());

            for (StartLayer startLayer : secondMashup.getStartLayers()) {
                assertEquals(secondMashup.getId(), startLayer.getApplication().getId());
            }

            TreeCache tc2 = secondMashup.loadTreeCache(entityManager);
            List<ApplicationLayer> appLayers2 = tc2.getApplicationLayers();
            for (ApplicationLayer appLayer : appLayers2) {
                assertTrue(appLayer.getStartLayers().containsKey(secondMashup));
            }
        } catch (Exception e) {
            log.error("Fout", e);
            assert (false);
        }
    }
    
    @Test
    public void testMakeMashupDontDuplicateStartLevels(){
         initData(true);
        try {
            int expectedStartLevelSize = app.getStartLevels().size();
            int expectedRootStartLevelSize = app.getRoot().getStartLevels().size() * 2;
            

            Application mashup = app.createMashup("mashup", entityManager,false);
            entityManager.persist(mashup);

            Application secondMashup = app.createMashup("mashup2", entityManager,false);
            entityManager.persist(secondMashup);

            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();

            // Check first mashup
            assertFalse(app.getId().equals(mashup.getId()));
            assertEquals(expectedStartLevelSize, mashup.getStartLevels().size());
            assertEquals(expectedRootStartLevelSize, app.getRoot().getStartLevels().size());
            assertEquals(app.getRoot(), mashup.getRoot());

            for (StartLevel startLevel : mashup.getStartLevels()) {
                assertEquals(mashup.getId(), startLevel.getApplication().getId());
            }

            // second mashup
            assertFalse(app.getId().equals(secondMashup.getId()));
            assertEquals(expectedStartLevelSize, secondMashup.getStartLevels().size());
            assertEquals(expectedRootStartLevelSize, app.getRoot().getStartLevels().size());
            assertEquals(app.getRoot(), secondMashup.getRoot());

            for (StartLevel startLevel : secondMashup.getStartLevels()) {
                assertEquals(secondMashup.getId(), startLevel.getApplication().getId());
            }

            TreeCache tc2 = secondMashup.loadTreeCache(entityManager);
            
        } catch (Exception e) {
            log.error("Fout", e);
            assert (false);
        }
    }

    @Test
    public void testMakeMashupDontLinkComponents() throws Exception {
        initData(true);
        try {
            int expectedStartLayerSize = app.getStartLayers().size();
            int expectedStartLevelSize = app.getStartLevels().size();
            int expectedRootStartLevelSize = app.getRoot().getStartLevels().size() * 2;

            Application mashup = app.createMashup("mashup", entityManager,false);
            entityManager.persist(mashup);

            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();

            assertFalse(app.getId().equals(mashup.getId()));
            assertEquals(expectedStartLayerSize, mashup.getStartLayers().size());
            assertEquals(expectedStartLevelSize, mashup.getStartLevels().size());

            for (StartLayer startLayer : mashup.getStartLayers()) {
                assertEquals(mashup.getId(), startLayer.getApplication().getId());
            }

            for (StartLevel startLevel : mashup.getStartLevels()) {
                assertEquals(mashup.getId(), startLevel.getApplication().getId());
            }

            assertEquals(expectedRootStartLevelSize, app.getRoot().getStartLevels().size());
            assertEquals(app.getRoot(), mashup.getRoot());

            TreeCache tc = mashup.loadTreeCache(entityManager);
            List<Level> levels = tc.getLevels();
            List<ApplicationLayer> appLayers = tc.getApplicationLayers();
            for (ApplicationLayer appLayer : appLayers) {
                assertTrue(appLayer.getStartLayers().containsKey(mashup));
            }

            for (Level level : levels) {
                if(level.getParent() != null){
                    assertTrue(level.getStartLevels().containsKey(mashup));
                }
            }
        } catch (Exception e) {
            log.error("Fout", e);
            assert (false);
        }
    }

    @Test
    public void testMakeMashupOfApplicationWithExistingMashup() throws Exception {
        initData(true);
        try {
            int expectedStartLayerSize = app.getStartLayers().size();
            int expectedStartLevelSize = app.getStartLevels().size();
            int expectedRootStartLevelSize = app.getRoot().getStartLevels().size() * 3;

            Application mashup1 = app.createMashup("mashup", entityManager,false);
            entityManager.persist(mashup1);

            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();


            Application mashup = app.createMashup("mashup2", entityManager,false);
            entityManager.persist(mashup);

            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();

            assertFalse(app.getId().equals(mashup.getId()));
            assertEquals(expectedStartLayerSize, mashup.getStartLayers().size());
            assertEquals(expectedStartLevelSize, mashup.getStartLevels().size());

            for (StartLayer startLayer : mashup.getStartLayers()) {
                assertEquals(mashup.getId(), startLayer.getApplication().getId());
            }

            for (StartLevel startLevel : mashup.getStartLevels()) {
                assertEquals(mashup.getId(), startLevel.getApplication().getId());
            }

            assertEquals(expectedRootStartLevelSize, app.getRoot().getStartLevels().size());
            assertEquals(app.getRoot(), mashup.getRoot());

            TreeCache tc = mashup.loadTreeCache(entityManager);
            List<Level> levels = tc.getLevels();
            List<ApplicationLayer> appLayers = tc.getApplicationLayers();
            for (ApplicationLayer appLayer : appLayers) {
                assertTrue(appLayer.getStartLayers().containsKey(mashup));
            }

            for (Level level : levels) {
                if(level.getParent() != null){
                    assertTrue(level.getStartLevels().containsKey(mashup));
                }
            }
        } catch (Exception e) {
            log.error("Fout", e);
            assert (false);
        }
    }

}
