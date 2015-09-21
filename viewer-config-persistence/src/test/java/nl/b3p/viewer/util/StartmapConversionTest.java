/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.util;

import java.io.File;
import java.net.URISyntaxException;
import java.util.List;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.app.StartLayer;
import nl.b3p.viewer.config.app.StartLevel;
import static nl.b3p.viewer.util.TestUtil.entityManager;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import org.junit.Before;
import org.junit.Test;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class StartmapConversionTest extends TestUtil {
    
    @Before
    public void revertChanged(){
        Application app = entityManager.find(Application.class, applicationId);
        List<StartLayer> startLayers = entityManager.createQuery("FROM StartLayer WHERE application = :app", StartLayer.class).setParameter("app", app).getResultList();
        List<StartLevel> startLevels = entityManager.createQuery("FROM StartLevel WHERE application = :app", StartLevel.class).setParameter("app", app).getResultList();
        
        for (StartLevel startLevel : startLevels) {
            entityManager.remove(startLevel);
        }
        
        for (StartLayer startLayer : startLayers) {
            entityManager.remove(startLayer);
        }
        
        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();
        assertEquals(6,entityManager.createQuery("FROM Level").getResultList().size());
    }
    
    private Long levelId = 5L;
    
    @Test
    public void convertTest() throws URISyntaxException{
        Level level = entityManager.find(Level.class,levelId);
        assertNotNull(level);
        assertEquals(6,entityManager.createQuery("FROM Level").getResultList().size());
            File f = new File(TestUtil.class.getResource("scripts/postgresql-add_cyclorama_account.sql").toURI());
        assertTrue (f.exists());
        
        StartLevel sl = entityManager.createQuery("FROM StartLevel where level = :level", StartLevel.class).setParameter("level", level).getSingleResult();
        assertNotNull(sl);
    }
    
}
