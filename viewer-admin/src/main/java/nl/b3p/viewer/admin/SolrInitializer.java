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
package nl.b3p.viewer.admin;

import java.io.File;
import java.net.URI;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import org.apache.commons.io.FileUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.embedded.EmbeddedSolrServer;
import org.apache.solr.core.CoreContainer;
import org.apache.solr.core.SolrResourceLoader;

/**
 * This class will initialize the solr server: the setup of the index and the
 * initialization of the SolrServer object. This in order to limit the number of
 * connections to the index.
 *
 * @author Meine Toonen
 */
public class SolrInitializer implements ServletContextListener {

    public static final String DATA_DIR = "flamingo.data.dir";
    private static final String SOLR_DIR = ".solr/";
    private static final String SOLR_CORE_NAME = "autosuggest";
    private static SolrServer server;
    private static CoreContainer coreContainer;
    private static final Log log = LogFactory.getLog(SolrInitializer.class);
    private ServletContext context;
    private String datadirectory;
    
    //private static final String SCHEMA="/WEB-INF/classes/xml/schema.xml";
    //private static final String SOLRCONFIG="/WEB-INF/classes/xml/solrconfig.xml";
    private static final String SOLR_CONF_DIR="/WEB-INF/classes/solr/autosuggest";

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        log.debug("SolrInitializer initializing");
        this.context = sce.getServletContext();

        datadirectory = context.getInitParameter(DATA_DIR);
        
        System.setProperty("solr.solr.home", datadirectory + File.separator + SOLR_DIR);
        File dataDirectory = new File(datadirectory);
        if (!isCorrectDir(dataDirectory)) {
            log.error("Cannot read/write data dir " + datadirectory + ". Solr searching not possible.");
            return;
        }
        log.info("Data dir set " + datadirectory);
        File solrDir = new File(dataDirectory, SOLR_DIR);
        if (!solrDir.exists()) {
            setupSolr(solrDir);
        }

        inializeSolr(solrDir);
    }

    private void setupSolr(File solrdir) {
        log.debug("Setup the solr directory");

        copyConf(solrdir);
        coreContainer = new CoreContainer(solrdir.getPath());
    }

    private void inializeSolr(File solrDir) {
        log.debug("Initialize the Solr Server instance");
        String path = solrDir.getPath();
        SolrResourceLoader loader = new SolrResourceLoader(path);
        if(coreContainer == null){
            coreContainer = new CoreContainer(loader);
        }
        coreContainer.load();
        server = new EmbeddedSolrServer(coreContainer, SOLR_CORE_NAME);
    }

    public static SolrServer getServerInstance() {
        return server;
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        coreContainer.shutdown();
        server.shutdown();
        log.debug("SolrInitializer destroyed");
    }

    private boolean isCorrectDir(File f) {
        return f.isDirectory() && f.canRead() && f.canWrite();
    }
    
    private void copyConf(File solrDir){
        try {
            File conf = new File( this.context.getRealPath("/WEB-INF/classes/solr/solr.xml"));
            boolean solrDirCreated = solrDir.mkdir();
            FileUtils.copyFile(conf, new File(solrDir, "solr.xml"));
            
            File coreConfiguration = new File(context.getRealPath(SOLR_CONF_DIR));
            
            File coreDir = new File(solrDir, SOLR_CORE_NAME);
            FileUtils.copyDirectory(coreConfiguration, coreDir);
        
        } catch (Exception ex) {
            log.error("Setup of the solr directory failed: ",ex);
        }
        
    }
}
