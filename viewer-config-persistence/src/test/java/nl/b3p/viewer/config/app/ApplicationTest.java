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

import java.util.List;
import nl.b3p.viewer.util.TestUtil;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import org.junit.Test;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class ApplicationTest extends TestUtil{

    @Test
    public void testDeepCopy() throws Exception{
        initData(false);

        int expectedStartLayerSize = app.getStartLayers().size();
        int expectedStartLevelSize = app.getStartLevels().size();

        Application copy = app.deepCopy();
        copy.setVersion("" +666);
        entityManager.detach(app);
        entityManager.persist(copy);
        objectsToRemove.add(copy);
        
        assertFalse(app.getId().equals(copy.getId()));
        assertEquals(expectedStartLayerSize, copy.getStartLayers().size());
        assertEquals(expectedStartLevelSize, copy.getStartLevels().size());

        for (StartLayer startLayer : copy.getStartLayers()) {
            assertEquals(copy.getId(),startLayer.getApplication().getId());
        }

        for (StartLevel startLevel : copy.getStartLevels()) {
            assertEquals(copy.getId(), startLevel.getApplication().getId());
        }
        app = entityManager.merge(app);
        objectsToRemove.add(app);
    }

    @Test
    public void testDeleteApplications() throws Exception{
        initData(false);
        Application application = entityManager.find(Application.class, app.getId());
        Application copy = application.deepCopy();
        entityManager.detach(application);
        copy.setVersion("123");
        entityManager.persist(copy);

        application = entityManager.merge(application);
        objectsToRemove.add(application);
        objectsToRemove.add(copy);

    }
    
    @Test
    public void testMakeMashup() throws Exception{
        initData(true);
        
        int expectedStartLayerSize = app.getStartLayers().size();
        int expectedStartLevelSize = app.getStartLevels().size();
        
        Application mashup = app.createMashup("mashup", entityManager);
        entityManager.persist(mashup);
        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();
        assertFalse(app.getId().equals(mashup.getId()));
        assertEquals(expectedStartLayerSize * 2, mashup.getStartLayers().size());
        assertEquals(expectedStartLevelSize * 2 , mashup.getStartLevels().size());

        for (StartLayer startLayer : mashup.getStartLayers()) {
            assertEquals(mashup.getId(),startLayer.getApplication().getId());
        }

        for (StartLevel startLevel : mashup.getStartLevels()) {
            assertEquals(mashup.getId(), startLevel.getApplication().getId());
        }
        
        objectsToRemove.add(mashup);
    }

}
