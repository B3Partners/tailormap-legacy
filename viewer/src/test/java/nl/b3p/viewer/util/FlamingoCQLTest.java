/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.util;

import org.geotools.filter.text.cql2.CQLException;
import static org.junit.Assert.assertEquals;
import org.junit.Test;
import org.opengis.filter.Filter;

/**
 *
 * @author Meine Toonen
 */
public class FlamingoCQLTest {
    
    private FlamingoCQL cql;
    
    public FlamingoCQLTest() {
        cql = new FlamingoCQL();
    }

    @Test
    public void testToFilterSingleGeom() throws CQLException {
        String input = "INTERSECTS(the_geom, POLYGON(( 1 1, 2 1, 2 2, 1 2, 1 1)))";
        Filter output = cql.toFilter(input);
        
        assertEquals("[ the_geom intersects POLYGON ((1 1, 2 1, 2 2, 1 2, 1 1)) ]", output.toString());
    }

    @Test
    public void testToFilterSingleAttribute() throws CQLException {
        String input = "pietje = 2";
        Filter output = cql.toFilter(input);
        
        assertEquals("[ pietje = 2 ]", output.toString());
    }
    

    @Test
    public void testToFilterMultipleAttributes() throws CQLException {
        String input = "pietje = 2 and aap = 'noot'";
        Filter output = cql.toFilter(input);
        
        assertEquals("[[ pietje = 2 ] AND [ aap = noot ]]", output.toString());
    }
    
    
    @Test
    public void testToFilterSingleApplayerWithoutFilter() throws CQLException {
        String input = "APPLAYER(the_geom, 1,'')";
        Filter output = cql.toFilter(input);
        
        assertEquals("[ the_geom intersects POLYGON ((1 1, 2 1, 2 2, 1 2, 1 1)) ]", output.toString());
    }
    
    
    @Test
    public void testToFilterSingleApplayerWithFilter() throws CQLException {
        String input = "APPLAYER(1, the_geom,  gm_naam = 'Gouda')";
        Filter output = cql.toFilter(input);
        
        assertEquals("[ the_geom intersects POLYGON ((1 1, 2 1, 2 2, 1 2, 1 1)) ]", output.toString());
    }
    
          
    @Test
    public void testToFilterNestedApplayer() throws CQLException {
        String input = "APPLAYER(1, the_geom,  APPLAYER (2, geometrie, ''))";
        Filter output = cql.toFilter(input);
        
        assertEquals("[ the_geom intersects POLYGON ((1 1, 2 1, 2 2, 1 2, 1 1)) ]", output.toString());
    }
    
    @Test
    public void testToFilterApplayerAndAttribute() throws CQLException {
        String input = "pietje = 2 AND PPLAYER(1, the_geom,  gm_naam = 'Gouda')";
        Filter output = cql.toFilter(input);
        
        assertEquals("[ the_geom intersects POLYGON ((1 1, 2 1, 2 2, 1 2, 1 1)) ]", output.toString());
    }
    
    @Test
    public void testToFilterApplayerAndGeom() throws CQLException {
        String input = "INTERSECTS(the_geom, POLYGON(( 1 1, 2 1, 2 2, 1 2, 1 1))) AND APPLAYER(1, the_geom,  gm_naam = 'Gouda')";
        Filter output = cql.toFilter(input);
        
        assertEquals("[ the_geom intersects POLYGON ((1 1, 2 1, 2 2, 1 2, 1 1)) ]", output.toString());
    }
    
}