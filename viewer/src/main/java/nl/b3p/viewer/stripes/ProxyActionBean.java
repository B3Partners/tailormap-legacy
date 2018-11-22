/*
 * Copyright (C) 2012-2017 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.commons.HttpClientConfigured;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.WMSService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpUriRequest;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.*;

/**
 *
 * @author Matthijs Laan
 * @author Meine Toonen
 */
@UrlBinding("/action/proxy/{mode}")
@StrictBinding
public class ProxyActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(ProxyActionBean.class);
    private ActionBeanContext context;
    
    @Validate
    private String url;
    
    @Validate
    private String mode;

    @Validate
    private boolean mustLogin;

    @Validate
    private Long serviceId;

    // <editor-fold desc="Getters and Setters" defaultstate="collapsed">
    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public boolean isMustLogin() {
        return mustLogin;
    }

    public void setMustLogin(boolean mustLogin) {
        this.mustLogin = mustLogin;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    // </editor-fold>

    @DefaultHandler
    public Resolution proxy() throws Exception {

        HttpServletRequest request = getContext().getRequest();
        
        // Session must exist
        HttpSession sess = request.getSession(false);
        if(sess == null || url == null) {
            return new ErrorResolution(HttpServletResponse.SC_FORBIDDEN, "Proxy requests forbidden");
        }
                
        if(WMSService.PROTOCOL.equals(mode)){
            return proxyWMS();
        }else{
            return new ErrorResolution(HttpServletResponse.SC_FORBIDDEN, "Proxy mode unacceptable");
        }
    }

    private Resolution proxyWMS() throws IOException, URISyntaxException{
        HttpServletRequest request = getContext().getRequest();
        
        if(!"GET".equals(request.getMethod())) {
            return new ErrorResolution(HttpServletResponse.SC_FORBIDDEN);
        }

        URL theUrl;
        EntityManager em = Stripersist.getEntityManager();
        try{
             theUrl = getRequestRL(em);
        }catch(IllegalAccessException ex){
            return new ErrorResolution(HttpServletResponse.SC_FORBIDDEN);
        }
   
        HttpClientConfigured client = getHttpClient(theUrl, em);
        HttpUriRequest req = getHttpRequest(theUrl);
        
        HttpResponse response;
        try {
            response = client.execute(req);

            int statusCode = response.getStatusLine().getStatusCode();
            if (statusCode >= 200 && statusCode < 300){
                final HttpResponse finalResponse = response;
                final HttpEntity entity = response.getEntity();

                return new StreamingResolution(entity.getContentType().getValue()) {
                    @Override
                    protected void stream(HttpServletResponse resp) throws IOException {
                        try {
                            entity.writeTo(resp.getOutputStream());
                        } finally {
                            if (finalResponse != null) {
                                client.close(finalResponse);
                            }
                            client.close();
                        }
                    }
                };
            } else {
                return new ErrorResolution(statusCode, "Service returned: " + response.getStatusLine().getReasonPhrase());
            }
        } catch(IOException e){
            log.error("Failed to write output:",e);
            return null;
        }
    }
    
    protected URL getRequestRL(EntityManager em) throws MalformedURLException, UnsupportedEncodingException, IllegalAccessException {
        URL theUrl = new URL(url);
        List<String> allowedParams = new ArrayList<>();
        allowedParams.add("VERSION");
        allowedParams.add("SERVICE");
        allowedParams.add("REQUEST");
        allowedParams.add("UPDATESEQUENCE");
        allowedParams.add("LAYERS");
        allowedParams.add("LAYER");
        allowedParams.add("STYLES");
        allowedParams.add("SRS");
        allowedParams.add("BBOX");
        allowedParams.add("FORMAT");
        allowedParams.add("WIDTH");
        allowedParams.add("HEIGHT");
        allowedParams.add("TRANSPARENT");
        allowedParams.add("BGCOLOR");
        allowedParams.add("EXCEPTIONS");
        allowedParams.add("TIME");
        allowedParams.add("ELEVATION");
        allowedParams.add("QUERY_LAYERS");
        allowedParams.add("X");
        allowedParams.add("Y");
        allowedParams.add("INFO_FORMAT");
        allowedParams.add("FEATURE_COUNT");
        allowedParams.add("SLD");
        allowedParams.add("SLD_BODY");
        //vendor
        allowedParams.add("MAP");
        // wmts
        allowedParams.add("TILEMATRIXSET");
        allowedParams.add("TILEMATRIX");
        allowedParams.add("TILEROW");
        allowedParams.add("TILECOL");
        allowedParams.add("STYLE");

        String query = theUrl.getQuery();
        Map paramsMap = new HashMap(getContext().getRequest().getParameterMap());
        StringBuilder paramsFromRequest = validateParams(paramsMap, allowedParams);

        if ((query == null || query.length() == 0) && paramsFromRequest.length() == 0) {
            // Must have parameters, so when none are existent, it is possibly a malicious use of this proxy.
            throw new IllegalAccessException();
        }
        //only WMS request param's allowed
        String[] params = (query != null ? query.split("&") : new String[0]);

        StringBuilder paramsFromUrl = validateParams(params, allowedParams);
        if (paramsFromUrl.length() > 0 && paramsFromUrl.charAt(paramsFromUrl.length() - 1) != '&') {
            paramsFromUrl.append('&');
        }
        paramsFromUrl.append(paramsFromRequest);

        int index = paramsFromUrl.charAt(0) == '&' ? 1 : 0;

        String paramString = paramsFromUrl.substring(index);
        GeoService gs = em.find(GeoService.class, serviceId);

        StringBuilder sbTheUrl = new StringBuilder(gs.getUrl());
        if (sbTheUrl.indexOf("?") < 0) {
            // sometimes we don't have a questionmark as part of the url, so add at end
            sbTheUrl.append('?');
        } else if ((sbTheUrl.charAt(sbTheUrl.length() - 1) != '&')) {
            sbTheUrl.append('&');
        }
        sbTheUrl.append(paramString);
        theUrl = new URL(sbTheUrl.toString());

        return theUrl;
    }
    
    protected HttpClientConfigured getHttpClient(URL theUrl, EntityManager em) {
        String username = null;
        String password = null;
        if (mustLogin && serviceId != null) {
            GeoService gs = em.find(GeoService.class, serviceId);
            Set<String> readers = gs.getReaders();
            Set<String> userroles = Authorizations.getRoles(context.getRequest(), em);

            boolean allowed = false;
            for (String userrole : userroles) {
                for (String reader : readers) {
                    if (userrole.equals(reader)) {
                        allowed = true;
                        break;
                    }
                }
            }
            if (allowed) {
                username = gs.getUsername();
                password = gs.getPassword();
            }
        }

        final HttpClientConfigured client = new HttpClientConfigured(username, password, theUrl.toString());
        return client;
    }

    protected HttpUriRequest getHttpRequest(URL url) throws URISyntaxException{
        return new HttpGet(url.toURI());
    }

    private StringBuilder validateParams (String [] params,List<String> allowedParams) throws UnsupportedEncodingException{
        StringBuilder sb = new StringBuilder();
        for (String param : params){
            String[] splitted = param.split("=");
            if (allowedParams.contains((splitted[0]).toUpperCase())){
                if(splitted.length > 1){
                    sb.append(param.split("=")[0]);
                    sb.append("=");
                    sb.append(param.split("=")[1]);
                }else{
                    sb.append(splitted[0]);
                }

                sb.append("&");
            } else {
                log.warn("Ignored unknown param " + param);
            }
        }
        if (sb.length() > 0 && sb.charAt(sb.length() - 1) == '&') {
            // remove trailing ampersand
            sb.setLength(sb.length() - 1);
        }
        return sb;
    }

    private StringBuilder validateParams (Map<String,String[]> params,List<String> allowedParams) throws UnsupportedEncodingException{
        StringBuilder sb = new StringBuilder();
        for (String param : params.keySet()){
            if (allowedParams.contains((param).toUpperCase())){
                sb.append(URLEncoder.encode(param, "UTF-8"));
                sb.append("=");
                String[] paramValue = params.get(param);
                for (int i = 0; i < paramValue.length; i++) {
                    String val = paramValue[i];
                    if(i > 0){
                        sb.append(",");
                    }
                    sb.append(URLEncoder.encode(val, "UTF-8"));
                }
                sb.append("&");
            }
        }
        return sb;
    }
}
