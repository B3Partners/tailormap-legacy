/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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

import java.util.*;
import javax.annotation.security.RolesAllowed;
import javax.persistence.NoResultException;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.security.Group;
import org.hibernate.*;
import org.hibernate.criterion.*;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@StrictBinding
@UrlBinding("/action/group/{$event}/{service}")
@RolesAllowed({Group.ADMIN,Group.USER_ADMIN})
public class GroupActionBean implements ActionBean {

    private static final String JSP = "/WEB-INF/jsp/security/group.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/security/editgroup.jsp";
        
    private ActionBeanContext context;
    private ResourceBundle bundle;
    
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
    private Group group;
    
    @Validate
    private String name;
    @Validate
    private String description;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    /**
     * @return the bundle
     */
    public ResourceBundle getBundle() {
        return bundle;
    }

    /**
     * @param bundle the bundle to set
     */
    public void setBundle(ResourceBundle bundle) {
        this.bundle = bundle;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
    //</editor-fold>

    @Before
    protected void initBundle() {
        setBundle(ResourceBundle.getBundle("ViewerResources", context.getRequest().getLocale()));
    }
        
    @DefaultHandler
    @HandlesEvent("default")
    @DontValidate
    public Resolution defaultResolution() {
        return new ForwardResolution(JSP);
    }

    @DontValidate
    public Resolution edit() {
        if(group != null){
            name = group.getName();
            description = group.getDescription();
        }
        return new ForwardResolution(EDITJSP);
    }

    @DontBind
    public Resolution cancel() {
        return new ForwardResolution(EDITJSP);
    }

    public Resolution save() {
        if (group == null) {
            group = new Group();
            group.setName(name);
            group.setDescription(description);
        } else {
            group.setDescription(description);
        }

        Stripersist.getEntityManager().persist(group);
        Stripersist.getEntityManager().getTransaction().commit();

        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.groupactionbean.ugsaved")));
        return new ForwardResolution(EDITJSP);
    }

    @ValidationMethod(on = "save")
    public void validate(ValidationErrors errors) throws Exception {
        if (group == null) {
            if(name == null) {
                errors.add("name", new SimpleError(getBundle().getString("viewer_admin.groupactionbean.nameobl")));
                return;
            }
            
            try {
                Object o = Stripersist.getEntityManager().createQuery("select 1 from Group where name = :name").setMaxResults(1).setParameter("name", name).getSingleResult();

                errors.add("name", new SimpleError(getBundle().getString("viewer_admin.groupactionbean.namenotunique")));
                return;

            } catch (NoResultException nre) {
                // name is unique
            }
        }
    }

    @DontValidate
    public Resolution delete() {
        if (!group.getMembers().isEmpty()) {
            getContext().getValidationErrors().add("group", new SimpleError(getBundle().getString("viewer_admin.groupactionbean.ughasu")));
            return new ForwardResolution(EDITJSP);
        }
        if(groupInUse()){
            getContext().getValidationErrors().add("group", new SimpleError(getBundle().getString("viewer_admin.groupactionbean.uginuse")));
            return new ForwardResolution(EDITJSP);
        }
        Stripersist.getEntityManager().remove(group);
        Stripersist.getEntityManager().getTransaction().commit();

        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.groupactionbean.ugrem")));

        return new ForwardResolution(EDITJSP);
    }

    @DontValidate
    public Resolution getGridData() throws JSONException {
        JSONArray jsonData = new JSONArray();

        String filterName = "";
        String filterDescription = "";
        /* 
         * FILTERING: filter is delivered by frontend as JSON array [{property, value}]
         * for demo purposes the value is now returned, ofcourse here should the DB
         * query be built to filter the right records
         */
        if (this.getFilter() != null) {
            for (int k = 0; k < this.getFilter().length(); k++) {
                JSONObject j = this.getFilter().getJSONObject(k);
                String property = j.getString("property");
                String value = j.getString("value");
                if (property.equals("name")) {
                    filterName = value;
                }
                if (property.equals("description")) {
                    filterDescription = value;
                }
            }
        }

        Session sess = (Session) Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(Group.class);

        /* Sorting is delivered by the frontend
         * as two variables: sort which holds the column name and dir which
         * holds the direction (ASC, DESC).
         */
        if (sort != null && dir != null && sort.equals("name")) {
            Order order = null;
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
        if (filterDescription != null && filterDescription.length() > 0) {
            Criterion urlCrit = Restrictions.ilike("description", filterDescription, MatchMode.ANYWHERE);
            c.add(urlCrit);
        }
        
        int rowCount = c.list().size();
        
        c.setMaxResults(limit);
        c.setFirstResult(start);

        List groups = c.list();
        for (Iterator it = groups.iterator(); it.hasNext();) {
            Group gr = (Group) it.next();
            JSONObject j = this.getGridRow(gr.getName(), gr.getDescription());
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
    
    private boolean groupInUse(){
        boolean inUse = false;
        List<Level> levels = Stripersist.getEntityManager().createQuery("from Level").getResultList();
        
        for(Iterator it = levels.iterator(); it.hasNext();){
            Level level = (Level)it.next();
            if(level.getReaders().contains(group.getName())){
                inUse = true;
                break;
            }
        }
        
        /*
         * not only a check on level.readers, but on every readers or writers
         */

        return inUse;
    }

    private JSONObject getGridRow(String name, String description) throws JSONException {
        JSONObject j = new JSONObject();
        j.put("name", name);
        j.put("description", description);
        if(Group.DEFAULT_GROUPS.contains(name)) {
            j.put("editable", false);
        } else {
            j.put("editable", true);
        }
        return j;
    }
}
