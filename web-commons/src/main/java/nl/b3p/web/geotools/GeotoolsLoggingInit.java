/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
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
