/*
 * Copyright (C) 2013 B3Partners B.V.
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

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.text.MessageFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.ResourceBundle;
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import javax.xml.xpath.XPathFactoryConfigurationException;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.i18n.LocalizableActionBean;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

/**
 *
 * @author Roy Braam
 */
@StrictBinding
@UrlBinding("/action/serviceUsageMatrix/{$event}")
@RolesAllowed({Group.ADMIN,Group.REGISTRY_ADMIN})
public class ServiceUsageMatrixActionBean extends LocalizableActionBean {
    private static final Log log = LogFactory.getLog(ServiceUsageMatrixActionBean.class);
    private static final String JSP = "/WEB-INF/jsp/services/serviceusagematrix.jsp";
    private static final String xslPath="/WEB-INF/classes/xsl/ServiceUsageMatrix.xsl";
    private ActionBeanContext context;

    @Validate
    private String xml;
    @Validate
    private ApplicationLayer applicationLayer;
    @Validate
    private Application application;
    @Validate
    private FeatureSource featureSource;
    @Validate
    private String changedFeatureTypes;
    @Validate
    private String output_format;

    private JSONObject data;
    
    private void createData() throws Exception {
        List<Application> applications = Stripersist.getEntityManager().createQuery("FROM Application order by name,version").getResultList();
        JSONArray jsonApps = new JSONArray();
        EntityManager em = Stripersist.getEntityManager();
        for (Application app: applications){
            JSONObject json = new JSONObject(app.toJSON(this.context.getRequest(),true,true,em));
            jsonApps.put(json);
        }
        //add the featureSources to the JSON.
        List <FeatureSource> featureSources;
        if (this.featureSource==null){
            featureSources = em.createQuery("FROM FeatureSource").getResultList();
        }else{
            featureSources = new ArrayList<FeatureSource>();
            featureSources.add(this.featureSource);
        }
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

        data = new JSONObject();
        data.put("root",firstChild);
    }

    @DefaultHandler
    public Resolution view() throws JSONException, TransformerConfigurationException, TransformerException, Exception {

        //make xml
        createData();
        String rawXml = org.json.XML.toString(data);

        this.xml = transformXml(rawXml);
        Date nowDate = new Date(System.currentTimeMillis());
        SimpleDateFormat sdf = (SimpleDateFormat) SimpleDateFormat.getDateInstance();
        sdf.applyPattern("HH-mm_dd-MM-yyyy");
        String now = sdf.format(nowDate);
        final String fileName = "UsageMatrix_" + now;
        if (output_format!=null || "XLS".equalsIgnoreCase(output_format)){
            final XSSFWorkbook workbook= createWorkBook(this.xml);
            return new StreamingResolution("application/vnd.ms-excel"){
                public void stream(final HttpServletResponse response){
                    try{
                        workbook.write(response.getOutputStream());
                    }catch(IOException ioe){
                        log.error("Error while writing workbook",ioe);
                    }
                }
            }.setAttachment(true).setFilename(fileName + ".xls");
        }
        return new ForwardResolution(JSP);
    }

    public Resolution json() throws Exception {
        createData();
        return new StreamingResolution("application/json", new StringReader(data.toString(4)));
    }

    public Resolution xml() throws Exception {
        createData();
        return new StreamingResolution("text/xml", new StringReader(org.json.XML.toString(data)));
    }

    public Resolution xmlTransformed() throws Exception {
        createData();
        return new StreamingResolution("text/xml", new StringReader(transformXml(org.json.XML.toString(data))));
    }

    public Resolution deleteApplicationLayer() throws JSONException{
        JSONObject json = new JSONObject();
        try{
            json.put("success",false);
            if (this.applicationLayer!=null && this.application!=null){
                json.put("id",this.applicationLayer.getId());
                json.put("name",this.applicationLayer.getDisplayName(Stripersist.getEntityManager()));

                Level parent=this.application.getRoot().getParentInSubtree(applicationLayer);
                if (parent==null){
                    json.put("message", MessageFormat.format(getBundle().getString("viewer.serviceusagematrixactionbean.noparent"), 
                            this.applicationLayer.getId(), this.getApplication().getId()));
                }else{
                    parent.getLayers().remove(this.applicationLayer);
                    Stripersist.getEntityManager().remove(this.applicationLayer);
                    Stripersist.getEntityManager().getTransaction().commit();
                    json.put("success",true);
                }
            }else{
                json.put("message",getBundle().getString("viewer.serviceusagematrixactionbean.noappl"));
            }
        }catch (Exception e){
            log.error("Error while deleting applicationlayer",e);
            json.put("message",e.getLocalizedMessage());
        }
        return new StreamingResolution("text/html", new StringReader(json.toString()));
    }

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

    public ApplicationLayer getApplicationLayer() {
        return applicationLayer;
    }

    public void setApplicationLayer(ApplicationLayer applicationLayer) {
        this.applicationLayer = applicationLayer;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public FeatureSource getFeatureSource() {
        return featureSource;
    }

    public void setFeatureSource(FeatureSource featureSource) {
        this.featureSource = featureSource;
    }

    public String getChangedFeatureTypes() {
        return changedFeatureTypes;
    }

    public void setChangedFeatureTypes(String changedFeatureTypes) {
        this.changedFeatureTypes = changedFeatureTypes;
    }

    public String getOutput_format() {
        return output_format;
    }

    public void setOutput_format(String output_format) {
        this.output_format = output_format;
    }
    //</editor-fold>

    public static XSSFWorkbook createWorkBook(String theXml) throws ParserConfigurationException, SAXException, IOException, XPathExpressionException, XPathFactoryConfigurationException {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc=builder.parse(new InputSource(new StringReader(theXml)));

        XSSFWorkbook workbook = new XSSFWorkbook();
        String tempProperty=null;
        try{            Element root = doc.getDocumentElement();
            /* JSTL XML is setting the system property to use the jstl xpath facotry.
             * Remove the setting temporary:
             * see: https://java.net/jira/browse/JSTL-1
             */
            tempProperty =  System.getProperty(XPathFactory.DEFAULT_PROPERTY_NAME +
                ":" + XPathFactory.DEFAULT_OBJECT_MODEL_URI);
            if (tempProperty!=null){
                System.clearProperty(XPathFactory.DEFAULT_PROPERTY_NAME +
                ":" + XPathFactory.DEFAULT_OBJECT_MODEL_URI);
            }

            XPathFactory xpathFactory = XPathFactory.newInstance();
            XPath xpath = xpathFactory.newXPath();
            XPathExpression exprFeatureSource = xpath.compile("//featureSource");
            XPathExpression exprFeatureType = xpath.compile("featureType");
            XPathExpression exprApplication = xpath.compile("applications/application");
            XPathExpression exprLayer = xpath.compile("layers/layer");
            XPathExpression exprAppLayer = xpath.compile("applayers/applayer");
            XPathExpression exprId = xpath.compile("id/text()");
            XPathExpression exprAlias = xpath.compile("alias/text()");
            XPathExpression exprName = xpath.compile("name/text()");
            XPathExpression exprVersion = xpath.compile("version/text()");
            XPathExpression exprProtocol = xpath.compile("protocol/text()");
            XPathExpression exprUrl = xpath.compile("url/text()");

            XSSFSheet sheet = workbook.createSheet("Sheet 1");
            int rowNum=0;

            Row head = sheet.createRow(rowNum++);
            String[] headValues = {"Bron","Featuretype","Applicatie","Layernaam van service","Application layer (kaart)"};
            for (int c = 0; c < headValues.length; c++){
                Cell cell = head.createCell(c);
                cell.setCellValue(headValues[c]);
            }
            List<String> columns=  new ArrayList<String>();
            for (int i=0; i < headValues.length; i++){
                columns.add("");
            }
            NodeList featureSources = (NodeList) exprFeatureSource.evaluate(root,XPathConstants.NODESET);

            for (int fs=0; fs < featureSources.getLength(); fs++){
                Node featureSource = featureSources.item(fs);

                String fsString=(String) exprName.evaluate(featureSource,XPathConstants.STRING);
                fsString+=" ("+(String) exprProtocol.evaluate(featureSource,XPathConstants.STRING);
                fsString+=":: "+(String) exprUrl.evaluate(featureSource,XPathConstants.STRING);
                fsString+=" id: "+(String) exprId.evaluate(featureSource,XPathConstants.STRING);
                fsString+=")";
                columns.set(0,fsString);
                NodeList featureTypes = (NodeList) exprFeatureType.evaluate(featureSource,XPathConstants.NODESET);
                for (int ft=0; ft < featureTypes.getLength(); ft++){
                    Node featureType = featureTypes.item(ft);
                    //String ftId = (String) exprId.evaluate(featureType,XPathConstants.STRING);
                    String ftName = (String) exprName.evaluate(featureType,XPathConstants.STRING);
                    //String ftString = ""+ftName;
                    columns.set(1,ftName);
                    NodeList applications = (NodeList) exprApplication.evaluate(featureType, XPathConstants.NODESET);
                    for (int app=0; app< applications.getLength(); app++){
                        Node application = applications.item(app);
                        String appVersion= (String) exprVersion.evaluate(application,XPathConstants.STRING);

                        String appString = (String) exprName.evaluate(application,XPathConstants.STRING);
                        if (appVersion!=null){
                            appString += ", version: "+appVersion;
                        }
                        appString+=" ("+(String) exprId.evaluate(application,XPathConstants.STRING)+")";
                        columns.set(2,appString);
                        NodeList layers = (NodeList) exprLayer.evaluate(application,XPathConstants.NODESET);
                        for (int lay=0; lay < layers.getLength(); lay++){
                            Node layer = layers.item(lay);
                            String layerString = "";
                            layerString += (String) exprName.evaluate(layer,XPathConstants.STRING);
                            columns.set(3,layerString);
                            NodeList appLayers = (NodeList) exprAppLayer.evaluate(layer,XPathConstants.NODESET);
                            for (int al=0; al < appLayers.getLength(); al++){
                                Node appLayer = appLayers.item(al);
                                String alString=(String) exprAlias.evaluate(appLayer,XPathConstants.STRING);
                                alString+=" ("+(String) exprId.evaluate(appLayer,XPathConstants.STRING)+")";
                                columns.set(4,alString);
                                Row row=sheet.createRow(rowNum++);
                                for (int c=0; c < columns.size(); c++){
                                    Cell cell = row.createCell(c);
                                    cell.setCellValue(columns.get(c));
                                }
                            }
                        }
                    }
                }
            }
        }finally{
            if (tempProperty!=null){
                System.setProperty(XPathFactory.DEFAULT_PROPERTY_NAME +
                ":" + XPathFactory.DEFAULT_OBJECT_MODEL_URI, tempProperty);
            }
        }
        return workbook;
    }

    public static void main (String[] args) throws Exception{
        String x="<?xml version=\"1.0\" encoding=\"UTF-8\"?><root><featureSources><featureSource><id>2</id><name>Gemeentes (CBS 2010)</name><protocol>wfs</protocol><url>http://mapserver.openwion.nl/cgi-bin/mapserv?map=/srv/b3p-wion/maps/gemeentes_cbs_2010.map</url><featureType><id>1</id><name>gemeentes</name><description/><applications><application><id>3</id><name>ol</name><version>2</version><layers><layer><serviceId>2</serviceId><name>gemeentes</name><applayers><applayer><id>48</id><alias>gemeentes</alias></applayer></applayers></layer></layers></application><application><id>1</id><name>default</name><version/><layers><layer><serviceId>2</serviceId><name>gemeentes</name><applayers><applayer><id>3</id><alias>gemeentes</alias></applayer></applayers></layer></layers></application><application><id>5</id><name>ol</name><version>3</version><layers><layer><serviceId>2</serviceId><name>gemeentes</name><applayers><applayer><id>71</id><alias>gemeentes</alias></applayer></applayers></layer></layers></application><application><id>2</id><name>ol</name><version/><layers><layer><serviceId>2</serviceId><name>gemeentes</name><applayers><applayer><id>31</id><alias>gemeentes</alias></applayer></applayers></layer></layers></application><application><id>30</id><name>ol22</name><version/><layers><layer><serviceId>2</serviceId><name>gemeentes</name><applayers><applayer><id>443</id><alias>gemeentes</alias></applayer></applayers></layer></layers></application></applications></featureType></featureSource></featureSources></root>";
        ServiceUsageMatrixActionBean.createWorkBook(x);

    }

}
