/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.tailormap.viewer.admin.stripes;

import nl.tailormap.viewer.config.services.AttributeDescriptor;
import nl.tailormap.viewer.config.services.FeatureSource;
import nl.tailormap.viewer.config.services.SimpleFeatureType;
import nl.tailormap.viewer.config.services.SolrConf;
import nl.tailormap.viewer.util.TestUtil;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.SolrServerException;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * @author Meine Toonen
 */
public class AttributeSourceActionBeanTest extends TestUtil {

    private final AttributeSourceActionBean instance = new AttributeSourceActionBean();

    @Test
    public void testDeleteAttributeSource() throws SolrServerException, IOException {
        FeatureSource fs = entityManager.find(FeatureSource.class, 1L);
        assertNotNull(fs);
        List<FeatureSource> sources = entityManager.createQuery("FROM FeatureSource").getResultList();
        int numSources = sources.size();
        int numAttributesFromSource = 0;
        List<SimpleFeatureType> types = fs.getFeatureTypes();
        for (SimpleFeatureType type : types) {
            numAttributesFromSource += type.getAttributes().size();
        }

        List<AttributeDescriptor> attributes = entityManager.createQuery("FROM AttributeDescriptor").getResultList();
        int totalAttributes = attributes.size();

        List<SolrConf> confs = entityManager.createQuery("FROM SolrConf").getResultList();
        assertEquals(1, confs.size());

        SolrConf conf = confs.get(0);
        assertEquals(2, conf.getIndexAttributes().size());
        assertEquals(2, conf.getResultAttributes().size());

        instance.setFeatureSource(fs);
        SolrServer server = Mockito.mock(SolrServer.class);

        instance.deleteFeatureSource(entityManager, server);

        Mockito.verify(server).deleteByQuery("searchConfig:1");
        sources = entityManager.createQuery("FROM FeatureSource").getResultList();
        assertEquals(numSources - 1, sources.size());

        confs = entityManager.createQuery("FROM SolrConf").getResultList();
        assertEquals(0, confs.size());

        List attrs = entityManager.createNativeQuery("select b.attribute_ from solr_conf_result_attributes b").getResultList();
        assertEquals(0, attrs.size());

        attributes = entityManager.createQuery("FROM AttributeDescriptor").getResultList();
        assertEquals(totalAttributes - numAttributesFromSource, attributes.size());
    }
}
