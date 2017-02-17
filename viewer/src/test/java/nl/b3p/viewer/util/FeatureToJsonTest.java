/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.util;

import java.util.ArrayList;
import java.util.List;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.WFSFeatureSource;
import org.geotools.data.Query;
import org.json.JSONArray;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.opengis.filter.Filter;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class FeatureToJsonTest {
    
    private String url = "http://flamingo4.b3p.nl/geoserver/Test_omgeving/wms";
    private String featureTypeName = "Test_omgeving:cbs_gemeente_2014";

    private ApplicationLayer al = null;
    private FeatureSource fs = new WFSFeatureSource();
    private SimpleFeatureType ft = new SimpleFeatureType();

    public FeatureToJsonTest() {
        
    }
    @Before
    public void setup(){
        ft.setFeatureSource(fs);
        ft.setTypeName(featureTypeName);
        fs.setUrl(url);
        fs.getFeatureTypes().add(ft);
    }

    /**
     * Test of getJSONFeatures method, of class FeatureToJson.
     */
    @Test
    public void testGetJSONFeaturesFirstPage() throws Exception {
        org.geotools.data.FeatureSource gtFS = ft.openGeoToolsFeatureSource();
        assertNotNull(gtFS);
        
        Query q = new Query();
        q.setStartIndex(0);
        q.setMaxFeatures(10);
        String sort = null;
        String dir = null;
        List<Long> attributesToInclude = new ArrayList<>();
        
        FeatureToJson instance = new FeatureToJson(true, true, false, attributesToInclude);
        JSONArray result = instance.getJSONFeatures(al, ft, gtFS, q, sort, dir);
        assertNotNull(result);
        assertFalse(result.length() == 0);
        assertEquals(10, result.length());
    }
    
    @Test
    public void testGetJSONFeaturesSecondPage() throws Exception {
        org.geotools.data.FeatureSource gtFS = ft.openGeoToolsFeatureSource();
        assertNotNull(gtFS);
        
        Query q = new Query();
        q.setStartIndex(10);
        q.setMaxFeatures(10);
        String sort = null;
        String dir = null;
        List<Long> attributesToInclude = new ArrayList<>();
        
        FeatureToJson instance = new FeatureToJson(true, true, false, attributesToInclude);
        JSONArray result = instance.getJSONFeatures(al, ft, gtFS, q, sort, dir);
        assertNotNull(result);
        assertFalse(result.length() == 0);
        assertEquals(10, result.length());
    }

    
}
