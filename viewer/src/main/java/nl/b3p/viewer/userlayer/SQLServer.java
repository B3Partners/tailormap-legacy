package nl.b3p.viewer.userlayer;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.sql.Connection;
import java.sql.SQLException;

public class SQLServer implements DataBase {
    private static final Log LOG = LogFactory.getLog(SQLServer.class);
    private final Connection connection;
    public SQLServer(Connection connection) {
        this.connection = connection;
    }


    @Override
    public boolean createView(String viewName, String tableName, String filterSQL) {
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
