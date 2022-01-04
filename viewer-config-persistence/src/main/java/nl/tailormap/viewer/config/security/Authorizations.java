/*
 * Copyright (C) 2012-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config.security;

import nl.tailormap.viewer.config.forms.Form;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.persistence.EntityManager;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.Set;

/**
 * Utility class for authorization checking. Because of the inheritence of 
 * authorizations in tree structures, caches are used for efficient 
 * authorization checks.
 * <p>
 * There are authorizations on these objects:
 * <p>
 * <b>Geo services registry:</b>
 * <ul>
 * <li>Categories: currently disabled, not accessible via user interface</li>
 * <li>Layers of GeoServices: with inheritence, read/write authorizations</li>
 * </ul>
 * <p>
 * <b>Application:</b>
 * <ul>
 * <li>Levels: with inheritence, read authorization only</li>
 * <li>ApplicationLayers of Levels: inherits from Level <i>and</i> the referenced Layer, read/write authorizations</li>
 * <li>ConfiguredComponents</li>
 * </ul>
 * <p>
 * Authorizations are based on role names which are Group names.
 * <p>
 * <b>Inheritence and authorization rules:</b>
 * <ol>
 * <li>The empty set of authorized role names (EVERYBODY) means
 * everybody is authorized.</li>
 * <li>A non-empty set which is not equal to NOBODY means only users who
 * are members of the named Groups in the set are authorized</li>
 * <li>NOBODY is the set containing a single value which is null.</li>
 * <li>Inheritence processing starts at the root with everybody authorized.</li>
 * <li>When inheriting authorizations, the set of authorized roles can only be
 * reduced and not expanded. When a parent is authorized for roles A and B and
 * the set of authorized roles for a child is B and C, only B is authorized. When
 * the child is only authorized for role C, nobody will be authorized for the child.</li>
 * <li>Because of the default access for everybody, denying editing for example is done
 * by only authorizing write access to a group which has no members.</li>
 * </ol>
 * <b>Caching</b>
 * <ul>
 * <li>Layer authorizations are cached and invalidated when authorizations are 
 * changed for a GeoService by updating the GeoService.authorizationsModified timestamp.</li>
 * <li>Level and ApplicationLayer authorizations are cached and invalidated when
 * authorizations on a Level or ApplicationLayer are changed by updating the 
 * Application.authorizationsModified timestamp.</li>
 * <li>Because ApplicationLayer authorizations inherit from Layer authorizations,
 * Application caches are invalidated when any authorization on a Layer changes. 
 * </ul>
 * Although when authorizations are changed for an object only the cached object
 * and its inheriting objects could be refreshed in the cache, the entire set of
 * cached Layers of a GeoService or cached Levels and ApplicationLayers of an 
 * Application are invalidated because:
 * <ol>
 * <li>The viewer-admin webapp is isolated from the viewer webapp so it cannot 
 * access its application-scope cache without extra cross-webapp communication.</li>
 * <li>The viewer-admin webapp communicates with the viewer webapp to refresh
 * its cache by updating the above mentioned authorizationChanged database columns.</li>
 * <li>The cache for an Application is invalidated when the maximum authorization 
 * changed date (for all GeoServices) column is later than the Application authorization 
 * changed date.</li>
 * <li>These database columns are the simplest method to refresh the cache, and no
 * partial updates are required to maintain performance because authorizations are
 * modified infrequently.</li>
 * <li>Applying inherited authorizations is optimized by loading a tree in a single
 * query using hierarchical queries.</li>
 * </ol>
 * <p>
 * Group membership for a User is not cached and read from the database for
 * the first authorization check in a Transaction. So authorization changes by
 * an administrator should always be directly applied except authorization checks
 * which use HttpServletRequest.isUserInRole(), which is cached by the servlet
 * container. Currently only viewer-admin checks roles this way.
 * @author Matthijs Laan
 */
public class Authorizations {
    public static final String AUTHORIZATIONS_KEY = "authorizations";

    private static final Log log = LogFactory.getLog(Authorizations.class);

    public static boolean isFormAuthorized(Form f, Set<String> userRoles, EntityManager em) {
        Set<String> formRoles = f.getReaders();
        return !Collections.disjoint(userRoles, formRoles) || formRoles.isEmpty();
    }


    public static boolean isUserExpired(User u) {
        if(u == null){
            return false;
        }
        Date today;
        Date expire;
        try {
            DateFormat formatter = new SimpleDateFormat("dd-MM-yyyy");
            expire = formatter.parse(u.getDetails().getOrDefault("expiry_date",formatter.format(new Date())));
            today = formatter.parse(formatter.format(new Date()));
        } catch (ParseException e){
            log.error("Error parsing expiry_date for user: " + u.getUsername(), e);
            return  true;
        }
        return today.after(expire);
    }

    private Authorizations(){}
}
