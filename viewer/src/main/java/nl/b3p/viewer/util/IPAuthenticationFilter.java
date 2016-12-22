/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.util;

import java.io.IOException;
import java.security.Principal;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.persistence.EntityManager;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;
import javax.servlet.http.HttpSession;
import nl.b3p.viewer.config.security.User;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.Hibernate;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class IPAuthenticationFilter implements Filter {
    
    private static final Log log = LogFactory.getLog(IPAuthenticationFilter.class);

    // The filter configuration object we are associated with.  If
    // this value is null, this filter instance is not currently
    // configured. 
    private FilterConfig filterConfig = null;
    
    private static final String IP_CHECK = IPAuthenticationFilter.class + "_IP_CHECK";
    private static final String USER_CHECK = IPAuthenticationFilter.class + "_USER_CHECK";
    
    
    public IPAuthenticationFilter() {
    }    
    
    /**
     *
     * @param r The servlet request we are processing
     * @param response The servlet response we are creating
     * @param chain The filter chain we are processing
     *
     * @exception IOException if an input/output error occurs
     * @exception ServletException if a servlet error occurs
     */
    public void doFilter(ServletRequest r, ServletResponse response,
            FilterChain chain)
            throws IOException, ServletException {
        
        log.debug("IPAuthenticationFilter:doFilter()");
        HttpServletRequest request = (HttpServletRequest) r;
        HttpSession session = request.getSession();
        User u = null;
        if(session.getAttribute(IP_CHECK) == null ||session.getAttribute(USER_CHECK) == null){
            String ipAddress = request.getHeader("X-FORWARDED-FOR");
            if (ipAddress == null) {
                ipAddress = request.getRemoteAddr();
            }
            Stripersist.requestInit();
            
            EntityManager em = Stripersist.getEntityManager();
           // em.createQuery("select u from user u join u.ips where p = :provincie order by r.naam").setParameter("provincie",p).getResultList();
            List<User> obj = em.createQuery("from User where :ip in elements(ips)", User.class).setParameter("ip", ipAddress).getResultList();
            if(obj.size() == 0){
                
            }else if( obj.size() == 1){
                u = obj.get(0);
                Hibernate.initialize(u.getGroups());
                session.setAttribute(IP_CHECK, ipAddress);
                session.setAttribute(USER_CHECK, u);
            }else{
                
            }
            Stripersist.requestComplete();
            
        }else{
            u = (User) session.getAttribute(USER_CHECK);
        }
        final User user = u;
        // Create wrappers for the request and response objects.
        // Using these, you can extend the capabilities of the
        // request and response, for example, allow setting parameters
        // on the request before sending the request to the rest of the filter chain,
        // or keep track of the cookies that are set on the response.
        //
        // Caveat: some servers do not handle wrappers very well for forward or
        // include requests.
        RequestWrapper wrappedRequest = new RequestWrapper((HttpServletRequest) request){
            @Override
            public Principal getUserPrincipal() {
                if(user != null){
                    return user;
                }else{
                    return super.getUserPrincipal();
                }
            }

            @Override
            public String getRemoteUser() {
                if(user != null){
                    return user.getName();
                }else{
                    return super.getRemoteUser();
                }
            }

            @Override
            public boolean isUserInRole(String role) {
                if(user != null){
                    return user.checkRole(role);
                }else{
                    return super.isUserInRole(role);
                }
            }
        };
        ResponseWrapper wrappedResponse = new ResponseWrapper((HttpServletResponse) response);
        
          
        Throwable problem = null;
        
        try {
            chain.doFilter(wrappedRequest, wrappedResponse);
        } catch (Throwable t) {
            // If an exception is thrown somewhere down the filter chain,
            // we still want to execute our after processing, and then
            // rethrow the problem after that.
            problem = t;
            t.printStackTrace();
        }
      
        // If there was a problem, we want to rethrow it if it is
        // a known type, otherwise log it.
        if (problem != null) {
            if (problem instanceof ServletException) {
                throw (ServletException) problem;
            }
            if (problem instanceof IOException) {
                throw (IOException) problem;
            }
            log.error("Error processing chain", problem);
        }
    }

    /**
     * Return the filter configuration object for this filter.
     */
    public FilterConfig getFilterConfig() {
        return (this.filterConfig);
    }

    /**
     * Set the filter configuration object for this filter.
     *
     * @param filterConfig The filter configuration object
     */
    public void setFilterConfig(FilterConfig filterConfig) {
        this.filterConfig = filterConfig;
    }

    /**
     * Destroy method for this filter
     */
    public void destroy() {        
    }

    /**
     * Init method for this filter
     */
    public void init(FilterConfig filterConfig) {        
        this.filterConfig = filterConfig;
        if (filterConfig != null) {
            log.debug("IPAuthenticationFilter: Initializing filter");
        }
    }

    /**
     * Return a String representation of this object.
     */
    @Override
    public String toString() {
        if (filterConfig == null) {
            return ("IPAuthenticationFilter()");
        }
        StringBuffer sb = new StringBuffer("IPAuthenticationFilter(");
        sb.append(filterConfig);
        sb.append(")");
        return (sb.toString());
        
    }
    
    /**
     * This request wrapper class extends the support class
     * HttpServletRequestWrapper, which implements all the methods in the
     * HttpServletRequest interface, as delegations to the wrapped request. You
     * only need to override the methods that you need to change. You can get
     * access to the wrapped request using the method getRequest()
     */
    class RequestWrapper extends HttpServletRequestWrapper {
        
        public RequestWrapper(HttpServletRequest request) {
            super(request);
        }

        // You might, for example, wish to add a setParameter() method. To do this
        // you must also override the getParameter, getParameterValues, getParameterMap,
        // and getParameterNames methods.
        protected Hashtable localParams = null;
        
        public void setParameter(String name, String[] values) {
            
            if (localParams == null) {
                localParams = new Hashtable();
                // Copy the parameters from the underlying request.
                Map wrappedParams = getRequest().getParameterMap();
                Set keySet = wrappedParams.keySet();
                for (Iterator it = keySet.iterator(); it.hasNext();) {
                    Object key = it.next();
                    Object value = wrappedParams.get(key);
                    localParams.put(key, value);
                }
            }
            localParams.put(name, values);
        }
        
        @Override
        public String getParameter(String name) {
            if (localParams == null) {
                return getRequest().getParameter(name);
            }
            Object val = localParams.get(name);
            if (val instanceof String) {
                return (String) val;
            }
            if (val instanceof String[]) {
                String[] values = (String[]) val;
                return values[0];
            }
            return (val == null ? null : val.toString());
        }
        
        @Override
        public String[] getParameterValues(String name) {
            if (localParams == null) {
                return getRequest().getParameterValues(name);
            }
            return (String[]) localParams.get(name);
        }
        
        @Override
        public Enumeration getParameterNames() {
            if (localParams == null) {
                return getRequest().getParameterNames();
            }
            return localParams.keys();
        }        
        
        @Override
        public Map getParameterMap() {
            if (localParams == null) {
                return getRequest().getParameterMap();
            }
            return localParams;
        }
    }

    /**
     * This response wrapper class extends the support class
     * HttpServletResponseWrapper, which implements all the methods in the
     * HttpServletResponse interface, as delegations to the wrapped response.
     * You only need to override the methods that you need to change. You can
     * get access to the wrapped response using the method getResponse()
     */
    class ResponseWrapper extends HttpServletResponseWrapper {
        
        public ResponseWrapper(HttpServletResponse response) {
            super(response);            
        }

        // You might, for example, wish to know what cookies were set on the response
        // as it went throught the filter chain. Since HttpServletRequest doesn't
        // have a get cookies method, we will need to store them locally as they
        // are being set.
        /*
	protected Vector cookies = null;
	
	// Create a new method that doesn't exist in HttpServletResponse
	public Enumeration getCookies() {
		if (cookies == null)
		    cookies = new Vector();
		return cookies.elements();
	}
	
	// Override this method from HttpServletResponse to keep track
	// of cookies locally as well as in the wrapped response.
	public void addCookie (Cookie cookie) {
		if (cookies == null)
		    cookies = new Vector();
		cookies.add(cookie);
		((HttpServletResponse)getResponse()).addCookie(cookie);
	}
         */
    }
    
}
