package nl.b3p.viewer.admin.stripes;

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.i18n.LocalizableActionBean;
import nl.b3p.viewer.config.forms.Form;
import nl.b3p.viewer.config.services.ArcGISFeatureSource;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.JDBCFeatureSource;
import nl.b3p.viewer.config.services.WFSFeatureSource;
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

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import java.util.*;

public class FormActionBean extends LocalizableActionBean {

    public ActionBeanContext context;
    private static final String JSP = "/WEB-INF/jsp/services/form.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/services/editform.jsp";

    private Set<String> featureTypes = new HashSet<>();

    private List<Form> formList = new ArrayList<>();

    private JSONArray forms;

    @Validate
    private JSONArray filter;
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

    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    @Before
    public void init(){
        EntityManager em = Stripersist.getEntityManager();
        formList = em.createQuery("FROM Form", Form.class).getResultList();
        formList.forEach(form -> {
            featureTypes.add(form.getFeatureTypeName());
        });
        forms = new JSONArray(formList);
    }

    @DefaultHandler
    @DontValidate
    public Resolution view() {
        return new ForwardResolution(JSP);
    }

    public Resolution cancel() {
        return new ForwardResolution(EDITJSP);
    }

    public Resolution getGridData() throws JSONException {
        JSONArray jsonData = new JSONArray();

        String filterName = "";
        String featureTypeName = "";
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
                if (property.equals("featureTypeName")) {
                    featureTypeName = value;
                }
            }
        }

        Session sess = (Session) Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(Form.class);

        /*
         * Sorting is delivered by the frontend as two variables: sort which
         * holds the column name and dir which holds the direction (ASC, DESC).
         */
        if (sort != null && dir != null) {
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
        if (featureTypeName != null && featureTypeName.length() > 0) {
            Criterion urlCrit = Restrictions.ilike("featureTypeName", featureTypeName, MatchMode.ANYWHERE);
            c.add(urlCrit);
        }

        List sources = c.list();
        int rowCount = c.list().size();

        c.setMaxResults(limit);
        c.setFirstResult(start);


        for (Iterator it = sources.iterator(); it.hasNext();) {
            Form form = (Form) it.next();

            JSONObject j = this.getGridRow(form);
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

    private JSONObject getGridRow(Form form) throws JSONException {
        JSONObject j = new JSONObject();
        j.put("id", form.getId());
        j.put("name", form.getName());
        j.put("featureTypeName", form.getFeatureTypeName());
        return j;
    }

    public Set<String> getFeatureTypes() {
        return featureTypes;
    }

    public void setFeatureTypes(Set<String> featureTypes) {
        this.featureTypes = featureTypes;
    }

    public List<Form> getFormList() {
        return formList;
    }

    public void setFormList(List<Form> formList) {
        this.formList = formList;
    }

    public JSONArray getForms() {
        return forms;
    }

    public void setForms(JSONArray forms) {
        this.forms = forms;
    }

    public JSONArray getFilter() {
        return filter;
    }

    public void setFilter(JSONArray filter) {
        this.filter = filter;
    }
}
