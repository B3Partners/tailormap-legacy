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
package nl.b3p.viewer.util;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.Persistence;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredComponent;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.app.StartLayer;
import nl.b3p.viewer.config.app.StartLevel;
import nl.b3p.viewer.config.metadata.Metadata;
import nl.b3p.viewer.util.databaseupdate.ScriptRunner;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.Session;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;

/**
 * utility methoden voor unit tests.
 *
 * @author Mark Prins <mark@b3partners.nl>
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public abstract class TestUtil {

    protected static EntityManager entityManager;

    private static boolean testdataLoaded = false;
    protected static int TEST_VERSION_NUMBER = 666;
    
    public Long applicationId = 1L;
    public static String originalVersion = null;

    public ApplicationLayer testAppLayer;
    public Level testLevel;
    public StartLayer testStartLayer;
    public StartLevel testStartLevel;
    public ConfiguredComponent testComponent;
    public Application app;

    protected static List<Object> objectsToRemove = new ArrayList<Object>();

    private static final Log log = LogFactory.getLog(TestUtil.class);
    /**
     * initialisatie van EntityManager {@link #entityManager} en starten
     * transactie.
     *
     * @throws Exception if any
     *
     * @see #entityManager
     */

    @BeforeClass
    public static void createEntityManager(){
        final String persistenceUnit = System.getProperty("test.persistence.unit");
        entityManager = Persistence.createEntityManagerFactory(persistenceUnit).createEntityManager();
    }

    @Before
    public void setUp() throws Exception {
        if(!entityManager.getTransaction().isActive()){
            entityManager.getTransaction().begin();
        }
        loadTestData();

        if(!entityManager.getTransaction().isActive()){
            entityManager.getTransaction().begin();
        }
    }

    /**
     * sluiten van van EntityManager {@link #entityManager}.
     *
     * @throws Exception if any
     * @see #entityManager
     */
    @AfterClass
    public static void close() throws Exception {
        if (entityManager.isOpen()) {
            entityManager.close();
        }
    }

    @After
    public void closeTransaction(){
         if(entityManager.getTransaction().isActive()){
            entityManager.getTransaction().commit();
        }
    }

    @After
    public void stuffToRemove() {
        for (Object obj : objectsToRemove) {
            log.debug("Removing obj" + obj.toString());
            if(entityManager.contains(obj)){
                entityManager.remove(obj);
            }
        }

        if (!entityManager.getTransaction().isActive()) {
            entityManager.getTransaction().begin();
        }
        try {
            entityManager.getTransaction().commit();
            objectsToRemove = new ArrayList<Object>();
        } catch (Exception e) {
            log.error("Error committing transaction: ", e);
            assert (false);
        }
    }

    // Helper functions for testing
    public <T> void persistEntityTest(T entity, Class<T> clazz, boolean removeLater){
        entityManager.persist(entity);
        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();
        if(removeLater){
            objectsToRemove.add(entity);
        }
    }
    
    public <T> void persistAndDeleteEntityTest(T entity, Class<T> clazz){
        persistEntityTest(entity, clazz, false);

        entityManager.remove(entity);
        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();
    }

    // Helper functions for initializing data

    public void loadTestData() throws URISyntaxException, IOException, SQLException {
        if(testdataLoaded){
            return;
        }

        Application app = entityManager.find(Application.class, applicationId);
        if( app == null) {
            File f = new File(TestUtil.class.getResource("testdata.sql").toURI());
            executeScript(f);

            testdataLoaded = true;
        }
        Metadata version = entityManager.createQuery("From Metadata where configKey = :v", Metadata.class).setParameter("v", Metadata.DATABASE_VERSION_KEY).getSingleResult();
        originalVersion = version.getConfigValue();

    }

    public void executeScript(File f) throws IOException, SQLException {
        Connection conn = null;

        try {
            Session session = (Session) entityManager.getDelegate();
            conn = (Connection) session.connection();
            ScriptRunner sr = new ScriptRunner(conn, true, true);
            sr.runScript(new FileReader(f));
            conn.commit();
            entityManager.flush();
        } finally {
            if (conn != null) {
                conn.close();
            }
        }
    }

    public void initData(boolean deleteAfterwards) {
        app = new Application();
        app.setName("testapp");
        app.setVersion("154");
        persistEntityTest(app, Application.class, deleteAfterwards);

        testLevel = new Level();
        testLevel.setName("testLevel");
        app.setRoot(testLevel);
        entityManager.persist(app);
        persistEntityTest(testLevel, Level.class, false);

        testAppLayer = new ApplicationLayer();
        testAppLayer.setLayerName("testApplayer");
        testLevel.getLayers().add(testAppLayer);
        persistEntityTest(testAppLayer, ApplicationLayer.class, false);

        testStartLayer = new StartLayer();
        testStartLayer.setApplicationLayer(testAppLayer);
        testStartLayer.setApplication(app);
        testStartLayer.setSelectedIndex(16);
        app.getStartLayers().add(testStartLayer);

        testAppLayer.getStartLayers().put(app,testStartLayer);

        testStartLevel = new StartLevel();
        testStartLevel.setApplication(app);
        testStartLevel.setLevel(testLevel);
        testStartLevel.setSelectedIndex(9);
        testLevel.getStartLevels().put(app, testStartLevel);
        app.getStartLevels().add(testStartLevel);
        persistEntityTest(testStartLevel, StartLevel.class, false);

        entityManager.persist(testAppLayer);
        entityManager.persist(app);

        persistEntityTest(testStartLayer, StartLayer.class, false);

        testComponent = new ConfiguredComponent();
        testComponent.setApplication(app);
        testComponent.setClassName("viewer.components.Bookmark");
        testComponent.setConfig("{value: 'aapnootmies'}");
        testComponent.setName("testClassName1");
        app.getComponents().add(testComponent);
        persistEntityTest(testComponent, ConfiguredComponent.class, false);

        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();
    }
}
