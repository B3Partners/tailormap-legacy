package nl.viewer.userlayer;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.Transaction;
import org.geotools.jdbc.JDBCDataStore;

import java.io.IOException;
import java.sql.Connection;

public class DataBaseFactory {

    private static final Log LOG = LogFactory.getLog(DataBaseFactory.class);

    private DataBaseFactory() {
    }

    /**
     * produce a database with opened connection.
     *
     * @param dataStore A supported JDBC DataStore
     * @return (open) connection in {@code Transaction.AUTO_COMMIT} modus, caller must close the connection after
     * using the database, return
     * {@code null} when getting JDBC connection fails.
     * @see JDBCDataStore#getConnection(Transaction)
     * @see DataBase#close()
     */
    public static DataBase getDataBase(JDBCDataStore dataStore) {
        DataBase d = null;
        try {
            Connection c = dataStore.getConnection(Transaction.AUTO_COMMIT);
            switch (dataStore.getSQLDialect().getClass().getSimpleName()) {
                case "PostGISDialect":
                    d = new PostgreSQL(c);
                    break;
                case "OracleDialect":
                    d = new Oracle(c);
                    break;
                case "SQLServerDialect":
                    d = new SQLServer(c);
                    break;
                default:
                    throw new IOException("Cannot connect to " + dataStore.getSQLDialect().getClass().getSimpleName());
            }
        } catch (IOException e) {
            LOG.error("Openen database connectie is mislukt", e);
        }
        return d;
    }
}
