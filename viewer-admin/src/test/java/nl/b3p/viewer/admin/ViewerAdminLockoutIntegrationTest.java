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
package nl.b3p.viewer.admin;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.hamcrest.CoreMatchers.equalTo;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Properties;
import java.util.Scanner;
import nl.b3p.viewer.util.LoggingTestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.impl.client.BasicCookieStore;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.client.LaxRedirectStrategy;
import org.apache.http.util.EntityUtils;
import org.junit.AfterClass;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeNotNull;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;

/**
 * test the tomcat lockout mechanism.
 *
 * If you want to run this test standalone use the following command:
 * {@code mvn -e clean verify -Ptravis-ci -Dit.test=ViewerAdminLockoutIntegrationTest > mvn.log }
 * This will take care of spinning up a tomcat instance on a maven specified
 * port to run the * test.
 *
 * @author Mark Prins
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ViewerAdminLockoutIntegrationTest extends LoggingTestUtil {

    private static final Log LOG = LogFactory.getLog(ViewerAdminLockoutIntegrationTest.class);
    /**
     * the viewer url. {@value}
     */
    private static String BASE_TEST_URL = "http://localhost:9091/viewer-admin/";

    /**
     * our test client.
     */
    private static CloseableHttpClient client;

    /**
     * our test response.
     */
    private HttpResponse response;

    /**
     * initialize http client.
     */
    @BeforeClass
    public static void setupClient() {
        client = HttpClients.custom()
                .useSystemProperties()
                .setUserAgent("brmo integration test")
                .setRedirectStrategy(new LaxRedirectStrategy())
                .setDefaultCookieStore(new BasicCookieStore())
                .build();
    }

    /**
     * close http client connections.
     *
     * @throws IOException if any occurs closing the http connection
     */
    @AfterClass
    public static void closeClient() throws IOException {
        client.close();
    }

    /**
     * Test if the Flamingo viewer-admin application has started and can be
     * reached.
     *
     * @throws UnsupportedEncodingException if any
     * @throws IOException if any
     */
    @Test
    public void testARequest() throws UnsupportedEncodingException, IOException {
        response = client.execute(new HttpGet(BASE_TEST_URL));

        final String body = EntityUtils.toString(response.getEntity());
        assertNotNull("Response body should not be null.", body);
        assertThat("Response status is OK.", response.getStatusLine().getStatusCode(),
                equalTo(HttpStatus.SC_OK));
        assertTrue("Response moet 'Inloggen' title hebben.",
                body.contains("<title>Inloggen</title>"));
    }

    /**
     * Test login/index/about/logout sequentie.
     *
     * @throws IOException mag niet optreden
     * @throws URISyntaxException mag niet optreden
     */
    @Test
    public void testBLoginLogout() throws IOException, URISyntaxException {
        // login page
        response = client.execute(new HttpGet(BASE_TEST_URL));
        EntityUtils.consume(response.getEntity());

        HttpUriRequest login = RequestBuilder.post()
                .setUri(new URI(BASE_TEST_URL + "j_security_check"))
                .addParameter("j_username", "admin")
                .addParameter("j_password", "flamingo")
                .build();
        response = client.execute(login);
        EntityUtils.consume(response.getEntity());
        assertThat("Response status is OK.", response.getStatusLine().getStatusCode(),
                equalTo(HttpStatus.SC_OK));

        // index
        response = client.execute(new HttpGet(BASE_TEST_URL + "action/index"));
        String body = EntityUtils.toString(response.getEntity());
        assertNotNull("Response body mag niet null zijn.", body);
        assertTrue("Response moet 'Beheeromgeving geo-viewers' title hebben.",
                body.contains("<title>Beheeromgeving geo-viewers</title>"));

        // about
        response = client.execute(new HttpGet(BASE_TEST_URL + "about.jsp"));
        body = EntityUtils.toString(response.getEntity());
        assertNotNull("Response body mag niet null zijn.", body);
        assertTrue("Response moet 'About' title hebben.", body.contains("<title>About</title>"));

        // logout
        response = client.execute(new HttpGet(BASE_TEST_URL + "logout.jsp"));
        body = EntityUtils.toString(response.getEntity());
        assertThat("Response status is OK.", response.getStatusLine().getStatusCode(),
                equalTo(HttpStatus.SC_OK));
        assertNotNull("Response body mag niet null zijn.", body);
        assertTrue("Response moet 'Uitgelogd' heading hebben.", body.contains("<h1>Uitgelogd</h1>"));
    }

    /**
     * This test work; but will be ignored because we need to catalina.out file
     * to check for the message and that does not seem te be generated.
     *
     * @throws IOException if any
     * @throws URISyntaxException if any
     */
    @Test
    public void testCLockout() throws IOException, URISyntaxException {
        response = client.execute(new HttpGet(BASE_TEST_URL));
        EntityUtils.consume(response.getEntity());

        HttpUriRequest login = RequestBuilder.post()
                .setUri(new URI(BASE_TEST_URL + "j_security_check"))
                .addParameter("j_username", "admin")
                .addParameter("j_password", "fout")
                .build();
        response = client.execute(login);
        EntityUtils.consume(response.getEntity());
        assertThat("Response status is OK.", response.getStatusLine().getStatusCode(),
                equalTo(HttpStatus.SC_OK));

        // the default lockout is 5 attempt in 5 minutes
        for (int c = 1; c < 6; c++) {
            response = client.execute(login);
            EntityUtils.consume(response.getEntity());
            assertThat("Response status is OK.", response.getStatusLine().getStatusCode(),
                    equalTo(HttpStatus.SC_OK));
        }
        // user 'fout' is now locked out, but we have no way to detect apart from looking at the cataline logfile,
        //   the status for a form-based login page is (and should be) 200


        LOG.info("trying one last time with locked-out user, but correct password");
        login = RequestBuilder.post()
                .setUri(new URI(BASE_TEST_URL + "j_security_check"))
                .addParameter("j_username", "admin")
                .addParameter("j_password", "flamingo")
                .build();
        response = client.execute(login);

        String body = EntityUtils.toString(response.getEntity());
        assertThat("Response status is OK.", response.getStatusLine().getStatusCode(),
                equalTo(HttpStatus.SC_OK));

        assertNotNull("Response body mag niet null zijn.", body);
        assertTrue("Response moet 'Ongeldige logingegevens.' text hebben.", body.contains("Ongeldige logingegevens."));

        // there will be a message in catalina.out similar to: `WARNING: An attempt was made to authenticate the locked user "admin"`
        // problem is this is output to the console so logging is broken in tomcat plugin, so below assumption will fail and mark this test as ignored
        InputStream is = ViewerAdminLockoutIntegrationTest.class.getClassLoader().getResourceAsStream("catalina.log");
        assumeNotNull("The catalina.out should privide a valid inputstream.", is);

        Scanner s = new Scanner(is);
        boolean lokkedOut = false;
        while (s.hasNextLine()) {
            final String lineFromFile = s.nextLine();
            if (lineFromFile.contains("An attempt was made to authenticate the locked user \"admin\"")) {
                lokkedOut = true;
                break;
            }
        }
        assertTrue("gebruiker 'admin' is buitengesloten", lokkedOut);
    }
}
