package nl.b3p.viewer.util;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


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
import nl.b3p.viewer.config.metadata.Metadata;
import nl.b3p.viewer.util.databaseupdate.ScriptRunner;
import org.hibernate.Session;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Assert;
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

    protected static List<Object> objectsToRemove = new ArrayList<Object>();

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
    public void stuffToRemove(){
        for (Object app : objectsToRemove) {
            entityManager.remove(app);
        }
        objectsToRemove = new ArrayList<Object>();
    }

    // Helper functions for testing
    public <T> void persistEntityTest(T entity, Class<T> clazz){
        entityManager.persist(entity);
        entityManager.getTransaction().commit();
    }
    
    public <T> void persistAndDeleteEntityTest(T entity, Class<T> clazz){
        persistEntityTest(entity, clazz);
        entityManager.getTransaction().begin();

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
}
