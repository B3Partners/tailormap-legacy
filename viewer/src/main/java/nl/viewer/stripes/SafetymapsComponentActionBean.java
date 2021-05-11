package nl.viewer.stripes;

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.viewer.config.app.Application;
import nl.web.stripes.ErrorMessageResolution;
import nl.opengeogroep.SafetyConnectProxy;
import nl.opengeogroep.SafetymapsApi;
import nl.opengeogroep.SafetymapsUtils;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@StrictBinding
@UrlBinding("/action/safetymaps/api/{path}")
public class SafetymapsComponentActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(SafetymapsComponentActionBean.class);

    private ActionBeanContext context;

    public static final String ROLE_ADMIN = "Admin";

    static final String ROLE = "safetyct";

    private String JNDI_NAME = "java:/comp/env/jdbc/safetymaps-server";
    private static final String FEATURES = "features.json";
    private static final String OBJECT = "object/";
    private static final String STYLES = "styles.json";
    private static final String PROXY = "proxy";
    private static final String MEDIA = "media";

    @Validate
    private String path;

    @Validate
    private int version = 3;

    @Validate
    private int indent = 0;

    @Validate
    private int srid = 28992;
    @Validate
    private Application app;

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    @Override
    public ActionBeanContext getContext() {
        return this.context;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public int getIndent() {
        return indent;
    }

    public void setIndent(int indent) {
        this.indent = indent;
    }

    public int getSrid() {
        return srid;
    }

    public void setSrid(int srid) {
        this.srid = srid;
    }

    public Application getApp() {
        return app;
    }

    public void setApp(Application app) {
        this.app = app;
    }

    public Resolution api() throws Exception {
        if(!context.getRequest().isUserInRole(ROLE) && !context.getRequest().isUserInRole(ROLE_ADMIN)) {
            return new ErrorMessageResolution(HttpServletResponse.SC_FORBIDDEN, "Gebruiker heeft geen toegang tot webservice");
        }

        try(Connection c = getConnection()) {
            if (path != null) {
                if (FEATURES.equals(path)) {
                    return SafetymapsApi.features(c, context, version, indent, srid);
                }
                if (STYLES.equals(path)) {
                    return SafetymapsApi.styles(c, indent);
                }
                if (path.indexOf(PROXY) == 0) {
                    String proxyPath = path.split("/")[1];
                    String authorization = getSetting("safetyconnect_webservice_authorization");
                    String url = getSetting("safetyconnect_webservice_url");
                    return SafetyConnectProxy.proxy(context, authorization, url, proxyPath);
                }if (path.indexOf(MEDIA) == 0) {
                    String fileName = path.split("/")[1];
                    String mediaPath = getSetting("media");
                    return SafetymapsApi.media(fileName, mediaPath);
                }
                if (path.indexOf(OBJECT) == 0) {
                    return SafetymapsApi.object(c, version, indent, path);
                }
            }
            return new ErrorResolution(HttpServletResponse.SC_NOT_FOUND, "Not found: /api/" + path);
        } catch(Exception e) {
            return new StreamingResolution("application/json", SafetymapsUtils.logExceptionAndReturnJSONObject(log, "Error on /api/" + path, e).toString(indent));
        }

    }

    private DataSource getDataSource(String jndiName) throws NamingException {
        InitialContext cxt = new InitialContext();
        DataSource ds = (DataSource)cxt.lookup(jndiName);
        if(ds == null) {
            throw new NamingException("Data source " + jndiName + " not found, please configure the webapp container correctly according to the installation instructions");
        }
        return ds;
    }

    private String getSetting(String name) throws NamingException, SQLException {
        String value = qr().query("select value from safetymaps.settings where name=?", new ScalarHandler<String>(), name);
        return value;
    }

    private QueryRunner qr() throws NamingException {
        return new QueryRunner(getDataSource(JNDI_NAME));
    }

    private Connection getConnection() throws NamingException, SQLException {
        return getDataSource(JNDI_NAME).getConnection();
    }
}
