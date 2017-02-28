/*
 * Copyright (C) 2013 B3Partners B.V.
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
package nl.b3p.viewer.solr;

import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.Point;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.SolrConf;
import nl.b3p.viewer.config.services.WFSFeatureSource;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.common.SolrInputDocument;
import org.geotools.data.Query;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.factory.GeoTools;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.filter.sort.SortBy;
import org.opengis.filter.sort.SortOrder;
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
    public static int MAX_FEATURES = 5000;
    public static int BATCH_SIZE = 5000;

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
                    
            List<SolrConf> configs = em.createQuery("FROM SolrConf", SolrConf.class).getResultList();
            for (SolrConf solrConfiguration : configs) {
                removeSolrConfigurationFromIndex(solrConfiguration, em, server);
                insertSolrConfigurationIntoIndex(solrConfiguration, em, status,server);
            }
            em.getTransaction().commit();

            log.info("Updating index complete.");
        } catch (Exception e) {
            log.error("Error", e);
        } finally {
            Stripersist.requestComplete();
        }
    }

    public static void removeSolrConfigurationFromIndex(SolrConf config, EntityManager em, SolrServer solrServer) {
        log.info("Remove documents from SolrConfiguration " + config.getName() + " from index.");
        try {
            solrServer.deleteByQuery("searchConfig:"+config.getId());
            solrServer.commit();
            
            Date now = new Date();
            config.setLastUpdated(now);
        } catch (SolrServerException ex) {
            log.error("Could not delete documents for solr configuration: " + config.getName() + " - id: " + config.getId(),ex);
        } catch (IOException ex) {
            log.error("Could not delete documents for solr configuration: " + config.getName() + " - id: " + config.getId(),ex);
        }
    }
    
    public static void insertSolrConfigurationIntoIndex(SolrConf config, EntityManager em, WaitPageStatus status, SolrServer solrServer, Filter filter) {
        log.info("Insert SolrConfiguration " + config.getName() + " into index.");
        org.geotools.data.FeatureSource fs = null;
        try {
            if (solrServer == null) {
                throw new Exception("No solr server initialized.");
            }
            status.setCurrentAction("Initialiseren...");

            status.setProgress(10);
            
            List<String> indexAttributesConfig = config.getIndexAttributes();
            List<String> resultAttributesConfig = config.getResultAttributes();
            
            SimpleFeatureType sft = config.getSimpleFeatureType();
            fs = sft.openGeoToolsFeatureSource();

            Query q = new Query();
            if(filter != null){
                q.setFilter(filter);
            }
            
            if (sft.getFeatureSource() instanceof WFSFeatureSource) {
                q.setMaxFeatures(MAX_FEATURES);
                FeatureCollection fc = fs.getFeatures(q);
                FeatureIterator<SimpleFeature> iterator = fc.features();
                processFeatures(iterator, indexAttributesConfig, resultAttributesConfig, config.getId(),solrServer, status, 70);
            }else{
                
                status.setCurrentAction("Aantal features berekenen...");

                status.setProgress(15);
                if (fs instanceof org.geotools.jdbc.JDBCFeatureSource ) {
                    List<String> propertyNames = new ArrayList<String>();
                    for (AttributeDescriptor ad : sft.getAttributes()) {
                        propertyNames.add(ad.getName());
                    }
                    if(!propertyNames.isEmpty()){
                        setSortBy(q, propertyNames.get(0));
                    }
                }
                FeatureCollection fc = fs.getFeatures(q);
                int total = fc.size();
                status.setCurrentAction("Begin toevoegen");

                status.setProgress(20);
                int numIterations = (int)Math.ceil((double)total/BATCH_SIZE);
                double percentagePerBatch = (double)70/numIterations;
                int currentProgress = 20;
                for (int i = 0; i < numIterations; i++) {
                    int start = i * BATCH_SIZE;
                    q.setStartIndex(start);
                    int max = (i+1)*BATCH_SIZE > total ? total : BATCH_SIZE;
                    q.setMaxFeatures(max);
                    
                    status.setCurrentAction("Bezig met verwerken features " + start + " - " + max + " van de " + total);
                    currentProgress += percentagePerBatch;
                    status.setProgress(currentProgress);
                    fc = fs.getFeatures(q);
                    processFeatures(fc.features(), indexAttributesConfig, resultAttributesConfig, config.getId(),solrServer, status, percentagePerBatch);
                }
            }
            
            Date now = new Date();
            config.setLastUpdated(now);
            em.persist(config);
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
    

    private static void processFeatures( FeatureIterator<SimpleFeature> iterator,List<String> indexAttributesConfig,
            List<String> resultAttributesConfig, Long id, SolrServer solrServer, WaitPageStatus status, double percentage ) {
        try {
            
            List<SolrInputDocument> docs = new ArrayList();
            try {
                while (iterator.hasNext()) {
                    SimpleFeature feature = iterator.next();
                    SolrInputDocument doc = new SolrInputDocument();
                    boolean hasAllRequiredFields = true;
                    for (String attr : indexAttributesConfig) {
                        String attributeName = attr;
                        Object col = feature.getAttribute(attributeName);
                        String field = "values";
                        if (col != null) {
                            doc.addField("columns", attributeName);
                            doc.addField(field, col);
                        } else {
                            hasAllRequiredFields = false;
                        }
                    }
                    if (!hasAllRequiredFields) {
                        continue;
                    }
                    for (String attributeDescriptor : resultAttributesConfig) {
                        String attributeName = attributeDescriptor;
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
                    doc.addField("searchConfig", id);
                    docs.add(doc);
                }
            } finally {
                iterator.close();
            }

            solrServer.add(docs);
            solrServer.commit();
        }   catch (SolrServerException ex) {
            log.error("Cannot add configuration to index", ex);
        } catch (IOException ex) {
            log.error("Cannot add configuration to index", ex);
        }
    }

    public static void insertSolrConfigurationIntoIndex(SolrConf config, EntityManager em, WaitPageStatus status, SolrServer solrServer) {
        insertSolrConfigurationIntoIndex(config, em, status, solrServer, null);
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
    
        /**
     * Set sort on query
     *
     * @param q the query on which the sort is added
     * @param sort the name of the sort column
     * @param dir sorting direction DESC or ASC
     */
    private static void setSortBy(Query q, String sort) {
        FilterFactory2 ff2 = CommonFactoryFinder.getFilterFactory2(GeoTools.getDefaultHints());

        if (sort != null) {
            q.setSortBy(new SortBy[]{
                ff2.sort(sort, SortOrder.ASCENDING)
            });
        }
    }
}
