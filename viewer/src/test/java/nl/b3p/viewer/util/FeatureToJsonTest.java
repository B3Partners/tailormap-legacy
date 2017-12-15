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
package nl.b3p.viewer.util;

import java.util.ArrayList;
import java.util.List;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.WFSFeatureSource;
import org.geotools.data.Query;
import org.json.JSONArray;
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class FeatureToJsonTest {
    
    private String url = "https://flamingo4.b3p.nl/geoserver/Test_omgeving/wms";
    private String featureTypeName = "Test_omgeving:cbs_gemeente_2014";
    

    private ApplicationLayer al = new ApplicationLayer();
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
        String sort = "GM_NAAM";
        String dir = null;
        List<Long> attributesToInclude = new ArrayList<>();
        
        FeatureToJson instance = new FeatureToJson(false, true, false, attributesToInclude);
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
        String sort = "GM_NAAM";
        String dir = null;
        List<Long> attributesToInclude = new ArrayList<>();
        
        FeatureToJson instance = new FeatureToJson(false, true, false, attributesToInclude);
        JSONArray result = instance.getJSONFeatures(al, ft, gtFS, q, sort, dir);
        assertNotNull(result);
        assertFalse(result.length() == 0);
        assertEquals(10, result.length());
    }
}
