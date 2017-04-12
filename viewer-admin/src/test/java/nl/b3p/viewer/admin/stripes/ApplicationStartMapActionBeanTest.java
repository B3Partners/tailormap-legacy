/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.admin.stripes;

import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.app.StartLayer;
import nl.b3p.viewer.config.app.StartLevel;
import nl.b3p.viewer.util.SelectedContentCache;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Assert;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import org.junit.Test;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class ApplicationStartMapActionBeanTest extends TestUtil{
    private static final Log log = LogFactory.getLog(ApplicationStartMapActionBeanTest.class);
    private ApplicationStartMapActionBean instance = new ApplicationStartMapActionBean();
    private Application application;
    
    public ApplicationStartMapActionBeanTest() {
        String sc = "[{ \"id\" : \"3\", \"type\" : \"level\"}, { \"id\" : \"4\", \"type\" : \"level\"}, { \"id\" : \"5\", \"type\" : \"level\"},{ \"id\" : \"6\", \"type\" : \"level\"}]";
        
        
        instance.setSelectedContent(sc);
        instance.setCheckedLayersString("[]");
        int a = 0;
    }
   
   // @Test
    public void testRemoveStartLayerFromMashup(){
        
        initData(true);
        application = entityManager.find(Application.class, 2L);
        try {
            int expectedStartLayerSize = application.getStartLayers().size();
            int expectedStartLevelSize = application.getStartLevels().size();
          //  int expectedRootStartLevelSize = application.getRoot().getStartLevels().size() * 2;

            ApplicationLayer al2 = entityManager.find(ApplicationLayer.class, testAppLayer.getId());
            
            Application mashup = application.createMashup("mashup", entityManager,false);
            entityManager.persist(mashup);

            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            instance.setApplication(mashup);
            
            JSONObject removeString = new JSONObject();
            removeString.put("type", "layer");
            removeString.put("id", testAppLayer.getId());
            JSONArray ar = new JSONArray();
            ar.put(removeString);
            instance.setRemovedRecordsString(ar.toString());
            
            instance.saveStartMap(entityManager);
            
            // test of mashup is verandert
            ApplicationLayer al = entityManager.find(ApplicationLayer.class, testAppLayer.getId());
            StartLayer sl = al.getStartLayers().get(mashup);
            assertNotNull(sl);
            assertTrue(sl.getSelectedIndex() == null || sl.getSelectedIndex() == -1);
            assertEquals(expectedStartLayerSize , mashup.getStartLayers().size());
            assertEquals(expectedStartLevelSize, mashup.getStartLevels().size());
         //   assertEquals(expectedRootStartLevelSize, application.getRoot().getStartLevels().size());
            
            // test of moederapplicatie NIET is verandert
            StartLayer slOrig = al.getStartLayers().get(application);
            assertNotNull(slOrig);
            assertTrue(slOrig.getSelectedIndex() != null && slOrig.getSelectedIndex() >= 0);
            assertEquals(expectedStartLayerSize, application.getStartLayers().size());
            assertEquals(expectedStartLevelSize, application.getStartLevels().size());
         //  assertEquals(expectedRootStartLevelSize, application.getRoot().getStartLevels().size());
            

            int a = 0;
        }catch(Exception e){
            log.error ("fout",e);
            assert(false);
        }
    }
   
   // @Test
    public void testRemoveStartLevelFromMashup(){
        
        initData(true);
        application = entityManager.find(Application.class, 1L);
        try {
            int expectedStartLayerSize = application.getStartLayers().size();
            int expectedStartLevelSize = application.getStartLevels().size();
            int expectedRootStartLevelSize = application.getRoot().getStartLevels().size() * 2;

            Application mashup = application.createMashup("mashup", entityManager,false);
            entityManager.persist(mashup);

            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            instance.setApplication(mashup);
            
            JSONObject removeString = new JSONObject();
            removeString.put("type", "level");
            removeString.put("id", 3L);
            JSONArray ar = new JSONArray();
            ar.put(removeString);
            instance.setRemovedRecordsString(ar.toString());
            
            instance.saveStartMap(entityManager);
            
            
            // test of mashup is verandert
            Level l = entityManager.find(Level.class, 3L);
            StartLevel slMashup = l.getStartLevels().get(mashup);
            assertNotNull(slMashup);
            assertTrue(slMashup.getSelectedIndex() == -1);
            assertEquals(expectedStartLayerSize , mashup.getStartLayers().size());
            assertEquals(expectedStartLevelSize, mashup.getStartLevels().size());

            assertEquals(expectedRootStartLevelSize, application.getRoot().getStartLevels().size());
            
            
            
            // test of moederapplicatie NIET is verandert
            StartLevel slOrig = l.getStartLevels().get(application);
            assertNotNull(slOrig);
            assertTrue(slOrig.getSelectedIndex() >= 0);
            assertEquals(expectedStartLayerSize, application.getStartLayers().size());
            assertEquals(expectedStartLevelSize, application.getStartLevels().size());
            assertEquals(expectedRootStartLevelSize, application.getRoot().getStartLevels().size());
            
        }catch(Exception e){
            log.error (e);
            assert(false);
        }
    }
    
      @Test
    public void testRemoveStartLevelWithParent(){
        initData(true);
        application = entityManager.find(Application.class, 1L);
        try {
           
            instance.setApplication(application);
            
            // voeg level "Thema" (id = 4) toe aan startkaartbeeld
            String selectedContent = "[{\"id\":\"4\",\"type\":\"level\"}]";
            instance.setSelectedContent(selectedContent);
            instance.setRemovedRecordsString(null);
            instance.setApplication(application);
            instance.saveStartMap(entityManager);
            
            entityManager.getTransaction().begin();
            // verwijder level Groen (id = 5) uit startkaartbeeld
            
            JSONObject removeString = new JSONObject();
            removeString.put("type", "level");
            removeString.put("id", 5L);
            JSONArray ar = new JSONArray();
            ar.put(removeString);
            instance = new ApplicationStartMapActionBean();
            instance.setApplication(application);
            instance.setRemovedRecordsString(ar.toString());
            
        
            instance.setSelectedContent(selectedContent);
            instance.setCheckedLayersString("[]");
            instance.saveStartMap(entityManager);
            
            // check of level Woonplaatsen (id=6) nog bestaat in startkaartbeeld
            instance.setLevelId("n4");
            JSONArray children = instance.loadSelectedLayers(entityManager);
            boolean found = false;
            for (Object object : children) {
                JSONObject obj = (JSONObject)object;
                if(obj.getString("id").equals("n6")){
                    found = true;
                    break;
                }
            }
            assertTrue(found);
       }catch(Exception e){
            log.error (e);
            assert(false);
        }
    }
    
}
