package nl.tailormap.viewer_ng.repository;

import nl.tailormap.viewer.config.app.Application;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ApplicationRepository extends JpaRepository<Application, Long> {
}

