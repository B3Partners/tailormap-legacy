/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.config.app;

import java.io.IOException;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.List;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.StartLayer;
import nl.b3p.viewer.util.TestUtil;
import org.junit.Assert;
import org.junit.Test;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class StartLevelTest extends TestUtil{
    
    @Test
    public void persistLevel(){
        StartLevel sl = new StartLevel();
        sl.setChecked(true);
        sl.setSelectedIndex(16);
        persistEntityTest(sl, StartLevel.class);
        
        StartLevel test = entityManager.find(StartLevel.class,1L);
        Assert.assertNotNull(test);
        Assert.assertEquals(new Integer(16), test.getSelectedIndex());
    }
    
    @Test
    public void deleteLevel() throws URISyntaxException, SQLException, IOException{
        Application app = entityManager.find(Application.class, 1L);
        
        Level level = entityManager.find(Level.class, 5L);
        
        StartLevel sl = new StartLevel();
        sl.setChecked(true);
        sl.setLevel(level);
        sl.setApplication(app);
        sl.setSelectedIndex(16);
        persistAndDeleteEntityTest(sl, StartLevel.class);
        
        
        Level levelExists = entityManager.find(Level.class, 5L);
        Application appExists = entityManager.find(Application.class, 1L);
        
        Assert.assertNotNull(levelExists);
        Assert.assertNotNull(appExists);
        
    }
    
}
