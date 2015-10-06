/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.config.app;

import java.io.IOException;
import java.net.URISyntaxException;
import java.sql.SQLException;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.Assert;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import org.junit.Test;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class StartLayerTest extends TestUtil{

    private static final Log log = LogFactory.getLog(StartLayerTest.class);

    public ApplicationLayer testAppLayer;
    public Level testLevel;
    public StartLayer testStartLayer;
    public Application app;

    public void initData(boolean deleteAfterwards) {
        app = new Application();
        app.setName("testapp");
        persistEntityTest(app, Application.class, deleteAfterwards);

        testLevel = new Level();
        testLevel.setName("testStartLayerLevel");
        app.setRoot(testLevel);
        entityManager.persist(app);
        persistEntityTest(testLevel, Level.class, deleteAfterwards);

        testAppLayer = new ApplicationLayer();
        testAppLayer.setLayerName("testlevel");
        testLevel.getLayers().add(testAppLayer);
        persistEntityTest(testAppLayer, ApplicationLayer.class, deleteAfterwards);

        testStartLayer = new StartLayer();
        testStartLayer.setApplicationLayer(testAppLayer);
        testStartLayer.setApplication(app);
        testStartLayer.setSelectedIndex(16);
        app.getStartLayers().add(testStartLayer);
        
        testAppLayer.getStartLayers().put(app,testStartLayer);

        entityManager.persist(testAppLayer);
        entityManager.persist(app);

        persistEntityTest(testStartLayer, StartLayer.class, deleteAfterwards);

        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();
    }

    @Test
    public void persistLayer(){
        StartLayer sl = new StartLayer();
        sl.setChecked(true);
        sl.setSelectedIndex(16);
        persistEntityTest(sl, StartLayer.class,true);

        entityManager.refresh(sl);
        
        StartLayer test = entityManager.find(StartLayer.class,sl.getId());
        Assert.assertNotNull(test);
        Assert.assertEquals(new Integer(16), test.getSelectedIndex());
        assertEquals(6,entityManager.createQuery("FROM Level").getResultList().size());
    }
    
    @Test
    public void deleteLayer() throws URISyntaxException, SQLException, IOException{
        Application app = entityManager.find(Application.class, 1L);
        
        ApplicationLayer appLayer = entityManager.find(ApplicationLayer.class, 2L);
        
        StartLayer sl = new StartLayer();
        sl.setChecked(true);
        sl.setApplicationLayer(appLayer);
        sl.setApplication(app);
        sl.setSelectedIndex(16);
        persistAndDeleteEntityTest(sl, StartLayer.class);
        
        entityManager.flush();
        ApplicationLayer appLayerExists = entityManager.find(ApplicationLayer.class, 2L);
        Application appExists = entityManager.find(Application.class, applicationId);
        
        Assert.assertNotNull(appLayerExists);
        Assert.assertNotNull(appExists);
        assertEquals(6,entityManager.createQuery("FROM Level").getResultList().size());
        
    }

    @Test
    public void deleteApplayer() throws URISyntaxException, SQLException, IOException{
        initData(true);
        assertNotNull(testAppLayer);
        assertNotNull(testStartLayer);
        long lid = testAppLayer.getId();
        ApplicationLayer appLayer = entityManager.find(ApplicationLayer.class, lid);
        StartLayer startLayer = entityManager.find(StartLayer.class, testStartLayer.getId());
        assertNotNull(startLayer);

        testLevel.getLayers().remove(appLayer);
        app.getStartLayers().removeAll(appLayer.getStartLayers().values());
        entityManager.remove(appLayer);
        try{
            entityManager.getTransaction().commit();
        }catch (Exception e){
            log.error("Fout bij verwijderen", e);
            assert(false);
        }
        entityManager.getTransaction().begin();

        ApplicationLayer appLayerNull = entityManager.find(ApplicationLayer.class, lid);
        StartLayer startLayerNull = entityManager.find(StartLayer.class, testStartLayer.getId());
        assertNull(appLayerNull);
        assertNull(startLayerNull);
    }
    
    
    @Test
    public void deleteApplication() throws URISyntaxException, SQLException, IOException{
        initData(false);
        assertNotNull(testAppLayer);
        assertNotNull(app);
        assertNotNull(testStartLayer);
        long lid = testAppLayer.getId();

        entityManager.remove(app);
        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();

        ApplicationLayer shouldBeNull = entityManager.find(ApplicationLayer.class, lid);
        StartLayer shouldBeNullAsWell = entityManager.find(StartLayer.class, testStartLayer.getId());
        Application appShouldBeNull = entityManager.find(Application.class, app.getId());
        assertNull(shouldBeNull);
        assertNull(shouldBeNullAsWell);
        assertNull(appShouldBeNull);
    }
}
