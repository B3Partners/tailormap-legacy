/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.admin.stripes;

import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONObject;
import static org.junit.Assert.assertEquals;
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
    

   
    @Test
    public void testRemoveStartLayer(){
        
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
            removeString.put("type", "layer");
            removeString.put("id", 3L);
            JSONArray ar = new JSONArray();
            ar.put(removeString);
            instance.setRemovedRecordsString(ar.toString());
            
            instance.saveStartMap(entityManager);
            
            
            assertEquals(expectedStartLayerSize - 1, mashup.getStartLayers().size());
            assertEquals(expectedStartLevelSize, mashup.getStartLevels().size());

            assertEquals(expectedRootStartLevelSize, application.getRoot().getStartLevels().size());
        }catch(Exception e){
            log.error ("fout",e);
            assert(false);
        }
    }
   
    @Test
    public void testRemoveStartLevel(){
        
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
            
            assertEquals(expectedStartLayerSize -1, mashup.getStartLayers().size());
            assertEquals(expectedStartLevelSize- 1, mashup.getStartLevels().size());

            assertEquals(expectedRootStartLevelSize, application.getRoot().getStartLevels().size());
        }catch(Exception e){
            log.error (e);
            assert(false);
        }
    }
    
}
