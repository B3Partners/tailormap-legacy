package nl.tailormap.viewer_ng.repository;

import nl.tailormap.viewer.config.metadata.Metadata;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MetadataRepository extends JpaRepository<Metadata, Long> {

    Metadata findByConfigKey(String configKey);
}
