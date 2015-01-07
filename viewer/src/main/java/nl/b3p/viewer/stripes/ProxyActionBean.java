/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
package nl.b3p.viewer.stripes;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.services.ArcIMSService;
import nl.b3p.viewer.config.services.WMSService;
import org.apache.commons.io.IOUtils;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/proxy/{mode}")
@StrictBinding
public class ProxyActionBean implements ActionBean {
    private ActionBeanContext context;
    
    @Validate
    private String url;
    
    @Validate
    private String mode;

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
    
    @DefaultHandler
    public Resolution proxy() throws Exception {

        HttpServletRequest request = getContext().getRequest();
        
        // Session must exist
        HttpSession sess = request.getSession(false);
        if(sess == null || url == null) {
            return new ErrorResolution(HttpServletResponse.SC_FORBIDDEN, "Proxy requests forbidden");
        }
        
        // TODO maybe add some other checks against illegal proxy use
        
        // We don't do a host check because the user can add custom services
        // using any URL. If the proxying viewer webapp is on a IP whitelist
        // and an attacker knows the URL of the IP-whitelist protected service 
        // this may allow the attacker to request maps from that service if that
        // service does not verify IP using the X-Forwarded-For header we send.
        if(ArcIMSService.PROTOCOL.equals(mode)) {
            return proxyArcIMS();
        } else if(WMSService.PROTOCOL.equals(mode)){
            return proxyWMS();
        }else{
            return new ErrorResolution(HttpServletResponse.SC_FORBIDDEN, "Proxy mode unacceptable");
        }
    }

    // Not public, proxy() performs proxy checks!
    private Resolution proxyArcIMS() throws Exception {

        HttpServletRequest request = getContext().getRequest();

        if(!"POST".equals(request.getMethod())) {
            return new ErrorResolution(HttpServletResponse.SC_FORBIDDEN);
        }   
        
        Map params = new HashMap(getContext().getRequest().getParameterMap());
        // Only allow these parameters in proxy request
        params.keySet().retainAll(Arrays.asList(
                "ClientVersion",
                "Encode",
                "Form",
                "ServiceName"
        ));
        URL theUrl = new URL(url);
        // Must not allow file / jar etc protocols, only HTTP:
        String path = theUrl.getPath();
        for(Map.Entry<String,String[]> param: (Set<Map.Entry<String,String[]>>)params.entrySet()) {
            if(path.length() == theUrl.getPath().length()) {
                path += "?";
            } else {
                path += "&";
            }
            path += URLEncoder.encode(param.getKey(), "UTF-8") + "=" + URLEncoder.encode(param.getValue()[0], "UTF-8");
        }
        theUrl = new URL("http", theUrl.getHost(), theUrl.getPort(), path);
        
        // TODO logging for inspecting malicious proxy use
        
        ByteArrayOutputStream post = new ByteArrayOutputStream();
        IOUtils.copy(request.getInputStream(), post);
        
        // This check makes some assumptions on how browsers serialize XML
        // created by OpenLayers' ArcXML.js write() function (whitespace etc.),
        // but all major browsers pass this check
        if(!post.toString("US-ASCII").startsWith("<ARCXML version=\"1.1\"><REQUEST><GET_IMAGE")) {
            return new ErrorResolution(HttpServletResponse.SC_FORBIDDEN);
        }

        final HttpURLConnection connection = (HttpURLConnection)theUrl.openConnection();
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.setAllowUserInteraction(false);
        connection.setRequestProperty("X-Forwarded-For", request.getRemoteAddr());
        
        connection.connect();
        try { 
            IOUtils.copy(new ByteArrayInputStream(post.toByteArray()), connection.getOutputStream());
        } finally {
            connection.getOutputStream().flush();
            connection.getOutputStream().close();        
        }
        
        return new StreamingResolution(connection.getContentType()) {
            @Override
            protected void stream(HttpServletResponse response) throws IOException {
                try {
                    IOUtils.copy(connection.getInputStream(), response.getOutputStream());
                } finally {
                    connection.disconnect();
                }
                
            }
        };
    }  
    
    private Resolution proxyWMS() throws IOException{
        
        HttpServletRequest request = getContext().getRequest();
        
        if(!"GET".equals(request.getMethod())) {
            return new ErrorResolution(HttpServletResponse.SC_FORBIDDEN);
        }

        List<String> allowedParams = new ArrayList<String>();
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
        
        URL theUrl = new URL(url);
        
        String query = theUrl.getQuery();
        //only WMS request param's allowed
        String[] params = query.split("&");
        
        StringBuilder sb = validateParams(params, allowedParams);
        StringBuilder sb2 = validateParams(request.getParameterMap(),allowedParams);
        sb.append(sb2);
        int index = sb.charAt(0) == '&' ? 1 : 0;
        
        String paramString = sb.substring(index);

        theUrl = new URL("http",theUrl.getHost(),theUrl.getPort(),theUrl.getPath()+"?"+paramString);

        //TODO: Check if response is a getFeatureInfo response.
        final URLConnection connection = theUrl.openConnection();
        return new StreamingResolution(connection.getContentType()) {
            @Override
            protected void stream(HttpServletResponse response) throws IOException {
                IOUtils.copy(connection.getInputStream(), response.getOutputStream());                
            }
        };
    }

    private StringBuilder validateParams (String [] params,List<String> allowedParams){
        StringBuilder sb = new StringBuilder();
        for (String param : params){
            if (allowedParams.contains((param.split("=")[0]).toUpperCase())){
                sb.append(param);
                sb.append("&");
            }
        }
        return sb;
    }

    private StringBuilder validateParams (Map<String,String[]> params,List<String> allowedParams){
        StringBuilder sb = new StringBuilder();
        for (String param : params.keySet()){
            if (allowedParams.contains((param).toUpperCase())){
                sb.append(param);
                sb.append("=");
                String[] paramValue = params.get(param);
                for (int i = 0; i < paramValue.length; i++) {
                    String val = paramValue[i];
                    if(i > 0){
                        sb.append(",");
                    }
                    sb.append(val);
                }
                sb.append("&");
            }
        }
        return sb;
    }
}
