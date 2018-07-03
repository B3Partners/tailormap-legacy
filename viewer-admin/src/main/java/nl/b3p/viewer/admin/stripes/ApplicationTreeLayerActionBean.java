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

import java.io.StringReader;
import java.util.*;
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.SimpleError;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.viewer.config.app.*;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.*;
import nl.b3p.viewer.util.SelectedContentCache;
import org.apache.commons.lang3.StringUtils;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@UrlBinding("/action/applicationtreelayer")
@StrictBinding
@RolesAllowed({Group.ADMIN, Group.APPLICATION_ADMIN})
public class ApplicationTreeLayerActionBean extends ApplicationActionBean {

    private static final String JSP = "/WEB-INF/jsp/application/applicationTreeLayer.jsp";
    private static final String ATTRIBUTES_CONFIG_KEY = "attributeConfig";
    private static final String ATTRIBUTES_ORDER_KEY = "attributeOrder";
    
    @Validate
    private ApplicationLayer applicationLayer;
    @Validate
    private List<String> groupsRead = new ArrayList<String>();
    @Validate
    private List<String> groupsWrite = new ArrayList<String>();
    @Validate
    private Map<String, String> details = new HashMap<String, String>();

    @Validate
    private List<String> selectedAttributes = new ArrayList<String>();

    private Map<String,String> attributeAliases = new HashMap();
    
    private List<Map> styles = new ArrayList();
    private JSONObject stylesTitleJson = new JSONObject();
    
    private boolean editable;

    private Long appLayerFeatureType;
    
    @Validate
    private JSONObject attributesJSON = new JSONObject();
    
    private JSONArray attributesConfig = new JSONArray();
    
    @Validate(on="getUniqueValues")
    private String attribute;
    
    private String displayName;

    @DefaultHandler
    public Resolution view() {
        return new ForwardResolution(JSP);
    }

    @Before
    public void loadInfo() throws JSONException{
        Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName(), Stripersist.getEntityManager());
        if(layer == null) {
            getContext().getValidationErrors().addGlobalError(new SimpleError("Laag niet gevonden bij originele service - verwijder deze laag uit niveau"));
            return;
        }

        for(StyleLibrary sld: layer.getService().getStyleLibraries()) {
            Map style = new HashMap();
            JSONObject styleTitleJson = new JSONObject();

            style.put("id", "sld:" + sld.getId());
            style.put("title", "SLD stijl: " + sld.getTitle() + (sld.isDefaultStyle() ? " (standaard)" : ""));

            // Find stuff for layerName
            if(sld.getNamedLayerUserStylesJson() != null) {
                JSONObject sldNamedLayerJson = new JSONObject(sld.getNamedLayerUserStylesJson());
                if(sldNamedLayerJson.has(layer.getName())) {
                    JSONObject namedLayer = sldNamedLayerJson.getJSONObject(layer.getName());
                    if(namedLayer.has("title")) {
                        styleTitleJson.put("namedLayerTitle", namedLayer.get("title"));
                    }
                    JSONArray userStyles = namedLayer.getJSONArray("styles");
                    if(userStyles.length() > 0) {
                        JSONObject userStyle = userStyles.getJSONObject(0);
                        if(userStyle.has("title")) {
                            styleTitleJson.put("styleTitle", userStyle.get("title"));
                        }
                    }
                }
            }
            styles.add(style);
            stylesTitleJson.put((String)style.get("id"), styleTitleJson);

        }
        if (applicationLayer.getService() instanceof WMSService && layer.getDetails().containsKey(Layer.DETAIL_WMS_STYLES)) {
            JSONArray wmsStyles = new JSONArray(layer.getDetails().get(Layer.DETAIL_WMS_STYLES).getValue());
            for(int i = 0; i < wmsStyles.length(); i++) {
                JSONObject wmsStyle = wmsStyles.getJSONObject(i);
                Map style = new HashMap();
                style.put("id", "wms:" + wmsStyle.getString("name"));
                style.put("title", "WMS server stijl: " + wmsStyle.getString("name") + (wmsStyle.has("title") ? " (" + wmsStyle.getString("title") + ")" : ""));
                JSONObject styleTitleJson = new JSONObject();
                styleTitleJson.put("styleTitle", wmsStyle.has("title") ? wmsStyle.getString("title") : wmsStyle.getString("name"));
                styles.add(style);
                stylesTitleJson.put((String)style.get("id"), styleTitleJson);
            }
        }
        if(!styles.isEmpty()) {
            List<Map> temp = new ArrayList();
            Map s = new HashMap();
            s.put("id", "registry_default");
            s.put("title", "In gegevensregister als standaard ingestelde SLD");
            temp.add(s);
            s = new HashMap();
            s.put("id", "none");
            s.put("title", "Geen: standaard stijl van WMS service zelf");
            temp.add(s);
            temp.addAll(styles);
            styles = temp;
        }

        if(layer.getFeatureType() != null && !layer.getFeatureType().getAttributes().isEmpty()) {
            SimpleFeatureType sft = layer.getFeatureType();
            editable = sft.isWriteable();
            appLayerFeatureType = sft.getId();
        }
    }

    @Before
    public void synchronizeFeatureType() throws JSONException {
        EntityManager em = Stripersist.getEntityManager();
        Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName(),em);
        // Synchronize configured attributes with layer feature type

        if(layer.getFeatureType() == null || layer.getFeatureType().getAttributes().isEmpty()) {
            applicationLayer.getAttributes().clear();
        } else {
            List<String> attributesToRetain = new ArrayList();
            
            SimpleFeatureType sft = layer.getFeatureType(); 
            // Rebuild ApplicationLayer.attributes according to Layer FeatureType
            // New attributes are added at the end of the list; the original
            // order is only used when the Application.attributes list is empty
            // So a feature for reordering attributes per applicationLayer is
            // possible.
            // New Attributes from a join or related featureType are added at the 
            //end of the list.                                  
            attributesToRetain = rebuildAttributes(sft);
            
             
            // Remove ConfiguredAttributes which are no longer present
            List<ConfiguredAttribute> attributesToRemove = new ArrayList();
            for(ConfiguredAttribute ca: applicationLayer.getAttributes()) {
                if (ca.getFeatureType()==null){
                    ca.setFeatureType(layer.getFeatureType());
                }
                if(!attributesToRetain.contains(ca.getFullName())) {
                    // Do not modify list we are iterating over
                    attributesToRemove.add(ca);
                    if(!"save".equals(getContext().getEventName())) {
                        getContext().getMessages().add(new SimpleMessage("Attribuut \"{0}\" niet meer beschikbaar in attribuutbron: wordt verwijderd na opslaan", ca.getAttributeName()));
                    }
                }
            }
            for(ConfiguredAttribute ca: attributesToRemove) {
                applicationLayer.getAttributes().remove(ca);
                em.remove(ca);
            }
            if (attributesJSON.has(ATTRIBUTES_CONFIG_KEY)) {
                attributesConfig = attributesJSON.getJSONArray(ATTRIBUTES_CONFIG_KEY);
            } else {
                attributesConfig = new JSONArray();
                // JSON info about attributed required for editing
                makeAttributeJSONArray(layer.getFeatureType());
            }
        }        
    }
    
    @DontValidate
    public Resolution edit() throws JSONException {
        if (applicationLayer != null) {
            details = new HashMap();
            for(Map.Entry<String,ClobElement> e: applicationLayer.getDetails().entrySet()) {
                details.put(e.getKey(), e.getValue().getValue());
            }

            groupsRead.addAll(applicationLayer.getReaders());
            groupsWrite.addAll(applicationLayer.getWriters());
            
            // Fill visible checkboxes
            for(ConfiguredAttribute ca: applicationLayer.getAttributes()) {
                if(ca.isVisible()) {
                    selectedAttributes.add(ca.getFullName());
                }
            }            
        }

        return new ForwardResolution(JSP);
    }
    
    private List<String> rebuildAttributes(SimpleFeatureType sft) {
        EntityManager em = Stripersist.getEntityManager();
        Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName(),em);
        List<String> attributesToRetain = new ArrayList<String>();
        for(AttributeDescriptor ad: sft.getAttributes()) {
            String name = ad.getName();

            String fullName=sft.getId()+":"+name;
            //if attribute already added return.
            if (attributesToRetain.contains(fullName)){
                return attributesToRetain;
            }
            attributesToRetain.add(fullName);

            // Used for display in JSP
            if(StringUtils.isNotBlank(ad.getAlias())) {
                attributeAliases.put(fullName, ad.getAlias());
            }

            if(applicationLayer.getAttribute(sft,name) == null) {
                ConfiguredAttribute ca = new ConfiguredAttribute();
                // default visible if not geometry type
                // and not a attribute of a related featuretype
                boolean defaultVisible=true;
                if (layer.getFeatureType().getId()!=sft.getId() || AttributeDescriptor.GEOMETRY_TYPES.contains(ad.getType())){
                    defaultVisible=false;
                }
                ca.setVisible(defaultVisible);
                ca.setAttributeName(name);
                ca.setFeatureType(sft);
                applicationLayer.getAttributes().add(ca);                        
                em.persist(ca);
                
                if(!"save".equals(getContext().getEventName())) {
                    String message ="Nieuw attribuut \"{0}\" gevonden in ";
                    if(layer.getFeatureType().getId()!=sft.getId()){
                        message+="gekoppelde ";
                    }
                    message+="attribuutbron";
                    if(layer.getFeatureType().getId()==sft.getId()){
                        message+=": wordt zichtbaar na opslaan";
                    }
                    getContext().getMessages().add(new SimpleMessage(message, name));
                }
            }                    
        }
        if (sft.getRelations()!=null){
            for (FeatureTypeRelation rel : sft.getRelations()){
                attributesToRetain.addAll(rebuildAttributes(rel.getForeignFeatureType()));
            }
        }
        return attributesToRetain;
    }
    
    private void sortPerFeatureType(final SimpleFeatureType layerSft, List<ConfiguredAttribute> cas) {
        List<FeatureTypeRelation> relations = layerSft.getRelations();
        for (FeatureTypeRelation relation : relations) {
             SimpleFeatureType foreign = relation.getForeignFeatureType();
             // Sort the attributes of the foreign featuretype. The "owning" featuretype is sorted below, so it doesn't need a call to this method.
             sortPerFeatureType(foreign, cas);
        }
    }
    
    public Resolution attributes() throws JSONException{
        attributesConfig = new JSONArray();
        
        Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName(), Stripersist.getEntityManager());
        makeAttributeJSONArray(layer.getFeatureType());
        return new StreamingResolution("application/json", new StringReader(attributesConfig.toString()));
    }

    private void makeAttributeJSONArray(final SimpleFeatureType layerSft) throws JSONException {
        List<ConfiguredAttribute> cas = applicationLayer.getAttributes();
        if(layerSft != null){
            // Sort the attributes by name (per featuretype)
            sortPerFeatureType(layerSft, cas);
        }

        for(ConfiguredAttribute ca: cas) {
            JSONObject j = ca.toJSONObject();
            
            // Copy alias over from feature type
            SimpleFeatureType sft= ca.getFeatureType();
            if (sft==null){
                sft=layerSft;
            }
            AttributeDescriptor ad = sft.getAttribute(ca.getAttributeName());
            j.put("alias", ad.getAlias());
            j.put("featureTypeAttribute", ad.toJSONObject());
            
            attributesConfig.put(j);
        }
    }    
    
    public Resolution getUniqueValues() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);

        try {
            Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName(), Stripersist.getEntityManager());
            if(layer != null && layer.getFeatureType() != null) {
                SimpleFeatureType sft = layer.getFeatureType();
                List<String> beh = sft.calculateUniqueValues(attribute);
                json.put("uniqueValues", new JSONArray(beh));
                json.put("success", Boolean.TRUE);
            }
        } catch(Exception e) {
            json.put("msg", e.toString());
        }
        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    public Resolution save() throws JSONException {
        EntityManager em = Stripersist.getEntityManager();
        // Only remove details which are editable and re-added layer if not empty,
        // retain other details possibly used in other parts than this page
        // See JSP for which keys are edited         
        applicationLayer.getDetails().keySet().removeAll(Arrays.asList(
                "titleAlias",
                "legendImageUrl",
                "transparency",
                "influenceradius",
                "summary.title",
                "summary.image",
                "summary.texteditor",
                "summary.description",
                "summary.link",
                "editfunction.title",
                "style",
                "metadataurl",
                "summary.noHtmlEncode",
                "summary.nl2br",
                "summary.retrieveUploads",
                "editfeature.usernameAttribute",
                "editfeature.uploadDocument",
                "editfeature.uploadDocument.types"
        ));     
        for(Map.Entry<String,String> e: details.entrySet()) {
            if(e.getValue() != null) { // Don't insert null value ClobElement 
                applicationLayer.getDetails().put(e.getKey(), new ClobElement(e.getValue()));
            }
        }

        applicationLayer.getReaders().clear();
        for (String groupName : groupsRead) {
            applicationLayer.getReaders().add(groupName);
        }

        applicationLayer.getWriters().clear();
        for (String groupName : groupsWrite) {
            applicationLayer.getWriters().add(groupName);
        }

        if (applicationLayer.getAttributes() != null && applicationLayer.getAttributes().size() > 0) {
            JSONArray attributeOrder = attributesJSON.getJSONArray(ATTRIBUTES_ORDER_KEY);
            List<ConfiguredAttribute> appAttributes = applicationLayer.getAttributes();
            applicationLayer.setAttributes(processAttributes(em, attributeOrder, attributesConfig, appAttributes));
        }
        
        em.persist(applicationLayer);
        application.authorizationsModified();

        displayName = applicationLayer.getDisplayName(em);
        SelectedContentCache.setApplicationCacheDirty(application, true, false,em);
        
        em.getTransaction().commit();

        attributesConfig = new JSONArray();
        
        Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName(), em);
        makeAttributeJSONArray(layer.getFeatureType());

        getContext().getMessages().add(new SimpleMessage("De kaartlaag is opgeslagen"));
        return edit();
    }
    
    protected List<ConfiguredAttribute> processAttributes(EntityManager em, JSONArray attributeOrder,JSONArray attributesConfig, List<ConfiguredAttribute> appAttributes ) {
        Map<String, JSONObject> attributeOrderMap = new HashMap<String, JSONObject>();
        Map<String, JSONObject> attributeConfigMap = new HashMap<String, JSONObject>();
        for (Iterator<Object> iterator = attributeOrder.iterator(); iterator.hasNext();) {
            JSONObject order = (JSONObject)iterator.next();
            attributeOrderMap.put(order.getString("longname"), order);
        }
        
        for (Iterator iterator = attributesConfig.iterator(); iterator.hasNext();) {
            JSONObject config = (JSONObject)iterator.next();
            attributeConfigMap.put(config.getString("longname"), config);
        }
        
        for (Iterator it = appAttributes.iterator(); it.hasNext();) {
            ConfiguredAttribute appAttribute = (ConfiguredAttribute) it.next();

            JSONObject orderConfigObject = attributeOrderMap.get(appAttribute.getLongName());

            //save visible
            if (orderConfigObject != null && orderConfigObject.has("checked")) {
                appAttribute.setVisible(orderConfigObject.getBoolean("checked"));
            } else {
                appAttribute.setVisible(false);
            }

            // save folder label
            if(orderConfigObject != null && orderConfigObject.has("folder_label")) {
                appAttribute.setLabel(orderConfigObject.getString("folder_label"));
            }

            //save editable
            JSONObject configObject = attributeConfigMap.get(appAttribute.getLongName());
            if(configObject != null){

                if (configObject.has("editable")) {
                    appAttribute.setEditable(configObject.getBoolean("editable"));
                }
                if (configObject.has("editAlias")) {
                    appAttribute.setEditAlias(configObject.getString("editAlias"));
                }
                if (configObject.has("editvalues")) {
                    appAttribute.setEditValues(configObject.get("editvalues").toString());
                }
                if (configObject.has("editHeight")) {
                    appAttribute.setEditHeight(configObject.getString("editHeight"));
                }

                //save selectable
                if (configObject.has("selectable")) {
                    appAttribute.setSelectable(configObject.getBoolean("selectable"));
                }
                if (configObject.has("filterable")) {
                    appAttribute.setFilterable(configObject.getBoolean("filterable"));
                }

                if (configObject.has("defaultValue")) {
                    appAttribute.setDefaultValue(configObject.getString("defaultValue"));
                }

                if (configObject.has("valueListFeatureSource") && !configObject.isNull("valueListFeatureSource")) {
                    Long id = configObject.getLong("valueListFeatureSource");
                    FeatureSource fs = em.find(FeatureSource.class, id);
                    appAttribute.setValueListFeatureSource(fs);
                }

                if (configObject.has("valueListFeatureType") && !configObject.isNull("valueListFeatureType")) {
                    Long id = configObject.getLong("valueListFeatureType");
                    SimpleFeatureType ft = em.find(SimpleFeatureType.class, id);
                    appAttribute.setValueListFeatureType(ft);
                }

                if (configObject.has("valueListValueAttribute") && !configObject.isNull("valueListValueAttribute")) {
                    appAttribute.setValueListValueName(configObject.getString("valueListValueAttribute"));
                }

                if (configObject.has("valueListLabelAttribute") && !configObject.isNull("valueListLabelAttribute")) {
                    appAttribute.setValueListLabelName(configObject.getString("valueListLabelAttribute"));
                }

                if (configObject.has("valueList") && !configObject.isNull("valueList")) {
                    appAttribute.setValueList(configObject.getString("valueList"));
                }

                if (configObject.has("allowValueListOnly")) {
                    appAttribute.setAllowValueListOnly(configObject.getBoolean("allowValueListOnly"));
                }
                if (configObject.has("disallowNullValue")) {
                    appAttribute.setDisallowNullValue(configObject.getBoolean("disallowNullValue"));
                }
                if (configObject.has("disableUserEdit")) {
                    appAttribute.setDisableUserEdit(configObject.getBoolean("disableUserEdit"));
                }
            }
        }
        
        List<ConfiguredAttribute> newOrder = new ArrayList<ConfiguredAttribute>();
        for (Iterator<Object> iterator = attributeOrder.iterator(); iterator.hasNext();) {
            JSONObject orderObject = (JSONObject)iterator.next();
            String longname = orderObject.getString("longname");
            for (ConfiguredAttribute appAttribute : appAttributes) {
                if(appAttribute.getLongName().equals(longname)){
                    newOrder.add(appAttribute);
                    break;
                }
            }
        }
        return newOrder;  
    }

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public ApplicationLayer getApplicationLayer() {
        return applicationLayer;
    }

    public void setApplicationLayer(ApplicationLayer applicationLayer) {
        this.applicationLayer = applicationLayer;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    public void setDetails(Map<String, String> details) {
        this.details = details;
    }

    public List<String> getSelectedAttributes() {
        return selectedAttributes;
    }

    public void setSelectedAttributes(List<String> selectedAttributes) {
        this.selectedAttributes = selectedAttributes;
    }

    public JSONObject getAttributesJSON() {
        return attributesJSON;
    }

    public void setAttributesJSON(JSONObject attributesJSON) {
        this.attributesJSON = attributesJSON;
    }


    public boolean isEditable() {
        return editable;
    }

    public void setEditable(boolean editable) {
        this.editable = editable;
    }

    public List<String> getGroupsWrite() {
        return groupsWrite;
    }

    public void setGroupsWrite(List<String> groupsWrite) {
        this.groupsWrite = groupsWrite;
    }

    public List<String> getGroupsRead() {
        return groupsRead;
    }

    public void setGroupsRead(List<String> groupsRead) {
        this.groupsRead = groupsRead;
    }

    public String getAttribute() {
        return attribute;
    }

    public void setAttribute(String attribute) {
        this.attribute = attribute;
    }

    public Map<String, String> getAttributeAliases() {
        return attributeAliases;
    }

    public void setAttributeAliases(Map<String, String> attributeAliases) {
        this.attributeAliases = attributeAliases;
    }
    
    public List<Map> getStyles() {
        return styles;
    }

    public void setStyles(List<Map> styles) {
        this.styles = styles;
    }

    public JSONObject getStylesTitleJson() {
        return stylesTitleJson;
    }

    public void setStylesTitleJson(JSONObject stylesTitleJson) {
        this.stylesTitleJson = stylesTitleJson;
    }
    
    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public Long getAppLayerFeatureType() {
        return appLayerFeatureType;
    }

    public void setAppLayerFeatureType(Long appLayerFeatureType) {
        this.appLayerFeatureType = appLayerFeatureType;
    }    
    
    public JSONArray getAttributesConfig() {
        return attributesConfig;
    }

    public void setAttributesConfig(JSONArray attributesConfig) {
        this.attributesConfig = attributesConfig;
    }
    

    //</editor-fold>    


}
