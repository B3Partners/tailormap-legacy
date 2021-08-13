package nl.tailormap.viewer_ng.controller;

import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.config.app.ConfiguredComponent;
import nl.tailormap.viewer.config.metadata.Metadata;
import nl.tailormap.viewer.helpers.AuthorizationsHelper;
import nl.tailormap.viewer.helpers.app.ApplicationHelper;
import nl.tailormap.viewer.util.SelectedContentCache;
import nl.tailormap.viewer_ng.repository.ApplicationRepository;
import nl.tailormap.viewer_ng.repository.MetadataRepository;
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
import javax.servlet.http.HttpServletRequest;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

@RequestMapping("/app")
@RestController
public class App {
    private static final Log LOG = LogFactory.getLog(App.class);

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private MetadataRepository metadataRepository;

    /**
     * required for selected content cache and user selection.
     */
    @Autowired
    private HttpServletRequest request;

    private String name;
    private String version;
    private Application application;

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
        this.name = name;
        this.version = version;
        LOG.debug("looking for application with name: " + name + ", and version: " + version);

        application = findApplication(name, version);
        final JSONObject response = new JSONObject();
        response.put("success", false);

        JSONObject obj = ApplicationHelper.toJSON(
                application,
                // TODO the selectedContentCache is tied into both the servlet API through using HttpServletRequest/ServletContext
                //      to get access to user/roles as well as reading context init params for the proxy and Persistence layer.
                request,
                false,
                false,
                false,
                false,
                entityManager,
                true,
                true
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
     * @param version user given version (can be {@code null})
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

    /**
     * find the default viewer (name and version) in this instance.
     */
    private void getDefaultViewer() {
        try {
            Metadata md = metadataRepository.findByConfigKey(Metadata.DEFAULT_APPLICATION);
            String appId = md.getConfigValue();
            Long id = Long.parseLong(appId);
            Application app = applicationRepository.getById(id);
            name = app.getName();
            version = app.getVersion();
        } catch (NullPointerException e) {
            name = "default";
            version = null;
        }
    }

    /**
     * find viewer type.
     * @return the viewer type
     * @deprecated Since we will only support 1 type in the future this should no longer be used
     */
    @Deprecated(since = "5.9.9")
    private String retrieveViewerType (){
        String type = "openlayers";
        String typePrefix = "viewer.mapcomponents";
        Set<ConfiguredComponent> components = application.getComponents();
        for (ConfiguredComponent component : components) {
            String className = component.getClassName();
            if(className.startsWith(typePrefix)){
                type = className.substring(typePrefix.length() +1).toLowerCase().replace("map", "");
                break;
            }
        }
        return type;
    }

    /**
     * Build a hash key to make the single component source for all components
     * cacheable but updateable when the roles of the user change. This is not
     * meant to be a secure hash, the roles of a user are not secret.
     *
     * @param request servlet request with user credential
     * @param em the entitymanahger to use for database access
     * @return a key to use as a cache identifyer
     */
    private static int getRolesCachekey(HttpServletRequest request, EntityManager em) {
        Set<String> roles = AuthorizationsHelper.getRoles(request, em);

        if(roles.isEmpty()) {
            return 0;
        }

        List<String> sorted = new ArrayList<>(roles);
        Collections.sort(sorted);

        int hash = 0;
        for(String role: sorted) {
            hash = hash ^ role.hashCode();
        }
        return hash;
    }
}
