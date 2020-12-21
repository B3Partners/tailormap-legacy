package nl.b3p.viewer.userlayer;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class PostgreSQL implements DataBase {
    private static final Log LOG = LogFactory.getLog(PostgreSQL.class);
    private static final String SELECT_SQL = " SELECT * FROM %s %s ";
    private static final String CREATE_SQL = "CREATE OR REPLACE VIEW %s AS " + SELECT_SQL;
    private static final String DROP_SQL = "DROP VIEW IF EXISTS %s";
    private static final String COMMENTS_SQL = "COMMENT ON VIEW %s IS '%s'";
    private final Connection connection;

    public PostgreSQL(Connection connection) {
        this.connection = connection;
    }

    @Override
    public String preValidateView(String tableName, String filterSQL) {
        String result = null;
        try (PreparedStatement ps = connection.prepareStatement(
                String.format(SELECT_SQL, tableName, filterSQL))
        ) {
            ps.setFetchSize(1);
            ps.setMaxRows(1);
            ps.execute();
        } catch (SQLException throwables) {
            LOG.error(throwables.getLocalizedMessage());
            result = String.format(INVALID_MSG, throwables.getLocalizedMessage()).replaceAll("\n", " ");
        }
        return result;
    }

    /**
     *
     * Note: <strong>comments are not sanitized!</strong> see inline comments.
     *
     * @param viewName  Name of the view
     * @param tableName Name of the source table
     * @param filterSQL Filter definition of view (where clause)
     * @param comments  optional comments to add the the view, can be {@code null}
     * @return {@code true} if call succeeded
     */
    @Override
    public boolean createView(String viewName, String tableName, String filterSQL, String comments) {
        boolean result;
        LOG.debug("try to create view " + viewName + " using table " + tableName + " and query " + filterSQL);
        try (PreparedStatement ps = connection.prepareStatement(
                String.format(CREATE_SQL, viewName, tableName, filterSQL));
                /* we don't need to sanitize the comments as it does not actually contain any user input.
                 * ans since this is a DDL statement there is no parameter binding and the statement would
                 * already be executed anyway during prepare
                 */
             PreparedStatement psComment = connection.prepareStatement(
                     String.format(COMMENTS_SQL, viewName, comments))
        ) {
            // we will ignore any results of setting the comment, only the view creating is important
            result = (0 == ps.executeUpdate());
            psComment.executeUpdate();
        } catch (SQLException throwables) {
            LOG.error("Probleem tijdens maken van view: " + throwables.getLocalizedMessage());
            result = false;
        }
        return result;
    }

    @Override
    public boolean dropView(String viewName) {
        boolean result;
        LOG.debug("try to drop view " + viewName);
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
