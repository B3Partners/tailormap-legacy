package nl.b3p.commons;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.ProxySelector;
import java.net.URL;
import java.util.Arrays;
import javax.net.ssl.SSLContext;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.Credentials;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.AuthCache;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.AuthSchemes;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLContexts;
import org.apache.http.conn.ssl.TrustSelfSignedStrategy;
import org.apache.http.impl.auth.BasicScheme;
import org.apache.http.impl.client.BasicAuthCache;
import org.apache.http.impl.client.BasicCredentialsProvider;
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
    
    private String username;
    private String password;

    public HttpClientConfigured(String username, String password, String url) {
        this( username,  password,url, -1);
    }

    public HttpClientConfigured(String username, String password, String url, int timeout) {
        this.password = password;
        this.username = username;
        if (timeout < 0) {
            timeout = maxResponseTime;
        }
        boolean preemptive = true;
 

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
        if (username != null && password != null) {
            String hostname = null; //any
            int port = -1; //any
            URL aURL;
            try {
                aURL = new URL(url);
                hostname = aURL.getHost();
                port = aURL.getPort();
            } catch (MalformedURLException ex) {
                // ignore
            }

            CredentialsProvider credentialsProvider
                    =                    new BasicCredentialsProvider();
            Credentials defaultcreds =
                    new UsernamePasswordCredentials(username, password);
            AuthScope authScope =
                    new AuthScope(hostname, port);
            credentialsProvider.setCredentials(authScope, defaultcreds);

            hcb = hcb.setDefaultCredentialsProvider(credentialsProvider);

            //preemptive not possible without hostname
            if (preemptive && hostname!=null) {
                // Create AuthCache instance for preemptive authentication
                AuthCache authCache = new BasicAuthCache();
                BasicScheme basicAuth = new BasicScheme();
                HttpHost targetHost = new HttpHost(hostname, port);
                authCache.put(targetHost, basicAuth);
                // Add AuthCache to the execution context
                context.setCredentialsProvider(credentialsProvider);
                context.setAuthCache(authCache);
                log.debug("Preemptive credentials: hostname: " + hostname
                        + ", port: " + port
                        + ", username: " + username
                        + ", password: ****.");
            }

        }
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

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }
}
