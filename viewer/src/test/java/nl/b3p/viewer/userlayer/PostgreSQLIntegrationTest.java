package nl.b3p.viewer.userlayer;

import nl.b3p.viewer.ViewerIntegrationTest;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import static nl.b3p.viewer.userlayer.DataBase.INVALID_MSG;
import static org.junit.Assert.*;
import static org.junit.Assume.assumeTrue;

/**
 * run: {@code mvn verify -Pgh-action -pl :viewer -Dit.test=PostgreSQLIntegrationTest} with a PG database setup as in
 * /viewer/src/test/resources/postgres.properties.
 */
public class PostgreSQLIntegrationTest extends ViewerIntegrationTest {
    private static final String INVALID_MSG_START = INVALID_MSG.substring(0, INVALID_MSG.indexOf("(") - 2);
    private final String viewName = "PostGISDialect";
    private final String tableName = "metadata";
    private final String invalidTableName = "metadata_doesnotexist";
    private final String filterSQL = "WHERE id > 0";
    private final String invalidFilterSQL = "WHERE id_doesnotexist > 0";
    private final String comments = "";
    private PostgreSQL db;

    @Before
    public void setUp() throws SQLException {
        assumeTrue("Configuratie fout voor database properties",
                "org.postgresql.Driver".equals(databaseprop.getProperty("testdb.driverClassName")));
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
    public void validateViewFailTable() {
        String isInvalidView = db.preValidateView(invalidTableName, filterSQL);
        assertNotNull(isInvalidView);
        assertTrue(isInvalidView.startsWith(INVALID_MSG_START));
    }

    @Test
    public void validateViewFailColumn() {
        String isInvalidView = db.preValidateView(tableName, invalidFilterSQL);
        assertNotNull(isInvalidView);
        assertTrue(isInvalidView.startsWith(INVALID_MSG_START));
    }

    @Test
    public void validateViewSucces() {
        assertNull(db.preValidateView(tableName, filterSQL));
    }

    @Test
    public void viewCreateDropSucces() {
        assertTrue(db.createView(viewName, tableName, filterSQL, comments));
        assertTrue(db.dropView(viewName));
    }

    @Test
    public void createViewFail() {
        assertFalse(db.createView(viewName, invalidTableName, filterSQL, ""));
    }

    @Test
    public void dropViewDoesNotExist() {
        // true because query uses IF EXISTS
        assertTrue(db.dropView(viewName + invalidTableName));
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
