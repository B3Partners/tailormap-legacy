/*
 * Copyright (C) 2011 B3Partners B.V.
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

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.*;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.criteria.*;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.util.HtmlUtil;
import net.sourceforge.stripes.validation.LocalizableError;
import net.sourceforge.stripes.validation.Validate;
import org.stripesstuff.stripersist.Stripersist;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ConfiguredComponent;
import org.apache.commons.io.IOUtils;
import org.json.JSONException;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/app/{name}/v{version}")
@StrictBinding
public class ApplicationActionBean implements ActionBean {

    private ActionBeanContext context;

    @Validate
    private String name;

    @Validate
    private String version;

    @Validate
    private boolean debug;

    private Application application;

    private String componentSourceHTML;
    private String script;


    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public boolean isDebug() {
        return debug;
    }

    public void setDebug(boolean debug) {
        this.debug = debug;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public ActionBeanContext getContext() {
        return context;
    }

    public String getComponentSourceHTML() {
        return componentSourceHTML;
    }

    public void setComponentSourceHTML(String componentSourceHTML) {
        this.componentSourceHTML = componentSourceHTML;
    }

    public String getScript() {
        return script;
    }

    public void setScript(String script) {
        this.script = script;
    }
    //</editor-fold>

    static Application findApplication(String name, String version) {
        EntityManager em = Stripersist.getEntityManager();
        if(name != null) {
            CriteriaBuilder cb = em.getCriteriaBuilder();
            CriteriaQuery q = cb.createQuery(Application.class);
            Root<Application> root = q.from(Application.class);
            Predicate namePredicate = cb.equal(root.get("name"), name);
            Predicate versionPredicate = version != null
                    ? cb.equal(root.get("version"), version)
                    : cb.isNull(root.get("version"));
            q.where(cb.and(namePredicate, versionPredicate));
            try {
                return (Application) em.createQuery(q).getSingleResult();
            } catch(NoResultException nre) {
            }
        }
        return null;
    }

    public Resolution view() throws JSONException, IOException {
        application = findApplication(name, version);

        if(application == null) {
            getContext().getValidationErrors().addGlobalError(new LocalizableError("app.notfound", name + (version != null ? " v" + version : "")));
            return new ForwardResolution("/WEB-INF/jsp/error.jsp");
        }

        buildComponentSourceHTML();
        buildScript();
        
        return new ForwardResolution("/WEB-INF/jsp/app.jsp");
    }

    private void buildComponentSourceHTML() throws IOException {

        StringBuilder sb = new StringBuilder();

        // Sort components by classNames, so order is always the same for debugging
        List<ConfiguredComponent> comps = new ArrayList<ConfiguredComponent>(application.getComponents());
        Collections.sort(comps);

        Set<String> classNamesDone = new HashSet<String>();

        if(isDebug()) {
            for(ConfiguredComponent cc: comps) {
                if(!classNamesDone.contains(cc.getClassName())) {

                    for(File f: cc.getViewerComponent().getSources()) {
                        String url = new ForwardResolution(ComponentActionBean.class, "source")
                                .addParameter("app", name)
                                .addParameter("version", version)
                                .addParameter("className", cc.getClassName())
                                .addParameter("file", f.getName())
                                .getUrl(context.getLocale());

                        sb.append("        <script type=\"text/javascript\" src=\"");
                        sb.append(HtmlUtil.encode(context.getServletContext().getContextPath() + url));
                        sb.append("\"></script>\n");
                    }
                    classNamesDone.add(cc.getClassName());
                }
            }
        } else {
            // If not debugging, create a single script tag with all source
            // for all components for the application for a minimal number of HTTP requests

            String url = new ForwardResolution(ComponentActionBean.class, "source")
                    .addParameter("app", name)
                    .addParameter("version", version)
                    .addParameter("minified", true)
                    .getUrl(context.getLocale());

            sb.append("        <script type=\"text/javascript\" src=\"");
            sb.append(HtmlUtil.encode(context.getServletContext().getContextPath() + url));
            sb.append("\"></script>\n");
        }

        componentSourceHTML = sb.toString();
    }

    private void buildScript() throws JSONException {

        // Define JSON variable with application data model

        StringBuilder sb = new StringBuilder();
        sb.append("var app = ");
        sb.append(application.toJSON());
        sb.append(";\n\n");

        script = sb.toString();
    }
}
