package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.commons.HttpClientConfigured;
import nl.b3p.viewer.audit.AuditMessageObject;
import nl.b3p.viewer.audit.Auditable;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.GeoService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.*;
import org.apache.http.entity.InputStreamEntity;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Set;

@UrlBinding("/action/proxyrest")
@StrictBinding
public class ProxyRESTActionBean implements ActionBean, Auditable {

    private static final Log log = LogFactory.getLog(ProxyActionBean.class);
    private ActionBeanContext context;
    private AuditMessageObject auditMessageObject;
    @Validate
    private String url;

    private boolean unauthorized;


    @Before(stages = LifecycleStage.EventHandling)
    public void checkAuthorization() {
        HttpServletRequest request = getContext().getRequest();
        HttpSession sess = request.getSession(false);
        if (sess == null || url == null || request.getRemoteUser() == null) {
            unauthorized = true;
        }
    }

    @DefaultHandler
    public Resolution proxy() throws IOException, URISyntaxException {

        HttpServletRequest request = getContext().getRequest();

        // Session must exist
        HttpSession sess = request.getSession(false);
        if (unauthorized) {
            return new ErrorResolution(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized proxying");
        }
        EntityManager em = Stripersist.getEntityManager();
        URL theUrl = new URL(url);
        HttpClientConfigured client = getHttpClient(theUrl, em);
        HttpUriRequest req = getHttpRequest(theUrl);
        HttpResponse response;
        try {
            response = client.execute(req);

            int statusCode = response.getStatusLine().getStatusCode();
            if (statusCode >= 200 && statusCode < 300) {
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
        } catch (IOException e) {
            log.error("Failed to write output:", e);
            return null;
        }
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

}
