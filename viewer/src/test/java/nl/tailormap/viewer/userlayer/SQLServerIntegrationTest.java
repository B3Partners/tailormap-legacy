package nl.tailormap.viewer.userlayer;

import nl.tailormap.viewer.ViewerIntegrationTest;
import org.junit.After;
import org.junit.Before;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import static org.junit.Assume.assumeTrue;

public class SQLServerIntegrationTest extends ViewerIntegrationTest {
    private final String viewName = "SQLServerDialect";
    private final String tableName = "metadata";
    private SQLServer db;

    @Before
    public void setUp() throws SQLException {
        assumeTrue("Configuratie fout voor database properties",
                "com.microsoft.sqlserver.jdbc.SQLServerDriver".equals(databaseprop.getProperty("testdb.driverClassName")));
        Connection connection = DriverManager.getConnection(databaseprop.getProperty("testdb.url"),
                databaseprop.getProperty("testdb.username"),
                databaseprop.getProperty("testdb.password")
        );
        db = new SQLServer(connection);
    }

    @After
    public void cleanup() {
        if (db != null) {
            db.close();
        }
        db = null;
    }
}
