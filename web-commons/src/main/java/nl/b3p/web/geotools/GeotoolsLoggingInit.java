/*
 * Copyright (C) 2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.web.geotools;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.util.logging.Logging;

/**
 *
 * @author Roy Braam
 */
public class GeotoolsLoggingInit implements ServletContextListener{
    private static final Log log = LogFactory.getLog(GeotoolsLoggingInit.class);
    public void contextInitialized(ServletContextEvent sce) {
        try{
            Logging.ALL.setLoggerFactory("org.geotools.util.logging.Log4JLoggerFactory");
        }catch (Exception e){
            log.error("While setting log4j for geotools",e);
        }
    }

    public void contextDestroyed(ServletContextEvent sce) {
        
    }
    
}
