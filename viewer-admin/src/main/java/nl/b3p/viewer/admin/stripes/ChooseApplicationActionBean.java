/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
package nl.b3p.viewer.admin.stripes;

import java.text.SimpleDateFormat;
import java.util.*;
import javax.annotation.security.RolesAllowed;
import javax.persistence.NoResultException;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.SimpleError;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.util.SelectedContentCache;
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

    //</editor-fold>
    @DefaultHandler
    public Resolution view() {
        return new ForwardResolution(JSP);
    }

    public Resolution viewEdit() {
        return new ForwardResolution(EDITJSP);
    }

    public Resolution deleteApplication() {
        try {
            if (applicationToDelete.isMashup()) {
                applicationToDelete.setRoot(null);
                Stripersist.getEntityManager().remove(applicationToDelete);
                Stripersist.getEntityManager().getTransaction().commit();

                getContext().getMessages().add(new SimpleMessage("Mashup is verwijderd"));
            } else if (applicationToDelete.getVersion() == null) {
                Date nowDate = new Date(System.currentTimeMillis());
                SimpleDateFormat sdf = (SimpleDateFormat) SimpleDateFormat.getDateInstance();
                sdf.applyPattern("HH-mm_dd-MM-yyyy");
                String now = sdf.format(nowDate);
                String uniqueVersion = ApplicationSettingsActionBean.findUniqueVersion(applicationToDelete.getName(), "B_" + now);
                applicationToDelete.setVersion(uniqueVersion);
                Stripersist.getEntityManager().getTransaction().commit();
            } else {
                Stripersist.getEntityManager().remove(applicationToDelete);
                Stripersist.getEntityManager().getTransaction().commit();

                getContext().getMessages().add(new SimpleMessage("Applicatie is verwijderd"));
            }
            if (applicationToDelete.equals(application)) {
                setApplication(null);
            }
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
            getContext().getValidationErrors().addGlobalError(new SimpleError("Fout bij verwijderen applicatie: " + ex));
        }
        return new ForwardResolution(EDITJSP);
    }

    public Resolution getGridData() throws JSONException {
        JSONArray jsonData = new JSONArray();

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

        Session sess = (Session) Stripersist.getEntityManager().getDelegate();
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
            JSONObject j = this.getGridRow(app.getId().intValue(), appName, published, ownername);
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
        try {
            Object o = Stripersist.getEntityManager().createQuery("select 1 from Application where name = :name AND version = :version").setMaxResults(1).setParameter("name", name).setParameter("version", version).getSingleResult();

            getContext().getMessages().add(new SimpleMessage("Kan niet kopieren; applicatie met naam \"{0}\" en versie \"{1}\" bestaat al", name, version));
            return new RedirectResolution(this.getClass());
        } catch (NoResultException nre) {
        }

        try {

            Application copy = applicationWorkversion.deepCopy();
            copy.setVersion(version);
            // don't save changes to original app
            Stripersist.getEntityManager().detach(applicationWorkversion);

            Stripersist.getEntityManager().persist(copy);
            Stripersist.getEntityManager().persist(copy);
            Stripersist.getEntityManager().flush();
            SelectedContentCache.setApplicationCacheDirty(copy, Boolean.TRUE, false);
            Stripersist.getEntityManager().getTransaction().commit();
            getContext().getMessages().add(new SimpleMessage("Werkversie is gemaakt"));
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
            getContext().getValidationErrors().addGlobalError(new SimpleError("Fout bij het maken van werkversie applicatie: " + ex));
            return new ForwardResolution(JSP);
        }
    }

    private JSONObject getGridRow(int i, String name, String published, String owner) throws JSONException {
        JSONObject j = new JSONObject();
        j.put("id", i);
        j.put("name", name);
        j.put("published", published);
        j.put("owner", owner);
        return j;
    }
}
