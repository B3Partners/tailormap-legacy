package nl.tailormap.viewer_ng.repository;

import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.util.LoggingTestUtil;
import nl.tailormap.viewer_ng.HSQLDBTestProfileJPAConfiguration;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;


@SpringBootTest(classes = {
        Application.class,
        HSQLDBTestProfileJPAConfiguration.class})
@ActiveProfiles("test")
@ExtendWith(SpringExtension.class)
//@Sql(value = "/import.sql",executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
public class ApplicationRepositoryIntegrationTest extends LoggingTestUtil {
    private static final Log LOG = LogFactory.getLog(ApplicationRepositoryIntegrationTest.class);

    @Autowired
    private ApplicationRepository applicationRepository;

    @Test
    public void it_should_findByName() {
        final Application a = applicationRepository.findByName("test");
        assertNotNull(a);
        assertEquals(1, a.getId());
        assertEquals("test", a.getName());
        assertEquals("1", a.getVersion());
    }

    @Test
    public void it_should_findByNameAndVersion() {
        final Application a = applicationRepository.findByNameAndVersion("test", "1");
        assertNotNull(a);
        assertEquals(1, a.getId());
        assertEquals("test", a.getName());
        assertEquals("1", a.getVersion());
    }
}
