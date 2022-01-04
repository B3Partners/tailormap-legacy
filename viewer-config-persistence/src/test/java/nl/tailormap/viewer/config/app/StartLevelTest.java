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

/**
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class StartLevelTest extends TestUtil {

    private static final Log log = LogFactory.getLog(StartLevelTest.class);

    @Test
    public void persistLevel() {
        StartLevel sl = new StartLevel();
        sl.setSelectedIndex(16);
        persistEntityTest(sl, StartLevel.class);

        entityManager.refresh(sl);
        StartLevel test = entityManager.find(StartLevel.class, sl.getId());
        assertNotNull(test);

        assertEquals(new Integer(16), test.getSelectedIndex());
        assertEquals(6, entityManager.createQuery("FROM Level").getResultList().size());
    }

    @Test
    public void deleteStartLevel() throws URISyntaxException, SQLException, IOException {
        Application app = entityManager.find(Application.class, applicationId);

        Level level = entityManager.find(Level.class, 5L);

        StartLevel sl = new StartLevel();
        sl.setLevel(level);
        sl.setApplication(app);
        sl.setSelectedIndex(16);
        persistEntityTest(sl, StartLevel.class);

        Level levelExists = entityManager.find(Level.class, 5L);
        Application appExists = entityManager.find(Application.class, applicationId);

        assertNotNull(levelExists);
        assertNotNull(appExists);
        assertEquals(6, entityManager.createQuery("FROM Level").getResultList().size());
    }

}
