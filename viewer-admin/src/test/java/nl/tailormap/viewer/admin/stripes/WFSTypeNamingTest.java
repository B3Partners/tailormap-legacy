/*
 * Copyright (C) 2016 B3Partners B.V.
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
import nl.tailormap.viewer.config.services.SimpleFeatureType;
import nl.tailormap.viewer.config.services.WFSFeatureSource;
import nl.tailormap.viewer.helpers.featuresources.FeatureSourceFactoryHelper;
import nl.tailormap.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.hamcrest.MatcherAssert;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.opengis.feature.Feature;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.junit.jupiter.params.provider.Arguments.arguments;

/**
 * testcases for
 * <a href="https://github.com/flamingo-geocms/flamingo/issues/517">#517</a>.
 *
 * @author Mark Prins
 */
public class WFSTypeNamingTest extends TestUtil {

    private static final Log log = LogFactory.getLog(WFSTypeNamingTest.class);
    private ActionBeanContext context;
    private AttributeSourceActionBean sb;
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
     *
     * @return parameter collection that contains input and response values for
     * this test.
     */
    static Stream<Arguments> argumentsProvider() {
        return Stream.of(
                // {"url","name","wfs",typecount},
                arguments("https://flamingo5.b3p.nl/geoserver/Test_omgeving/wfs?SERVICE=WFS&", "geoserver-namespaced-wfsurl", "wfs", 5, 0),
                arguments("https://flamingo5.b3p.nl/geoserver/Test_omgeving/wms?SERVICE=WMS&", "geoserver-namespaced-wmsurl", "wms", 6, 0)
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
        sb = null;
    }

    @ParameterizedTest(name = "{index}: name: {1}")
    @MethodSource("argumentsProvider")
    public void addWMSGeoservice(String serviceUrl, String serviceName, String serviceProtocol, int serviceTypeCount, int groupLayerCount) {
        if (serviceProtocol.equalsIgnoreCase("wms")) {
            log.debug("Starting WMS test with: " + this.toString(serviceUrl, serviceName, serviceProtocol, serviceTypeCount, groupLayerCount));
            try {
                Category cat = new Category();
                cat.setId(1L);
                gsb = new GeoServiceActionBean();
                gsb.setCategory(cat);
                gsb.setContext(context);
                gsb.setProtocol(serviceProtocol);
                gsb.setOverrideUrl(false);
                gsb.setUrl(serviceUrl);
                gsb.setName(serviceName);
                gsb.addService(entityManager);
            } catch (Exception ex) {
                log.error("adding WMS service  failed", ex);
                Assertions.fail("Saving WFS attribute source failed.");
            }
            GeoService service = gsb.getService();
            Assertions.assertEquals(serviceUrl, service.getUrl(), "The url should be the same");

            List<Layer> layers = service.loadLayerTree(entityManager);
            Assertions.assertEquals(serviceTypeCount + groupLayerCount, layers.size(), "The number of layers should be the same");

            for (Layer lyr : layers) {
                if (!lyr.isVirtual()) {
                    log.debug("Inspecting layer, name: " + lyr.getName() + ", featuretype: " + lyr.getFeatureType().getDescription());
                    Assertions.assertTrue(lyr.getFeatureType().getTypeName().contains(":"), "Attribute type name does contain a colon");
                    try {
                        FeatureSource fs2 = FeatureSourceFactoryHelper.openGeoToolsFeatureSource(lyr.getFeatureType());
                        MatcherAssert.assertThat("No exception was thrown and featuresource not null", fs2, not(nullValue()));
                    } catch (Exception ex) {
                        log.error("Opening featuresource failed.", ex);
                        Assertions.fail("Opening featuresource failed.");
                    }
                }
            }
        }
    }

    @ParameterizedTest(name = "{index}: name: {1}")
    @MethodSource("argumentsProvider")
    public void addWFSService(String serviceUrl, String serviceName, String serviceProtocol, int serviceTypeCount, int groupLayerCount) {
        if (serviceProtocol.equalsIgnoreCase("wfs")) {
            log.debug("Starting WFS test with: " + this.toString(serviceUrl, serviceName, serviceProtocol, serviceTypeCount, groupLayerCount));
            try {
                sb = new AttributeSourceActionBean();
                sb.setContext(context);
                sb.setProtocol(serviceProtocol);
                sb.setUrl(serviceUrl);
                sb.setName(serviceName);
                sb.addService(entityManager);
            } catch (Exception ex) {
                log.error("Saving WFS attribute source failed", ex);
                Assertions.fail("Saving WFS attribute source failed.");
            }

            WFSFeatureSource fs = (WFSFeatureSource) sb.getFeatureSource();
            List<SimpleFeatureType> types = fs.getFeatureTypes();
            Assertions.assertEquals(serviceTypeCount, types.size(), "The number of layers should be the same");
            for (SimpleFeatureType type : types) {
                log.debug("Testing type: " + type.getTypeName());
                Assertions.assertTrue(type.getTypeName().contains(":"), "Type name does contain a colon");
                try {
                    FeatureSource fs2 = FeatureSourceFactoryHelper.openGeoToolsFeatureSource(type);
                    MatcherAssert.assertThat("No exception was thrown and featuresource not null", fs2, not(nullValue()));

                    Query q = new Query(fs2.getName().toString());
                    q.setMaxFeatures(1);
                    FeatureCollection fc = fs2.getFeatures(q);
                    MatcherAssert.assertThat("No exception was thrown and FeatureCollection not null", fc, not(nullValue()));
                    FeatureIterator it = fc.features();
                    while (it.hasNext()) {
                        Feature feat = it.next();
                        MatcherAssert.assertThat("No exception was thrown and Feature not null", feat, not(nullValue()));

                    }
                } catch (Exception ex) {
                    log.error("Opening featuresource failed.", ex);
                    Assertions.fail("Opening featuresource failed.");
                }
            }
        }
    }

    private final String toString(String serviceUrl, String serviceName, String serviceProtocol, int serviceTypeCount, int groupLayerCount) {
        return this.getClass().getCanonicalName()
                + ", serviceUrl: " + serviceUrl
                + ", serviceName: " + serviceName
                + ", serviceProtocol: " + serviceProtocol
                + ", typeCount: " + serviceTypeCount
                + ", groupLayerCount: " + groupLayerCount;
    }
}
