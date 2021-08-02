/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.tailormap.viewer.admin.stripes;

import net.sourceforge.stripes.action.ActionBeanContext;
import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.config.app.StartLayer;
import nl.tailormap.viewer.helpers.app.ApplicationHelper;
import nl.tailormap.viewer.util.TestActionBeanContext;
import nl.tailormap.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.fail;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class ChooseApplicationActionBeanTest extends TestUtil {

    private static final Log log = LogFactory.getLog(ChooseApplicationActionBeanTest.class);

    @Test
    public void testMakeWorkVersion() {
        try {
            initData(true);
            ChooseApplicationActionBean caab = new ChooseApplicationActionBean();
            ActionBeanContext context = new ActionBeanContext();
            caab.setContext(context);
            
            String version = "werkversie";
            Application workVersion = caab.createWorkversion(app, entityManager,version);

            Application prev = entityManager.merge(app);
            entityManager.getTransaction().begin();
            entityManager.getTransaction().commit();
        } catch (Exception e) {
            log.error("Fout", e);
            fail(e.getLocalizedMessage());
        }
    }

    @Test
    public void testMakeWorkVersionFromAppWithMashup() {
        initData(true);
        try {
            ChooseApplicationActionBean caab = new ChooseApplicationActionBean();
            ActionBeanContext context = new ActionBeanContext();
            caab.setContext(context);
            int startLevelsMotherApp = app.getStartLevels().size();
            int startLayersMotherApp = app.getStartLayers().size();

            Application mashup = ApplicationHelper.createMashup(app, "mashup", entityManager, true);
            entityManager.persist(mashup);
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            
            String version = "werkversie";
            Application workVersion = caab.createWorkversion(app, entityManager, version);

            entityManager.getTransaction().begin();
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            Application prev = entityManager.merge(app);
            
            assertEquals(startLayersMotherApp, workVersion.getStartLayers().size());
            assertEquals(startLevelsMotherApp, workVersion.getStartLevels().size());
           //objectsToRemove.add(entityManager.merge(mashup));
       //     objectsToRemove.add(prev);

          //  objectsToRemove.add(workVersion);
        } catch (Exception e) {
            log.error("Fout", e);
            fail(e.getLocalizedMessage());
        }
    }
    
    @Test
    public void publishWorkVersionWhereCurrentPublishedHasMashup() {
        initData(true);
        try {
            ChooseApplicationActionBean caab = new ChooseApplicationActionBean();
            ActionBeanContext context = new ActionBeanContext();
            caab.setContext(context);
            int startLevelsMotherApp = app.getStartLevels().size();
            int startLayersMotherApp = app.getStartLayers().size();

            app.setVersion(null);
            entityManager.persist(app);
            Application mashup = ApplicationHelper.createMashup(app, "mashup", entityManager, true);
            entityManager.persist(mashup);
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            mashup.loadTreeCache(entityManager);

            long mashupStartLevelId = mashup.getStartLevels().get(0).getLevel().getId();
            
            String version = "werkversie";
            Application workVersion = caab.createWorkversion(app, entityManager, version);

            entityManager.getTransaction().begin();
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            Application prev = entityManager.merge(app);
            
            assertEquals(startLayersMotherApp, workVersion.getStartLayers().size());
            assertEquals(startLevelsMotherApp, workVersion.getStartLevels().size());
          
            
            ApplicationSettingsActionBean asab = new ApplicationSettingsActionBean();
            asab.setContext(context);
            asab.setApplication(workVersion);
            asab.setMashupMustPointToPublishedVersion(true);
            asab.setName(app.getName());
            asab.publish(entityManager);
            
            entityManager.getTransaction().begin();
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            
            Application newMashup = entityManager.find(Application.class, mashup.getId());
            newMashup.loadTreeCache(entityManager);

            long newRootStartLevelId = newMashup.getStartLevels().get(0).getLevel().getId();
            assertNotEquals(mashupStartLevelId, newRootStartLevelId);
        } catch (Exception e) {
            log.error("Fout", e);
            fail(e.getLocalizedMessage());
        }
    }
    
    @Test
    public void deleteOriginalMotherWhenComponentsMustFollowNewlyPublishedApplication() {
        initData(true);
        try {
            ChooseApplicationActionBean caab = new ChooseApplicationActionBean();
            TestActionBeanContext context = new TestActionBeanContext();
            caab.setContext(context);

            app.setVersion(null);
            entityManager.persist(app);
            Application mashup = ApplicationHelper.createMashup(app, "mashup", entityManager, true);
            entityManager.persist(mashup);
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            mashup.loadTreeCache(entityManager);

            long mashupStartLevelId = mashup.getStartLevels().get(0).getLevel().getId();
            
            String version = "werkversie";
            Application workVersion = caab.createWorkversion(app, entityManager, version);

            entityManager.getTransaction().begin();
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            Application prev = entityManager.merge(app);
          
            
            ApplicationSettingsActionBean asab = new ApplicationSettingsActionBean();
            asab.setContext(context);
            asab.setApplication(workVersion);
            asab.setMashupMustPointToPublishedVersion(true);
            asab.setName(app.getName());
            asab.publish(entityManager);
            
            entityManager.getTransaction().begin();
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            
            // delete old mother
            caab = new ChooseApplicationActionBean();
            context = new TestActionBeanContext();
            caab.setContext(context);
            Application oldmother = entityManager.find(Application.class, app.getId());
            caab.setApplicationToDelete(oldmother);
            caab.deleteApplication(entityManager);
        } catch (Exception e) {
            log.error("Fout", e);
            fail(e.getLocalizedMessage());
        }
    }
    
    @Test
    public void testMakeWorkVersionFromMashup() {
        initData(true);
        try {
            ChooseApplicationActionBean caab = new ChooseApplicationActionBean();
            ActionBeanContext context = new ActionBeanContext();
            caab.setContext(context);

            Application mashup = ApplicationHelper.createMashup(app, "mashup", entityManager, true);
            entityManager.persist(mashup);
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            
            String version = "werkversie";
            Application workVersion = caab.createWorkversion(mashup, entityManager, version);

            entityManager.getTransaction().begin();
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();   
          
            List origStartLayers = entityManager.createQuery("FROM StartLayer WHERE application = :app" , StartLayer.class).setParameter("app", app).getResultList();
            List workversionStartLayers = entityManager.createQuery("FROM StartLayer WHERE application = :app" , StartLayer.class).setParameter("app", workVersion).getResultList();
            assertEquals(app.getRoot().getId(),workVersion.getRoot().getId(), "Rootlevel should be the same ");
            assertEquals(origStartLayers.size(), workversionStartLayers.size());
        } catch (Exception e) {
            log.error("Fout", e);
            fail(e.getLocalizedMessage());
        }
    }
    
    @Test
    public void testDeleteApplication(){
        initData(false);
        try{
            ChooseApplicationActionBean caab = new ChooseApplicationActionBean();
            TestActionBeanContext context = new TestActionBeanContext();
            caab.setApplicationToDelete(app);
            caab.setContext(context);
             caab.deleteApplication(entityManager);
            entityManager.getTransaction().begin();
            entityManager.getTransaction().commit();
        }catch(Exception e){
            log.error("Fout", e);
            fail(e.getLocalizedMessage());
        }
    }
    
    @Test
    public void testPublishWorkVersionFromMashup() {
        initData(true);
        try {
            ChooseApplicationActionBean caab = new ChooseApplicationActionBean();
            ActionBeanContext context = new ActionBeanContext();
            caab.setContext(context);
            Long oldRootId = app.getRoot().getId();
            List origAppStartLayers = entityManager.createQuery("FROM StartLayer WHERE application = :app" , StartLayer.class).setParameter("app", app).getResultList();
            
            Application mashup = ApplicationHelper.createMashup(app, "mashup", entityManager, true);
            entityManager.persist(mashup);
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            
            String version = "werkversie";
            Application workVersion = caab.createWorkversion(mashup, entityManager, version);
            entityManager.getTransaction().begin();
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            
            workVersion.setVersion(null);
            entityManager.persist(workVersion);
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            
            ApplicationSettingsActionBean asab = new ApplicationSettingsActionBean();
            asab.setContext(context);
            asab.setApplication(workVersion);
            asab.setMashupMustPointToPublishedVersion(true);
            asab.publish(entityManager);
            
            assertEquals(oldRootId, workVersion.getRoot().getId(), "Rootlevel should be the same ");
            assertEquals(oldRootId, app.getRoot().getId(), "Rootlevel of original should remain the same");
            
            List newAppStartLayers = entityManager.createQuery("FROM StartLayer WHERE application = :app" , StartLayer.class).setParameter("app", app).getResultList();
            
            assertEquals(origAppStartLayers.size(), newAppStartLayers.size());
            
            List workversionStartLayers = entityManager.createQuery("FROM StartLayer WHERE application = :app" , StartLayer.class).setParameter("app", workVersion).getResultList();
            
            assertEquals(app.getRoot().getId(),workVersion.getRoot().getId());
        } catch (Exception e) {
            log.error("Fout", e);
            fail(e.getLocalizedMessage());
        }
    }
    
    @Test
    public void testMakeMashupFromAppWithWorkversion() {
         initData(true);
        try {
            ChooseApplicationActionBean caab = new ChooseApplicationActionBean();
            ActionBeanContext context = new ActionBeanContext();
            caab.setContext(context);

            String version = "werkversie";
            Application workVersion = caab.createWorkversion(app, entityManager, version);

            entityManager.getTransaction().begin();
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();

            Application mashup = ApplicationHelper.createMashup(app, "mashup", entityManager, true);
            
            
            entityManager.persist(mashup);
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();


           // Application prev = entityManager.merge(app);

        } catch (Exception e) {
            log.error("Fout", e);
            fail(e.getLocalizedMessage());
        }
    }

}
