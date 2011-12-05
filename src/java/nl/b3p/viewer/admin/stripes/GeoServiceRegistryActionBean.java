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

import java.util.List;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
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
public class GeoServiceRegistryActionBean implements ActionBean {

    private ActionBeanContext context;

    private String registryTreeJson;

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public ActionBeanContext getContext() {
        return context;
    }

    public String getRegistryTreeJson() {
        return registryTreeJson;
    }

    public void setRegistryTreeJson(String registryTreeJson) {
        this.registryTreeJson = registryTreeJson;
    }

    @After(stages=LifecycleStage.EventHandling)
    public void loadRegistryTree() throws JSONException {
        EntityManager em = Stripersist.getEntityManager();

        List<GeoService> services = em.createQuery("from GeoService order by name").getResultList();

        JSONArray a = new JSONArray();
        for(GeoService s: services) {
            JSONObject j = new JSONObject();
            j.put("id", s.getId());
            j.put("name", s.getName());
            a.put(j);
        }
        registryTreeJson = a.toString(4);
    }

    public Resolution view() throws JSONException {

        Stripersist.getEntityManager().getTransaction().commit();

        return new ForwardResolution("/WEB-INF/jsp/geoserviceregistry.jsp");
    }
}
