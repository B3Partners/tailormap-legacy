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
package nl.b3p.viewer.admin.stripes;

import java.net.URL;
import java.util.List;
import net.sourceforge.stripes.action.ActionBeanContext;
import nl.b3p.viewer.config.services.Category;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.util.TestUtil;
import static org.junit.Assert.*;

import org.junit.Test;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class GeoServiceActionBeanTest extends TestUtil{

    public GeoServiceActionBeanTest() {
    }

    @Test
    public void addWMSService(){
        try {
            String url = "http://geodata.nationaalgeoregister.nl/rwsgeluidskaarten/wms?request=GetCapabilities";
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
            assertEquals(layers.size(), 3);
        } catch (Exception ex) {
            assert(false);
        }
    }

 //   @Test
    public void addArcGISService(){
        //https://geodata.nationaalgeoregister.nl/rwsgeluidskaarten/wms?request=GetCapabilities
        //protocol
        //overrideUrl
        //username
        //password
        // url
        //exception_type
        //agsVersion
    }

}
