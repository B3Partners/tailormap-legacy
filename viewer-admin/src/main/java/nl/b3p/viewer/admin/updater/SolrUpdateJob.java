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

import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.Point;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import nl.b3p.viewer.SolrInitializer;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.SolrConfiguration;
import nl.b3p.viewer.config.services.WFSFeatureSource;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.common.SolrInputDocument;
import org.geotools.data.Query;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.opengis.feature.simple.SimpleFeature;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Meine Toonen
 */
public class SolrUpdateJob implements Job {

    private static final Log log = LogFactory.getLog(SolrUpdateJob.class);
    private SolrServer server;

    @Override
    public void execute(JobExecutionContext jec) throws JobExecutionException {
        log.info("Starting updating of the solr index.");
        server = SolrInitializer.getServerInstance();

        if (server == null) {
            log.error("Could not locate solr server. Terminate updating of index.");
            return;
        }

        try {
            Stripersist.requestInit();
            EntityManager em = Stripersist.getEntityManager();
            WaitPageStatus status = new WaitPageStatus() {
                @Override
                public void setCurrentAction(String currentAction) {
                    // no debug logging
                    super.currentAction.set(currentAction);
                }

                @Override
                public void addLog(String message) {
                    // no debug logging
                    logs.add(message);
                }
            };
                    
            List<SolrConfiguration> configs = em.createQuery("FROM SolrConfiguration", SolrConfiguration.class).getResultList();
            for (SolrConfiguration solrConfiguration : configs) {
                removeSolrConfigurationFromIndex(solrConfiguration, em, server);
                insertSolrConfigurationIntoIndex(solrConfiguration, em, status,server);
            }

            log.info("Updating index complete.");
        } catch (Exception e) {
            log.error("Error", e);
        } finally {
            Stripersist.requestComplete();
        }
    }

    public void removeSolrConfigurationFromIndex(SolrConfiguration config, EntityManager em, SolrServer solrServer) {
        log.info("Remove documents from SolrConfiguration " + config.getName() + " from index.");
        try {
            server.deleteByQuery("searchConfig:"+config.getId());
        } catch (SolrServerException ex) {
            log.error("Could not delete documents for solr configuration: " + config.getName() + " - id: " + config.getId(),ex);
        } catch (IOException ex) {
            log.error("Could not delete documents for solr configuration: " + config.getName() + " - id: " + config.getId(),ex);
        }
    }

    public static void insertSolrConfigurationIntoIndex(SolrConfiguration config, EntityManager em, WaitPageStatus status, SolrServer solrServer) {
        log.info("Insert SolrConfiguration " + config.getName() + " into index.");
        org.geotools.data.FeatureSource fs = null;
        try {
            if (solrServer == null) {
                throw new Exception("No solr server initialized.");
            }
            status.setCurrentAction("Features ophalen");

            status.setProgress(10);
            SimpleFeatureType sft = config.getSimpleFeatureType();
            fs = sft.openGeoToolsFeatureSource();

            Query q = new Query();
            if (sft.getFeatureSource() instanceof WFSFeatureSource) {
                q.setMaxFeatures(5000);
            }
            FeatureCollection fc = fs.getFeatures(q);
            List<AttributeDescriptor> indexAttributesConfig = config.getIndexAttributes();
            List<AttributeDescriptor> resultAttributesConfig = config.getResultAttributes();

            List<SolrInputDocument> docs = new ArrayList();

            FeatureIterator<SimpleFeature> iterator = fc.features();
            double size = fc.size();
            double percentagesForAdding = 50;
            double intervalPerDoc = percentagesForAdding / size;
            Double total = (double) status.getProgress();
            try {
                while (iterator.hasNext()) {
                    SimpleFeature feature = iterator.next();
                    SolrInputDocument doc = new SolrInputDocument();
                    for (AttributeDescriptor attr : indexAttributesConfig) {
                        String attributeName = attr.getName();
                        Object col = feature.getAttribute(attributeName);
                        String field = "values";
                        if (col != null) {
                            doc.addField("columns", attributeName);
                            doc.addField(field, col);
                        }
                    }
                    for (AttributeDescriptor attributeDescriptor : resultAttributesConfig) {
                        String attributeName = attributeDescriptor.getName();
                        Object col = feature.getAttribute(attributeName);
                        String field = "resultValues";
                        if (col != null) {
                            doc.addField("resultColumns", attributeName);
                            doc.addField(field, col);
                        }
                    }
                    Object obj = feature.getDefaultGeometry();
                    Geometry g = (Geometry) obj;
                    if (g != null) {
                        Envelope env = featureToEnvelope(g);

                        doc.addField("minx", env.getMinX());
                        doc.addField("miny", env.getMinY());
                        doc.addField("maxx", env.getMaxX());
                        doc.addField("maxy", env.getMaxY());
                    }

                    doc.addField("id", feature.getID());
                    doc.addField("searchConfig", config.getId());
                    docs.add(doc);
                    total += intervalPerDoc;
                    status.setProgress(total.intValue());
                }
            } finally {
                iterator.close();
            }
            status.setCurrentAction("Features toevoegen aan solr index");

            status.setProgress(60);
            solrServer.add(docs);
            solrServer.commit();
            status.setProgress(100);
            status.setFinished(true);
        } catch (Exception ex) {
            log.error("Cannot add configuration to index", ex);
            status.setCurrentAction("Mislukt.");
        } finally {
            if (fs != null && fs.getDataStore() != null) {
                fs.getDataStore().dispose();
            }
        }
    }
    
    private static Envelope featureToEnvelope(Geometry g){
        Map<String, Double> bbox = new HashMap();
        Envelope env;
        if(g instanceof Point){
            Point p = (Point)g;
            Geometry buffer = p.buffer(200);
            env =buffer.getEnvelopeInternal();
        }else {
            env = g.getEnvelopeInternal();
        }
        return env;
    }
}
