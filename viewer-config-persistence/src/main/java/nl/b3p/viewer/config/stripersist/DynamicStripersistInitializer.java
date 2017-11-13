/*
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.config.stripersist;

import java.net.URL;
import java.sql.Connection;
import java.util.Arrays;
import java.util.List;
import java.util.SortedMap;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletContext;
import javax.sql.DataSource;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.stripesstuff.stripersist.InitializeSettings;
import org.w3c.dom.Node;

/**
 *
 * @author Matthijs Laan
 */
public class DynamicStripersistInitializer implements InitializeSettings {

    private static final Log log = LogFactory.getLog(DynamicStripersistInitializer.class);
    
    private static final String DATA_SOURCE_NAME = "jdbc/geo_viewer";

    public static final String PU_PREFIX = "viewer-config-";
    public static String databaseProductName = null;
    
    private SortedMap<String,Node> persistenceUnits;
    private ServletContext context;
    
    @Override
    public void init(SortedMap<String,Node> persistenceUnits, URL xml, ServletContext context) {
        this.persistenceUnits = persistenceUnits;
        this.context = context;
    }

    @Override
    public List<String> getPersistenceUnitsToCreate() throws Exception {
        
        log.info("Trying to determine persistence unit from JNDI DataSource database");    

        String persistenceUnit = null;
        DataSource ds = null;
        try {
            InitialContext init = new InitialContext();
            Context env = (Context) init.lookup("java:comp/env");
            ds = (DataSource) env.lookup(DATA_SOURCE_NAME);
        } catch (NamingException e) {
            log.fatal("No JNDI DataSource found under " + DATA_SOURCE_NAME + "");
            log.debug(e.getLocalizedMessage(), e);
        }

        if(ds != null) {
            try {
                Connection conn = ds.getConnection();
                try {
                    databaseProductName = conn.getMetaData().getDatabaseProductName();
                } finally {
                    conn.close();
                }

                if(databaseProductName == null) {
                    throw new Exception("No database product name found!");
                } else {
                    persistenceUnit = PU_PREFIX + databaseProductName.toLowerCase();
                    if(!persistenceUnits.containsKey(persistenceUnit)) {
                        throw new Exception(String.format("No persistence unit \"%s\" found for database product name \"%s\"",
                                persistenceUnit,
                                databaseProductName));
                    }
                }
            } catch(Exception e) {
                log.error("Error looking up database product name", e);
                throw e;
            }
        }
            
        log.info("Found persistence unit: " + persistenceUnit);
        // If null, use HSQLDB with data directory in java.io.tmpdir or from 
        // environment variable? 
        
        return Arrays.asList(persistenceUnit);
    }    
}
