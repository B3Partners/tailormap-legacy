package nl.b3p.viewer.helpers.services;

import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.UpdateResult;
import nl.b3p.web.WaitPageStatus;

import javax.persistence.EntityManager;
import java.util.Map;

public interface ServiceHelper {

    public GeoService loadServiceFromURL(String url, Map params, WaitPageStatus status, EntityManager em) throws Exception;
    public UpdateResult updateService(EntityManager em, GeoService service) throws Exception;
}
