package nl.tailormap.viewer_ng.repository;

import nl.tailormap.viewer.config.app.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Application findByName(String name);

    Application findByNameAndVersion(String name, String version);
}

