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

   // @Test
    public void testToFilterSingleGeom() throws CQLException {
        String input = "INTERSECTS(the_geom, POLYGON(( 1 1, 2 1, 2 2, 1 2, 1 1)))";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ the_geom intersects POLYGON ((1 1, 2 1, 2 2, 1 2, 1 1)) ]", output.toString());
    }

   // @Test
    public void testToFilterSingleAttribute() throws CQLException {
        String input = "pietje = 2";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ pietje = 2 ]", output.toString());
    }
    

   // @Test
    public void testToFilterMultipleAttributes() throws CQLException {
        String input = "pietje = 2 and aap = 'noot'";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[[ pietje = 2 ] AND [ aap = noot ]]", output.toString());
    }
    
    
    @Test
    public void testToFilterSingleApplayerWithoutFilter() throws CQLException {
        initData(true);
        String input = "APPLAYER(the_geom, " + testAppLayer.getId() + ",'')";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ the_geom intersects MULTIPOLYGON (((150218.522352941 432398.543058824, 142036.882823529 432504.798117647, 142355.648 437923.806117647, 150218.522352941 432398.543058824)), ((156487.570823529 452161.984, 156912.591058823 442917.793882353, 191870.505411764 441111.457882353, 191870.505411764 454712.105411765, 191870.505411764 454712.105411765, 156487.570823529 452161.984)), ((137467.915294117 453543.299764706, 137680.425411764 443130.304, 144693.259294117 443874.089411765, 145437.044705882 451418.198588236, 145437.044705882 451418.198588236, 137467.915294117 453543.299764706))) ]", output.toString());
    }
    
    
    //@Test
    public void testToFilterSingleApplayerWithFilter() throws CQLException {
        String input = "APPLAYER(1, the_geom, gid = 1)";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ the_geom intersects POLYGON((156487.570823529 452161.984,156912.591058823 442917.793882353,191870.505411764 441111.457882353,191870.505411764 454712.105411765,191870.505411764 454712.105411765,156487.570823529 452161.984)) ]", output.toString());
    }
    
          
    //@Test
    public void testToFilterNestedApplayer() throws CQLException {
        String input = "APPLAYER(1, the_geom,  APPLAYER (2, geometrie, ''))";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ the_geom intersects POLYGON ((1 1, 2 1, 2 2, 1 2, 1 1)) ]", output.toString());
    }
    
    //@Test
    public void testToFilterApplayerAndAttribute() throws CQLException {
        String input = "pietje = 2 AND PPLAYER(1, the_geom,  gm_naam = 'Gouda')";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ the_geom intersects POLYGON ((1 1, 2 1, 2 2, 1 2, 1 1)) ]", output.toString());
    }
    
    //@Test
    public void testToFilterApplayerAndGeom() throws CQLException {
        String input = "INTERSECTS(the_geom, POLYGON(( 1 1, 2 1, 2 2, 1 2, 1 1))) AND APPLAYER(1, the_geom,  gm_naam = 'Gouda')";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ the_geom intersects POLYGON ((1 1, 2 1, 2 2, 1 2, 1 1)) ]", output.toString());
    }
    
}