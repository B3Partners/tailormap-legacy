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
package nl.tailormap.viewer.admin.stripes;

import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Message;
import nl.tailormap.viewer.config.services.Category;
import nl.tailormap.viewer.config.services.GeoService;
import nl.tailormap.viewer.config.services.Layer;
import nl.tailormap.viewer.config.services.WMSService;
import nl.tailormap.viewer.helpers.featuresources.FeatureSourceFactoryHelper;
import nl.tailormap.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import org.hamcrest.MatcherAssert;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import static org.junit.jupiter.params.provider.Arguments.arguments;

/**
 * @author mprins
 */
public class WMSGeoServiceABTest extends TestUtil {

    private static final Log log = LogFactory.getLog(WMSGeoServiceABTest.class);
    private ActionBeanContext context;
    private GeoServiceActionBean gsb;

    /**
     * The parameter collection for this testcase. A paramet set consists of an
     * array containing:
     * <ol>
     * <li>(String) service url</li>
     * <li>(String) server type</li>
     * <li>(String) service type</li>
     * <li>(int) expected number of feature types</li>
     * </ol>
     */
    static Stream<Arguments> argumentsProvider() {
        return Stream.of(
                // {"url",skipWFS,"serviceProtocol", "attrServiceProtocol",serviceTypecount,groupLayerCount},
                arguments("https://flamingo5.b3p.nl/geoserver/Test_omgeving/wms?SERVICE=WMS&", true, "wms", null, 6, 0),
                arguments("https://flamingo5.b3p.nl/geoserver/Test_omgeving/wms?SERVICE=WMS&", false, "wms", "wfs", 6, 0)
        );
    }

    @BeforeEach
    public void createContext() {
        context = new ActionBeanContext() {
            @Override
            public List<Message> getMessages() {
                return new ArrayList<>();
            }
        };
    }

    @AfterEach
    public void cleanupContext() {
        context = null;
        gsb = null;
    }

    @ParameterizedTest(name = "skip WFS discovery voor testUrl: {1}")
    @MethodSource("argumentsProvider")
    public void addWMSService(String serviceUrl, boolean skipWFS, String serviceProtocol, String attrServiceProtocol, int serviceTypeCount, int groupLayerCount) throws Exception {
        Category cat = new Category();
        cat.setId(1L);

        gsb = new GeoServiceActionBean();
        gsb.setUrl(serviceUrl);
        gsb.setProtocol(serviceProtocol);
        gsb.setOverrideUrl(false);
        gsb.setCategory(cat);
        gsb.setContext(this.context);
        gsb.setSkipDiscoverWFS(skipWFS);
        gsb.addService(this.entityManager);
        GeoService service = gsb.getService();

        context.getMessages().forEach((m) -> {
            log.debug(m.getMessage(Locale.ROOT));
        });

        assertTrue(service instanceof WMSService, "Service should be a WMS");
        assertEquals(serviceUrl, service.getUrl(), "The url should be as expected");

        List<Layer> layers = service.loadLayerTree(entityManager);
        assertEquals(serviceTypeCount + groupLayerCount, layers.size(), "The number of layers should be as expected");

        layers.stream().filter((lyr) -> (!lyr.isVirtual())).forEachOrdered((lyr) -> {
            if (skipWFS) {
                assertNull(lyr.getFeatureType(), "Layer should not have a featuretype");
            } else {
                if (!lyr.isVirtual()) {
                    assertNotNull(lyr.getFeatureType(), "Layer should have a featuretype");
                    log.debug("Inspecting layer, name: " + lyr.getName() + ", featuretype: " + lyr.getFeatureType().getDescription());
                    assertEquals(attrServiceProtocol, lyr.getFeatureType().getFeatureSource().getProtocol(), "Attribute service protocol should be as expected");
                    try {

                        FeatureSource fs2 = FeatureSourceFactoryHelper.openGeoToolsFeatureSource(lyr.getFeatureType());
                        MatcherAssert.assertThat("No exception was thrown and featuresource is not null", fs2, not(nullValue()));
                    } catch (Exception ex) {
                        log.error("Opening featuresource failed.", ex);
                        fail("Opening featuresource failed.");
                    }
                }
            }
        });
    }
}
