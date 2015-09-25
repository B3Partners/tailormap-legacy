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
public class StartLevelTest extends TestUtil{

    public Level testLevel;
    public StartLevel testStartLevel;

    public void initData(){
        testLevel = new Level();
        testLevel.setName("testlevel");
        persistEntityTest(testLevel, Level.class, false);

        testStartLevel = new StartLevel();
        testStartLevel.setLevel(testLevel);
        testLevel.getStartLevels().put(null,testStartLevel);
        testStartLevel.setSelectedIndex(16);
        persistEntityTest(testStartLevel, StartLevel.class, false);
    }
    
    @Test
    public void persistLevel(){
        StartLevel sl = new StartLevel();
        sl.setSelectedIndex(16);
        persistEntityTest(sl, StartLevel.class,true);

        entityManager.refresh(sl);
        StartLevel test = entityManager.find(StartLevel.class,sl.getId());
        assertNotNull(test);
        
        Assert.assertEquals(new Integer(16), test.getSelectedIndex());
        assertEquals(6,entityManager.createQuery("FROM Level").getResultList().size());
    }
    
    @Test
    public void deleteStartLevel() throws URISyntaxException, SQLException, IOException{
        Application app = entityManager.find(Application.class, applicationId);
        
        Level level = entityManager.find(Level.class, 5L);
        
        StartLevel sl = new StartLevel();
        sl.setLevel(level);
        sl.setApplication(app);
        sl.setSelectedIndex(16);
        persistAndDeleteEntityTest(sl, StartLevel.class);
        
        Level levelExists = entityManager.find(Level.class, 5L);
        Application appExists = entityManager.find(Application.class, applicationId);
        
        Assert.assertNotNull(levelExists);
        Assert.assertNotNull(appExists);
        assertEquals(6,entityManager.createQuery("FROM Level").getResultList().size());
    }

    @Test
    public void deleteLevel() throws URISyntaxException, SQLException, IOException{
        initData();
        assertNotNull(testLevel);
        assertNotNull(testStartLevel);
        long lid = testLevel.getId();
        Level l = entityManager.find(Level.class, lid);
    
        entityManager.remove(l);
        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();

        Level shouldBeNull = entityManager.find(Level.class, lid);
        StartLevel shouldBeNullAsWell = entityManager.find(StartLevel.class, testStartLevel.getId());
        assertNull(shouldBeNull);
        assertNull(shouldBeNullAsWell);
    }



}
