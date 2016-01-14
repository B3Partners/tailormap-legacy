/*
 * Copyright (C) 2016 B3Partners B.V.
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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Message;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.WFSFeatureSource;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.CoreMatchers.nullValue;
import org.junit.After;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;

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
    @Parameters
    public static Collection params() {
        return Arrays.asList(new Object[][]{
            // {"url","name","wfs",typecount},
            {"http://ibis.b3p.nl/geoserver/ibis/wfs?SERVICE=WFS", "geoserver-namespaced-url", "wfs", 3},
            {"http://ibis.b3p.nl/geoserver/wfs?SERVICE=WFS", "geoserver", "wfs", 3},
            {"http://services.geodataoverijssel.nl/geoserver/B07_Adressen/wfs?SERVICE=WFS", "geoserver", "wfs", 2},
            {"http://services.geodataoverijssel.nl/geoserver/wfs?SERVICE=WFS", "geoserver", "wfs", 467}
        // disable for now as the describeFeaturetype responses fail to validate
        // ,{"http://geoservices.rijkswaterstaat.nl/verkeersscheidingsstelsel_noordzee?SERVICE=WFS", "mapserver", "wfs", 10}
        //    http://geoservices.knmi.nl/cgi-bin/SCIA__CONS_V___IMAP____L2__2004.cgi?SERVICE=WFS
        //    http://geoservices.rijkswaterstaat.nl/verkeersscheidingsstelsel_noordzee?SERVICE=WFS
        });
    }

    /* test parameter */
    private final String serviceUrl;
    /* test parameter */
    private final String serviceName;
    /* test parameter */
    private final String serviceProtocol;
    /* test expectation */
    private final int serviceTypeCount;

    public WFSTypeNamingTest(String serviceUrl, String serviceName, String serviceProtocol, int serviceTypeCount) {
        this.serviceUrl = serviceUrl;
        this.serviceName = serviceName;
        this.serviceProtocol = serviceProtocol;
        this.serviceTypeCount = serviceTypeCount;
        log.debug("Starting test with: " + this.toString());
    }

    @Before
    public void createContext() {
        context = new ActionBeanContext() {
            @Override
            public List<Message> getMessages() {
                return new ArrayList<>();
            }
        };
        sb = new AttributeSourceActionBean();
        sb.setContext(context);
    }

    @After
    public void cleanupContext() {
        context = null;
        sb = null;
    }

    @Test
    public void addService() {
        try {
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
            assertFalse("Type name does not contain a colon", type.getTypeName().contains(":"));
            try {
                FeatureSource fs2 = type.openGeoToolsFeatureSource();
                assertThat("No exception was thrown and fs2 not null", fs2, not(nullValue()));
            } catch (Exception ex) {
                log.error("Opening featuresource failed.", ex);
                fail("Opening featuresource failed.");
            }
        }
    }

    @Override
    public final String toString() {
        return this.getClass().getCanonicalName()
                + ", serviceUrl: " + this.serviceUrl
                + ", serviceName: " + this.serviceName
                + ", typeCount: " + this.serviceTypeCount;
    }
}
