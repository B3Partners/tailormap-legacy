/*
 * Copyright (C) 2012-2016 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.admin.stripes;

import java.io.StringReader;
import java.text.SimpleDateFormat;
import java.util.*;
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.SimpleError;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ConfiguredComponent;
import nl.b3p.viewer.config.metadata.Metadata;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.util.SelectedContentCache;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.*;
import org.hibernate.criterion.*;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@UrlBinding("/action/chooseapplication/{$event}")
@StrictBinding
@RolesAllowed({Group.ADMIN, Group.APPLICATION_ADMIN})
public class ChooseApplicationActionBean extends ApplicationActionBean {

    private static final Log log = LogFactory.getLog(ChooseApplicationActionBean.class);
    private static final String JSP = "/WEB-INF/jsp/application/chooseApplication.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/application/chooseApplicationEdit.jsp";
    private static final String VIEWER_URL_PARAM = "viewer.url";
    @Validate
    private int page;
    @Validate
    private int start;
    @Validate
    private int limit;
    @Validate
    private String sort;
    @Validate
    private String dir;
    @Validate
    private JSONArray filter;
    @Validate
    private String name;
    @Validate
    private String version;
    @Validate
    private Application applicationWorkversion;
    @Validate
    private Application applicationToDelete;

    private List<Application> apps;

    private String defaultAppId;

    @Validate
    private Application defaultApplication;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public String getDir() {
        return dir;
    }

    public void setDir(String dir) {
        this.dir = dir;
    }

    public JSONArray getFilter() {
        return filter;
    }

    public void setFilter(JSONArray filter) {
        this.filter = filter;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    public int getStart() {
        return start;
    }

    public void setStart(int start) {
        this.start = start;
    }

    public Application getApplicationToDelete() {
        return applicationToDelete;
    }

    public void setApplicationToDelete(Application applicationToDelete) {
        this.applicationToDelete = applicationToDelete;
    }

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

    public Application getApplicationWorkversion() {
        return applicationWorkversion;
    }

    public void setApplicationWorkversion(Application applicationWorkversion) {
        this.applicationWorkversion = applicationWorkversion;
    }

    public List<Application> getApps() {
        return apps;
    }

    public void setApps(List<Application> apps) {
        this.apps = apps;
    }

    public String getDefaultAppId() {
        return defaultAppId;
    }

    public void setDefaultAppId(String defaultAppId) {
        this.defaultAppId = defaultAppId;
    }

    public Application getDefaultApplication() {
        return defaultApplication;
    }

    public void setDefaultApplication(Application defaultApplication) {
        this.defaultApplication = defaultApplication;
    }
    //</editor-fold>

    @DefaultHandler
    public Resolution view() {
        return new ForwardResolution(JSP);
    }

    public Resolution viewEdit() {
        return new ForwardResolution(EDITJSP);
    }

    public Resolution deleteApplication() {
        EntityManager em = Stripersist.getEntityManager();
        try {
            deleteApplication(em);
        } catch (Exception e) {
            log.error(String.format("Error deleting application #%d named %s",
                    applicationToDelete.getId(),
                    applicationToDelete.getName(),
                    applicationToDelete.getVersion() == null ? "" : "v" + applicationToDelete.getVersion() + " "),
                    e);
            String ex = e.toString();
            Throwable cause = e.getCause();
            while (cause != null) {
                ex += ";\n<br>" + cause.toString();
                cause = cause.getCause();
            }
            getContext().getValidationErrors().addGlobalError(new SimpleError(getBundle().getString("viewer_admin.chooseapplicationactionbean.errorremapp"), ex));
        }
        return new ForwardResolution(EDITJSP);
    }

    protected void deleteApplication(EntityManager em) {
        if (applicationToDelete.isMashup()) {
            applicationToDelete.setRoot(null);
            Set<ConfiguredComponent> comps = applicationToDelete.getComponents();
            for (ConfiguredComponent comp : comps) {
                List<ConfiguredComponent> linked = comp.getLinkedComponents();
                for (ConfiguredComponent cc : linked) {
                    cc.setMotherComponent(null);
                    em.persist(cc);
                }
            }
            em.remove(applicationToDelete);
            em.getTransaction().commit();

            getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.chooseapplicationactionbean.murem")));
        } else if (applicationToDelete.getVersion() == null) {
            Date nowDate = new Date(System.currentTimeMillis());
            SimpleDateFormat sdf = (SimpleDateFormat) SimpleDateFormat.getDateInstance();
            sdf.applyPattern("HH-mm_dd-MM-yyyy");
            String now = sdf.format(nowDate);
            String uniqueVersion = ApplicationSettingsActionBean.findUniqueVersion(applicationToDelete.getName(), "B_" + now, em);
            applicationToDelete.setVersion(uniqueVersion);
            em.getTransaction().commit();
        } else {
            List<Application> mashups = applicationToDelete.getMashups(em);
            if (!mashups.isEmpty()) {
                List<String> list = new ArrayList();
                for (Application mashup : mashups) {
                    list.add(mashup.getNameWithVersion());
                }
                String mashupList = StringUtils.join(list, ", ");
                getContext().getValidationErrors().addGlobalError(new SimpleError(getBundle().getString("viewer_admin.chooseapplicationactionbean.noremapp"), mashupList));
            } else {

                em.remove(applicationToDelete);
                em.getTransaction().commit();

                getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.chooseapplicationactionbean.remapp")));
            }
        }
        if (applicationToDelete.equals(application)) {
            setApplication(null);
        }
    }

    public Resolution getGridData() throws JSONException {
        JSONArray jsonData = new JSONArray();
        EntityManager em = Stripersist.getEntityManager();
        String filterName = "";
        String filterPublished = "";
        String filterOwner = "";
        /*
         * FILTERING: filter is delivered by frontend as JSON array [{property,
         * value}] for demo purposes the value is now returned, ofcourse here
         * should the DB query be built to filter the right records
         */
        if (this.getFilter() != null) {
            for (int k = 0; k < this.getFilter().length(); k++) {
                JSONObject j = this.getFilter().getJSONObject(k);
                String property = j.getString("property");
                String value = j.getString("value");
                if (property.equals("name")) {
                    filterName = value;
                }
                if (property.equals("published")) {
                    filterPublished = value;
                }
                if (property.equals("owner")) {
                    filterOwner = value;
                }
            }
        }

        Session sess = (Session) em.getDelegate();
        Criteria c = sess.createCriteria(Application.class);

        /*
         * Sorting is delivered by the frontend as two variables: sort which
         * holds the column name and dir which holds the direction (ASC, DESC).
         */
        if (sort != null && dir != null) {
            Order order = null;
            if (sort.equals("published")) {
                sort = "version";
            }
            if (dir.equals("ASC")) {
                order = Order.asc(sort);
            } else {
                order = Order.desc(sort);
            }
            order.ignoreCase();
            c.addOrder(order);
        }

        if (filterName != null && filterName.length() > 0) {
            Criterion nameCrit = Restrictions.ilike("name", filterName, MatchMode.ANYWHERE);
            c.add(nameCrit);
        }
        if (filterPublished != null && filterPublished.length() > 0) {
            if (filterPublished.equalsIgnoreCase("nee")) {
                Criterion publishedCrit = Restrictions.isNotNull("version");
                c.add(publishedCrit);
            } else if (filterPublished.equalsIgnoreCase("ja")) {
                Criterion publishedCrit = Restrictions.isNull("version");
                c.add(publishedCrit);
            }
        }
        if (filterOwner != null && filterOwner.length() > 0) {
            Criterion ownerCrit = Restrictions.ilike("owner.username", filterOwner, MatchMode.ANYWHERE);
            c.add(ownerCrit);
        }

        int rowCount = c.list().size();

        c.setMaxResults(limit);
        c.setFirstResult(start);

        List applications = c.list();
        String baseUrl = getContext().getServletContext().getInitParameter(VIEWER_URL_PARAM);
        for (Iterator it = applications.iterator(); it.hasNext();) {
            Application app = (Application) it.next();
            String appName = app.getName();
            if (app.getVersion() != null) {
                appName += " v" + app.getVersion();
            }
            String ownername = "";
            if (app.getOwner() != null) {
                ownername = app.getOwner().getUsername();
            }
            String published = "Nee";
            if (app.getVersion() == null) {
                published = "Ja";
            }
            JSONObject j = new JSONObject();
            j.put("id", app.getId().intValue());
            j.put("name", appName);
            j.put("published", published);
            j.put("owner", ownername);
            j.put("baseName", app.getName());
            j.put("version", app.getVersion());
            j.put("baseUrl", baseUrl);
            boolean isMashup = app.isMashup(sess);
            if (isMashup) {
                    List<Application> linkedApps = em.createQuery(
                            "from Application where root = :level and id <> :oldId")
                            .setParameter("level", app.getRoot())
                            .setParameter("oldId", app.getId())
                            .getResultList();
                    for (Application linkedApp : linkedApps) {
                        if (!linkedApp.isMashup(sess)) {
                            j.put("motherapplication", linkedApp.getNameWithVersion());
                            break;
                        }
                    }
                }
            j.put("mashup", (isMashup ? "Ja" : "Nee"));
            jsonData.put(j);
        }

        final JSONObject grid = new JSONObject();
        grid.put("totalCount", rowCount);
        grid.put("gridrows", jsonData);

        return new StreamingResolution("application/json") {

            @Override
            public void stream(HttpServletResponse response) throws Exception {
                response.getWriter().print(grid.toString());
            }
        };
    }

    public Resolution makeWorkVersion() {
        EntityManager em = Stripersist.getEntityManager();
        try {
            Object o = em.createQuery("select 1 from Application where name = :name AND version = :version").setMaxResults(1).setParameter("name", name).setParameter("version", version).getSingleResult();

            getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.chooseapplicationactionbean.nocopy"), name, version));
            return new RedirectResolution(this.getClass());
        } catch (NoResultException nre) {
        }

        try {

            Application copy = createWorkversion(applicationWorkversion, em, version);
            getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.chooseapplicationactionbean.wvcreate")));
            setApplication(copy);

            return new RedirectResolution(ApplicationSettingsActionBean.class);
        } catch (Exception e) {
            log.error(String.format("Error copying application #%d named %s %swith new name %s",
                    applicationWorkversion.getId(),
                    applicationWorkversion.getName(),
                    applicationWorkversion.getVersion() == null ? "" : "v" + applicationWorkversion.getVersion() + " ",
                    name), e);
            String ex = e.toString();
            Throwable cause = e.getCause();
            while (cause != null) {
                ex += ";\n<br>" + cause.toString();
                cause = cause.getCause();
            }
            getContext().getValidationErrors().addGlobalError(new SimpleError(getBundle().getString("viewer_admin.chooseapplicationactionbean.wverror"), ex));
            return new ForwardResolution(JSP);
        }
    }

    Application createWorkversion(Application base, EntityManager em, String version) throws Exception {
        if (base.isMashup()) {
            Application mashup = base.createMashup(version, em, true);
            String appName = mashup.getName();
            appName = appName.substring(0, appName.lastIndexOf("_" + version));
            mashup.setName(appName);
            mashup.setVersion(version);
            em.persist(mashup);
            em.getTransaction().commit();
            return mashup;
        } else {
            Application copy = base.createWorkVersion(em,version, context);
            return copy;
        }
    }

    public Resolution saveDefaultApplication() throws JSONException {
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        try {
            EntityManager em = Stripersist.getEntityManager();
            Metadata md = null;
            try {
                md = em.createQuery("from Metadata where configKey = :key", Metadata.class).setParameter("key", Metadata.DEFAULT_APPLICATION).getSingleResult();
            } catch (NoResultException e) {
                md = new Metadata();
                md.setConfigKey(Metadata.DEFAULT_APPLICATION);
            }
            if (defaultApplication != null) {
                md.setConfigValue(defaultApplication.getId().toString());
            } else {
                md.setConfigValue(null);
            }
            defaultAppId = md.getConfigValue();
            em.persist(md);
            em.getTransaction().commit();
            json.put("success", Boolean.TRUE);
        } catch (Exception ex) {
            log.error("Error during setting the default application: ", ex);
        }
        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    @After(stages = {LifecycleStage.BindingAndValidation})
    public void createLists() {
        EntityManager em = Stripersist.getEntityManager();
        apps = em.createQuery("from Application").getResultList();
        try {
            Metadata md = em.createQuery("from Metadata where configKey = :key", Metadata.class).setParameter("key", Metadata.DEFAULT_APPLICATION).getSingleResult();
            defaultAppId = md.getConfigValue();
        } catch (NoResultException e) {
        }

    }
}
