/*
 * Copyright (C) 2015 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.config.app;

import nl.b3p.viewer.util.TestUtil;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import org.junit.Test;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class BookmarkTest extends TestUtil{
    
    @Test
    public void testBookmarkPersist(){
        Bookmark bm = new Bookmark();
        bm.setCode("" + 16);
        bm.setParams("parameters");
        persistEntityTest(bm, Bookmark.class);

        entityManager.refresh(bm);
        Bookmark test = entityManager.find(Bookmark.class,bm.getId());
        assertNotNull(test);
        assertEquals(6,entityManager.createQuery("FROM Level").getResultList().size());
    }
    
    @Test
    public void testBookmarkDelete(){
        Application app = entityManager.find(Application.class, applicationId);
        Bookmark bm = new Bookmark();
        bm.setCode("" + 16);
        bm.setParams("parameters");
        bm.setApplication(app);
        persistEntityTest(bm, Bookmark.class);
        
        Application appTest = entityManager.find(Application.class, applicationId);
        assertNotNull(appTest);
        
        assertEquals(6,entityManager.createQuery("FROM Level").getResultList().size());
        
    }
    
}
