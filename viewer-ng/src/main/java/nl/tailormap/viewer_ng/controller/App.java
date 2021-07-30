package nl.tailormap.viewer_ng.controller;

import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.helpers.app.ApplicationHelper;
import nl.tailormap.viewer.util.SelectedContentCache;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@RequestMapping("/app")
@RestController
public class App {

    Logger logger = LoggerFactory.getLogger(App.class);

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * retrieve application json from persistence.
     *
     * <i>Copied from {@link nl.tailormap.viewer.stripes.ApplicationActionBean#retrieveAppConfigJSON()}.</i>
     *
     * @param name    user given name
     * @param version user given version (optional, may be null)
     * @return application JSON for frontend
     */
    @GetMapping(
            value = {"/{name}", "/{name}/v{version}"},
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public String retrieveAppConfigJSON(@PathVariable String name, @PathVariable(required = false) String version) {
        logger.debug("looking for application with name: " + name + ", and version: " + version);

        final Application application = findApplication(name, version);
        final JSONObject response = new JSONObject();
        response.put("success", false);
        JSONObject obj = ApplicationHelper.toJSON(
                application, /* TODO context.getRequest()*/ null, false, false,
                false, false, entityManager, true
        );
        JSONObject details = obj.optJSONObject("details");
        if (details != null) {
            details.remove(SelectedContentCache.DETAIL_CACHED_EXPANDED_SELECTED_CONTENT);
            details.remove(SelectedContentCache.DETAIL_CACHED_SELECTED_CONTENT);
        }
        response.put("config", obj.toString());
        response.put("success", true);

        return response.toString();
    }

    /**
     * recursive method to find application by name and version.
     * <i>Copied from {@link nl.tailormap.viewer.stripes.ApplicationActionBean}.</i>
     *
     * @param name    user given name
     * @param version user given version
     * @return found Application (or {@code null}
     */
    private Application findApplication(String name, String version) {
        if (name != null) {
            CriteriaBuilder cb = entityManager.getCriteriaBuilder();
            CriteriaQuery<Application> q = cb.createQuery(Application.class);
            Root<Application> root = q.from(Application.class);
            Predicate namePredicate = cb.equal(root.get("name"), name);
            Predicate versionPredicate = version != null
                    ? cb.equal(root.get("version"), version)
                    : cb.isNull(root.get("version"));
            q.where(cb.and(namePredicate, versionPredicate));
            try {
                return entityManager.createQuery(q).getSingleResult();
            } catch (NoResultException nre) {
                logger.warn("No application found with name " + name + " and version " + version, nre);
                String decodedName = URLDecoder.decode(name, StandardCharsets.UTF_8);
                if (!decodedName.equals(name)) {
                    return findApplication(decodedName, version);
                }
            }
        }
        return null;
    }

}
