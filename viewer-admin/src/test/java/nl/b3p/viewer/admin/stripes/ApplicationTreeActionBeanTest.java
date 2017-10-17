/*
 * Copyright (C) 2013-2017 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.admin.stripes;

import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.util.SelectedContentCache;
import nl.b3p.viewer.util.TestUtil;
import org.json.JSONArray;
import org.json.JSONObject;
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
        String levelId = "n" + levelIdLng;
        String targetId = "n" + targetIdLng;
        
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
   
    @Test
    public void testMoveLevelToSame(){
        long themaIdLng = 4;
        long levelIdLng = 5;
        long targetIdLng = 6;
        String levelId = "n" + levelIdLng;
        String targetId = "n" + targetIdLng;
        
        Level thema = entityManager.find(Level.class, themaIdLng);
        Level groen = entityManager.find(Level.class, levelIdLng);
        Level woonplaatsen = entityManager.find(Level.class, targetIdLng);
        
        assertEquals((Long)themaIdLng, groen.getParent().getId());
        assertEquals((Long)themaIdLng, woonplaatsen.getParent().getId());
        assertEquals(2, thema.getChildren().size());
        
        instance.moveLevel(levelId, "n" + themaIdLng ,entityManager);
        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();
        
        thema = entityManager.find(Level.class, themaIdLng);
        groen = entityManager.find(Level.class, levelIdLng);
        woonplaatsen = entityManager.find(Level.class, targetIdLng);
        
        assertEquals((Long)themaIdLng, groen.getParent().getId());
        assertEquals((Long)themaIdLng, woonplaatsen.getParent().getId());
        assertEquals(2, thema.getChildren().size());
        
        assertEquals(2, thema.getChildren().size());
        assertEquals(0, woonplaatsen.getChildren().size());
        assertEquals(0, groen.getChildren().size());
        
    }
    @Test
    public void testSelectedContentAfterMoveLevelToSame(){
        long levelIdLng = 5;
        long targetIdLng = 6;
        String levelId = "n" + levelIdLng;
        String targetId = "n" + targetIdLng;
        
        Level groen = entityManager.find(Level.class, levelIdLng);
        Level woonplaatsen = entityManager.find(Level.class, targetIdLng);
        
        
        instance.moveLevel(levelId, targetId ,entityManager);
        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();
        
        SelectedContentCache scc = new SelectedContentCache();
        Application application = entityManager.find(Application.class, applicationId);
        
        JSONObject json = scc.createSelectedContent(application, false, false, false, entityManager);
        JSONArray selectedContent = json.getJSONArray("selectedContent");
        assertEquals(2, selectedContent.length());
    }

}
