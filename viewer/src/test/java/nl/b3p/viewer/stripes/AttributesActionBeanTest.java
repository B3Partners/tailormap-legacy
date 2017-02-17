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
    
    
    private String url = "http://flamingo4.b3p.nl/geoserver/Test_omgeving/wms";
    private String featureTypeName = "Test_omgeving:cbs_gemeente_2014";

    private ApplicationLayer al = null;
    private FeatureSource fs = new WFSFeatureSource();
    private SimpleFeatureType ft = new SimpleFeatureType();
    private ApplicationLayer appLayer=new ApplicationLayer();
    
    public AttributesActionBeanTest() {
    }
    
    
    @Before
    public void setUp() {
        ft.setFeatureSource(fs);
        ft.setTypeName(featureTypeName);
        fs.setUrl(url);
        fs.getFeatureTypes().add(ft);
        
        appLayer.setId(666L);
        
        
        instance.setFeatureType(ft);
        instance.setAppLayer(appLayer);
        instance.setContext(new TestActionBeanContext());
    }
    
    @After
    public void tearDown() {
    }

    /**
     * Test of store method, of class AttributesActionBean.
     */
    @Test
    public void testStoreFirstPage() throws Exception {
        System.out.println("store");
        
        instance.setStart(0);
        instance.setLimit(10);
        
        JSONObject result = instance.executeStore();
        
        JSONArray features = result.getJSONArray("features");
        assertEquals(10, features.length());
    }
    
    @Test
    public void testStoreSecondPage() throws Exception {
        System.out.println("store");
        
        instance.setStart(10);
        instance.setLimit(10);
        
        JSONObject result = instance.executeStore();
        
        JSONArray features = result.getJSONArray("features");
        assertEquals(10, features.length());
    }
    
}
