package nl.viewer.userlayer;

import nl.viewer.audit.AuditMessageObject;
import nl.viewer.util.TestUtil;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.util.Arrays;
import java.util.Collection;

import static org.junit.Assert.*;

@RunWith(Parameterized.class)
public class UserLayerHandlerIntegrationTest extends TestUtil {


    private final String serviceUrl;
    private final String expected;

    public UserLayerHandlerIntegrationTest(String expected, String serviceUrl) {
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
    @Ignore("fails with NPE on getting service, needs more setup")
    public void testValidate() {
        UserLayerHandler ulh = new UserLayerHandler(new AuditMessageObject(), entityManager, app, testAppLayer,
                "id > 0", "testlayer", "geoserverWorkspace", "geoserverStorename");
        assertNull(ulh.validate());
    }

    @Test
    @Ignore("fails with NPE on getting service, needs more setup")
    public void testAdd() {
        UserLayerHandler ulh = new UserLayerHandler(new AuditMessageObject(), entityManager, app, testAppLayer,
                "id > 0", "testlayer", "geoserverWorkspace", "geoserverStorename");
        assertTrue(ulh.add());
    }


    @Test
    @Ignore("fails with NPE on getting service, needs more setup")
    public void testGetBaseUrl() {
        UserLayerHandler ulh = new UserLayerHandler(new AuditMessageObject(), entityManager, app, testAppLayer,
                "id > 0", "testlayer", "geoserverWorkspace", "geoserverStorename");

        GeoServerManager serverManager = new GeoServerManager(null, null, null, null, serviceUrl);
        assertEquals(expected, serverManager.getBaseUrl());
    }

}
