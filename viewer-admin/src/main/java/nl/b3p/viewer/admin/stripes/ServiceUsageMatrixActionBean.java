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

import java.io.File;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.List;
import javax.annotation.security.RolesAllowed;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.SimpleFeatureType;
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
    private static final String xslPath=File.separator+"WEB-INF"+File.separator+"classes"+File.separator+"xsl"+File.separator+"ServiceUsageMatrix.xsl";
    private ActionBeanContext context;
    
    @Validate
    private String xml;
    
    @DefaultHandler
    public Resolution view() throws JSONException, TransformerConfigurationException, TransformerException {
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
        //add the featureSources to the JSON.
        List <FeatureSource> featureSources = Stripersist.getEntityManager().createQuery("FROM FeatureSource").getResultList();
        JSONArray featureSourcesJson = new JSONArray();
        for (FeatureSource fs : featureSources){
            JSONObject fsJson = fs.toJSONObject();
            featureSourcesJson.put(fsJson);
           
            JSONObject featuretypesRoot = new JSONObject();
            JSONArray ftJsonArray = new JSONArray();
            featuretypesRoot.put("featureType",ftJsonArray);
            fsJson.put("featuretypes", featuretypesRoot);
            
            List<SimpleFeatureType> featureTypes = fs.getFeatureTypes();
            for (SimpleFeatureType sft : featureTypes){
                JSONObject ftJson= new JSONObject();
                ftJson.put("id",sft.getId());
                ftJson.put("name", sft.getTypeName());
                ftJson.put("description",sft.getDescription());
                ftJsonArray.put(ftJson);
            }
        }
        //format a json for the xml output.
        JSONObject fs = new JSONObject();
        fs.put("featureSource",featureSourcesJson);
        
        JSONObject appl = new JSONObject();
        appl.put("application",jsonApps);
        //make root elements for applicatons and featuresources
        JSONObject firstChild = new JSONObject();
        firstChild.put("applications",appl);
        firstChild.put("featureSources",fs);
        
        JSONObject root = new JSONObject();
        root.put("root",firstChild);
        
        //make xml
        String rawXml = org.json.XML.toString(root);
        
        this.xml = transformXml(rawXml);
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
    public String getXml() {
        return xml;
    }

    public void setXml(String xml) {
        this.xml = xml;
    }
    //</editor-fold>

    private String transformXml(String rawXml) throws TransformerConfigurationException, TransformerException {
        StringReader reader = new StringReader(rawXml);
        StringWriter writer = new StringWriter();
        
        TransformerFactory tFactory = TransformerFactory.newInstance();
        Transformer transformer = tFactory.newTransformer(
            new javax.xml.transform.stream.StreamSource(this.getContext().getServletContext().getRealPath(xslPath)));
         
        transformer.transform(
            new javax.xml.transform.stream.StreamSource(reader), 
            new javax.xml.transform.stream.StreamResult(writer));
        
        return writer.toString();
    }
}
