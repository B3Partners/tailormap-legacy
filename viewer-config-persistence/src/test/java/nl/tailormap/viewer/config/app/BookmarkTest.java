/*
 * Copyright (C) 2015-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config.app;

import nl.tailormap.viewer.util.TestUtil;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class BookmarkTest extends TestUtil {

    @Test
    public void testBookmarkPersist() {
        Bookmark bm = new Bookmark();
        bm.setCode("" + 16);
        bm.setParams("parameters");
        persistEntityTest(bm, Bookmark.class);

        entityManager.refresh(bm);
        Bookmark test = entityManager.find(Bookmark.class, bm.getId());
        assertNotNull(test);
        assertEquals(6, entityManager.createQuery("FROM Level").getResultList().size());
    }

    @Test
    public void testBookmarkDelete() {
        Application app = entityManager.find(Application.class, applicationId);
        Bookmark bm = new Bookmark();
        bm.setCode("" + 16);
        bm.setParams("parameters");
        bm.setApplication(app);
        persistEntityTest(bm, Bookmark.class);

        Application appTest = entityManager.find(Application.class, applicationId);
        assertNotNull(appTest);
        assertEquals(6, entityManager.createQuery("FROM Level").getResultList().size());
    }

}
