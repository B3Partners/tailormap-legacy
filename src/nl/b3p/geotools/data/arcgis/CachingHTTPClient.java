/*
 * Copyright (C) 2012 B3Partners B.V.
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
package nl.b3p.geotools.data.arcgis;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.zip.GZIPInputStream;
import org.codehaus.httpcache4j.*;
import org.codehaus.httpcache4j.cache.HTTPCache;
import org.codehaus.httpcache4j.payload.InputStreamPayload;
import org.codehaus.httpcache4j.payload.Payload;
import org.geotools.data.Base64;
import org.geotools.data.ows.HTTPClient;
import org.geotools.data.ows.HTTPResponse;

/**
 * XXX: timeouts are not supported by HttpCache4j
 * @author Matthijs Laan
 */
public class CachingHTTPClient implements HTTPClient {
    private static final int DEFAULT_TIMEOUT = 30000;// 30 seconds
    
    private String user;
    private String password;
    private int connectTimeout = DEFAULT_TIMEOUT;
    private int readTimeout = DEFAULT_TIMEOUT;
    private boolean gzip;
    
    private HTTPCache cache;
    
    public CachingHTTPClient(HTTPCache cache) {
        this.cache = cache;
    }
    
    @Override
    public String getUser() {
        return user;
    }

    @Override
    public void setUser(String user) {
        this.user = user;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public int getConnectTimeout() {
        return connectTimeout;
    }

    @Override
    public void setConnectTimeout(int connectTimeout) {
        this.connectTimeout = connectTimeout;
    }

    @Override
    public int getReadTimeout() {
        return readTimeout;
    }

    @Override
    public void setReadTimeout(int readTimeout) {
        this.readTimeout = readTimeout;
    }

    public boolean isGzip() {
        return gzip;
    }

    public void setGzip(boolean gzip) {
        this.gzip = gzip;
    }

    public HTTPCache getCache() {
        return cache;
    }

    public void setCache(HTTPCache cache) {
        this.cache = cache;
    }
    
    @Override
    public HTTPResponse post(URL url, InputStream in, String postContentType) throws IOException {
        return request(url, HTTPMethod.POST, new InputStreamPayload(in, new MIMEType(postContentType)));
    }

    @Override
    public HTTPResponse get(URL url) throws IOException {
        return request(url, HTTPMethod.GET, null);
    }

    private HTTPResponse request(URL url, HTTPMethod method, Payload payload) throws IOException {

        Headers headers = new Headers();
        if(gzip) {
            headers = headers.set("Accept-Encoding", "gzip");
        }
        if (user != null && password != null) {
            String userpassword = user + ":" + password;
            String encodedAuthorization = Base64.encodeBytes(userpassword.getBytes("UTF-8"));
            headers = headers.set("Authorization", "Basic " + encodedAuthorization);
        }        

        HTTPRequest request;
        try {
            request = new HTTPRequest(url.toURI(), method, headers, null, null, null, null, null);
        } catch (URISyntaxException ex) {
            throw new IOException(ex);
        }
        org.codehaus.httpcache4j.HTTPResponse response = cache.execute(request);

        if(response.getStatus().isClientError() || response.getStatus().isServerError()) {
            response.consume();
            
            throw new IOException("HTTP error " + response.getStatus().getCode() + ": " +response.getStatusLine().getMessage());
        }

        return new CachingHTTPResponse(response);        
    }
    
    public static class CachingHTTPResponse implements HTTPResponse {

        org.codehaus.httpcache4j.HTTPResponse response;
        
        private InputStream responseStream;        
        
        public CachingHTTPResponse(org.codehaus.httpcache4j.HTTPResponse response) {
            this.response = response;            
        }
        
        @Override
        public void dispose() {
            if(responseStream != null) {
                try {
                    responseStream.close();
                } catch (IOException e) {
                    // ignore
                }
                responseStream = null;
            }
            if(response != null) {
                response.consume();
                response = null;
            }            
        }

        @Override
        public String getContentType() {
            return getResponseHeader(HeaderConstants.CONTENT_TYPE);
        }

        @Override
        public String getResponseHeader(String header) {
            return response.getHeaders().getFirstHeaderValue(header);
        }

        @Override
        public InputStream getResponseStream() throws IOException {
            
            if(responseStream == null) {
            
                if(!response.hasPayload()) {
                    responseStream = new ByteArrayInputStream(new byte[] {});
                } else {
                    InputStream inputStream = response.getPayload().getInputStream();

                    final String contentEncoding = getResponseHeader("Content-Encoding");

                    if(contentEncoding != null && contentEncoding.indexOf("gzip") != -1) {
                        inputStream = new GZIPInputStream(inputStream);
                    }
                    responseStream = inputStream;
                }
            }

            return responseStream;            
        }
    }
}
