/*
 * Copyright (C) 2017 B3Partners B.V.
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
package nl.b3p.viewer.stripes;

import java.net.SocketTimeoutException;
import java.util.ArrayList;
import java.util.List;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.FeatureTypeRelation;
import nl.b3p.viewer.config.services.FeatureTypeRelationKey;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.WFSFeatureSource;
import nl.b3p.viewer.util.TestActionBeanContext;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
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
public class AttributesActionBeanTest extends TestUtil{
    private static final Log log = LogFactory.getLog(AttributesActionBeanTest.class);
    private AttributesActionBean instance = new AttributesActionBean();
    private ApplicationLayer applayerGS = new ApplicationLayer();
    private ApplicationLayer applayerDG = new ApplicationLayer();
    
    private String urlGeoserver = "https://flamingo4.b3p.nl/geoserver/Test_omgeving/wms";
    private String typenameGeoserver = "Test_omgeving:cbs_gemeente_2014";
    private FeatureSource fsGeoserver = new WFSFeatureSource();
    private SimpleFeatureType ftGeoserver = new SimpleFeatureType();
    

    private FeatureSource fsDeegree = new WFSFeatureSource();
    private SimpleFeatureType ftDeegree = new SimpleFeatureType();
    private String urlDeegree = "http://afnemers.ruimtelijkeplannen.nl/afnemers/services";
    private String typenameDeegree = "app:Bestemmingsplangebied";

    
    
    
    private String urlGeoserverRel = "https://flamingo4.b3p.nl/geoserver/Test_omgeving/wms";
    private String typenameGeoserverRel = "Test_omgeving:cbs_gemeente_2014";
    private FeatureSource fsGeoserverRel = new WFSFeatureSource();
    private SimpleFeatureType ftGeoserverRel = new SimpleFeatureType();
    
    
    private String featureTypeNameSub = "Test_omgeving:cbs_buurt_2014";
    private ApplicationLayer relatedAL = new ApplicationLayer();
    
    private SimpleFeatureType relatedMain = new SimpleFeatureType();
    private SimpleFeatureType relatedSub = new SimpleFeatureType();
    private Layer relatedLayer = new Layer();

    public AttributesActionBeanTest() {
    }
    
    
    @Before
    public void setupResources() {
        ftGeoserver.setFeatureSource(fsGeoserver);
        ftGeoserver.setTypeName(typenameGeoserver);
        fsGeoserver.setUrl(urlGeoserver);
        fsGeoserver.getFeatureTypes().add(ftGeoserver);
        
        
        ftDeegree.setFeatureSource(fsDeegree);
        ftDeegree.setTypeName(typenameDeegree);
        fsDeegree.setUrl(urlDeegree);
        fsDeegree.getFeatureTypes().add(ftDeegree);
        
        applayerGS.setId(666L);
        applayerDG.setId(666L);
        instance.setContext(new TestActionBeanContext());
        
        List<ConfiguredAttribute> cas = new ArrayList<>();
        ConfiguredAttribute ca = new ConfiguredAttribute();
        ca.setAttributeName("GM_NAAM");
        ca.setVisible(true);
        cas.add(ca);
        
        List<ConfiguredAttribute> casDG = new ArrayList<>();
        ConfiguredAttribute caDG = new ConfiguredAttribute();
        caDG.setAttributeName("naam");
        caDG.setVisible(true);
        casDG.add(caDG);
        
        applayerGS.setAttributes(cas);
        applayerDG.setAttributes(casDG);
        
        // RelatedFeature tests
        
        ftGeoserverRel.setFeatureSource(fsGeoserverRel);
        ftGeoserverRel.setTypeName(typenameGeoserverRel);
        fsGeoserverRel.setUrl(urlGeoserverRel);
        fsGeoserverRel.getFeatureTypes().add(ftGeoserverRel);
        
        
        relatedMain.setFeatureSource(fsGeoserverRel);
        relatedMain.setId(666L);
        relatedMain.setTypeName(typenameGeoserverRel);
        
        relatedSub.setFeatureSource(fsGeoserverRel);
        relatedSub.setId(665L);
        relatedSub.setTypeName(featureTypeNameSub);
        
        
        fsGeoserverRel.getFeatureTypes().add(relatedMain);
        fsGeoserverRel.getFeatureTypes().add(relatedSub);
        
        AttributeDescriptor leftSide = new AttributeDescriptor();
        leftSide.setName("GM_NAAM");
        AttributeDescriptor rightSide = new AttributeDescriptor();
        rightSide.setName("GM_NAAM");
        
        FeatureTypeRelation ftr = new FeatureTypeRelation();
        FeatureTypeRelationKey ftrk = new FeatureTypeRelationKey(ftr, leftSide, rightSide);
        ftr.setFeatureType(relatedMain);
        ftr.setForeignFeatureType(relatedSub);
        ftr.getRelationKeys().add(ftrk);
        ftr.setType(FeatureTypeRelation.RELATE);
        relatedMain.getRelations().add(ftr);
        
        
        List<ConfiguredAttribute> cas2 = new ArrayList<>();
        ConfiguredAttribute ca1 = new ConfiguredAttribute();
        ca1.setAttributeName("GM_NAAM");
        ca1.setFeatureType(relatedMain);
        ca1.setVisible(true);
        cas.add(ca1);
        
        ConfiguredAttribute ca3 = new ConfiguredAttribute();
        ca3.setAttributeName("BU_NAAM");
        ca3.setFeatureType(relatedSub);
        ca3.setVisible(true);
        cas.add(ca3);
        
        ConfiguredAttribute ca2 = new ConfiguredAttribute();
        ca2.setAttributeName("GM_NAAM");
        ca2.setFeatureType(relatedSub);
        ca2.setVisible(true);
        cas.add(ca2);
        
        relatedAL.setAttributes(cas2);
        relatedAL.setId(666L);
        relatedLayer.setFeatureType(relatedMain);
    }
    
    
    @After
    public void tearDown() {
    }

    /**
     * Test of store method, of class AttributesActionBean.
     * @throws java.lang.Exception if any
     */
    @Test
    public void testStoreFirstPageGS() throws Exception {
        System.out.println("store");
        
        instance.setFeatureType(ftGeoserver);
        instance.setStart(0);
        instance.setLimit(10);
        instance.setAppLayer(applayerGS);
        
        JSONObject result = instance.executeStore(entityManager);
        
        JSONArray features = result.getJSONArray("features");
        assertEquals(10, features.length());
    }

    /**
     * Test of store method, of class AttributesActionBean.
     *
     * @throws Exception if any
     */
    @Test
    public void testStoreSecondPageGS() throws Exception {
        System.out.println("store");
        
        instance.setFeatureType(ftGeoserver);
        instance.setStart(10);
        instance.setLimit(10);
        instance.setAppLayer(applayerGS);
        
        JSONObject result = instance.executeStore(entityManager);
        
        JSONArray features = result.getJSONArray("features");
        assertEquals(10, features.length());
    }
    
    /**
     * Test of store method, of class AttributesActionBean.
     * @throws java.lang.Exception if any
     */
    @Test //at the time of committing, the service was down.
    public void testStoreFirstPageDG() throws Exception {
        System.out.println("store");

        instance.setFeatureType(ftDeegree);
        instance.setStart(0);
        instance.setLimit(10);
        instance.setAppLayer(applayerDG);

        JSONObject result = instance.executeStore(entityManager);

        if (result.has("features")) {
            JSONArray features = result.getJSONArray("features");
            assertEquals(10, features.length());
        }
    }

    /**
     * Test of store method, of class AttributesActionBean.
     *
     * @throws Exception if any
     */
    @Test //at the time of committing, the service was down.
    public void testStoreSecondPageDG() throws Exception {
        System.out.println("store");

        instance.setFeatureType(ftDeegree);
        instance.setStart(10);
        instance.setLimit(10);
        instance.setAppLayer(applayerDG);

        JSONObject result = instance.executeStore(entityManager);

        if (result.has("features")) {
            JSONArray features = result.getJSONArray("features");
            assertEquals(10, features.length());
        }
    }

    /**
     *
     * @throws Exception if any
     */
    @Test
    public void testGetJSONFeaturesRelatedFeaturetypeSub() throws Exception {
        System.out.println("store");
        
        instance.setStart(0);
        instance.setLimit(10);
        instance.setFilter("GM_NAAM = 'Coevorden'");
        instance.setFeatureType(relatedSub);
        instance.setAppLayer(relatedAL);
        instance.setDebug(true);
        instance.layer = relatedLayer;
        instance.setSort("GM_NAAM");
        
        JSONObject result = instance.executeStore(entityManager);
        
        JSONArray features = result.getJSONArray("features");
        assertEquals(10, features.length());
    }
    
    /**
     *
     * @throws Exception if any
     */
    @Test
    public void testGetJSONFeaturesRelatedFeaturetypeMain() throws Exception {
        initData(false);
        System.out.println("store");
        
        instance.setStart(0);
        instance.setLimit(10);
        instance.setFilter("GM_NAAM = 'Coevorden'");
        instance.setFeatureType(relatedMain);
        instance.setAppLayer(relatedAL);
        instance.setSort("GM_NAAM");
        instance.setDebug(true);
        instance.layer = relatedLayer;
        
        JSONObject result = instance.executeStore(entityManager);
        
        JSONArray features = result.getJSONArray("features");
        assertEquals(1, features.length());
    }
}
