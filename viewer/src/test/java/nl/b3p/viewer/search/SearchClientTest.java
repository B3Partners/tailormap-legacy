package nl.b3p.viewer.search;

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.net.HttpURLConnection;
import nl.b3p.viewer.HttpTestSupport;
import org.json.JSONArray;
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author Roy Braam
 * @author mprins
 */
public class SearchClientTest extends HttpTestSupport{
    private OpenLSSearchClient ols;
    public SearchClientTest() {
        //super();
        HttpHandler handler = new HttpHandler(){
            @Override
            public void handle(HttpExchange ex) throws IOException{                
                byte[] response = "<xls:GeocodeResponse xmlns:xls=\"http://www.opengis.net/xls\" xmlns:gml=\"http://www.opengis.net/gml\"><xls:GeocodeResponseList numberOfGeocodedAddresses=\"1\"><xls:GeocodedAddress><gml:Point srsName=\"EPSG:28992\"><gml:pos dimension=\"2\">233818.478 582036.58</gml:pos></gml:Point><xls:Address countryCode=\"NL\"><xls:StreetAddress><xls:Street>Grote Markt</xls:Street></xls:StreetAddress><xls:Place type=\"MunicipalitySubdivision\">Groningen</xls:Place><xls:Place type=\"Municipality\">Groningen</xls:Place><xls:Place type=\"CountrySubdivision\">Groningen</xls:Place></xls:Address></xls:GeocodedAddress></xls:GeocodeResponseList></xls:GeocodeResponse>".getBytes();
                ex.sendResponseHeaders(HttpURLConnection.HTTP_OK, response.length);
                ex.getResponseBody().write(response);
                ex.close();
            }
        };
        httpServer.createContext("/geocoder/Geocoder",handler);
    }
   
    @Before
    public void setUp() {
        ols = new OpenLSSearchClient("http://localhost:"
                + httpServer.getAddress().getPort()
                + "/geocoder/Geocoder?zoekterm=");
    }
    
    @Test
    public void searchOpenLs(){        
        SearchResult response = ols.search("grote+markt+groningen");
        JSONArray result = response.getResults();
        assertTrue(result.length()==1);
    }    
    
    @Test
    public void searchOpenLsUnencoded(){        
        SearchResult response =   ols.search("grote markt groningen");   
        JSONArray result = response.getResults();
        assertTrue(result.length()==1);
    }    
}