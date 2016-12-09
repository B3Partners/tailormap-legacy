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
package nl.b3p.viewer.admin;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.hamcrest.CoreMatchers.equalTo;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Properties;
import java.util.Scanner;
import nl.b3p.viewer.util.databaseupdate.DatabaseSynchronizer;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.junit.AfterClass;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;

/**
 * test het tomcat lockout mechanisme.
 *
 * @author Mark Prins
 */
public class ViewerAdminLockoutIntegrationTest {

    /**
     * the viewer url. {@value}
     */
    public static final String BASE_TEST_URL = "http://localhost:9091/viewer-admin/";

    /**
     * our test client.
     */
    private static CloseableHttpClient client;

    private static final Properties POSTGRESPROP = new Properties();

    /**
     * our test response.
     */
    private HttpResponse response;

    /**
     * initialize database props.
     *
     * @throws java.io.IOException if loading the property file fails
     */
    @BeforeClass
    public static void loadDBprop() throws IOException {
        POSTGRESPROP.load(ViewerAdminLockoutIntegrationTest.class.getClassLoader().getResourceAsStream("postgres.properties"));
    }

    /**
     * initialize http client.
     */
    @BeforeClass
    public static void setUpClass() {
        client = HttpClientBuilder.create().build();
    }

    /**
     * close http client connections.
     *
     * @throws IOException if any occurs closing the http connection
     */
    @AfterClass
    public static void tearDownClass() throws IOException {
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
    public void request() throws UnsupportedEncodingException, IOException {
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
    @Ignore("fails because there is a problem setting up the jndi authentication realm")
    public void testLoginLogout() throws IOException, URISyntaxException {
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
        response = client.execute(new HttpGet(BASE_TEST_URL + "index.jsp"));
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

    @Test
    @Ignore("fails because there is a problem setting up the jndi authentication realm")
    public void testLockout() throws IOException, URISyntaxException {
        response = client.execute(new HttpGet(BASE_TEST_URL));
        EntityUtils.consume(response.getEntity());

        HttpUriRequest login = RequestBuilder.post()
                .setUri(new URI(BASE_TEST_URL + "j_security_check"))
                .addParameter("j_username", "fout")
                .addParameter("j_password", "fout")
                .build();
        response = client.execute(login);
        EntityUtils.consume(response.getEntity());
        assertThat("Response status is OK.", response.getStatusLine().getStatusCode(),
                equalTo(HttpStatus.SC_OK));

//        String body = EntityUtils.toString(response.getEntity());
//        assertNotNull("Response body mag niet null zijn.", body);
//        assertTrue("Response moet 'Ongeldige logingegevens.' in pagina hebben.",
//                body.contains("Ongeldige logingegevens."));

        for (int c = 1; c < 6; c++) {
            response = client.execute(login);
            EntityUtils.consume(response.getEntity());
            assertThat("Response status is OK.", response.getStatusLine().getStatusCode(),
                    equalTo(HttpStatus.SC_OK));
        }
        // user 'fout' is now locked out, but we have no way to detect apart from looking in the cataline logfile,
        //   the status for a form-based login page is (and should be) 200

        // the will be a message in catalina.out similar to: `WARNING .... An attempt was made to authenticate the locked user "test"`
        Scanner s = new Scanner(ViewerAdminLockoutIntegrationTest.class.getClassLoader().getResourceAsStream("catalina.log"));
        boolean lokkedOut = false;
        while (s.hasNextLine()) {
            final String lineFromFile = s.nextLine();
            if (lineFromFile.contains("An attempt was made to authenticate the locked user \"test\"")) {
                lokkedOut = true;
                break;
            }
        }
        assertTrue("gebruiker is buitengesloten", lokkedOut);
    }
}
