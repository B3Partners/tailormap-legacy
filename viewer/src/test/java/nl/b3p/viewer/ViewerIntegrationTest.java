/*
 * Copyright (C) 2015 B3Partners B.V.
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
package nl.b3p.viewer;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.hamcrest.CoreMatchers.equalTo;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Properties;
import nl.b3p.viewer.util.databaseupdate.DatabaseSynchronizer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.junit.AfterClass;
import static org.junit.Assert.assertEquals;
import static org.junit.Assume.assumeNotNull;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 *
 * @author Mark Prins
 */
public class ViewerIntegrationTest {

    private static final Log LOG = LogFactory.getLog(ViewerIntegrationTest.class);
    /**
     * the viewer url. {@value}
     */
    public static final String BASE_TEST_URL = "http://localhost:9090/viewer/";

    /**
     * our test client.
     */
    private static CloseableHttpClient client;
    /**
     * our test response.
     */
    private HttpResponse response;

    private static final Properties databaseprop = new Properties();

    /**
     * initialize database props.
     *
     * @throws java.io.IOException if loading the property file fails
     * @throws java.lang.ClassNotFoundException if the database driver class
     * cannot be found
     */
    @BeforeClass
    public static void loadDBprop() throws IOException, ClassNotFoundException {
        assumeNotNull("Verwacht database omgeving te zijn aangegeven.", System.getProperty("database.properties.file"));
        databaseprop.load(ViewerIntegrationTest.class.getClassLoader().getResourceAsStream(System.getProperty("database.properties.file")));
        LOG.debug("database props: " + databaseprop);
        Class.forName(databaseprop.getProperty("testdb.driverClassName"));
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
     * @throws IOException if any occurs closing th ehttp connection
     */
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
        response = client.execute(new HttpGet(BASE_TEST_URL));

        final String body = EntityUtils.toString(response.getEntity());
        assertNotNull("Response body should not be null.", body);
        assertThat("Response status is OK.", response.getStatusLine().getStatusCode(),
                equalTo(HttpStatus.SC_OK));
    }

    /**
     * test if the database has the right metadata version.
     *
     * @throws SQLException if something goes wrong executing the query
     * @throws ClassNotFoundException if the postgres driver cannot be found.
     */
    @Test
    public void testMetadataVersion() throws SQLException, ClassNotFoundException {
        // get 'database_version' from table metadata and check that is has the value of 'n'
        Connection connection = DriverManager.getConnection(databaseprop.getProperty("testdb.url"),
                databaseprop.getProperty("testdb.username"),
                databaseprop.getProperty("testdb.password")
        );
        ResultSet rs = connection.createStatement(
                ResultSet.TYPE_SCROLL_INSENSITIVE,
                ResultSet.CONCUR_READ_ONLY
        ).executeQuery("SELECT config_value FROM metadata WHERE config_key = 'database_version'");

        String actual_config_value = "-1";
        while (rs.next()) {
            actual_config_value = rs.getString("config_value");
        }
        assertThat("There is only one 'database_version' record (first and last should be same record).", rs.isLast(), equalTo(rs.isFirst()));

        rs.close();
        connection.close();

        assertEquals("The database version should be the same.", DatabaseSynchronizer.getUpdateNumber(), actual_config_value);
    }
}
