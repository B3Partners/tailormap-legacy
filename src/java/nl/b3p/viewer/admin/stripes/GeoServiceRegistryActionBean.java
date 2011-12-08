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
package nl.b3p.viewer.admin.stripes;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.services.Category;
import nl.b3p.viewer.config.services.GeoService;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/geoserviceregistry/{$event}")
@StrictBinding
public class GeoServiceRegistryActionBean implements ActionBean {

    private ActionBeanContext context;

    @Validate
    private Category category;

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public ActionBeanContext getContext() {
        return context;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Resolution loadCategoryTree() throws JSONException {

        EntityManager em = Stripersist.getEntityManager();

        if(!em.contains(category)) {
            category = Category.getRootCategory();
        }

        final JSONObject c = new JSONObject();
        c.put("id", category.getId());
        c.put("name", category.getName());

        JSONArray subCats = new JSONArray();
        c.put("subCategories", subCats);
        for(Category sub: category.getChildren()) {
            JSONObject j = new JSONObject();
            j.put("id", sub.getId());
            j.put("name", sub.getName());
            subCats.put(j);
        }

        JSONArray services = new JSONArray();
        c.put("services", services);

        for(GeoService s: category.getServices()) {
            JSONObject j = new JSONObject();
            j.put("id", s.getId());
            j.put("name", s.getName());
            j.put("class", s.getClass().getName());
            services.put(j);
        }
        
        return new StreamingResolution("application/json") {
           @Override
           public void stream(HttpServletResponse response) throws Exception {
               response.getWriter().print(c.toString());
           }
        };
    }

    public Resolution view() throws JSONException {
        return new ForwardResolution("/WEB-INF/jsp/geoserviceregistry.jsp");
    }
}
