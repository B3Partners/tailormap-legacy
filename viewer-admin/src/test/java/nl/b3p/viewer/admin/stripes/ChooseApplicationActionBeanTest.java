/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.admin.stripes;

import net.sourceforge.stripes.action.ActionBeanContext;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationTest;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.Test;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class ChooseApplicationActionBeanTest extends TestUtil {

    private static final Log log = LogFactory.getLog(ChooseApplicationActionBeanTest.class);

    @Test
    public void testMakeWorkVersion() throws Exception {
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
            assert (false);
        }
    }

    @Test
    public void testMakeWorkVersionFromAppWithMashup() {
        initData(true);
        try {
            ChooseApplicationActionBean caab = new ChooseApplicationActionBean();
            ActionBeanContext context = new ActionBeanContext();
            caab.setContext(context);

            Application mashup = app.createMashup("mashup", entityManager, true);
            entityManager.persist(mashup);
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            
            String version = "werkversie";
            Application workVersion = caab.createWorkversion(app, entityManager, version);

            entityManager.getTransaction().begin();
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            Application prev = entityManager.merge(app);
           //objectsToRemove.add(entityManager.merge(mashup));
       //     objectsToRemove.add(prev);

          //  objectsToRemove.add(workVersion);
        } catch (Exception e) {
            log.error("Fout", e);
            assert (false);
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

            Application mashup = app.createMashup("mashup", entityManager, true);
            
            
            entityManager.persist(mashup);
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();


           // Application prev = entityManager.merge(app);

        } catch (Exception e) {
            log.error("Fout", e);
            assert (false);
        }
    }

}
