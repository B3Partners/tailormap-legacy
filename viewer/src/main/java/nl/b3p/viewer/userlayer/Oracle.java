package nl.b3p.viewer.userlayer;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.sql.Connection;
import java.sql.SQLException;

public class Oracle implements DataBase {
    private static final Log LOG = LogFactory.getLog(Oracle.class);
    private final Connection connection;

    public Oracle(Connection connection) {
        this.connection = connection;
    }

    @Override
    public String preValidateView(String tableName, String filterSQL) {
        // TODO implement
        return null;
    }

    @Override
    public boolean createView(String viewName, String tableName, String filterSQL, String comments) {
        // TODO implement
        return false;
    }

    @Override
    public boolean dropView(String viewName) {
        // TODO implement
        return false;
    }

    @Override
    public void close() {
        try {
            this.connection.close();
        } catch (SQLException throwables) {
            LOG.error("Probleem tijdens sluiten van connectie: " + throwables.getLocalizedMessage());
        }
    }
}
