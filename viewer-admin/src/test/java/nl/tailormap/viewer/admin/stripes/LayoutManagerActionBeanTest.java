/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.tailormap.viewer.admin.stripes;

import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.config.app.ConfiguredComponent;
import nl.tailormap.viewer.helpers.app.ApplicationHelper;
import nl.tailormap.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

/**
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class LayoutManagerActionBeanTest extends TestUtil {

    private static final Log log = LogFactory.getLog(LayoutManagerActionBeanTest.class);

    @Test
    public void testUpdateComponentsInMotherApplication() throws Exception {
        initData(true);
        Application mashup = ApplicationHelper.createMashup(app, "mashup", entityManager, true);

        LayoutManagerActionBean lmab = new LayoutManagerActionBean();
        entityManager.persist(mashup);

        String newConfig = "{value: 'different'}";
        for (ConfiguredComponent component : app.getComponents()) {
            lmab.saveComponent(entityManager, component, newConfig, component.getName(), component.getClassName(), app, null);
        }

        entityManager.getTransaction().begin();

        for (ConfiguredComponent component : mashup.getComponents()) {
            assertEquals(component.getConfig(), newConfig);
        }
    }

    @Test
    public void testUpdateHTMLComponentsInMotherApplication() {
        try {
            initData(true);
            LayoutManagerActionBean lmab = new LayoutManagerActionBean();
            app.getComponents().remove(testComponent);
            entityManager.remove(testComponent);

            String expectedConfig = "{ change: false}";
            ConfiguredComponent cc = new ConfiguredComponent();
            cc.setClassName("viewer.components.HTML");
            cc.setConfig(expectedConfig);
            cc.setName("htmlComponent1");
            cc.setApplication(app);
            persistEntityTest(cc, ConfiguredComponent.class);

            app.getComponents().add(cc);

            Application mashup = ApplicationHelper.createMashup(app, "mashup", entityManager, true);
            entityManager.persist(mashup);

            String newConfig = "{value: 'different'}";
            for (ConfiguredComponent component : app.getComponents()) {
                lmab.saveComponent(entityManager, component, newConfig, component.getName(), component.getClassName(), app, null);
            }

            entityManager.getTransaction().begin();

            for (ConfiguredComponent component : mashup.getComponents()) {
                assertEquals(component.getConfig(), expectedConfig);
            }
        } catch (Exception e) {
            log.error("Error:", e);
            fail("Error: " + e.getLocalizedMessage());
        }
    }
}
