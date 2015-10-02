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


    public ApplicationLayer testLayer;
    public StartLayer testStartLayer;
    public Application app;

    public void initData(boolean deleteApp){
        app = new Application();
        app.setName("testapp");
        persistEntityTest(app, Application.class, deleteApp);
        
        testLayer = new ApplicationLayer();
        testLayer.setLayerName("testlevel");
        persistEntityTest(testLayer, ApplicationLayer.class, false);

        testStartLayer = new StartLayer();
        testStartLayer.setApplicationLayer(testLayer);
        testStartLayer.setApplication(app);
        app.getStartLayers().add(testStartLayer);
        
        testLayer.getStartLayers().put(app,testStartLayer);
        testStartLayer.setSelectedIndex(16);
        persistEntityTest(testStartLayer, StartLayer.class, false);
    }

   // @Test
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
    
   // @Test
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

   // @Test
    public void deleteLevel() throws URISyntaxException, SQLException, IOException{
        initData(true);
        assertNotNull(testLayer);
        assertNotNull(testStartLayer);
        long lid = testLayer.getId();
        ApplicationLayer l = entityManager.find(ApplicationLayer.class, lid);

        entityManager.remove(l);
        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();

        ApplicationLayer shouldBeNull = entityManager.find(ApplicationLayer.class, lid);
        StartLayer shouldBeNullAsWell = entityManager.find(StartLayer.class, testStartLayer.getId());
        assertNull(shouldBeNull);
        assertNull(shouldBeNullAsWell);
    }
    
    
    @Test
    public void deleteApplication() throws URISyntaxException, SQLException, IOException{
        initData(false);
        assertNotNull(testLayer);
        assertNotNull(app);
        assertNotNull(testStartLayer);
        long lid = testLayer.getId();

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
