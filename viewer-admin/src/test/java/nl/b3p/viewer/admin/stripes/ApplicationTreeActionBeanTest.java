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
        long themaIdLng = 4;
        long levelIdLng = 5;
        long targetIdLng = 6;
        String levelId = "" + levelIdLng;
        String targetId = "" + targetIdLng;
        
        Level thema = entityManager.find(Level.class, themaIdLng);
        Level groen = entityManager.find(Level.class, levelIdLng);
        Level woonplaatsen = entityManager.find(Level.class, targetIdLng);
        
        assertEquals((Long)themaIdLng, groen.getParent().getId());
        assertEquals((Long)themaIdLng, woonplaatsen.getParent().getId());
        assertEquals(2, thema.getChildren().size());
        
        instance.moveLevel(levelId, targetId,entityManager);
        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();
        
        thema = entityManager.find(Level.class, themaIdLng);
        groen = entityManager.find(Level.class, levelIdLng);
        woonplaatsen = entityManager.find(Level.class, targetIdLng);
        
        assertEquals((Long)themaIdLng, woonplaatsen.getParent().getId());
        assertEquals("Level not moved. id ", (Long)targetIdLng, groen.getParent().getId());
        assertEquals(1, thema.getChildren().size());
        assertEquals(1, woonplaatsen.getChildren().size());
        
    }

}
