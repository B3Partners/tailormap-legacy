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
package nl.tailormap.viewer.admin;

import nl.tailormap.viewer.util.LoggingTestUtil;
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
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Scanner;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeFalse;

/**
 * test the tomcat lockout mechanism.
 * <p>
 * If you want to run this test standalone use the following command:
 * {@code mvn -e clean verify -Ptravis-ci -Dit.test=ViewerAdminLockoutIntegrationTest > mvn.log }
 * This will take care of spinning up a tomcat instance on a maven specified
 * port to run the * test.
 *
 * @author Mark Prins
 */
@TestMethodOrder(MethodOrderer.Alphanumeric.class)
public class ViewerAdminLockoutIntegrationTest extends LoggingTestUtil {

    private static final Log LOG = LogFactory.getLog(ViewerAdminLockoutIntegrationTest.class);
    /**
     * the viewer url. {@value}
     */
    private static final String BASE_TEST_URL = "http://localhost:9090/viewer-admin/";

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
    @BeforeAll
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
    @AfterAll
    public static void closeClient() throws IOException {
        client.close();
    }

    /**
     * Test if the Flamingo viewer-admin application has started and can be
     * reached.
     *
     * @throws IOException                  if any
     */
    @Test
    public void testARequest() throws IOException {
        response = client.execute(new HttpGet(BASE_TEST_URL));

        final String body = EntityUtils.toString(response.getEntity());
        assertNotNull(body, "Response body should not be null.");
        assertThat("Response status is OK.", response.getStatusLine().getStatusCode(),
                equalTo(HttpStatus.SC_OK));
        assertTrue(
                body.contains("<title>Inloggen</title>"), "Response moet 'Inloggen' title hebben.");
    }

    /**
     * Test login/index/about/logout sequentie.
     *
     * @throws IOException        mag niet optreden
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
        assertNotNull(body, "Response body mag niet null zijn.");
        assertTrue(
                body.contains("<title>Beheeromgeving geo-viewers</title>"), "Response moet 'Beheeromgeving geo-viewers' title hebben.");

        // about
        response = client.execute(new HttpGet(BASE_TEST_URL + "about.jsp"));
        body = EntityUtils.toString(response.getEntity());
        assertNotNull(body, "Response body mag niet null zijn.");
        assertTrue(body.contains("<title>About</title>"), "Response moet 'About' title hebben.");

        // logout
        response = client.execute(new HttpGet(BASE_TEST_URL + "logout.jsp"));
        body = EntityUtils.toString(response.getEntity());
        assertThat("Response status is OK.", response.getStatusLine().getStatusCode(),
                equalTo(HttpStatus.SC_OK));
        assertNotNull(body, "Response body mag niet null zijn.");
        assertTrue(body.contains("<h1>Uitgelogd</h1>"), "Response moet 'Uitgelogd' heading hebben.");
    }

    /**
     * This test work; but will be ignored because we need to catalina.out file
     * to check for the message and that does not seem te be generated.
     *
     * @throws IOException        if any
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

        assertNotNull(body, "Response body mag niet null zijn.");
        assertTrue(body.contains("Ongeldige logingegevens."), "Response moet 'Ongeldige logingegevens.' text hebben.");

        // there will be a message in catalina.out similar to: `WARNING: An attempt was made to authenticate the locked user "admin"`
        // problem is this is output to the console so logging is broken in tomcat plugin, so below assumption will fail and mark this test as ignored
        InputStream is = ViewerAdminLockoutIntegrationTest.class.getClassLoader().getResourceAsStream("catalina.log");
        assumeFalse(null == is, "The catalina.out should privide a valid inputstream.");

        Scanner s = new Scanner(is);
        boolean lokkedOut = false;
        while (s.hasNextLine()) {
            final String lineFromFile = s.nextLine();
            if (lineFromFile.contains("An attempt was made to authenticate the locked user \"admin\"")) {
                lokkedOut = true;
                break;
            }
        }
        assertTrue(lokkedOut, "gebruiker 'admin' is buitengesloten");
    }
}
