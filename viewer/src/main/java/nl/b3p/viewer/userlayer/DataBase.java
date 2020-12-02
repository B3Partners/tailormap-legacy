package nl.b3p.viewer.userlayer;

import java.util.UUID;

public interface DataBase {
    /**
     * Prefix for userlayer view names, {@value #PREFIX}.
     * @see #createViewName(String)
     */
    String PREFIX = "ul_";
    /**
     * Create a view in the database.
     *
     * @param viewName  Name of the view
     * @param tableName Name of the source table
     * @param filterSQL Filter definition of view (where clause)
     * @param comments optional comments to add the the view, can be {@code null}
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
     * close any resources such as open connections.
     */
    void close();

    /**
     * create a random, but recognizable name.
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
}

