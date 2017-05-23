/*
 * Copyright (C) 2016 B3Partners B.V.
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

import net.sourceforge.stripes.action.ActionBeanContext;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.After;
import static org.junit.Assert.fail;
import org.junit.Before;
import org.junit.Test;

/**
 *
 * @author meine
 */
public class ApplicationSettingsActionBeanTest extends TestUtil {
    private static final Log log = LogFactory.getLog(ApplicationSettingsActionBeanTest.class);

    private ApplicationSettingsActionBean instance = null;

    @Before
    public void startup(){
        instance = new ApplicationSettingsActionBean();
    }

    @After
    public void tearDown() {
    }

    @Test
    public void testCopyOfMashup(){
        try {
            initData(false);
            instance.setApplication(app);
            Application mashup = app.createMashup("mashup", entityManager, false);
            entityManager.persist(mashup);
            
            instance.setApplication(mashup);
            instance.setName("kopie");
            instance.setVersion( "13");
            instance.copyApplication(entityManager);
            
        } catch (Exception ex) {
            log.error("Error creating copy of mashup: ",ex);
            fail();
        }
    }

    @Test
    public void testCopyOfApplication(){
        try {
            initData(false);
            instance.setApplication(app);
            instance.setName("kopie");
            instance.setVersion( "13");
            instance.copyApplication(entityManager);
        } catch (Exception ex) {
            log.error("Error creating copy of mashup: ",ex);
            fail();
        }
    }
    
       
    
    @Test
    public void testMakeWorkVersionFromMashupApp() {
        /*
        Have a motherapplication
        One mashup (no workversion)
        Create workversion of mashup
        Publish workversion and let all mashups point to the newly published application.
        */
        initData(true);
        try {
            ChooseApplicationActionBean caab = new ChooseApplicationActionBean();
            ActionBeanContext context = new ActionBeanContext();
            caab.setContext(context);
            app.setVersion(null);
            entityManager.persist(app);

            Application mashup = app.createMashup("mashup", entityManager, true);
            entityManager.persist(mashup);
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
            
            String version = "werkversie";
            Application workVersion = caab.createWorkversion(mashup, entityManager, version);

            entityManager.getTransaction().begin();
            entityManager.getTransaction().commit();
            entityManager.getTransaction().begin();
           
            instance.setApplication(workVersion);
            instance.publish(entityManager);
            int a = 0;
        } catch (Exception e) {
            log.error("Fout", e);
            assert (false);
        }
    }
    
}
