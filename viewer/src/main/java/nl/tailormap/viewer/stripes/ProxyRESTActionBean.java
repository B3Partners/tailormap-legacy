package nl.tailormap.viewer.stripes;

import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.ErrorResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.tailormap.commons.HttpClientConfigured;
import nl.tailormap.viewer.audit.AuditMessageObject;
import nl.tailormap.viewer.audit.Auditable;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.entity.InputStreamEntity;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@UrlBinding("/action/proxyrest")
@StrictBinding
public class ProxyRESTActionBean implements ActionBean, Auditable {

    private Map<Integer, String> endpoints;
    private static final Log log = LogFactory.getLog(ProxyActionBean.class);
    private ActionBeanContext context;
    private AuditMessageObject auditMessageObject;
    @Validate
    private String url;

    @Validate
    private Integer endpoint = 0;

    private boolean unauthorized;


    @Before(stages = LifecycleStage.EventHandling)
    public void checkAuthorization() {
        HttpServletRequest request = getContext().getRequest();
        HttpSession sess = request.getSession(false);
        if (sess == null || url == null || request.getRemoteUser() == null) {
            unauthorized = true;
        }
    }

    @Before(stages = LifecycleStage.EventHandling)
    public void initEndpoints() {
        endpoints = new HashMap<>();
        endpoints.put(0, "feature-api");
        endpoints.put(1, "gbi");
    }

    @DefaultHandler
    public Resolution proxy() throws IOException, URISyntaxException {

        HttpServletRequest request = getContext().getRequest();

        // Session must exist
        HttpSession sess = request.getSession(false);
        if (unauthorized) {
            return new StreamingResolution("application/json") {
                @Override
                public void stream(HttpServletResponse response) throws Exception {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    IOUtils.copy(new StringReader("Unauthorized proxying"), response.getOutputStream(), StandardCharsets.UTF_8);

                }
            };
        }
        EntityManager em = Stripersist.getEntityManager();
        URL theUrl = constructURL();
        HttpClientConfigured client = getHttpClient(theUrl, em);
        HttpUriRequest req = getHttpRequest(theUrl);
        req.setHeader("tailormap-user", request.getUserPrincipal().getName());
        HttpResponse response;
        try {
            response = client.execute(req);

            int statusCode = response.getStatusLine().getStatusCode();
            if (statusCode >= 200 && statusCode < 300) {
                final HttpResponse finalResponse = response;
                final HttpEntity entity = response.getEntity();


                return new StreamingResolution(entity.getContentType() != null ?entity.getContentType().getValue() : "application/json") {
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
        } catch (IOException e) {
            log.error("Failed to write output:", e);
            return null;
        }
    }

    private URL constructURL() throws MalformedURLException {
        HttpServletRequest request = getContext().getRequest();
        String parentId = "";
        if(request.getParameter("parentId") != null) {
            parentId = "?parentId="+request.getParameter("parentId");
        }
        URL requestUrl = new URL(context.getRequest().getRequestURL().toString());
        String host = context.getServletContext().getInitParameter("flamingo.restproxy.host");
        String port = context.getServletContext().getInitParameter("flamingo.restproxy.port");
        String constructedURL = "http://" + (host != null ? host : "localhost") + ":" + (port != null ? port : "8084") + "/" + endpoints.get(endpoint) + url + parentId;
        URL u = new URL(constructedURL);
        return u;
    }

    public HttpClientConfigured getHttpClient(URL theUrl, EntityManager em) {
        String username = null;
        String password = null;
        final HttpClientConfigured client = new HttpClientConfigured(username, password, theUrl.toString());
        return client;
    }

    public HttpUriRequest getHttpRequest(URL url) throws URISyntaxException, IOException {
        HttpUriRequest req = null;
        HttpServletRequest request = context.getRequest();
        InputStreamEntity entity = new InputStreamEntity(request.getInputStream());
        entity.setContentEncoding(request.getCharacterEncoding());
        entity.setContentType("application/json");
        switch (request.getMethod()) {
            case "GET":
                req = new HttpGet(url.toURI());
                break;
            case "POST":
                HttpPost post = new HttpPost(url.toURI());
                post.setEntity(entity);
                req = post;
                break;
            case "PUT":
                HttpPut put = new HttpPut(url.toURI());
                put.setEntity(entity);
                req = put;
                break;
            case "DELETE":
                req = new HttpDelete(url.toURI());
                break;
        }

        return req;
    }

    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    @Override
    public AuditMessageObject getAuditMessageObject() {
        return auditMessageObject;
    }

    public void setAuditMessageObject(AuditMessageObject auditMessageObject) {
        this.auditMessageObject = auditMessageObject;
    }

    @Before(stages = LifecycleStage.EventHandling)
    public void initAudit() {
        auditMessageObject = new AuditMessageObject();
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Integer getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(Integer endpoint) {
        this.endpoint = endpoint;
    }
}
