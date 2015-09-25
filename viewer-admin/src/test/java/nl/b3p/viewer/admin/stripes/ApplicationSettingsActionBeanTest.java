/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.admin.stripes;

import java.util.List;
import nl.b3p.viewer.util.TestUtil;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.Level;
import static org.junit.Assert.assertEquals;
import org.junit.Test;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class ApplicationSettingsActionBeanTest extends TestUtil{

    public ApplicationSettingsActionBeanTest() {
    }

    @Test
    public void applicationMashupTest() throws Exception{
        Application app = entityManager.find(Application.class, applicationId);
        assert(false);
        ApplicationSettingsActionBean asa = new ApplicationSettingsActionBean();
        Application mashup = asa.createMashup(app, entityManager, "mashup");

        Application.TreeCache tc = mashup.loadTreeCache(entityManager);
        List<Level> levels = tc.getLevels();
        for (Level level : levels) {
         //   assertEquals(2,level.getStartLevels().size());
        }


    }
}
