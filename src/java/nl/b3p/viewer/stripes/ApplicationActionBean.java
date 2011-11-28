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

import javax.persistence.EntityManager;

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;

import nl.b3p.viewer.config.services.GeoService;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/app/{name}")
@StrictBinding
public class ApplicationActionBean implements ActionBean {

    private ActionBeanContext context;

    @Validate
    private String name;

    private GeoService service;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public GeoService getService() {
        return service;
    }

    public void setService(GeoService service) {
        this.service = service;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public ActionBeanContext getContext() {
        return context;
    }

    public Resolution view() {
        EntityManager em = Stripersist.getEntityManager();

        //service = em.find(Service.class, (long)50);

        service = new GeoService();
        service.setName("pietje");
        em.persist(service);

        em.getTransaction().commit();
        
        return new ForwardResolution("/WEB-INF/jsp/app.jsp");
    }
}
