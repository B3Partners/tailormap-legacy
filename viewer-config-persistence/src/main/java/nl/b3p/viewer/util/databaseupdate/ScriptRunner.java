/*
 * Slightly modified version of the com.ibatis.common.jdbc.ScriptRunner class
 * from the iBATIS Apache project. Only removed dependency on Resource class
 * and a constructor
 */
/*
 *  Copyright 2004 Clinton Begin
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package nl.b3p.viewer.util.databaseupdate;
import java.io.IOException;
import java.io.LineNumberReader;
import java.io.Reader;
import java.sql.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * Tool to run database scripts
 */
public class ScriptRunner {
    private static final Log log = LogFactory.getLog(ScriptRunner.class);
    
    private static final String DEFAULT_DELIMITER = ";";
    private Connection connection;
    private boolean stopOnError;
    private boolean autoCommit;
    private String delimiter = DEFAULT_DELIMITER;
    private boolean fullLineDelimiter = false;

    /**
     * Default constructor.
     *
     * @param connection database connection
     * @param autoCommit {@code true} when to autocommit
     * @param stopOnError {@code true} when to stop on error
     */
    public ScriptRunner(Connection connection, boolean autoCommit,
            boolean stopOnError) {
        this.connection = connection;
        this.autoCommit = autoCommit;
        this.stopOnError = stopOnError;
    }

    public void setDelimiter(String delimiter, boolean fullLineDelimiter) {
        this.delimiter = delimiter;
        this.fullLineDelimiter = fullLineDelimiter;
    }

    /**
     * Runs a SQL script (read in using the Reader parameter).
     *
     * @param reader the source of the script
     * @throws IOException if any occurs connecting to the database
     * @throws SQLException if any occurs executing the script
     */
    public void runScript(Reader reader, boolean canFail) throws IOException, SQLException {
        try {
            boolean originalAutoCommit = connection.getAutoCommit();
            try {
                if (originalAutoCommit != this.autoCommit) {
                    connection.setAutoCommit(this.autoCommit);
                }
                runScript(connection, reader, canFail);
            } finally {
                connection.setAutoCommit(originalAutoCommit);
            }
        } catch (IOException e) {
            throw e;
        } catch (SQLException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error running script.  Cause: " + e, e);
        }
    }

    /**
     * Runs an SQL script (read in using the Reader parameter) using the
     * connection passed in
     *
     * @param conn the connection to use for the script
     * @param reader the source of the script
     * @throws SQLException if any SQL errors occur
     * @throws IOException if there is an error reading from the Reader
     */
    private void runScript(Connection conn, Reader reader, boolean canFail) throws IOException,
            SQLException {
        StringBuffer command = null;
        try {
            LineNumberReader lineReader = new LineNumberReader(reader);
            String line = null;
            while ((line = lineReader.readLine()) != null) {
                if (command == null) {
                    command = new StringBuffer();
                }
                String trimmedLine = line.trim();
                if (trimmedLine.startsWith("--")) {
                    log.debug(trimmedLine);
                } else if (trimmedLine.length() < 1
                        || trimmedLine.startsWith("//")) {
                    // Do nothing
                } else if (trimmedLine.length() < 1
                        || trimmedLine.startsWith("--")) {
                    // Do nothing
                } else if (!fullLineDelimiter
                        && trimmedLine.endsWith(getDelimiter())
                        || fullLineDelimiter
                        && trimmedLine.equals(getDelimiter())) {
                    command.append(line.substring(0, line
                            .lastIndexOf(getDelimiter())));
                    command.append(" ");
                    Statement statement = conn.createStatement();

                    log.debug(command);

                    boolean hasResults = false;
                    if (stopOnError) {
                        hasResults = statement.execute(command.toString());
                    } else {
                        try {
                            statement.execute(command.toString());
                        } catch (SQLException e) {
                            e.fillInStackTrace();
                            log.error("Error executing: " + command,e);
                        }
                    }

                    if (autoCommit && !conn.getAutoCommit()) {
                        conn.commit();
                    }

                    ResultSet rs = statement.getResultSet();
                    if (hasResults && rs != null) {
                        ResultSetMetaData md = rs.getMetaData();
                        int cols = md.getColumnCount();
                        for (int i = 0; i < cols; i++) {
                            String name = md.getColumnLabel(i);
                            log.debug(name + "\t");
                        }
                        while (rs.next()) {
                            for (int i = 0; i < cols; i++) {
                                String value = rs.getString(i);
                                log.debug(value + "\t");
                            }
                        }
                    }

                    command = null;
                    try {
                        statement.close();
                    } catch (Exception e) {
                        // Ignore to workaround a bug in Jakarta DBCP
                    }
                    Thread.yield();
                } else {
                    command.append(line);
                    command.append(" ");
                }
            }
            if (!autoCommit) {
                conn.commit();
            }
        } catch (SQLException | IOException e) {
            e.fillInStackTrace();
            
            if(!canFail){
                log.error("Error executing: " + command,e);
                throw e;
            }else{
                log.error("Error executing: " + command + " but ignoring, because it is allowed to fail." + e.getLocalizedMessage());
            }
        } finally {
            if (!this.autoCommit){
                conn.rollback();
            }
        }
    }

    private String getDelimiter() {
        return delimiter;
    }

    
}
