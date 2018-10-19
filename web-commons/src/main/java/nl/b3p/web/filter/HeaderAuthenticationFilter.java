package nl.b3p.web.filter;

import java.io.IOException;
import java.security.Principal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * Servlet filter which wraps the request to return getUserPrincipal(),
 * getRemoteUser(), and isUserInRole() results according to HTTP headers we
 * trust meant to be sent by Apache modules like mod_auth_mellon and not by
 * end users (the webserver MUST be configured correctly to avoid security
 * problems).
 * <p>
 * <b>WARNING: pick a random header name prefix for each installation so that
 * users cannot send their own headers when connecting directly to the Tomcat
 * HTTP connector if that is enabled and not firewalled.</b>
 * <p>
 * Note that if you only want to use SAML authentication, you can use Apache
 * authentication by setting the tomcatAuthentication attribute on the AJP
 * Connector to false in server.xml, and for authorization either use Apache
 * (isUserInRole() always returns false) or use a Realm which recognizes the IdP
 * usernames for roles and set tomcatAuthorization to true on the Connector to
 * use isUserInRole().
 * </p>
 * <p>
 * This filter trusts HTTP request headers, which must be set by Apache on the
 * configured authPath. Pick a random header prefix to prevent a user from
 * maliciously providing the headers directly to the HTTP connector.
 * </p>
 * <h2>Usage with mod_auth_mellon for SAML support</h2>
 * Configure Mellon as follows:
 * <pre>
 * &lt;Location /&gt;
 *     MellonEndpointPath "/mellon"
 *     MellonSPPrivateKeyFile mellon/sp-private-key.pem
 *     MellonSPCertFile mellon/sp-cert.pem
 *     MellonIdpMetadataFile mellon/idp-metadata-here.xml
 *
 *     # When using localhost for testing
 *     #MellonSubjectConfirmationDataAddressCheck off
 * &lt;/Location&gt;
 *
 * &lt;Location /[contextPath]/auth/saml&gt;
 *     Require valid-user
 *     AuthType "Mellon"
 *     MellonEnable auth
 *
 *     # For tomcatAuthentication=false, set the username to this attribute's oid
 *     MellonUser "urn:oid:0.9.2342.19200300.100.1.1"
 *
 *     # Optional: if you want the Mellon Session XML to be available, enable
 *     # these options and also configure the AJP connector in Tomcat/conf/server.xml
 *     # with packetSize:
 *     # &lt;Connector port="8009" protocol="AJP/1.3" redirectPort="8443" packetSize="65536"/&gt;
 *     #MellonSessionDump On
 *     #RequestHeader set [prefix]_SESSION "%{MELLON_SESSION}e"
 *     # Set this outside the &lt;Location&gt; block
 *     #ProxyIOBufferSize 65536
 *
 *     # Look at the base64 decoded MELLON_SESSION (using printenv.pl or similar)
 *     # to see the oids of the returned attributes. This oid is for uid
 *     MellonSetEnvNoPrefix "MELLON_uid" "urn:oid:0.9.2342.19200300.100.1.1"
 *     RequestHeader set [prefix]_uid "%{MELLON_uid}e"
 *
 *     # oid for FriendlyName="eduPersonAffiliation"
 *     # Supported in newer Mellon versions:
 *     #MellonMergeEnvVars On
 *     MellonSetEnvNoPrefix "MELLON_roles" "urn:oid:1.3.6.1.4.1.5923.1.1.1.1"
 *     RequestHeader set [prefix]_roles "%{MELLON_roles}e"
 *     # If merging is not supported, use multiple request headers, for a maximum
 *     # number of groups, add more to increase maximum
 *     RequestHeader set [prefix]_roles_0 "%{MELLON_roles_0}e"
 *     RequestHeader set [prefix]_roles_1 "%{MELLON_roles_1}e"
 *     RequestHeader set [prefix]_roles_2 "%{MELLON_roles_2}e"
 *     RequestHeader set [prefix]_roles_3 "%{MELLON_roles_3}e"
 *     RequestHeader set [prefix]_roles_4 "%{MELLON_roles_4}e"
 *     RequestHeader set [prefix]_roles_5 "%{MELLON_roles_5}e"
 *  &lt;/Location&gt;
 * </pre>
 * <h2>Servlet filter configuration</h2>
 * <p>Configure with a filter-mapping for the entire webapp with the init parameters
 * as described in the JavaDoc.</p>
 * <p>To support custom deployments overriding parameters without having to overwrite
 * web.xml (which needs to be kept up-to-date with new versions), context parameters
 * can also be set to override filter init-params by prefixing them with headerAuth and
 * uppercasing the first character of the parameter name, so to set the "prefix"
 * parameter using a context parameter, use "headerAuthPrefix" as the parameter name.
 * </p>
 * <h2>Logging out</h2>
 * Not currently supported. To enable logout by IdP calling the SingleLogoutService
 * binding, we would need to enable MellonEnable info for all URL's and check if
 * the userHeader is still there when the principal is on the session attribute.
 * SP initiated logout also not supported, would need extra configuration of the
 * SingleLogoutService binding in the IdP metadata.
 *
 * @author Matthijs Laan
 */
public class HeaderAuthenticationFilter implements Filter {

    private static final Log log = LogFactory.getLog(HeaderAuthenticationFilter.class);

    private FilterConfig filterConfig = null;

    /**
     * Prefix for context global parameters which can be set to override filter
     * init params for easier deployments without overwriting web.xml.
     */
    private static final String CONTEXT_PARAM_PREFIX = "headerAuth";

    /**
     * Random header prefix which must be kept secret and changed on each
     * deployment. If this is not changed from the default, this filter is not
     * enabled.
     */
    public static final String PARAM_HEADER_PREFIX = "prefix";

    /**
     * userHeader init-param: the request header that contains
     * the username, default _uid.
     */
    public static final String PARAM_USER_HEADER = "userHeader";

    /**
     * authPath init-param: path after the contextPath for which Apache is
     * configured to send the authentication/authorization headers which we
     * trust - must override any headers sent by the client, default
     * &quot;/auth/saml&quot;. If the application directly redirects to this
     * path without redirecting to authInitPath first, redirects to the
     * contextPath after succesful authentication.
     */
    public static final String PARAM_AUTH_PATH = "authPath";

    /**
     * authInitPath init-param: path which will save a returnTo parameter or
     * Referer before redirecting to the authPath, default
     * &quot;/auth/init&quot;. The returnTo parameter is saved in the session
     * and redirected to after successful login. Only relative URL's supported,
     * otherwise redirects to the contextPath. When no returnTo parameter is
     * present the Referer header is saved and redirected to after successful
     * login.
     */
    public static final String PARAM_AUTH_INIT_PATH = "authInitPath";

    /**
     * rolesHeader init-param: header which contains the roles, defaults to
     * &quot;_roles&quot;.
     */
    public static final String PARAM_ROLES_HEADER = "rolesHeader";

    /**
     * rolesSeparator init-param: the separator to split the roles header with,
     * defaults to &quot;;&quot;. Use with MellonMergeEnvVars.
     */
    public static final String PARAM_ROLES_SEPARATOR = "rolesSeparator";

    /**
     * useRolesNSuffix init-param: set to &quot;true&quot; to use an index
     * suffix for unmerged role headers instead of splitting on a separator,
     * defaults to false. Use with older Mellon version not supporting
     * MellonMergeEnvVars. When rolesHeader is &quot;roles&quot;, searches for
     * roles_0, roles_1, roles_2, etc. Will stop when header contains
     * &quot;(null)&quot; as sent by Apache when variable is null or next _N
     * header is not found.
     */
    public static final String PARAM_USE_ROLES_NSUFFIX = "useRolesNSuffix";

    /**
     * commonRole init-param: role to always add to users authenticated by this
     * filter.
     */
    public static final String PARAM_COMMON_ROLE = "commonRole";

    /**
     * saveExtraHeaders init-param: extra headers to save sent to authPath, such
     * as [prefix]_SESSION, separated by &quot;,&quot;. Retrieve using
     * getExtraAuthHeaders().
     */
    public static final String PARAM_SAVE_EXTRA_HEADERS = "saveExtraHeaders";

    private static final String ATTR_RETURN_TO = HeaderAuthenticationFilter.class.getName() + ".RETURN_TO";
    private static final String ATTR_PRINCIPAL = HeaderAuthenticationFilter.class.getName() + ".PRINCIPAL";
    private static final String ATTR_EXTRA_HEADERS = HeaderAuthenticationFilter.class.getName() + ".EXTRA_HEADERS";

    private String headerPrefix;
    private String userHeader;
    private String authPath;
    private String authInitPath;
    private String rolesHeader;
    private String rolesSeparator;
    private boolean useRolesNSuffix;
    private String commonRole;
    private String saveExtraHeaders;
    private boolean enabled;

    public HeaderAuthenticationFilter() {
    }

    /**
     * Get a filter init-parameter which can be overriden by a context parameter
     * when prefixed with "headerAuth".
     */
    private String getInitParameter(String paramName) {
        String contextParamName = CONTEXT_PARAM_PREFIX + StringUtils.capitalize(paramName);
        String value = filterConfig.getServletContext().getInitParameter(contextParamName);
        if(value == null) {
            value = filterConfig.getInitParameter(paramName);
            log.debug("Using filter init parameter " + paramName + ": " + (PARAM_HEADER_PREFIX.equals(paramName) ? "<hidden for security reasons>" : value));
        } else {
            log.debug("Using context parameter " + contextParamName + ": " + (PARAM_HEADER_PREFIX.equals(paramName) ? "<hidden for security reasons>" : value));
        }
        return value;
    }

    @Override
    public void init(FilterConfig filterConfig) {
        this.filterConfig = filterConfig;

        this.headerPrefix = ObjectUtils.firstNonNull(getInitParameter(PARAM_HEADER_PREFIX), "[disabled]");
        this.enabled = !"[disabled]".equals(this.headerPrefix);
        this.userHeader = this.headerPrefix + ObjectUtils.firstNonNull(getInitParameter(PARAM_USER_HEADER), "_uid");
        this.authPath = ObjectUtils.firstNonNull(getInitParameter(PARAM_AUTH_PATH), "auth/saml");
        this.authInitPath = ObjectUtils.firstNonNull(getInitParameter(PARAM_AUTH_PATH), "auth/init");
        this.rolesHeader = this.headerPrefix + ObjectUtils.firstNonNull(getInitParameter(PARAM_ROLES_HEADER), "_roles");
        this.rolesSeparator = ObjectUtils.firstNonNull(getInitParameter(PARAM_ROLES_SEPARATOR), ";");
        this.useRolesNSuffix = "true".equals(getInitParameter(PARAM_USE_ROLES_NSUFFIX));
        this.commonRole = getInitParameter(PARAM_COMMON_ROLE);
        this.saveExtraHeaders = getInitParameter(PARAM_SAVE_EXTRA_HEADERS);
        log.info("Initialized - " + toString());
    }

    @Override
    public void destroy() {
    }

    @Override
    public String toString() {
        return ToStringBuilder.reflectionToString(this);
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain) throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest)servletRequest;
        HttpServletResponse response = (HttpServletResponse)servletResponse;
        HttpSession session = request.getSession();

        if(!enabled) {
            chain.doFilter(request, response);
            return;
        }

        if(request.getUserPrincipal() != null) {
            if(request.getRequestURI().equals(request.getContextPath() + "/" + authInitPath)) {
                log.warn("Login requested but already authenticated by servlet container!");
                session.invalidate();
            }

            // Do nothing when using tomcatAuthentication=false or authenticated
            // by other means such as standard servlet login-config
            if(log.isTraceEnabled()) {
                log.trace("HeaderAuthenticationFilter: already authenticated as user " + request.getRemoteUser() + " (principal " + request.getUserPrincipal() + "), passing through " + request.getRequestURI());
            }

            chain.doFilter(request, servletResponse);
            return;
        }

        if(request.getRequestURI().equals(request.getContextPath() + "/" + authInitPath)) {
            // Save the returnTo parameter or the Referer header, only accept
            // relative path for returnTo parameter
            String returnTo = request.getParameter("returnTo");
            String msg;
            if(returnTo == null || !returnTo.startsWith(request.getContextPath())) {
                // Try Referer header
                returnTo = request.getHeader("Referer");
                if(returnTo != null) {
                    msg = ", redirecting to this Referer after successful login: " + returnTo;
                } else {
                    msg = ", no relative returnTo parameter or Referer header, redirecting to contextPath after succesful login";
                }
            } else {
                msg = ", redirecting to returnTo parameter after successful login: " + returnTo;
            }
            session.setAttribute(ATTR_RETURN_TO, returnTo);

            log.info("Redirecting to authPath " + authPath + msg);
            response.sendRedirect(request.getContextPath() + "/" + authPath);
            return;
        }

        if(request.getRequestURI().equals(request.getContextPath() + "/" + authPath)) {
            // Must be protected by Apache auth module!

            // Check for user header
            String user = request.getHeader(userHeader);
            if(user == null) {
                log.warn("No user header returned, Apache should have denied access!");
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Not authorized by identity provider");
                return;
            }

            Set<String> roles = new HashSet<>();
            if(commonRole != null) {
                roles.add(commonRole);
            }
            if(useRolesNSuffix) {
                int i = 0;
                while(true) {
                    String role = request.getHeader(rolesHeader + "_" + i++);
                    if(role == null || "(null)".equals(role)) {
                        break;
                    }
                    roles.add(role);
                }
            } else {
                String r = request.getHeader(rolesHeader);
                if(r != null) {
                    roles.addAll(Arrays.asList(r.split(Pattern.quote(rolesSeparator))));
                }
            }

            log.info("Authenticated user from header [prefix]" + userHeader.substring(this.headerPrefix.length()) + ": " + user + ", roles: " + roles);
            session.setAttribute(ATTR_PRINCIPAL, new HeaderAuthenticatedPrincipal(user, roles));

            if(saveExtraHeaders != null) {
                Map<String,String> extraHeaders = new HashMap();
                for(String h: saveExtraHeaders.split(",")) {
                    extraHeaders.put(h, request.getHeader(this.headerPrefix + h));
                }
                session.setAttribute(ATTR_EXTRA_HEADERS, extraHeaders);
                log.info("Extra headers saved from auth request: " + extraHeaders);
            }

            String returnTo = (String)session.getAttribute(ATTR_RETURN_TO);
            if(returnTo != null) {
                log.info("Redirecting after successful login to: " + returnTo);
                response.sendRedirect(returnTo);
            } else {
                log.info("Redirecting to default page after successful login");
                response.sendRedirect(request.getContextPath());
            }
            return;
        }

        final HeaderAuthenticatedPrincipal principal = (HeaderAuthenticatedPrincipal)session.getAttribute(ATTR_PRINCIPAL);
        if(principal != null) {
            if(log.isTraceEnabled()) {
                log.trace("Chaining authenticated request for user " + principal.getName() + " for URL " + request.getRequestURL());
            }
            chain.doFilter(new HttpServletRequestWrapper(request) {
                @Override
                public String getRemoteUser() {
                    return principal.getName();
                }

                @Override
                public Principal getUserPrincipal() {
                    return principal;
                }

                @Override
                public boolean isUserInRole(String role) {
                    return principal.isUserInRole(role);
                }
            }, response);
        } else {
            if(log.isTraceEnabled()) {
                log.trace("Chaining unauthenticated request for URL " + request.getRequestURL());
            }
            chain.doFilter(request, response);
        }
    }

    public static Map<String, String> getExtraHeaders(HttpServletRequest request) {
        return (Map<String, String>)request.getSession().getAttribute(ATTR_EXTRA_HEADERS);
    }

    private class HeaderAuthenticatedPrincipal implements Principal {
        private final String name;
        private final Set<String> roles;

        public HeaderAuthenticatedPrincipal(String name, Set<String> roles) {
            this.name = name;
            this.roles = roles;
        }

        @Override
        public String getName() {
            return name;
        }

        public boolean isUserInRole(String r) {
            return roles.contains(r);
        }

        public Set<String> getRoles() {
            return roles;
        }

        public void setRoles(Set<String> roles) {
            throw new UnsupportedOperationException();
        }
    }
}
