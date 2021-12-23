/*
 * Copyright (C) 2015-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config.app;

import nl.tailormap.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.URISyntaxException;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class StartLayerTest extends TestUtil {

    private static final Log log = LogFactory.getLog(StartLayerTest.class);

    @Test
    public void persistLayer() {
        StartLayer sl = new StartLayer();
        sl.setChecked(true);
        sl.setSelectedIndex(16);
        persistEntityTest(sl, StartLayer.class);

        entityManager.refresh(sl);

        StartLayer test = entityManager.find(StartLayer.class, sl.getId());
        assertNotNull(test);
        assertEquals(new Integer(16), test.getSelectedIndex());
        assertEquals(6, entityManager.createQuery("FROM Level").getResultList().size());
    }

    @Test
    public void deleteLayer() throws URISyntaxException, SQLException, IOException {
        Application app = entityManager.find(Application.class, 1L);

        ApplicationLayer appLayer = entityManager.find(ApplicationLayer.class, 2L);

        StartLayer sl = new StartLayer();
        sl.setChecked(true);
        sl.setApplicationLayer(appLayer);
        sl.setApplication(app);
        sl.setSelectedIndex(16);
        persistEntityTest(sl, StartLayer.class);

        entityManager.flush();
        ApplicationLayer appLayerExists = entityManager.find(ApplicationLayer.class, 2L);
        Application appExists = entityManager.find(Application.class, applicationId);

        assertNotNull(appLayerExists);
        assertNotNull(appExists);
        assertEquals(6, entityManager.createQuery("FROM Level").getResultList().size());

    }

    @Test
    public void deleteApplayer() throws URISyntaxException, SQLException, IOException {
        initData(true);
        assertNotNull(testAppLayer);
        assertNotNull(testStartLayer);
        long lid = testAppLayer.getId();
        ApplicationLayer appLayer = entityManager.find(ApplicationLayer.class, lid);
        StartLayer startLayer = entityManager.find(StartLayer.class, testStartLayer.getId());
        assertNotNull(startLayer);

        testLevel.getLayers().remove(appLayer);
        app.getStartLayers().removeAll(appLayer.getStartLayers().values());
        entityManager.remove(appLayer);
        try {
            entityManager.getTransaction().commit();
        } catch (Exception e) {
            log.error("Fout bij verwijderen", e);
            assert (false);
        }
        entityManager.getTransaction().begin();

        ApplicationLayer appLayerNull = entityManager.find(ApplicationLayer.class, lid);
        StartLayer startLayerNull = entityManager.find(StartLayer.class, testStartLayer.getId());
        assertNull(appLayerNull);
        assertNull(startLayerNull);
    }


    @Test
    public void deleteApplication() throws URISyntaxException, SQLException, IOException {
        initData(true);
        assertNotNull(testAppLayer);
        assertNotNull(app);
        assertNotNull(testStartLayer);
        long lid = testAppLayer.getId();

        entityManager.remove(app);
        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();

        ApplicationLayer shouldBeNull = entityManager.find(ApplicationLayer.class, lid);
        StartLayer shouldBeNullAsWell = entityManager.find(StartLayer.class, testStartLayer.getId());
        Application appShouldBeNull = entityManager.find(Application.class, app.getId());
        assertNull(shouldBeNull);
        assertNull(shouldBeNullAsWell);
        assertNull(appShouldBeNull);
    }
}
