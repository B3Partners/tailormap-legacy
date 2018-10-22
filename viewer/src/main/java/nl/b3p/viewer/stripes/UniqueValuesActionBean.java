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
package nl.b3p.viewer.stripes;

import java.io.StringReader;
import java.util.List;
import java.util.Map;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.util.FlamingoCQL;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.filter.Filter;
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
    @Validate
    private String filter;

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

    public String getFilter() {
        return filter;
    }

    public void setFilter(String filter) {
        this.filter = filter;
    }
    // </editor-fold>

    @DefaultHandler
    public Resolution getUniqueValues() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);

        try {
            if (this.featureType==null){
                Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName(), Stripersist.getEntityManager());
                if(layer != null && layer.getFeatureType() != null) {
                    this.featureType=layer.getFeatureType();
                }
            }
                //SimpleFeatureType sft = layer.getFeatureType();
            JSONObject uniqueValues = new JSONObject();
            for (int i = 0; i < attributes.length; i++) {
                String attribute = attributes[i];
                Filter  f = filter != null ? FlamingoCQL.toFilter(filter,Stripersist.getEntityManager()) : null;
                List<String> beh = this.featureType.calculateUniqueValues(attribute,maxFeatures,f);

                uniqueValues.put(attribute, new JSONArray(beh));
                json.put("success", Boolean.TRUE);
            }
            json.put("uniqueValues", uniqueValues);

        } catch (Exception e) {
            log.error("getUniqueValues() failed", e);
            json.put("msg", "Fetching unique values failed for layer " + applicationLayer.getLayerName() + ": " + e.toString());
        }
        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    /**
     * Get a list of key/value pairs to use in picklists.
     *
     * @return json containing a list of id/label objects
     * @throws JSONException if any
     */
    public Resolution getKeyValuePairs() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);
        try {
            if (attributes.length != 2) {
                throw new IllegalArgumentException("This function needs 2 attributes: a key and a label.");
            }

            if (this.featureType == null) {
                Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName(), Stripersist.getEntityManager());
                if (layer != null && layer.getFeatureType() != null) {
                    this.featureType = layer.getFeatureType();
                }
            }
            Map<String, String> pairs = this.featureType.getKeysValues(attributes[0], attributes[1],maxFeatures);
            json.put("valuePairs", pairs);
            json.put("success", Boolean.TRUE);
        } catch (IllegalArgumentException e) {
            log.error("getKeyValuePairs() failed", e);
            json.put("msg", e.toString());
        } catch (Exception e) {
            log.error("getKeyValuePairs() failed", e);
            json.put("msg", "Fetching key value pairs failed for layer " + applicationLayer.getLayerName() + ": " + e.toString());
        }
        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    public Resolution getMinMaxValue() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);

        try {
            Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName(), Stripersist.getEntityManager());
            if(layer != null && layer.getFeatureType() != null) {
                SimpleFeatureType sft = layer.getFeatureType();
                Filter  f = filter != null ? FlamingoCQL.toFilter(filter,Stripersist.getEntityManager()) : null;
                Object value;
                if(operator.equals("#MAX#")) {
                    value = sft.getMaxValue(attribute, f);
                } else {
                    value = sft.getMinValue(attribute, f);
                }

                json.put("value", value.toString());
                json.put("success", Boolean.TRUE);
            }
        } catch (Exception e) {
            log.error("getMinMaxValue() failed", e);
            json.put("msg", "Min/max value determination failed for attribute " + attribute + ": " + e.toString());
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
