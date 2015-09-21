/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.config.app;

import nl.b3p.viewer.util.TestUtil;
import static org.junit.Assert.assertNotNull;
import org.junit.Test;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class BookmarkTest extends TestUtil{
    
    @Test
    public void testBookmarkPersist(){
        Bookmark bm = new Bookmark();
        bm.setCode("" + 16);
        bm.setParams("parameters");
        persistEntityTest(bm, Bookmark.class);
    }
    
    @Test
    public void testBookmarkDelete(){
        Application app = entityManager.find(Application.class, 1L);
        Bookmark bm = new Bookmark();
        bm.setCode("" + 16);
        bm.setParams("parameters");
        bm.setApplication(app);
        persistAndDeleteEntityTest(bm, Bookmark.class);
        
        Application appTest = entityManager.find(Application.class, 1L);
        assertNotNull(appTest);
        
    }
    
}
