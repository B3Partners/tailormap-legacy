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

import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import net.sourceforge.stripes.action.ActionBeanContext;
import nl.b3p.commons.HttpClientConfigured;
import nl.b3p.viewer.config.security.User;
import nl.b3p.viewer.util.TestActionBeanContext;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import org.junit.Before;
import org.junit.Test;

/**
 *
 * @author Mark Prins
 * @author Mark Prins
 */
public class ProxyActionBeanTest extends TestUtil {

    private ActionBeanContext context;
    private ProxyActionBean ab;

    public ProxyActionBeanTest(){
    }
        
    // test of beveiligde service met gebruiker met onvoldoende rechten geen user/pass heeft
    @Test
    public void testSecureServiceNoRights() throws MalformedURLException{
        User geb = null;
        String url = "http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&";
        context = new TestActionBeanContext(geb);
        ab = new ProxyActionBean();
        ab.setContext(context);
        ab.setUrl(url);
        ab.setMustLogin(true);
        ab.setServiceId(2L);
        
        HttpClientConfigured client = ab.getHttpClient(new URL(url), entityManager);
        
        assertNull(client.getPassword());
        assertNull(client.getUsername());
    }
    
    // test of beveiligde service met gebruiker met onvoldoende rechten geen user/pass heeft
    @Test
    public void testSecureServiceWrongRights() throws MalformedURLException{
        User geb = entityManager.find(User.class, "pietje");
        String url = "http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&";
        context = new TestActionBeanContext(geb);
        ab = new ProxyActionBean();
        ab.setContext(context);
        ab.setUrl(url);
        ab.setMustLogin(true);
        ab.setServiceId(2L);
        
        HttpClientConfigured client = ab.getHttpClient(new URL(url), entityManager);
        
        assertNull(client.getPassword());
        assertNull(client.getUsername());
    }
    
    
    // test of beveiligde service met voloende rechten wel user pass heeft
    @Test
    public void testSecureServiceRights() throws MalformedURLException{
        User geb = entityManager.find(User.class, "admin");
        String url = "http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&";
        context = new TestActionBeanContext(geb);
        ab = new ProxyActionBean();
        ab.setContext(context);
        ab.setUrl(url);
        ab.setMustLogin(true);
        ab.setServiceId(2L);
        
        HttpClientConfigured client = ab.getHttpClient(new URL(url), entityManager);
        
        assertNotNull(client.getPassword());
        assertNotNull(client.getUsername());
    }
    
    // test of url van service uit db gebruikt wordt (en dus niet aangepast kan worden)
    @Test
    public void testModifiedServiceUrl() throws MalformedURLException, URISyntaxException, UnsupportedEncodingException, IllegalAccessException{
        User geb = entityManager.find(User.class, "admin");
        String url = "http://fakeurl.com?map=/srv/maps/solparc/groen_productie.map&";
        String originalUrl = "http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&";
        context = new TestActionBeanContext(geb);
        ab = new ProxyActionBean();
        ab.setContext(context);
        ab.setUrl(url);
        ab.setMustLogin(true);
        ab.setServiceId(2L);
        URL u = ab.getRequestRL(entityManager);
        String real = u.toString();
        assertTrue(real.contains(originalUrl));
    }
}
