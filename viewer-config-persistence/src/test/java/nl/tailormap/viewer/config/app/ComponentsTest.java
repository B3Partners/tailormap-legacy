package nl.tailormap.viewer.config.app;

import nl.tailormap.viewer.util.TestUtil;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class ComponentsTest extends TestUtil {
    @Test
    void testComponents() {
        Application app = entityManager.find(Application.class, applicationId);
        Set<ConfiguredComponent> appComponents = app.getComponents();
        assertNotNull(appComponents, "should not be null");
        assertEquals(1, appComponents.size(), "there must be one configured component");
        assertEquals("viewer.mapcomponents.OpenLayers5Map", appComponents.stream().findFirst().get().getClassName(), "should have found an OpenLayers5Map");
    }
}
