/*
 * Copyright (C) 2015 B3Partners B.V.
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
package nl.b3p.viewer;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.hamcrest.CoreMatchers.equalTo;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.List;
import javax.persistence.EntityManager;
import nl.b3p.viewer.config.metadata.Metadata;
import nl.b3p.viewer.util.databaseupdate.DatabaseSynchronizer;
import nl.b3p.viewer.util.TestUtil;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.junit.AfterClass;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 *
 * @author Mark Prins <mark@b3partners.nl>
 */
public class ViewerIntegrationTest extends TestUtil {

    /**
     * the server root url. {@value}
     */
    public static final String BASE_TEST_URL = "http://localhost:9090/";

    /**
     * our test client.
     */
    private static CloseableHttpClient client;
    /**
     * our test response.
     */
    private HttpResponse response;

    @BeforeClass
    public static void setUpClass() {
        client = HttpClientBuilder.create().build();
    }

    @AfterClass
    public static void tearDownClass() throws IOException {
        client.close();
    }

    /**
     * Test if the Flaming viewer application has started.
     *
     * @throws UnsupportedEncodingException if any
     * @throws IOException if any
     */
    @Test
    public void request() throws UnsupportedEncodingException, IOException {
        response = client.execute(new HttpGet(BASE_TEST_URL + "/viewer/index.jsp"));

        final String body = new String(EntityUtils.toByteArray(response.getEntity()), "UTF-8");
        assertNotNull("Response body should not be null.", body);

        // when looking at a pristine database it will report an application error
        // assertThat("Response status is 500/Error.", response.getStatusLine().getStatusCode(),
        //        equalTo(HttpStatus.SC_INTERNAL_SERVER_ERROR));
        assertThat("Response status is OK.", response.getStatusLine().getStatusCode(),
                equalTo(HttpStatus.SC_OK));
    }

    /**
     * test if the database has the right metadata version.
     */
    @Test
    public void testMetadataVersion() {
        // get 'database_version' from table metadata and check that is has the value of '15'
        int expected = DatabaseSynchronizer.getUpdateNumber();
        List<Metadata> metadata = entityManager.createQuery("From Metadata where configKey = :v").setParameter("v", Metadata.DATABASE_VERSION_KEY).getResultList();
        assertFalse("There should be at least one metadata record.", metadata.isEmpty());

        int actual = Integer.parseInt(metadata.get(0).getConfigValue());
        assertEquals("The database version should be the same.", expected, actual);
    }
}
