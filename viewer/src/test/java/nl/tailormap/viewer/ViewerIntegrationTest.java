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
package nl.tailormap.viewer;

import nl.tailormap.viewer.util.databaseupdate.DatabaseSynchronizer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Properties;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assumptions.assumeFalse;

/**
 * @author Mark Prins
 */
public class ViewerIntegrationTest {

    /**
     * the viewer url. {@value}
     */
    public static final String BASE_TEST_URL = "http://localhost:9090/viewer/";
    protected static final Properties databaseprop = new Properties();
    private static final Log LOG = LogFactory.getLog(ViewerIntegrationTest.class);
    /**
     * our test client.
     */
    private static CloseableHttpClient client;
    /**
     * our test response.
     */
    private HttpResponse response;

    /**
     * initialize database props.
     *
     * @throws java.io.IOException              if loading the property file fails
     * @throws java.lang.ClassNotFoundException if the database driver class
     *                                          cannot be found
     */
    @BeforeAll
    public static void loadDBprop() throws IOException, ClassNotFoundException {
        assumeFalse(null == System.getProperty("database.properties.file"), "Database environment must be defined.");
        databaseprop.load(ViewerIntegrationTest.class.getClassLoader().getResourceAsStream(System.getProperty("database.properties.file")));
        LOG.debug("database props: " + databaseprop);
        Class.forName("org.postgresql.Driver");
    }

    /**
     * initialize http client.
     */
    @BeforeAll
    public static void setUpClass() {
        client = HttpClientBuilder.create().build();
    }

    /**
     * close http client connections.
     *
     * @throws IOException if any occurs closing th ehttp connection
     */
    @AfterAll
    public static void tearDownClass() throws IOException {
        if (client != null) {
            client.close();
        }
    }

    /**
     * Test if the Flaming viewer application has started.
     *
     * @throws IOException if any
     */
    @Test
    public void request() throws IOException {
        response = client.execute(new HttpGet(BASE_TEST_URL));

        final String body = EntityUtils.toString(response.getEntity());
        assertNotNull(body, "Response body should not be null.");
        assertThat("Response status is OK.", response.getStatusLine().getStatusCode(), equalTo(HttpStatus.SC_OK));
    }

    /**
     * test if the database has the right metadata version.
     *
     * @throws SQLException if something goes wrong executing the query
     */
    @Test
    public void testMetadataVersion() throws SQLException {
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

        assertEquals(DatabaseSynchronizer.getUpdateNumber(), actual_config_value, "The database version should be the same.");
    }
}
