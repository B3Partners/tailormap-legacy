package nl.b3p.viewer.userlayer;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class PostgreSQL implements DataBase {
    private static final Log LOG = LogFactory.getLog(PostgreSQL.class);
    private static final String CREATE_SQL = "CREATE OR REPLACE VIEW %s AS SELECT * FROM %s WHERE %s";
    private static final String DROP_SQL = "DROP VIEW IF EXISTS %s";
    private final Connection connection;

    public PostgreSQL(Connection connection) {
        this.connection = connection;
    }

    @Override
    public boolean createView(String viewName, String tableName, String filterSQL) {
        boolean result;
        try (PreparedStatement ps = connection.prepareStatement(
                String.format(CREATE_SQL, viewName, tableName, filterSQL))
        ) {
            result = (0 == ps.executeUpdate());
        } catch (SQLException throwables) {
            LOG.error("Probleem tijdens maken van view: " + throwables.getLocalizedMessage());
            result = false;
        }
        return result;
    }

    @Override
    public boolean dropView(String viewName) {
        boolean result;
        try (PreparedStatement ps = connection.prepareStatement(String.format(DROP_SQL, viewName))) {
            result = (0 == ps.executeUpdate());
        } catch (SQLException throwables) {
            LOG.error("Probleem tijdens droppen van view: " + throwables.getLocalizedMessage());
            result = false;
        }
        return result;
    }

    /**
     * close any resources.
     */
    @Override
    public void close() {
        try {
            this.connection.close();
        } catch (SQLException throwables) {
            LOG.error("Probleem tijdens sluiten van connectie: " + throwables.getLocalizedMessage());
        }
    }
}
