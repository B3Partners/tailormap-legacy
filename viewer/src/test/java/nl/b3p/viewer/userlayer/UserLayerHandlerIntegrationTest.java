package nl.b3p.viewer.userlayer;

import nl.b3p.viewer.audit.AuditMessageObject;
import nl.b3p.viewer.util.TestUtil;
import org.junit.Test;

import static org.junit.Assert.assertTrue;

public class UserLayerHandlerIntegrationTest extends TestUtil {

    @Test
    public void testAdd() {
        UserLayerHandler ulh = new UserLayerHandler(new AuditMessageObject(), entityManager, app, testAppLayer,
                "id > 0", "testlayer", "geoserverWorkspace", "geoserverStorename");
        assertTrue(ulh.add());
    }
}
