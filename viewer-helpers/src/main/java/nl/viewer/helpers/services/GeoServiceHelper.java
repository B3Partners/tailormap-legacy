package nl.viewer.helpers.services;

import nl.viewer.config.services.GeoService;
import nl.viewer.config.services.UpdateResult;
import nl.web.WaitPageStatus;

import javax.persistence.EntityManager;
import java.util.Map;

public interface GeoServiceHelper {

    public GeoService loadServiceFromURL(String url, Map params, WaitPageStatus status, EntityManager em) throws Exception;
    public UpdateResult updateService(EntityManager em, GeoService service) throws Exception;
}
