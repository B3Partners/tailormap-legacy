package nl.tailormap.viewer.userlayer;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public interface DataBase {
    Log LOG = LogFactory.getLog(DataBase.class);
    /**
     * Prefix for userlayer view names, {@value #PREFIX}.
     *
     * @see #createViewName(String)
     */
    String PREFIX = "ul_";
    /**
     * Validatie foutmelding {@value #INVALID_MSG}.
     */
    String INVALID_MSG = "Validatiefout voor selectiefilter (%s)";
    /**
     * Validate query to create a view in the database.
     *
     * @param tableName Name of the source table
     * @param filterSQL Filter definition of view (where clause)
     * @return message describing any problem or {@code null} when there are no problems
     */
    String preValidateView(String tableName, String filterSQL);

    String getGtPkMetadataDDL();

    /**
     * Create a view in the database.
     *
     * @param viewName  Name of the view
     * @param tableName Name of the source table
     * @param filterSQL Filter definition of view (where clause)
     * @param comments  optional comments to add the the view, can be {@code null}
     * @return {@code true} after successful execution
     */
    boolean createView(String viewName, String tableName, String filterSQL, String comments);

    /**
     * Drop the named view from the database.
     *
     * @param viewName name of the view
     * @return {@code true} after successful execution
     */
    boolean dropView(String viewName);

    /**
     * Insert item into gt_pk_metadata table
     * @param viewName name of the view
     * @param tableName name of the table on which the view is based
     * @return {@code true} after successful execution
     */
    boolean addToGtPKMetadata(String viewName, String tableName);

    /**
     * Remove item from gt_pk_metadata table
     * @param viewName name of the view
     * @return {@code true} after successful execution
     */
    boolean removeFromGtPKMetadata(String viewName);

    /**
     * close any resources such as open connections.
     */
    void close();

    /**
     * create a random, but recognizable name.
     *
     * @param tableName Name of original table
     * @return {@code "UL_"+ [table name] + UUID.randomUUID();} with dash replaced bij underscore
     * @see #PREFIX
     */
    default String createViewName(String tableName) {
        return new StringBuilder(PREFIX)
                .append(tableName)
                .append('_')
                .append(UUID.randomUUID())
                .toString().replace('-', '_');
    }

    default List<String> getPrimaryKey(String tableName, String schema,Connection connection) throws SQLException {
        List<String> keys = new ArrayList<>();
        DatabaseMetaData meta = connection.getMetaData();
        try (ResultSet primaryKeys = meta.getPrimaryKeys(null, schema, tableName);) {
            while (primaryKeys.next()) {
                keys.add(primaryKeys.getString("COLUMN_NAME"));
            }
        }
        return keys;
    }

    default List<String> getSchema(String tableName, Connection connection) throws SQLException {
        List<String> keys = new ArrayList<>();
        DatabaseMetaData meta = connection.getMetaData();
        try (ResultSet tables = meta.getTables(null, null, tableName, new String[] { "TABLE", "VIEW" })) {
            while (tables.next()) {
                keys.add(tables.getString("TABLE_SCHEM"));
            }
        }
        return keys;
    }

    default boolean doesGtPkMetadataExists(Connection connection) throws SQLException {
        DatabaseMetaData dbm = connection.getMetaData();
        try (ResultSet tables = dbm.getTables(null, null, "gt_pk_metadata", null)) {
            return tables.next();
        }
    }

    default boolean createGtPkMetadata( Connection connection) {
        String query = getGtPkMetadataDDL();
        boolean result;
        LOG.debug("try to create gt_pk_metadata table and query " + query);
        try (PreparedStatement ps = connection.prepareStatement(
                String.format(query))) {
            result = (0 == ps.executeUpdate());
        } catch (SQLException throwables) {
            LOG.error("Probleem tijdens maken van view: " + throwables.getLocalizedMessage());
            result = false;
        }
        return result;
    }
}

