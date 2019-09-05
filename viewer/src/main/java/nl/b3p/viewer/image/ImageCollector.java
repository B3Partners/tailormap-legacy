/*
 * B3P Kaartenbalie is a OGC WMS/WFS proxy that adds functionality
 * for authentication/authorization, pricing and usage reporting.
 *
 * Copyright 2006, 2007, 2008 B3Partners BV
 * 
 * This file is part of B3P Kaartenbalie.
 * 
 * B3P Kaartenbalie is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * B3P Kaartenbalie is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with B3P Kaartenbalie.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.image;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URL;
import java.util.concurrent.Callable;
import javax.imageio.ImageIO;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * ImageCollector definition:
 */
public class ImageCollector implements Callable<ImageCollector> {

    private static final Log log = LogFactory.getLog(ImageCollector.class);
    private int maxResponseTime = 10000;
    public static final int NEW = 0;
    public static final int ACTIVE = 1;
    public static final int COMPLETED = 2;
    public static final int WARNING = 3;
    public static final int ERROR = 4;
    private int status = NEW;
    private String message = null;
    private BufferedImage bufferedImage;
    private String username = null;
    private String password = null;
    private CombineImageUrl combinedImageUrl = null;
    protected HttpClient client =null;
    private HttpServletRequest req;
    /*public ImageCollector(String url, int maxResponseTime) {
        this.url = url;
        this.maxResponseTime = maxResponseTime;
        this.setMessage("Still downloading...");
    }*/

    public ImageCollector(CombineImageUrl ciu, int maxResponseTime,HttpClient client, HttpServletRequest req) {
        this.combinedImageUrl=ciu;
        this.maxResponseTime = maxResponseTime;
        this.client = client;
        this.setMessage("Still downloading...");
        this.req = req;
    }

    public ImageCollector(CombineImageUrl ciu, int maxResponseTime, HttpClient client, String uname, String pw, HttpServletRequest req) {
        this(ciu, maxResponseTime, client,req);
        this.username = uname;
        this.password = pw;
    }

    public ImageCollector call() throws Exception {        
        status = ACTIVE;
        if ((getUrl() == null || getUrl().length() == 0) && getRealUrl() == null) {
            return this;
        }

        try {
            if (getRealUrl() != null) {
                setBufferedImage(ImageIO.read(getRealUrl()));
            } else {
                setBufferedImage(loadImage(getUrl(),getUsername(),getPassword()));                
            }
            setMessage("");
            setStatus(COMPLETED);
        } catch (Exception ex) {
            log.warn("error call image collector: ", ex);
            setStatus(ERROR);
        } 
        return this;
    }
    /**
     * Load the image with a http-get
     * @param url The url to the image
     * @param user username
     * @param pass password
     * @return The image
     * @throws IOException if any
     * @throws Exception if any
     */
    protected BufferedImage loadImage(String url, String user, String pass) throws IOException, Exception {
        HttpMethod method = null;
        try {            
            method = new GetMethod(url);
            if (req != null) {
                Cookie[] cookies = req.getCookies();
                String jsessionid = null;
                String key = "JSESSIONID";
                String ssojsessionid = null;
                String ssokey = "JSESSIONIDSSO";
                if (cookies != null) {
                    for (Cookie cookie : cookies) {
                        if (cookie != null && cookie.getName().equalsIgnoreCase(key)) {
                            jsessionid = cookie.getValue();
                            break;
                        }
                    }
                    for (Cookie cookie : cookies) {
                        if (cookie != null && cookie.getName().equalsIgnoreCase(ssokey)) {
                            ssojsessionid = cookie.getValue();
                            break;
                        }
                    }
                }else if(req.getParameterValues(key).length  == 1){
                    jsessionid = req.getParameterValues(key)[0];
                }
                if(jsessionid != null){
                    Header cookieHeader = new Header("Cookie", null);
                    cookieHeader.setValue(key + "=" + jsessionid);
                    method.setRequestHeader(cookieHeader);
                }
                if (ssojsessionid != null) {
                    Header cookieHeader = new Header("Cookie", null);
                    cookieHeader.setValue(ssokey + "=" + ssojsessionid);
                    method.setRequestHeader(cookieHeader);
                }
            }

            int statusCode = client.executeMethod(method);
            if (statusCode != HttpStatus.SC_OK) {
                throw new Exception("Error connecting to server with url " + url  + ". HTTP status code: " + statusCode);
            }

            String mime = method.getResponseHeader("Content-Type").getValue();
            return ImageTool.readImage(method, mime);
        }finally{
            if (method != null) {
                method.releaseConnection();
            }
        }
    }

    //<editor-fold defaultstate="collapsed" desc="Getters and setters">
    /**
     * @return the url
     */
    public String getUrl() {
        if (combinedImageUrl==null)
            return null;
        return getCombinedImageUrl().getUrl();
    }
    
    public URL getRealUrl(){ 
        if (combinedImageUrl==null)
            return null;
        return getCombinedImageUrl().getRealUrl();
    }
    
    public BufferedImage getBufferedImage() {
        return bufferedImage;
    }
    
    public void setBufferedImage(BufferedImage bufferedImage) {
        this.bufferedImage = bufferedImage;
    }
    
    public int getStatus() {
        return status;
    }
    
    public void setStatus(int status) {
        this.status = status;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public int getMaxResponseTime() {
        return maxResponseTime;
    }
    
    public void setMaxResponseTime(int maxResponseTime) {
        this.maxResponseTime = maxResponseTime;
    }

    public CombineImageUrl getCombinedImageUrl() {
        return combinedImageUrl;
    }

    public void setCombineImageUrl(CombineImageUrl ciu) {
        this.combinedImageUrl = ciu;
    }
    //</editor-fold>
}
