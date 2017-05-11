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
package nl.b3p.viewer.stripes;

import java.util.Arrays;
import java.util.Collection;
import net.sourceforge.stripes.action.ActionBeanContext;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import static org.junit.Assert.fail;
import org.junit.Before;
import org.junit.Test;
import org.junit.runners.Parameterized;

/**
 *
 * @author Mark Prins
 */
public class ProxyActionBeanTest extends TestUtil {

    private static final Log LOG = LogFactory.getLog(ProxyActionBeanTest.class);

    @Parameterized.Parameters(name = "{index}: test url: {0}")
    public static Collection params() {
        return Arrays.asList(new Object[][]{
            // {"url", "layer", ... },
            {"http://....", "layer1"}
        //,{"next url", "next layer"}
        //,{"next url", "next layer"}
        });
    }

    private ActionBeanContext context;
    private ProxyActionBean ab;
    private final String url;
    private final String layer;

    public ProxyActionBeanTest(String url, String layer) {
        this.url = url;
        this.layer = layer;
    }

    @Before
    public void prepareAB() {
        context = new ActionBeanContext();
        ab = new ProxyActionBean();
        ab.setContext(context);
        ab.setUrl(url);
    }

    @Test
    public void testProxy() {
        fail("to be implemented");
        // ab.proxy();
    }
}
