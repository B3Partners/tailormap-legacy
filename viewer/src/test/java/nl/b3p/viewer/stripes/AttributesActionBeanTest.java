/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.stripes;

import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.WFSFeatureSource;
import nl.b3p.viewer.util.TestActionBeanContext;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class AttributesActionBeanTest {
    private AttributesActionBean instance = new AttributesActionBean();
    private ApplicationLayer applayer = new ApplicationLayer();
    
    private String urlGeoserver = "http://flamingo4.b3p.nl/geoserver/Test_omgeving/wms";
    private String typenameGeoserver = "Test_omgeving:cbs_gemeente_2014";
    private FeatureSource fsGeoserver = new WFSFeatureSource();
    private SimpleFeatureType ftGeoserver = new SimpleFeatureType();
    

    private FeatureSource fsDeegree = new WFSFeatureSource();
    private SimpleFeatureType ftDeegree = new SimpleFeatureType();
    private String urlDeegree = "http://afnemers.ruimtelijkeplannen.nl/afnemers/services";
    private String typenameDeegree = "Test_omgeving:cbs_gemeente_2014";


    public AttributesActionBeanTest() {
    }
    
    
    @Before
    public void setUp() {
        ftGeoserver.setFeatureSource(fsGeoserver);
        ftGeoserver.setTypeName(typenameGeoserver);
        fsGeoserver.setUrl(urlGeoserver);
        fsGeoserver.getFeatureTypes().add(ftGeoserver);
        
        
        ftDeegree.setFeatureSource(fsDeegree);
        ftDeegree.setTypeName(typenameDeegree);
        fsDeegree.setUrl(urlDeegree);
        fsDeegree.getFeatureTypes().add(ftDeegree);
        
        applayer.setId(666L);
        instance.setAppLayer(applayer);
        instance.setContext(new TestActionBeanContext());
        
    }
    
    @After
    public void tearDown() {
    }

    /**
     * Test of store method, of class AttributesActionBean.
     */
    @Test
    public void testStoreFirstPageGS() throws Exception {
        System.out.println("store");
        
        instance.setFeatureType(ftGeoserver);
        instance.setStart(0);
        instance.setLimit(10);
        
        JSONObject result = instance.executeStore();
        
        JSONArray features = result.getJSONArray("features");
        assertEquals(10, features.length());
    }
    
    @Test
    public void testStoreSecondPageGS() throws Exception {
        System.out.println("store");
        
        instance.setFeatureType(ftGeoserver);
        instance.setStart(10);
        instance.setLimit(10);
        
        JSONObject result = instance.executeStore();
        
        JSONArray features = result.getJSONArray("features");
        assertEquals(10, features.length());
    }
    
    /**
     * Test of store method, of class AttributesActionBean.
     */
    @Test
    public void testStoreFirstPageDG() throws Exception {
        System.out.println("store");
        
        instance.setFeatureType(ftDeegree);
        instance.setStart(0);
        instance.setLimit(10);
        
        JSONObject result = instance.executeStore();
        
        JSONArray features = result.getJSONArray("features");
        assertEquals(10, features.length());
    }
    
    @Test
    public void testStoreSecondPageDG() throws Exception {
        System.out.println("store");
        
        instance.setFeatureType(ftDeegree);
        instance.setStart(10);
        instance.setLimit(10);
        
        JSONObject result = instance.executeStore();
        
        JSONArray features = result.getJSONArray("features");
        assertEquals(10, features.length());
    }
    
}
