/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.util;

import nl.b3p.viewer.config.app.BookmarkTest;
import nl.b3p.viewer.config.app.StartLayerTest;
import nl.b3p.viewer.config.app.StartLevelTest;
import nl.b3p.viewer.util.databaseupdate.DatabaseSynchronizerEMTest;
import nl.b3p.viewer.util.databaseupdate.DatabaseSynchronizerTest;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
@RunWith(Suite.class)
@Suite.SuiteClasses({
    StartLayerTest.class,
    StartLevelTest.class,
    DatabaseSynchronizerTest.class,
    DatabaseSynchronizerEMTest.class,
    BookmarkTest.class,
    
    SelectedContentCacheTest.class
   // TestUtil.class
})
public class ViewerConfigPersistenceSuite {

    @BeforeClass
    public static void setUpClass() throws Exception {
    }

    @AfterClass
    public static void tearDownClass() throws Exception {
    }

    @Before
    public void setUp() throws Exception {
    }

    @After
    public void tearDown() throws Exception {
    }

}
