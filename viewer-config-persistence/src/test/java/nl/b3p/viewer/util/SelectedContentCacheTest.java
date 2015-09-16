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
import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

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

    // TODO add test methods here.
    // The methods must be annotated with annotation @Test. For example:
    //
    // @Test
    // public void hello() {}
    @Test
    public void persistApplication(){
        Application app = new Application();
        app.setName("testapp");
        entityManager.persist(app);
        entityManager.getTransaction().commit();
        assert(true);
    }

    @Test
    public void testSelectedContentGeneration() throws SQLException, FileNotFoundException, IOException, URISyntaxException{

        Connection conn =  null;

        try{
            Session session = (Session)entityManager.getDelegate();
            conn = (Connection)session.connection();
            ScriptRunner sr = new ScriptRunner(conn, true, true);

            File f = new File(this.getClass().getResource("testdata.sql").toURI());
            sr.runScript(new FileReader(f));
        }finally
        {
            if(conn != null){
                conn.close();
            }
        }
    }
}
