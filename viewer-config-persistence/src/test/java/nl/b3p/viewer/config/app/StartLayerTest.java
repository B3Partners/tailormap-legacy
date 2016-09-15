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

import java.io.IOException;
import java.net.URISyntaxException;
import java.sql.SQLException;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.Assert;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import org.junit.Test;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class StartLayerTest extends TestUtil{

    private static final Log log = LogFactory.getLog(StartLayerTest.class);

    @Test
    public void persistLayer(){
        StartLayer sl = new StartLayer();
        sl.setChecked(true);
        sl.setSelectedIndex(16);
        persistEntityTest(sl, StartLayer.class);

        entityManager.refresh(sl);
        
        StartLayer test = entityManager.find(StartLayer.class,sl.getId());
        Assert.assertNotNull(test);
        Assert.assertEquals(new Integer(16), test.getSelectedIndex());
        assertEquals(6,entityManager.createQuery("FROM Level").getResultList().size());
    }
    
    @Test
    public void deleteLayer() throws URISyntaxException, SQLException, IOException{
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
        
        Assert.assertNotNull(appLayerExists);
        Assert.assertNotNull(appExists);
        assertEquals(6,entityManager.createQuery("FROM Level").getResultList().size());
        
    }

    @Test
    public void deleteApplayer() throws URISyntaxException, SQLException, IOException{
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
        try{
            entityManager.getTransaction().commit();
        }catch (Exception e){
            log.error("Fout bij verwijderen", e);
            assert(false);
        }
        entityManager.getTransaction().begin();

        ApplicationLayer appLayerNull = entityManager.find(ApplicationLayer.class, lid);
        StartLayer startLayerNull = entityManager.find(StartLayer.class, testStartLayer.getId());
        assertNull(appLayerNull);
        assertNull(startLayerNull);
    }
    
    
    @Test
    public void deleteApplication() throws URISyntaxException, SQLException, IOException{
        initData(false);
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
