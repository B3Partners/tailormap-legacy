package nl.b3p.viewer.userlayer;

import nl.b3p.viewer.ViewerIntegrationTest;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeTrue;

/**
 * run: {@code mvn verify -Ptravis-ci -pl :viewer -Dit.test=PostgreSQLIntegrationTest} with a PG database setup as in
 * postgres.properties
 */
public class PostgreSQLIntegrationTest extends ViewerIntegrationTest {

    private final String viewName = "PostGISDialect";
    private final String tableName = "metadata";
    private final String filterSQL = "id > 0";
    private final String comments = "";
    private PostgreSQL db;

    @Before
    public void setUp() throws SQLException {
        assumeTrue("org.postgresql.Driver".equals(databaseprop.getProperty("driverClassName")));
        Connection connection = DriverManager.getConnection(databaseprop.getProperty("testdb.url"),
                databaseprop.getProperty("testdb.username"),
                databaseprop.getProperty("testdb.password")
        );
        db = new PostgreSQL(connection);
    }

    @After
    public void cleanup() {
        if (db != null) {
            db.close();
        }
        db = null;
    }

    @Test
    public void viewCreateDropSucces() {
        assertTrue(db.createView(viewName, tableName, filterSQL,comments));
        assertTrue(db.dropView(viewName));
    }

    @Test
    public void createViewFail() {
        assertFalse(db.createView(viewName, tableName + "doesnotexist", filterSQL, null));
    }

    @Test
    public void dropViewDoesNotExist() {
        // true because query uses IF EXISTS
        assertTrue(db.dropView(viewName + "doesnotexist"));
    }

    @Test
    public void dropViewError() {
        assertFalse(db.dropView(viewName + "doesnotexist and some"));
    }

    @Test
    public void closedConnection() {
        db.close();
        assertFalse(db.createView(viewName, tableName, filterSQL, comments));
    }
}
