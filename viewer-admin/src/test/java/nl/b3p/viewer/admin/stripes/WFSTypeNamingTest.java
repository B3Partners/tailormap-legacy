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
package nl.b3p.viewer.admin.stripes;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Message;
import nl.b3p.viewer.config.services.Category;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.WFSFeatureSource;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.CoreMatchers.nullValue;
import org.junit.After;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;
import org.opengis.feature.Feature;

/**
 * testcases for
 * <a href="https://github.com/flamingo-geocms/flamingo/issues/517">#517</a>.
 *
 * @author Mark Prins
 */
@RunWith(Parameterized.class)
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
    @Parameters(name="naam: {1}")
    public static Collection params() {
        return Arrays.asList(new Object[][]{
            // {"url","name","wfs",typecount},
            {"http://ibis.b3p.nl/geoserver/ibis/wfs?SERVICE=WFS", "geoserver-namespaced-wfsurl", "wfs", 3, 0},
            {"http://ibis.b3p.nl/geoserver/wfs?SERVICE=WFS", "geoserver-wfsurl", "wfs", 3, 0},
            // Disable for now, as this now fails because of a geotools bug regarding names/namespaces of featuretypes. Fixed in geotools 16.x
          // {"http://afnemers.ruimtelijkeplannen.nl/afnemers/services?Version=1.0.0", "ro-online", "wfs", 43, 0},
        //    {"http://services.geodataoverijssel.nl/geoserver/B07_Adressen/wfs?SERVICE=WFS", "geoserver", "wfs", 0, 0},
            // {"http://services.geodataoverijssel.nl/geoserver/wfs?SERVICE=WFS", "geoserver", "wfs", 467,0},
            {"http://ibis.b3p.nl/geoserver/wms?SERVICE=WMS&", "geoserver-wmsurl", "wms", 3, 1},
            {"http://ibis.b3p.nl/geoserver/ibis/wms?SERVICE=WMS&", "geoserver-namespaced-wmsurl", "wms", 3, 1}
        // disable for now as the describeFeatureType responses fail to validate
        // ,{"http://geoservices.rijkswaterstaat.nl/verkeersscheidingsstelsel_noordzee?SERVICE=WFS", "mapserver", "wfs", 10,0}
        //    http://geoservices.knmi.nl/cgi-bin/SCIA__CONS_V___IMAP____L2__2004.cgi?SERVICE=WFS
        //    http://geoservices.rijkswaterstaat.nl/verkeersscheidingsstelsel_noordzee?SERVICE=WFS
        });
    }

    /**
     * test parameter.
     */
    private final String serviceUrl;
    /**
     * test parameter.
     */
    private final String serviceName;
    /**
     * test parameter.
     */
    private final String serviceProtocol;
    /**
     * test expectation.
     */
    private final int serviceTypeCount;
    /**
     * test expectation.
     */
    private final int groupLayerCount;

    public WFSTypeNamingTest(String serviceUrl, String serviceName, String serviceProtocol, int serviceTypeCount, int groupLayerCount) {
        this.serviceUrl = serviceUrl;
        this.serviceName = serviceName;
        this.serviceProtocol = serviceProtocol;
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
        sb = null;
    }

    @Test
    public void addWMSGeoservice() {
        if (serviceProtocol.equalsIgnoreCase("wms")) {
            log.debug("Starting WMS test with: " + this.toString());
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
                fail("Saving WFS attribute source failed.");
            }
            GeoService service = gsb.getService();
            assertEquals("The url should be the same", serviceUrl, service.getUrl());

            List<Layer> layers = service.loadLayerTree(entityManager);
            assertEquals("The number of layers should be the same", serviceTypeCount + groupLayerCount, layers.size());

            for (Layer lyr : layers) {
                if (!lyr.isVirtual()) {
                    log.debug("Inspecting layer, name: " + lyr.getName() + ", featuretype: " + lyr.getFeatureType().getDescription());
                    assertTrue("Attribute type name does contain a colon", lyr.getFeatureType().getTypeName().contains(":"));
                    try {
                        FeatureSource fs2 = lyr.getFeatureType().openGeoToolsFeatureSource();
                        assertThat("No exception was thrown and featuresource not null", fs2, not(nullValue()));
                    } catch (Exception ex) {
                        log.error("Opening featuresource failed.", ex);
                        fail("Opening featuresource failed.");
                    }
                }
            }
        }
    }

    @Test
    public void addWFSService() {
        if (serviceProtocol.equalsIgnoreCase("wfs")) {
            log.debug("Starting WFS test with: " + this.toString());
            try {
                sb = new AttributeSourceActionBean();
                sb.setContext(context);
                sb.setProtocol(serviceProtocol);
                sb.setUrl(serviceUrl);
                sb.setName(serviceName);
                sb.addService(entityManager);
            } catch (Exception ex) {
                log.error("Saving WFS attribute source failed", ex);
                fail("Saving WFS attribute source failed.");
            }

            WFSFeatureSource fs = (WFSFeatureSource) sb.getFeatureSource();
            List<SimpleFeatureType> types = fs.getFeatureTypes();
            assertEquals("The number of layers should be the same", serviceTypeCount, types.size());
            for (SimpleFeatureType type : types) {
                log.debug("Testing type: " + type.getTypeName());
                assertTrue("Type name does contain a colon", type.getTypeName().contains(":"));
                try {
                    FeatureSource fs2 = type.openGeoToolsFeatureSource();
                    assertThat("No exception was thrown and featuresource not null", fs2, not(nullValue()));
                    
                    Query q = new Query(fs2.getName().toString());
                    q.setMaxFeatures(1);
                    FeatureCollection fc = fs2.getFeatures(q);
                    assertThat("No exception was thrown and FeatureCollection not null", fc, not(nullValue()));
                    FeatureIterator it = fc.features();
                    while(it.hasNext()){
                        Feature feat = it.next();
                        assertThat("No exception was thrown and Feature not null", feat, not(nullValue()));
                        
                    }
                } catch (Exception ex) {
                    log.error("Opening featuresource failed.", ex);
                    fail("Opening featuresource failed.");
                }
            }
        }
    }

    @Override
    public final String toString() {
        return this.getClass().getCanonicalName()
                + ", serviceUrl: " + this.serviceUrl
                + ", serviceName: " + this.serviceName
                + ", typeCount: " + this.serviceTypeCount
                + ", groupLayerCount: " + this.groupLayerCount;
    }
}
