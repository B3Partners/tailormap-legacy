package nl.tailormap.viewer_ng.repository;

import nl.tailormap.viewer.config.metadata.Metadata;
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
        Metadata.class,
        HSQLDBTestProfileJPAConfiguration.class})
@ActiveProfiles("test")
@ExtendWith(SpringExtension.class)
public class MetadataRepositoryIntegrationTest {
    private static final Log LOG = LogFactory.getLog(MetadataRepositoryIntegrationTest.class);

    @Autowired
    private MetadataRepository metadataRepository;

    @Test
    public void it_should_findByConfigKey() {
        final Metadata m = metadataRepository.findByConfigKey(Metadata.DEFAULT_APPLICATION);
        assertNotNull(m, "we should have found something");
        assertEquals("1", m.getConfigValue(), "default application is not 1");
    }
}
