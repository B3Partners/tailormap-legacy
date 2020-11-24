package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.web.stripes.ErrorMessageResolution;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.mutable.MutableObject;
import org.apache.http.HttpResponse;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.io.StringReader;
import java.util.zip.GZIPOutputStream;

@StrictBinding
@UrlBinding("/action/safetyconnect/api/{path}")
public class SafetyConnectProxyActionBean implements ActionBean {

    private ActionBeanContext context;

    public static final String ROLE_ADMIN = "Admin";

    static final String ROLE = "safetyct";

    @Validate
    private String path;

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    @Override
    public ActionBeanContext getContext() {
        return this.context;
    }

    public Resolution proxy() throws Exception {
        if(!context.getRequest().isUserInRole(ROLE) && !context.getRequest().isUserInRole(ROLE_ADMIN)) {
            return new ErrorMessageResolution(HttpServletResponse.SC_FORBIDDEN, "Gebruiker heeft geen toegang tot webservice");
        }

        String authorization = SafetymapsComponentActionBean.getSetting("safetyconnect_webservice_authorization");
        String url = SafetymapsComponentActionBean.getSetting("safetyconnect_webservice_url");

        if(authorization == null || url == null) {
            return new ErrorMessageResolution(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Geen toegangsgegevens voor webservice geconfigureerd door beheerder");
        }

        // TODO: serverside checks incidentmonitor, incidentmonitor_kladblok,
        // eigen_voertuignummer roles and use voertuignummer from user details

        String qs = context.getRequest().getQueryString();
        final HttpUriRequest req = RequestBuilder.get()
                .setUri(url + "/" + path + (qs == null ? "" : "?" + qs))
                .addHeader("Authorization", authorization)
                .build();

        try(CloseableHttpClient client = HttpClients.createDefault()) {
            final MutableObject<String> contentType = new MutableObject<>("text/plain");
            final String content = client.execute(req, new ResponseHandler<String>() {
                @Override
                public String handleResponse(HttpResponse hr) {
                    contentType.setValue(hr.getEntity().getContentType().getValue());
                    try {
                        return IOUtils.toString(hr.getEntity().getContent(), "UTF-8");
                    } catch(IOException e) {

                        return "Exception " + e.getClass() + ": " + e.getMessage();
                    }
                }
            });

            return new Resolution() {
                @Override
                public void execute(HttpServletRequest request, HttpServletResponse response) throws Exception {
                    String encoding = "UTF-8";
                    response.setCharacterEncoding(encoding);
                    response.setContentType(contentType.getValue());

                    OutputStream out;
                    String acceptEncoding = request.getHeader("Accept-Encoding");
                    if(acceptEncoding != null && acceptEncoding.contains("gzip")) {
                        response.setHeader("Content-Encoding", "gzip");
                        out = new GZIPOutputStream(response.getOutputStream(), true);
                    } else {
                        out = response.getOutputStream();
                    }
                    IOUtils.copy(new StringReader(content), out, encoding);
                    out.flush();
                    out.close();
                }
            };

            //return new StreamingResolution(contentType.getValue(), new StringReader(content));
        } catch(IOException e) {
            return null;
        }
    }
}
