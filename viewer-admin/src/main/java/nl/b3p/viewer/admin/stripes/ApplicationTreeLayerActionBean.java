/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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

import java.io.StringReader;
import java.util.*;
import javax.annotation.security.RolesAllowed;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
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
    @Validate
    private ApplicationLayer applicationLayer;
    private List<Group> allGroups;
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

    @Validate
    private JSONArray attributesJSON = new JSONArray();

    @Validate(on="getUniqueValues")
    private String attribute;

    private String displayName;

    @DefaultHandler
    public Resolution view() {
        return new ForwardResolution(JSP);
    }

    @Before
    public void synchronizeFeatureTypeAndLoadInfo() throws JSONException {

        Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName());
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
        if(layer.getDetails().containsKey(Layer.DETAIL_WMS_STYLES)) {
            JSONArray wmsStyles = new JSONArray(layer.getDetails().get(Layer.DETAIL_WMS_STYLES).getValue());
            for(int i = 0; i < wmsStyles.length(); i++) {
                JSONObject wmsStyle = wmsStyles.getJSONObject(i);
                Map style = new HashMap();
                style.put("id", "wms:" + wmsStyle.getString("name"));
                style.put("title", "WMS server stijl: " + wmsStyle.getString("name") + " (" + wmsStyle.getString("title") + ")");
                JSONObject styleTitleJson = new JSONObject();
                styleTitleJson.put("styleTitle", wmsStyle.getString("title"));
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

        // Synchronize configured attributes with layer feature type

        if(layer.getFeatureType() == null || layer.getFeatureType().getAttributes().isEmpty()) {
            applicationLayer.getAttributes().clear();
        } else {
            List<String> attributesToRetain = new ArrayList();

            SimpleFeatureType sft = layer.getFeatureType();
            editable = sft.isWriteable();
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
                Stripersist.getEntityManager().remove(ca);
            }

            // JSON info about attributed required for editing
            makeAttributeJSONArray(layer.getFeatureType());
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
        Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName());
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
                Stripersist.getEntityManager().persist(ca);

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
        // Sort the attributes of the given SimpleFeatureType (layerSft), ordering by attributename
        Collections.sort(cas, new Comparator<ConfiguredAttribute>() {
            @Override
            public int compare(ConfiguredAttribute o1, ConfiguredAttribute o2) {
                if (o1.getFeatureType() == null) {
                    return 0;
                }
                if (o2.getFeatureType() == null) {
                    return 0;
                }
                if (o1.getFeatureType().getId().equals(layerSft.getId()) && o2.getFeatureType().getId().equals(layerSft.getId())) {
                    return o1.getAttributeName().compareTo(o2.getAttributeName());
                }else{
                    return 0;
                }
            }
        });
    }

    public Resolution attributes() throws JSONException{
        attributesJSON = new JSONArray();
        Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName());
        makeAttributeJSONArray(layer.getFeatureType());
        return new StreamingResolution("application/json", new StringReader(attributesJSON.toString()));
    }

    private void makeAttributeJSONArray(final SimpleFeatureType layerSft) throws JSONException {
        List<ConfiguredAttribute> cas = applicationLayer.getAttributes();
        //Sort the attributes, by featuretype: neccessary for related featuretypes
        Collections.sort(cas, new Comparator<ConfiguredAttribute>() {
            @Override
            public int compare(ConfiguredAttribute o1, ConfiguredAttribute o2) {
                if (o1.getFeatureType() == null) {
                    return -1;
                }
                if (o2.getFeatureType() == null) {
                    return 1;
                }
                if (o1.getFeatureType().getId().equals(layerSft.getId())) {
                    return -1;
                }
                if (o2.getFeatureType().getId().equals(layerSft.getId())) {
                    return 1;
                }
                return o1.getFeatureType().getId().compareTo(o2.getFeatureType().getId());
            }
        });

        // Sort the attributes by name (per featuretype)
        sortPerFeatureType(layerSft, cas);

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

            attributesJSON.put(j);
        }
    }

    public Resolution getUniqueValues() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);

        try {
            Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName());
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

    @Before(stages = LifecycleStage.BindingAndValidation)
    @SuppressWarnings("unchecked")
    public void load() {
        allGroups = Stripersist.getEntityManager().createQuery("from Group").getResultList();
    }

    public Resolution save() throws JSONException {
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
                "summary.description",
                "summary.link",
                "editfunction.title",
                "style",
                "summary.noHtmlEncode",
                "summary.nl2br",
                "editfeature.usernameAttribute"
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
            List<ConfiguredAttribute> appAttributes = applicationLayer.getAttributes();
            int i = 0;

            for (Iterator it = appAttributes.iterator(); it.hasNext();) {
                ConfiguredAttribute appAttribute = (ConfiguredAttribute) it.next();
                //save visible
                if (selectedAttributes.contains(appAttribute.getFullName())) {
                    appAttribute.setVisible(true);
                } else {
                    appAttribute.setVisible(false);
                }

                //save editable
                if (attributesJSON.length() > i) {
                    JSONObject attribute = attributesJSON.getJSONObject(i);

                    if (attribute.has("editable")) {
                        appAttribute.setEditable(new Boolean(attribute.get("editable").toString()));
                    }
                    if (attribute.has("editalias")) {
                        appAttribute.setEditAlias(attribute.get("editalias").toString());
                    }
                    if (attribute.has("editvalues")) {
                        appAttribute.setEditValues(attribute.get("editvalues").toString());
                    }
                    if (attribute.has("editHeight")) {
                        appAttribute.setEditHeight(attribute.get("editHeight").toString());
                    }

                    //save selectable
                    if (attribute.has("selectable")) {
                        appAttribute.setSelectable(new Boolean(attribute.get("selectable").toString()));
                    }
                    if (attribute.has("filterable")) {
                        appAttribute.setFilterable(new Boolean(attribute.get("filterable").toString()));
                    }

                    if (attribute.has("defaultValue")) {
                        appAttribute.setDefaultValue(attribute.get("defaultValue").toString());
                    }
                }
                i++;
            }
        }

        Stripersist.getEntityManager().persist(applicationLayer);
        application.authorizationsModified();

        displayName = applicationLayer.getDisplayName();
        SelectedContentCache.setApplicationCacheDirty(application, true);

        Stripersist.getEntityManager().getTransaction().commit();

        getContext().getMessages().add(new SimpleMessage("De kaartlaag is opgeslagen"));
        return edit();
    }

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public ApplicationLayer getApplicationLayer() {
        return applicationLayer;
    }

    public void setApplicationLayer(ApplicationLayer applicationLayer) {
        this.applicationLayer = applicationLayer;
    }

    public List<Group> getAllGroups() {
        return allGroups;
    }

    public void setAllGroups(List<Group> allGroups) {
        this.allGroups = allGroups;
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

    public JSONArray getAttributesJSON() {
        return attributesJSON;
    }

    public void setAttributesJSON(JSONArray attributesJSON) {
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
    //</editor-fold>

}
