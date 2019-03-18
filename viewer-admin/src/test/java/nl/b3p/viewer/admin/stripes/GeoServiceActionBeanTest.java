/*
 * Copyright (C) 2015 B3Partners B.V.
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

import java.util.List;
import net.sourceforge.stripes.action.ActionBeanContext;
import nl.b3p.viewer.config.services.Category;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import static org.junit.Assert.*;

import org.junit.Test;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class GeoServiceActionBeanTest extends TestUtil{

    private static final Log log = LogFactory.getLog(GeoServiceActionBeanTest.class);
    public GeoServiceActionBeanTest() {
    }

    @Test
    public void addWMSService(){
        try {
            String url = "https://geodata.nationaalgeoregister.nl/rwsgeluidskaarten/ows?language=dut&";
            String protocol = "wms";
            boolean overrideUrl = false;
            Category cat = new Category();
            cat.setId(1L);
            ActionBeanContext context = new ActionBeanContext();
            
            GeoServiceActionBean ab = new GeoServiceActionBean();
            ab.setUrl(url);
            ab.setProtocol(protocol);
            ab.setOverrideUrl(overrideUrl);
            ab.setCategory(cat);
            ab.setContext(context);
            ab.addService(entityManager);
            GeoService service = ab.getService();

            List<Layer> layers = service.loadLayerTree(entityManager);
            // hmmmp PDOK weirdness v1.1.0 caps file has 3 layers, v1.3.0 has 6
            assertEquals("The number of layers should be the same", 8, layers.size());
            //assertEquals("The number of layers should be the same", 3, layers.size());
            assertEquals("The url should be the same", url, service.getUrl());
        } catch (Exception ex) {
            log.error("Error testing adding a geoservice:", ex);
            assert(false);
        }
    }

    @Test
    public void addArcGISService(){
         try {
            String url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer";
            String protocol = "arcgis";
            boolean overrideUrl = false;
            Category cat = new Category();
            cat.setId(1L);
            ActionBeanContext context = new ActionBeanContext();

            GeoServiceActionBean ab = new GeoServiceActionBean();
            ab.setUrl(url);
            ab.setProtocol(protocol);
            ab.setOverrideUrl(overrideUrl);
            ab.setCategory(cat);
            ab.setContext(context);
            ab.addService(entityManager);
            GeoService service = ab.getService();

            List<Layer> layers = service.loadLayerTree(entityManager);
             assertEquals("The number of layers should be the same", 2, layers.size());
             assertEquals("The url should be the same", url, service.getUrl());
        } catch (Exception ex) {
            log.error("Error testing adding a geoservice:", ex);
            fail(ex.getLocalizedMessage());
        }
    }

}
