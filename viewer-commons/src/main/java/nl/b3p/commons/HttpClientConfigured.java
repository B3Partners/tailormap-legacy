package nl.b3p.commons;

import java.io.IOException;
import java.net.ProxySelector;
import java.util.Arrays;
import javax.net.ssl.SSLContext;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.AuthSchemes;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLContexts;
import org.apache.http.conn.ssl.TrustSelfSignedStrategy;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.client.LaxRedirectStrategy;
import org.apache.http.impl.conn.SystemDefaultRoutePlanner;

/**
 * bundle of objects needed to do httpclient call
 *
 * @author Chris
 * @author Meine Toonen
 */
public class HttpClientConfigured {
    private static final Log log = LogFactory.getLog(HttpClientConfigured.class);

    private static int maxResponseTime = 20000; //0=infinite
    private static boolean allowSelfSignedCerts = false; // see at use

    private HttpClient httpClient;
    private HttpClientContext httpContext;

    public HttpClientConfigured(String url) {
        this(url, -1);
    }

    public HttpClientConfigured(String url, int timeout) {

        if (timeout < 0) {
            timeout = maxResponseTime;
        }

        RequestConfig defaultRequestConfig = RequestConfig.custom()
            .setStaleConnectionCheckEnabled(false)
            .setTargetPreferredAuthSchemes(Arrays.asList(AuthSchemes.BASIC))
            .setProxyPreferredAuthSchemes(Arrays.asList(AuthSchemes.BASIC))
            .setConnectionRequestTimeout(timeout)
            .build();

        HttpClientBuilder hcb = HttpClients.custom()
                .setDefaultRequestConfig(defaultRequestConfig);

        if (allowSelfSignedCerts) {
            //accept selfsigned certificates
            //TODO: This appears to be NOT working, not sure why!
            //The only way to get this to work is to add the SSL certificate
            //of the server (tomcat) with the correct domain name to the
            //TrustedStore of the JVM in which this app runs.
            try {
                SSLContext sslcontext = SSLContexts.custom()
                        .loadTrustMaterial(null, new TrustSelfSignedStrategy())
                        .build();
                SSLConnectionSocketFactory sslsf
                        = new SSLConnectionSocketFactory(sslcontext,
                                SSLConnectionSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER);
                hcb.setSSLSocketFactory(sslsf);
                log.info("SSL init for selfsigned certs successful.");
            } catch (Exception ex) {
                log.info("SSL init for selfsigned certs failed: " + ex.getLocalizedMessage());
            }
        }

        HttpClientContext context = HttpClientContext.create();
        //Use standard JRE proxy selector to obtain proxy information
        SystemDefaultRoutePlanner routePlanner =
                new SystemDefaultRoutePlanner(ProxySelector.getDefault());
        hcb.setRoutePlanner(routePlanner);
        hcb.setRedirectStrategy(new LaxRedirectStrategy());

        this.httpClient = hcb.build();
        this.httpContext = context;
    }

    public HttpResponse execute(HttpUriRequest method) throws IOException {
        return httpClient.execute(method, httpContext);
    }

    public void close() {
        if (httpClient instanceof CloseableHttpClient) {
            try {
                ((CloseableHttpClient)httpClient).close();
            } catch (IOException ex) {
                log.info("Error closing HttpClient: " + ex.getLocalizedMessage());
            }
        }
    }

    public void close(HttpResponse response) {
        if (response instanceof CloseableHttpResponse) {
            try {
                ((CloseableHttpResponse)response).close();
            } catch (IOException ex) {
                log.info("Error closing HttpResponse: " + ex.getLocalizedMessage());
            }
        }
    }
    /**
     * @return the httpClient
     */
    public HttpClient getHttpClient() {
        return httpClient;
    }

    /**
     * @param httpClient the httpClient to set
     */
    public void setHttpClient(HttpClient httpClient) {
        this.httpClient = httpClient;
    }

    /**
     * @return the context
     */
    public HttpClientContext getContext() {
        return httpContext;
    }

    /**
     * @param context the context to set
     */
    public void setContext(HttpClientContext context) {
        this.httpContext = context;
    }


    /**
     * @param aMaxResponseTime the maxResponseTime to set
     */
    public static void setMaxResponseTime(int aMaxResponseTime) {
        maxResponseTime = aMaxResponseTime;
    }

    /**
     * @param assc the allowSelfSignedCerts to set
     */
    public static void setAllowSelfSignedCerts(boolean assc) {
        allowSelfSignedCerts = assc;
    }
}
