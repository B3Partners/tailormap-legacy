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
package nl.tailormap.viewer.admin.stripes;

import net.sourceforge.stripes.action.ActionBeanContext;
import nl.tailormap.viewer.config.services.Category;
import nl.tailormap.viewer.config.services.GeoService;
import nl.tailormap.viewer.config.services.Layer;
import nl.tailormap.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

/**
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class GeoServiceActionBeanTest extends TestUtil {

    private static final Log log = LogFactory.getLog(GeoServiceActionBeanTest.class);

    public GeoServiceActionBeanTest() {
    }

    @Test
    public void addWMSService() {
        String url = "https://geodata.nationaalgeoregister.nl/au/wms?SERVICE=WMS&";
        try {
            Category cat = new Category();
            cat.setId(1L);
            ActionBeanContext context = new ActionBeanContext();
            GeoServiceActionBean ab = new GeoServiceActionBean();
            ab.setUrl(url);
            ab.setProtocol("wms");
            ab.setOverrideUrl(false);
            ab.setCategory(cat);
            ab.setContext(context);
            ab.addService(entityManager);
            GeoService service = ab.getService();

            List<Layer> layers = service.loadLayerTree(entityManager);
            // hmmmp PDOK weirdness v1.1.0 caps file has 3 layers, v1.3.0 has 6
            assertEquals(3, layers.size(), "The number of layers should be the same");
            //assertEquals("The number of layers should be the same", 3, layers.size());
            assertEquals(url, service.getUrl(), "The url should be the same");
        } catch (Exception ex) {
            log.error("Error testing adding a geoservice: " + url, ex);
            fail("Error testing adding a geoservice:" + url);
        }
    }

    @Test
    public void addArcGISService() {
        String url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer";
        try {
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
            assertEquals(2, layers.size(), "The number of layers should be the same");
            assertEquals(url, service.getUrl(), "The url should be the same");
        } catch (Exception ex) {
            log.error("Error testing adding a geoservice: " + url, ex);
            fail("Error testing adding a geoservice: " + url);
        }
    }

}
