package nl.tailormap.viewer.userlayer;

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
    public String preValidateView(String tableName, String filterSQL) {
        // TODO implement
        return null;
    }

    @Override
    public String getGtPkMetadataDDL() {
        return "CREATE TABLE gt_pk_metadata (table_schema varchar(255), table_name varchar(255), pk_column varchar(255), pk_column_idx int, pk_policy varchar(255), pk_sequence varchar(255))";
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
    public boolean addToGtPKMetadata(String viewName, String tableName) {
        return false;
    }

    @Override
    public boolean removeFromGtPKMetadata(String viewName) {
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
