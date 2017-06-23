/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.admin.stripes;

import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.util.TestUtil;
import static org.junit.Assert.*;
import org.junit.Before;
import org.junit.Test;

/**
 *
 * @author Meine Toonen
 */
public class ApplicationTreeActionBeanTest extends TestUtil{
    private ApplicationTreeActionBean instance;
    
    public ApplicationTreeActionBeanTest() {
    }
    
    @Before
    public void init(){
        instance = new ApplicationTreeActionBean();
    }
    
    @Test
    public void testMoveLevels(){
        String levelId = "5";
        String targetId = "6";
        
        Level thema = entityManager.find(Level.class, 4L);
        Level groen = entityManager.find(Level.class, 5L);
        Level woonplaatsen = entityManager.find(Level.class, 6L);
        
        assertEquals((Long)4L, groen.getParent().getId());
        assertEquals((Long)4L, woonplaatsen.getParent().getId());
        assertEquals(2, thema.getChildren().size());
        
        instance.moveLevel(levelId, targetId);
        
        thema = entityManager.find(Level.class, 4L);
        groen = entityManager.find(Level.class, 5L);
        woonplaatsen = entityManager.find(Level.class, 6L);
        
        assertEquals((Long)4L, woonplaatsen.getParent().getId());
        assertEquals((Long)6L, groen.getParent().getId());
        assertEquals(1, thema.getChildren().size());
        assertEquals(1, groen.getChildren().size());
        
    }

}
