/*
 * Copyright (C) 2017 B3Partners B.V.
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

import java.util.Locale;
import nl.b3p.viewer.config.services.WMSService;
import static org.junit.Assert.assertNull;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Message;
import nl.b3p.viewer.config.services.Category;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.CoreMatchers.nullValue;
import org.junit.After;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

/**
 *
 * @author mprins
 */
//@RunWith(Parameterized.class)
public class WMSGeoServiceABTest extends TestUtil {

    private static final Log log = LogFactory.getLog(WMSGeoServiceABTest.class);

    /**
     * The parameter collection for this testcase. A paramet set consists of an
     * array containing:
     * <ol>
     * <li>(String) service url</li>
     * <li>(String) server type</li>
     * <li>(String) service type</li>
     * <li>(int) expected number of feature types</li>
     * </ol>
     *
     * @return parameter collection that contains input and response values for
     * this test.
     */
    @Parameterized.Parameters(name = "skip WFS discovery: {1}")
    public static Collection params() {
        return Arrays.asList(new Object[][]{
            // {"url",skipWFS,"serviceProtocol", "attrServiceProtocol",serviceTypecount,groupLayerCount},
            {"https://flamingo5.b3p.nl:443/geoserver/Test_omgeving/wms?SERVICE=WMS&", true, "wms", null, 5, 0},
            {"https://flamingo5.b3p.nl:443/geoserver/Test_omgeving/wms?SERVICE=WMS&", false, "wms", "wfs", 5, 0}
        });
    }
    private ActionBeanContext context;

    private GeoServiceActionBean gsb;
    /**
     * test parameter.
     */
    private final String serviceUrl;
    /**
     * test parameter.
     */
    private final boolean skipWFS;
    /**
     * test parameter.
     */
    private final String serviceProtocol;
    /**
     * test parameter.
     */
    private final String attrServiceProtocol;
    /**
     * test expectation.
     */
    private final int serviceTypeCount;
    /**
     * test expectation.
     */
    private final int groupLayerCount;

    public WMSGeoServiceABTest(String serviceUrl, boolean skipWFS, String serviceProtocol, String attrServiceProtocol, int serviceTypeCount, int groupLayerCount) {
        this.serviceUrl = serviceUrl;
        this.skipWFS = skipWFS;
        this.serviceProtocol = serviceProtocol;
        this.attrServiceProtocol = attrServiceProtocol;
        this.serviceTypeCount = serviceTypeCount;
        this.groupLayerCount = groupLayerCount;
    }

    @Before
    public void createContext() {
        context = new ActionBeanContext() {
            @Override
            public List<Message> getMessages() {
                return new ArrayList<>();
            }
        };
    }

    @After
    public void cleanupContext() {
        context = null;
        gsb = null;
    }

  //  @Test
    public void addWMSService() throws Exception {
        Category cat = new Category();
        cat.setId(1L);

        gsb = new GeoServiceActionBean();
        gsb.setUrl(this.serviceUrl);
        gsb.setProtocol(this.serviceProtocol);
        gsb.setOverrideUrl(false);
        gsb.setCategory(cat);
        gsb.setContext(this.context);
        gsb.setSkipDiscoverWFS(this.skipWFS);
        gsb.addService(this.entityManager);
        GeoService service = gsb.getService();

        context.getMessages().forEach((m) -> {
            log.debug(m.getMessage(Locale.ROOT));
        });

        assertTrue("Service should be a WMS", service instanceof WMSService);


        assertEquals("The url should be as expected", serviceUrl, service.getUrl());

        List<Layer> layers = service.loadLayerTree(entityManager);
        assertEquals("The number of layers should be as expected", serviceTypeCount + groupLayerCount, layers.size());

        layers.stream().filter((lyr) -> (!lyr.isVirtual())).forEachOrdered((lyr) -> {
            if (this.skipWFS) {
                assertNull("Layer should not have a featuretype", lyr.getFeatureType());
            } else {
                if (!lyr.isVirtual()) {
                    assertNotNull("Layer should have a featuretype", lyr.getFeatureType());
                    log.debug("Inspecting layer, name: " + lyr.getName() + ", featuretype: " + lyr.getFeatureType().getDescription());
                    assertEquals("Attribute service protocol should be as expected", attrServiceProtocol, lyr.getFeatureType().getFeatureSource().getProtocol());
                    try {
                        FeatureSource fs2 = lyr.getFeatureType().openGeoToolsFeatureSource();
                        assertThat("No exception was thrown and featuresource is not null", fs2, not(nullValue()));
                    } catch (Exception ex) {
                        log.error("Opening featuresource failed.", ex);
                        fail("Opening featuresource failed.");
                    }
                }
            }
        });

    }
}
