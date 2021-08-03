package nl.tailormap.viewer.userlayer;

import nl.tailormap.viewer.audit.AuditMessageObject;
import nl.tailormap.viewer.util.TestUtil;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.stream.Stream;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.params.provider.Arguments.arguments;

public class UserLayerHandlerIntegrationTest extends TestUtil {
    static Stream<Arguments> argumentsProvider() {
        return Stream.of(
                // expected / given serviceUrl
                arguments("http://localhost:8080/geoserver/", "http://localhost:8080/geoserver/geoserver/wms?SERVICE=WMS"),
                arguments("http://localhost:8080/geoserver/", "http://localhost:8080/geoserver/wms?SERVICE=WMS"),
                arguments("http://localhost:8080/geoserver/", "http://localhost:8080/geoserver/ows")
        );
    }

    @Test
    @Disabled("fails with NPE on getting service, needs more setup")
    public void testValidate() {
        UserLayerHandler ulh = new UserLayerHandler(new AuditMessageObject(), entityManager, app, testAppLayer,
                "id > 0", "testlayer", "geoserverWorkspace", "geoserverStorename");
        assertNull(ulh.validate());
    }

    @Test
    @Disabled("fails with NPE on getting service, needs more setup")
    public void testAdd() {
        UserLayerHandler ulh = new UserLayerHandler(new AuditMessageObject(), entityManager, app, testAppLayer,
                "id > 0", "testlayer", "geoserverWorkspace", "geoserverStorename");
        assertTrue(ulh.add());
    }


    @Disabled("fails with NPE on getting service, needs more setup")
    @MethodSource("argumentsProvider")
    @ParameterizedTest(name = "{index}: type: {0}, bestand: {1}")
    public void testGetBaseUrl(String expected, String serviceUrl) {
        UserLayerHandler ulh = new UserLayerHandler(new AuditMessageObject(), entityManager, app, testAppLayer,
                "id > 0", "testlayer", "geoserverWorkspace", "geoserverStorename");

        GeoServerManager serverManager = new GeoServerManager(null, null, null, null, serviceUrl);
        assertEquals(expected, serverManager.getBaseUrl());
    }

}
