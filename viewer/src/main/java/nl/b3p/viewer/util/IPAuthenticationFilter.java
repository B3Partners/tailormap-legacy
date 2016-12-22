/*
 * Copyright (C) 2016 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.util;

import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
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
        if(session.getAttribute(IP_CHECK) == null  && session.getAttribute(USER_CHECK) == null){
            
            String ipAddress = getIp(request);
            session.setAttribute(IP_CHECK, ipAddress);
            Stripersist.requestInit();
            
            EntityManager em = Stripersist.getEntityManager();
            List<User> users = em.createQuery("from User", User.class).getResultList();
            List<User> possibleUsers = new ArrayList<User>();
            
            for (User user : users) {
                if(checkValidIpAddress(request, user)){
                    possibleUsers.add(user);
                }
            }
            
            if(possibleUsers.isEmpty()){
                log.debug("No possible users found for ip");
            }else if( possibleUsers.size() == 1){
                u = possibleUsers.get(0);
                Hibernate.initialize(u.getGroups());
                session.setAttribute(IP_CHECK, ipAddress);
                session.setAttribute(USER_CHECK, u);
            }else{
                log.debug("Too many possible users found for ip.");
            }
            Stripersist.requestComplete();
        }else{
            u = (User) session.getAttribute(USER_CHECK);
        }
        final User user = u;

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
          
        Throwable problem = null;
        
        try {
            chain.doFilter(wrappedRequest, response);
        } catch (IOException | ServletException t) {
            log.error("Error processing chain", problem);
            throw t;
        }
    }

    /**
     * Return the filter configuration object for this filter.
     * @return 
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
    @Override
    public void destroy() {        
    }

    /**
     * Init method for this filter
     * @param filterConfig
     */
    @Override
    public void init(FilterConfig filterConfig) {        
        this.filterConfig = filterConfig;
    }

    /**
     * Return a String representation of this object.
     */
    @Override
    public String toString() {
        if (filterConfig == null) {
            return ("IPAuthenticationFilter()");
        }
        StringBuilder sb = new StringBuilder("IPAuthenticationFilter(");
        sb.append(filterConfig);
        sb.append(")");
        return (sb.toString());
        
    }
    
    private boolean checkValidIpAddress(HttpServletRequest request, User user) {

        String remoteAddress = getIp(request); 
        
        /* remoteaddress controleren tegen ip adressen van user.
         * Ip ranges mogen ook via een asterisk */
        for(String ipAddress: (Set<String>)user.getIps()) {

            log.debug("Controleren ip: " + ipAddress + " tegen: " + remoteAddress);

            if (ipAddress.contains("*")) {
                if (isRemoteAddressWithinIpRange(ipAddress, remoteAddress)) {
                    return true;
                }
            }

            if (ipAddress.equalsIgnoreCase(remoteAddress)
                    || ipAddress.equalsIgnoreCase("0.0.0.0")
                    || ipAddress.equalsIgnoreCase("::")) {
                return true;
            }
        }

        /* lokale verzoeken mogen ook */
        String localAddress = request.getLocalAddr();

        if (remoteAddress.equalsIgnoreCase(localAddress)) {
            log.debug("Toegang vanaf lokaal adres toegestaan: lokaal adres " + localAddress + ", remote adres: " + remoteAddress);
            return true;
        }

        log.info("IP adres " + remoteAddress + " niet toegestaan voor gebruiker " + user.getName());

        return false;
    }
    
    private String getIp(HttpServletRequest request){
        String remoteAddress = request.getRemoteAddr();
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null) {
            int endIndex = forwardedFor.contains(",") ? forwardedFor.indexOf(",") : forwardedFor.length();
            remoteAddress = forwardedFor.substring(0, endIndex);
        }
        return remoteAddress;
    }

    /* This function should only be called when ip contains an asterisk. This
     is the case when someone has given an ip to a user with an asterisk
     eq. 10.0.0.*  */
    protected boolean isRemoteAddressWithinIpRange(String ip, String remote) {
        if (ip == null || remote == null) {
            return false;
        }

        String[] arrIp = ip.split("\\.");
        String[] arrRemote = remote.split("\\.");

        if (arrIp == null || arrIp.length < 1 || arrRemote == null || arrRemote.length < 1) {
            return false;
        }

        /* kijken of het niet asteriks gedeelte overeenkomt met
         hetzelfde gedeelte uit remote address */
        for (int i = 0; i < arrIp.length; i++) {
            if (!arrIp[i].equalsIgnoreCase("*")) {
                if (!arrIp[i].equalsIgnoreCase(arrRemote[i])) {
                    return false;
                }
            }
        }

        return true;
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
}
