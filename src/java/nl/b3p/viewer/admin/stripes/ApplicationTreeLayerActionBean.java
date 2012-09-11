/*
 * Copyright (C) 2012 B3Partners B.V.
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
import javax.persistence.NoResultException;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.SimpleError;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.*;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.*;
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
    
    private boolean editable;
    
    @Validate
    private JSONArray attributesJSON = new JSONArray();
    
    @Validate(on="getUniqueValues")
    private String attribute;

    @DefaultHandler
    public Resolution view() {
        return new ForwardResolution(JSP);
    }
    
    @Before
    public void synchronizeFeatureTypeAndLoadInfo() throws JSONException {

        Layer layer = null;
        try {
            layer = (Layer) Stripersist.getEntityManager().createQuery("from Layer "
                    + "where service = :service "
                    + "and name = :name").setParameter("service", applicationLayer.getService()).setParameter("name", applicationLayer.getLayerName()).getSingleResult();

        } catch (NoResultException nre) {
            getContext().getValidationErrors().addGlobalError(new SimpleError("Laag niet gevonden bij originele service - verwijder deze laag uit niveau"));
            return;
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
            // possible

            for(AttributeDescriptor ad: sft.getAttributes()) {
                String name = ad.getName();

                attributesToRetain.add(name);

                // Used for display in JSP
                if(StringUtils.isNotBlank(ad.getAlias())) {
                    attributeAliases.put(name, ad.getAlias());
                }

                if(applicationLayer.getAttribute(name) == null) {
                    ConfiguredAttribute ca = new ConfiguredAttribute();
                    // default visible if not geometry type
                    ca.setVisible(! AttributeDescriptor.GEOMETRY_TYPES.contains(ad.getType()));
                    ca.setAttributeName(name);
                    applicationLayer.getAttributes().add(ca);                        
                    Stripersist.getEntityManager().persist(ca);
                    
                    if(!"save".equals(getContext().getEventName())) {
                        getContext().getMessages().add(new SimpleMessage("Nieuw attribuut \"{0}\" gevonden in attribuutbron: wordt zichtbaar na opslaan", name));
                    }
                }                    
            }

            // Remove ConfiguredAttributes which are no longer present
            List<ConfiguredAttribute> attributesToRemove = new ArrayList();
            for(ConfiguredAttribute ca: applicationLayer.getAttributes()) {
                if(!attributesToRetain.contains(ca.getAttributeName())) {
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
            details = applicationLayer.getDetails();

            groupsRead.addAll(applicationLayer.getReaders());
            groupsWrite.addAll(applicationLayer.getWriters());
            
            // Fill visible checkboxes
            for(ConfiguredAttribute ca: applicationLayer.getAttributes()) {
                if(ca.isVisible()) {
                    selectedAttributes.add(ca.getAttributeName());
                }
            }            
        }

        return new ForwardResolution(JSP);
    }

    private void makeAttributeJSONArray(SimpleFeatureType sft) throws JSONException {
        
        for(ConfiguredAttribute ca: applicationLayer.getAttributes()) {
            JSONObject j = ca.toJSONObject();
            
            // Copy alias over from feature type
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
            Layer layer = (Layer) Stripersist.getEntityManager().createQuery("from Layer "
                    + "where service = :service "
                    + "and name = :name").setParameter("service", applicationLayer.getService()).setParameter("name", applicationLayer.getLayerName()).getSingleResult();

            if (layer.getFeatureType() != null) {
                SimpleFeatureType sft = layer.getFeatureType();
                List<String> beh = sft.calculateUniqueValues(attribute);
                json.put("uniqueValues", new JSONArray(beh));
                json.put("success", Boolean.TRUE);
            }
        } catch (Exception e) {
            json.put("msg",e.toString());
        }

        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    @Before(stages = LifecycleStage.BindingAndValidation)
    @SuppressWarnings("unchecked")
    public void load() {
        allGroups = Stripersist.getEntityManager().createQuery("from Group").getResultList();
    }

    public Resolution save() throws JSONException {
        applicationLayer.getDetails().clear();
        applicationLayer.getDetails().putAll(details);

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
                if (selectedAttributes.contains(appAttribute.getAttributeName())) {
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
    //</editor-fold>
    
}
