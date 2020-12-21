package nl.b3p.viewer.userlayer;

import nl.b3p.viewer.ViewerIntegrationTest;
import org.junit.After;
import org.junit.Before;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import static org.junit.Assume.assumeTrue;

public class OracleIntegrationTest extends ViewerIntegrationTest {
    private final String viewName = "OracleDialect";
    private final String tableName = "metadata";
    private Oracle db;

    @Before
    public void setUp() throws SQLException {
        assumeTrue("Configuratie fout voor database properties",
                "oracle.jdbc.OracleDriver".equals(databaseprop.getProperty("testdb.driverClassName")));
        Connection connection = DriverManager.getConnection(databaseprop.getProperty("testdb.url"),
                databaseprop.getProperty("testdb.username"),
                databaseprop.getProperty("testdb.password")
        );
        db = new Oracle(connection);
    }

    @After
    public void cleanup() {
        if (db != null) {
            db.close();
        }
        db = null;
    }
}
