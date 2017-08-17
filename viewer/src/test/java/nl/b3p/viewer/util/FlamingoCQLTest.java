/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.util;

import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.Layer;
import org.geotools.filter.text.cql2.CQLException;
import static org.junit.Assert.assertEquals;
import org.junit.Before;
import org.junit.Test;
import org.opengis.filter.Filter;

/**
 *
 * @author Meine Toonen
 */
public class FlamingoCQLTest extends TestUtil{
    
    private FlamingoCQL cql;
    
    public FlamingoCQLTest() {
        cql = new FlamingoCQL();
        
        // maak applayer met een featuresource die we kunnen gebruiken om applayer cql te maken.
    }
    
    @Before
    public void setupAppLayer(){
        ApplicationLayer al = new ApplicationLayer();
        Layer l = new Layer();
        FeatureSource fs;
    }

    @Test
    public void testToFilterSingleGeom() throws CQLException {
        String input = "INTERSECTS(the_geom, POLYGON(( 1 1, 2 1, 2 2, 1 2, 1 1)))";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ the_geom intersects POLYGON ((1 1, 2 1, 2 2, 1 2, 1 1)) ]", output.toString());
    }

    @Test
    public void testToFilterSingleAttribute() throws CQLException {
        String input = "pietje = 2";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ pietje = 2 ]", output.toString());
    }
    

    @Test
    public void testToFilterMultipleAttributes() throws CQLException {
        String input = "pietje = 2 and aap = 'noot'";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[[ pietje = 2 ] AND [ aap = noot ]]", output.toString());
    }
    
    
    @Test
    public void testToFilterSingleApplayerWithoutFilter() throws CQLException {
        initData(true);
        String input = "APPLAYER(the_geom, " + testAppLayer.getId() + ", )";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ the_geom intersects MULTIPOLYGON (((156487.5708 452161.984, 191870.5054 454712.1054, 191870.5054 441111.4579, 156912.5911 442917.7939, 156487.5708 452161.984)), ((137467.9153 453543.2998, 145437.0447 451418.1986, 144693.2593 443874.0894, 137680.4254 443130.304, 137467.9153 453543.2998)), ((150218.5224 432398.5431, 142036.8828 432504.7981, 142355.648 437923.8061, 150218.5224 432398.5431))) ]", output.toString());
    }
    
    
    @Test
    public void testToFilterSingleApplayerWithFilter() throws CQLException {
        initData(true);
        String input = "APPLAYER(the_geom, " + testAppLayer.getId() + ", gid = 1)";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ the_geom intersects POLYGON ((156487.5708 452161.984, 156912.5911 442917.7939, 191870.5054 441111.4579, 191870.5054 454712.1054, 191870.5054 454712.1054, 156487.5708 452161.984)) ]", output.toString());
    }
    
          
    @Test
    public void testToFilterNestedApplayer() throws CQLException {
        initData(true);
        String input = "APPLAYER(geom, " + testAppLayer.getId() + ",  APPLAYER(geom, " + testAppLayer.getId() + ", gid = 1))";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ geom intersects POLYGON ((156487.5708 452161.984, 156912.5911 442917.7939, 191870.5054 441111.4579, 191870.5054 454712.1054, 191870.5054 454712.1054, 156487.5708 452161.984)) ]", output.toString());
    }
    
    @Test
    public void testToFilterAttributeAndApplayer() throws CQLException {
        initData(true);
        String input = "pietje = 2 AND APPLAYER(the_geom, " + testAppLayer.getId() + ",  gid = 1)";
        Filter output = cql.toFilter(input, entityManager);
        String result = output.toString();
        assertEquals("[[ pietje = 2 ] AND [ the_geom intersects POLYGON ((156487.5708 452161.984, 156912.5911 442917.7939, 191870.5054 441111.4579, 191870.5054 454712.1054, 191870.5054 454712.1054, 156487.5708 452161.984)) ]]", result);
    }
    
    @Test
    public void testToFilterApplayerAndAttribute() throws CQLException {
        initData(true);
        String input = "APPLAYER(the_geom, " + testAppLayer.getId() + ",  gid = 1) AND pietje = 2 ";
        Filter output = cql.toFilter(input, entityManager);
        String result = output.toString();
        assertEquals("[[ the_geom intersects POLYGON ((156487.5708 452161.984, 156912.5911 442917.7939, 191870.5054 441111.4579, 191870.5054 454712.1054, 191870.5054 454712.1054, 156487.5708 452161.984)) ] AND [ pietje = 2 ]]", result);
    }
    
    @Test
    public void testToFilterApplayerAndGeom() throws CQLException {
        initData(true);
        String input = "INTERSECTS(the_geom, POLYGON(( 1 1, 2 1, 2 2, 1 2, 1 1))) AND APPLAYER(the_geom, " + testAppLayer.getId() + ",  gid = 1)";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[[ the_geom intersects POLYGON ((1 1, 2 1, 2 2, 1 2, 1 1)) ] AND [ the_geom intersects POLYGON ((156487.5708 452161.984, 156912.5911 442917.7939, 191870.5054 441111.4579, 191870.5054 454712.1054, 191870.5054 454712.1054, 156487.5708 452161.984)) ]]", output.toString());
    }
    
}