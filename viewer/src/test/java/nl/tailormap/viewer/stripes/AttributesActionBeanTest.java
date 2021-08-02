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
package nl.tailormap.viewer.stripes;

import nl.tailormap.viewer.config.app.ApplicationLayer;
import nl.tailormap.viewer.config.app.ConfiguredAttribute;
import nl.tailormap.viewer.config.services.AttributeDescriptor;
import nl.tailormap.viewer.config.services.FeatureSource;
import nl.tailormap.viewer.config.services.FeatureTypeRelation;
import nl.tailormap.viewer.config.services.FeatureTypeRelationKey;
import nl.tailormap.viewer.config.services.Layer;
import nl.tailormap.viewer.config.services.SimpleFeatureType;
import nl.tailormap.viewer.config.services.WFSFeatureSource;
import nl.tailormap.viewer.util.TestActionBeanContext;
import nl.tailormap.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class AttributesActionBeanTest extends TestUtil {
    private static final Log log = LogFactory.getLog(AttributesActionBeanTest.class);
    private final AttributesActionBean instance = new AttributesActionBean();
    private final ApplicationLayer applayerGS = new ApplicationLayer();
    private final ApplicationLayer applayerDG = new ApplicationLayer();

    private final String urlGeoserver = "https://flamingo5.b3p.nl/geoserver/Test_omgeving/wms";
    private final String typenameGeoserver = "Test_omgeving:cbs_gemeente_2014";
    private final FeatureSource fsGeoserver = new WFSFeatureSource();
    private final SimpleFeatureType ftGeoserver = new SimpleFeatureType();

    private final FeatureSource fsDeegree = new WFSFeatureSource();
    private final SimpleFeatureType ftDeegree = new SimpleFeatureType();
    private final String urlDeegree = "http://afnemers.ruimtelijkeplannen.nl/afnemers/services";
    private final String typenameDeegree = "app:Bestemmingsplangebied";

    private final String urlGeoserverRel = "https://flamingo5.b3p.nl/geoserver/Test_omgeving/wms";
    private final String typenameGeoserverRel = "Test_omgeving:cbs_gemeente_2014";
    private final FeatureSource fsGeoserverRel = new WFSFeatureSource();
    private final SimpleFeatureType ftGeoserverRel = new SimpleFeatureType();

    private final String featureTypeNameSub = "Test_omgeving:cbs_buurt_2014";
    private final ApplicationLayer relatedAL = new ApplicationLayer();

    private final SimpleFeatureType relatedMain = new SimpleFeatureType();
    private final SimpleFeatureType relatedSub = new SimpleFeatureType();
    private final Layer relatedLayer = new Layer();

    public AttributesActionBeanTest() {
    }

    @BeforeEach
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

    /**
     * Test of store method, of class AttributesActionBean.
     *
     * @throws java.lang.Exception if any
     */
    @Test
    @Disabled("disabled tests for failing service. to be fixed")
    public void testStoreFirstPageGS() throws Exception {
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
    @Disabled("disabled tests for failing service. to be fixed")
    public void testStoreSecondPageGS() throws Exception {
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
     *
     * @throws java.lang.Exception if any
     */
    @Test
    public void testStoreFirstPageDG() throws Exception {
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
    @Test
    public void testStoreSecondPageDG() throws Exception {
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
     * @throws Exception if any
     */
    @Test
    @Disabled("disabled tests for failing service. to be fixed")
    public void testGetJSONFeaturesRelatedFeaturetypeSub() throws Exception {
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
     * @throws Exception if any
     */
    @Test
    @Disabled("disabled tests for failing service. to be fixed")
    public void testGetJSONFeaturesRelatedFeaturetypeMain() throws Exception {
        initData(false);
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
