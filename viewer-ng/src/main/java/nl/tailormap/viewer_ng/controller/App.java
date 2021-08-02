package nl.tailormap.viewer_ng.controller;

import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.helpers.app.ApplicationHelper;
import nl.tailormap.viewer.util.SelectedContentCache;
import nl.tailormap.viewer_ng.repository.ApplicationRepository;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@RequestMapping("/app")
@RestController
public class App {
    private static final Log LOG = LogFactory.getLog(App.class);

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private ApplicationRepository applicationRepository;

    /**
     * retrieve application json from persistence.
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
        LOG.debug("looking for application with name: " + name + ", and version: " + version);

        final Application application = findApplication(name, version);
        final JSONObject response = new JSONObject();
        response.put("success", false);

        JSONObject obj = ApplicationHelper.toJSON(
                application,
                // TODO the selectedContentCache is tied into both the servlet API through using HttpServletRequest/ServletContext
                //      to get access to user/roles as well as reading context init params for the proxy and Persistence layer.
                //      Basically it breaks everything Sprint Boot is about. What doesn't help is total lack of documentation.
                /* HttpServletRequest */ null,
                false, false, false, false, entityManager, true, true
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
     *
     * @param name    user given name
     * @param version user given version (may be {@code null})
     * @return found Application (or {@code null})
     */
    private Application findApplication(String name, String version) {
        Application application = null;
        if (name != null) {
            if (null != version) {
                application = applicationRepository.findByNameAndVersion(name, version);
            } else {
                application = applicationRepository.findByName(name);
            }

            if (null == application) {
                LOG.warn("No application found with name " + name + " and version " + version);
                String decodedName = URLDecoder.decode(name, StandardCharsets.UTF_8);
                if (!decodedName.equals(name)) {
                    return findApplication(decodedName, version);
                }
            }
        }
        return application;
    }

}
