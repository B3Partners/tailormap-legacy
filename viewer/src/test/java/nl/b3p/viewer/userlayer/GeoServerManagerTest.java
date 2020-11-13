package nl.b3p.viewer.userlayer;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.util.Arrays;
import java.util.Collection;

import static org.junit.Assert.assertEquals;

@RunWith(Parameterized.class)
public class GeoServerManagerTest {

    private final String serviceUrl;
    private final String expected;
    public GeoServerManagerTest(String expected, String serviceUrl) {
        this.serviceUrl = serviceUrl;
        this.expected = expected;
    }

    @Parameterized.Parameters
    public static Collection primeNumbers() {
        return Arrays.asList(new Object[][]{
                // expected / given serviceUrl
                {"http://localhost:8080/geoserver/", "http://localhost:8080/geoserver/geoserver/wms?SERVICE=WMS"},
                {"http://localhost:8080/geoserver/", "http://localhost:8080/geoserver/wms?SERVICE=WMS"},
                {"http://localhost:8080/geoserver/", "http://localhost:8080/geoserver/ows"},
        });
    }

    @Test
    public void testGetBaseUrl() {
        GeoServerManager serverManager = new GeoServerManager(serviceUrl, null, null, null, null        );
        assertEquals(expected, serverManager.getBaseUrl());
    }
}
