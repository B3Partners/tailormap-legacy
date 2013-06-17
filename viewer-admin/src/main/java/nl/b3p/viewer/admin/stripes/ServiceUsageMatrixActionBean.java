/*
 * Copyright (C) 2013 B3Partners B.V.
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
import javax.annotation.security.RolesAllowed;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.FeatureSource;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Roy Braam
 */
@StrictBinding
@UrlBinding("/action/serviceUsageMatrix/{$event}")
@RolesAllowed({Group.ADMIN,Group.REGISTRY_ADMIN})
public class ServiceUsageMatrixActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(ServiceUsageMatrixActionBean.class);
    private static final String JSP = "/WEB-INF/jsp/services/serviceusagematrix.jsp";
    
    private ActionBeanContext context;
    
    @DefaultHandler
    public Resolution view() throws JSONException {
        /*List <FeatureSource> featureSources = Stripersist.getEntityManager().createQuery("FROM FeatureSource").getResultList();
        List<FeatureSourceBean> fsbs = new ArrayList<FeatureSourceBean>();
        for (FeatureSource fs : featureSources){
            fsbs.add(new FeatureSourceBean(fs));
        }*/
        List<Application> applications = Stripersist.getEntityManager().createQuery("FROM Application").getResultList();
        JSONArray jsonApps = new JSONArray();
        for (Application app: applications){
            JSONObject json = new JSONObject(app.toJSON(this.context.getRequest(),true,true));
            jsonApps.put(json);
        }       
        
        List <FeatureSource> featureSources = Stripersist.getEntityManager().createQuery("FROM FeatureSource").getResultList();
        JSONArray jsonFs = new JSONArray();
        for (FeatureSource fs : featureSources){
            JSONObject json = new JSONObject();
            json.put("id", fs.getId());
            json.put("name",fs.getName());
            jsonFs.put(json);
        }
        //format a json for the xml output.
        JSONObject fs = new JSONObject();
        fs.put("featureSource",jsonFs);
        
        JSONObject appl = new JSONObject();
        appl.put("application",jsonApps);
        
        JSONObject firstChild = new JSONObject();
        firstChild.put("applications",appl);
        firstChild.put("featureSources",fs);

        
        JSONObject root = new JSONObject();
        root.put("root",firstChild);
        
        String xml = org.json.XML.toString(root);
       
        return new ForwardResolution(JSP);
        
    }
    //<editor-fold defaultstate="collapsed" desc="Getters setters">
    
    @Override
    public void setContext(ActionBeanContext context) {
        this.context=context;
    }
    
    @Override
    public ActionBeanContext getContext() {
        return this.context;
    }
    //</editor-fold>
}
