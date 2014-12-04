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
package nl.b3p.viewer.stripes;

import java.io.StringReader;
import java.util.List;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class UniqueValuesActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(UniqueValuesActionBean.class);

    private ActionBeanContext context;
    @Validate
    private ApplicationLayer applicationLayer;
    @Validate
    private SimpleFeatureType featureType;
    @Validate
    private String[] attributes;
    @Validate
    private String attribute;
    @Validate
    private String operator;
    @Validate
    private int maxFeatures = 250;

    // <editor-fold desc="Getters and Setters" defaultstate="collapsed">
    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public ApplicationLayer getApplicationLayer() {
        return applicationLayer;
    }

    public void setApplicationLayer(ApplicationLayer applicationLayer) {
        this.applicationLayer = applicationLayer;
    }

    public String[] getAttributes() {
        return attributes;
    }

    public void setAttributes(String[] attributes) {
        this.attributes = attributes;
    }

    public String getAttribute() {
        return attribute;
    }

    public void setAttribute(String attribute) {
        this.attribute = attribute;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public int getMaxFeatures() {
        return maxFeatures;
    }

    public void setMaxFeatures(int maxFeatures) {
        this.maxFeatures = maxFeatures;
    }

    // </editor-fold>

    @DefaultHandler
    public Resolution getUniqueValues() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);

        try {
            if (this.featureType==null){
                Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName());
                if(layer != null && layer.getFeatureType() != null) {
                    this.featureType=layer.getFeatureType();
                }
            }
                //SimpleFeatureType sft = layer.getFeatureType();
            JSONObject uniqueValues = new JSONObject();
            for (int i = 0; i < attributes.length; i++) {
                String attribute = attributes[i];
                List<String> beh = this.featureType.calculateUniqueValues(attribute,maxFeatures);

                uniqueValues.put(attribute, new JSONArray(beh));
                json.put("success", Boolean.TRUE);
            }
            json.put("uniqueValues", uniqueValues);

        } catch (Exception e) {
            log.error("getUniqueValues() failed", e);
            json.put("msg", "Unieke waardes ophalen mislukt voor laag " + applicationLayer.getLayerName() + ": " + e.toString());
        }
        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    public Resolution getMinMaxValue() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);

        try {
            Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName());
            if(layer != null && layer.getFeatureType() != null) {
                SimpleFeatureType sft = layer.getFeatureType();
                Object value;
                if(operator.equals("#MAX#")) {
                    value = sft.getMaxValue(attribute);
                } else {
                    value = sft.getMinValue(attribute);
                }

                json.put("value", value.toString());
                json.put("success", Boolean.TRUE);
            }
        } catch (Exception e) {
            log.error("getMinMaxValue() failed", e);
            json.put("msg", "Minmax waardes bepalen mislukt voor attribuut " + attribute + ": " + e.toString());
        }
        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    public SimpleFeatureType getFeatureType() {
        return featureType;
    }

    public void setFeatureType(SimpleFeatureType featureType) {
        this.featureType = featureType;
    }
}
