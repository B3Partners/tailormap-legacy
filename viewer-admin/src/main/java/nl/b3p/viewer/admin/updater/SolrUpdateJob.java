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
package nl.b3p.viewer.admin.updater;

import java.util.List;
import javax.persistence.EntityManager;
import nl.b3p.viewer.SolrInitializer;
import nl.b3p.viewer.config.services.SolrConfiguration;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.response.SolrPingResponse;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Meine Toonen
 */
public class SolrUpdateJob  implements Job{
    private static final Log log = LogFactory.getLog(SolrUpdateJob.class);
    private SolrServer server;

    @Override
    public void execute(JobExecutionContext jec) throws JobExecutionException {
        log.info("Starting updating of the solr index.");
        server = SolrInitializer.getServerInstance();
        
        if(server == null){
            log.error("Could not locate solr server. Terminate updating of index.");
            return;
        }
        
        try {
            Stripersist.requestInit();
            EntityManager em = Stripersist.getEntityManager();
            List<SolrConfiguration> configs = em.createQuery("FROM SolrConfiguration", SolrConfiguration.class).getResultList();
            for (SolrConfiguration solrConfiguration : configs) {
                removeSolrConfigurationFromIndex(solrConfiguration);
                insertSolrConfigurationIntoIndex(solrConfiguration);
            }

            log.info("Updating index complete.");
        } catch(Exception e) {
            log.error("Error", e);
        } finally {
            Stripersist.requestComplete();
        }
    }
    
    public void removeSolrConfigurationFromIndex(SolrConfiguration config){
        log.info("Remove documents from SolrConfiguration "+ config.getName() + " from index.");
        
    }
    
    public void insertSolrConfigurationIntoIndex(SolrConfiguration config){
        log.info("Insert SolrConfiguration "+ config.getName() + " into index.");
    }
    
}
