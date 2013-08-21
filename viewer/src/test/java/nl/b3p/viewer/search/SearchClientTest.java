package nl.b3p.viewer.search;

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

import nl.b3p.viewer.search.OpenLSSearchClient;
import org.json.JSONArray;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author Roy Braam
 */
public class SearchClientTest {
    private OpenLSSearchClient ols;
    
    public SearchClientTest() {
        
    }
    
    @BeforeClass
    public static void setUpClass() {
    }
    
    @AfterClass
    public static void tearDownClass() {
    }
    
    @Before
    public void setUp() {
        ols = new OpenLSSearchClient("http://geodata.nationaalgeoregister.nl/geocoder/Geocoder?zoekterm=","GET");        
    }
    
    @After
    public void tearDown() {
    }
    
    @Test
    public void search(){        
        JSONArray result = ols.search("grote+markt+groningen");
        assertTrue(result.length()==1);
    }    
}