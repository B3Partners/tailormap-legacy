/*
 * Copyright (C) 2015-2016 B3Partners B.V.
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

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.SimpleMessage;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.validation.SimpleError;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.Bookmark;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class BookmarkActionBean implements ActionBean{

    private static final String JSP = "/WEB-INF/jsp/services/bookmark.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/services/bookmarkEdit.jsp";
    private ActionBeanContext context;

    @Validate
    private int limit;

    @Validate
    private int start;

    @Validate
    private int page;

    @Validate
    private String sort;

    @Validate
    private JSONArray filter;

    @Validate
    private String dir;

    @Validate
    private Bookmark bookmark;

    // <editor-fold defaultstate="collapsed" desc="Getters and Setters">

    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public int getStart() {
        return start;
    }

    public void setStart(int start) {
        this.start = start;
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

    public Bookmark getBookmark() {
        return bookmark;
    }

    public void setBookmark(Bookmark bookmark) {
        this.bookmark = bookmark;
    }
    // </editor-fold>


    @DefaultHandler
    public Resolution view(){
        return new ForwardResolution(JSP);
    }

    public Resolution viewEdit(){
        return new ForwardResolution(EDITJSP);
        
    }

    public Resolution deleteBookmark() throws JSONException{
        
        
        try{
            EntityManager em = Stripersist.getEntityManager();
            em.remove(bookmark);
            em.getTransaction().commit();
            context.getMessages().add(new SimpleMessage("Verwijderen gelukt"));
        }catch(Exception e ){
            context.getValidationErrors().add("Verwijderen",new SimpleError("Verwijderen bookmark mislukt", e.getLocalizedMessage()));
        }
        return viewEdit();
    }

    public Resolution getGridData() throws JSONException {
        final JSONObject result = new JSONObject();
        JSONArray gridrows = new JSONArray();


        Session sess = (Session) Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(Bookmark.class,"bookmark");
        c.createAlias("bookmark.application", "application");

        String applicationName = "";
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
                if (property.equals("application.name")) {
                    applicationName = value;
                }
            }
        }
        
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

        if (applicationName != null && applicationName.length() > 0) {
            Criterion nameCrit = Restrictions.ilike("application.name", applicationName, MatchMode.ANYWHERE);
            c.add(nameCrit);
        }

        int rowCount = c.list().size();

        c.setMaxResults(limit);
        c.setFirstResult(start);

        List<Bookmark> bookmarks = c.list();
        for (Bookmark bookmark : bookmarks) {
            Application app = bookmark.getApplication();
            String appName = null;
            if (app != null) {
                appName = app.getName();
                if (app.getVersion() != null) {
                    appName += " v" + app.getVersion();
                }
            }

            Date dateCreated = bookmark.getCreatedAt();

            JSONObject j = getGridRow(bookmark.getId(), appName, dateCreated);
            gridrows.put(j);
        }

        result.put("totalCount", rowCount);
        result.put("gridrows", gridrows);

        return new StreamingResolution("application/json") {

            @Override
            public void stream(HttpServletResponse response) throws Exception {
                response.getWriter().print(result.toString());
            }
        };
    }

    private JSONObject getGridRow(long id, String appName, Date createdDate) throws JSONException{
        JSONObject row = new JSONObject();
        row.put("id", id);
        row.put("application.name", appName);
        SimpleDateFormat sdf = new SimpleDateFormat("HH-mm dd-MM-yyyy");
        String date = sdf.format(createdDate);
        row.put("createdAt", date);
        return row;
    }


}
