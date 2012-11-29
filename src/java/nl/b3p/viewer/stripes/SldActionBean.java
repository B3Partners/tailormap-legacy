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
package nl.b3p.viewer.stripes;

import java.io.*;
import java.util.Arrays;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.services.StyleLibrary;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.filter.text.cql2.CQL;
import org.geotools.styling.*;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.filter.Filter;
import org.stripesstuff.stripersist.Stripersist;

/**
 * Create a SLD using GeoTools.
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/sld")
@StrictBinding
public class SldActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(SldActionBean.class);
    
    private ActionBeanContext context;
    
    @Validate
    private Long id;

    @Validate
    private String[] layers;
    
    @Validate
    private String[] styles;
    
    @Validate
    private String[] filters;
    
    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    @Override
    public ActionBeanContext getContext() {
        return context;
    }
    
    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String[] getFilters() {
        return filters;
    }

    public void setFilters(String[] filters) {
        this.filters = filters;
    }

    public String[] getLayers() {
        return layers;
    }

    public void setLayers(String[] layers) {
        this.layers = layers;
    }

    public String[] getStyles() {
        return styles;
    }

    public void setStyles(String[] styles) {
        this.styles = styles;
    }
    //</editor-fold>
    
    public Resolution create() throws JSONException {
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        String error = null;

        if(id != null) {
            StyleLibrary sld = Stripersist.getEntityManager().find(StyleLibrary.class, id);
            if(sld == null || StringUtils.isBlank(sld.getSldBody())) {
                return new ErrorResolution(HttpServletResponse.SC_NOT_FOUND, "Can't find SLD with id " + id);
            }
            return new StreamingResolution("text/xml", sld.getSldBody());
        }
        
        try {
            StyleFactory sldFactory = CommonFactoryFinder.getStyleFactory();

            StyledLayerDescriptor sld = sldFactory.createStyledLayerDescriptor();

            if(layers != null) {
                for(int i = 0; i < layers.length; i++) {
                    NamedLayer nl = sldFactory.createNamedLayer();
                    nl.setName(layers[i]);
                    sld.addStyledLayer(nl);
                    if(styles != null && i < styles.length && !"none".equals(styles[i])) {
                        NamedStyle ns = sldFactory.createNamedStyle();
                        ns.setName(styles[i]);
                        nl.addStyle(ns);
                    }
                    if(filters != null && i < filters.length && !"none".equals(filters[i])) {
                        Filter filter = CQL.toFilter(filters[i]);
                        // XXX name should be a feature type name from DescribeLayer response
                        // use extra parameter...
                        FeatureTypeConstraint ftc = sldFactory.createFeatureTypeConstraint(layers[i], filter, new Extent[] {});
                        nl.setLayerFeatureConstraints(new FeatureTypeConstraint[] { ftc });
                    }
                }
            }

            StringWriter sw = new StringWriter();
            SLDTransformer sldTransformer = new SLDTransformer();
            sldTransformer.transform(sld, sw);
            
            System.out.println(sw.toString());
            json.put("sld", sw.toString());
            json.put("success", Boolean.TRUE);
        } catch(Exception e) {
            log.error(String.format("Error creating sld for layers=%s, styles=%s, filters=%s",
                    Arrays.toString(layers),
                    Arrays.toString(styles),
                    Arrays.toString(filters)), e);
            
            error = e.toString();
            if(e.getCause() != null) {
                error += "; cause: " + e.getCause().toString();
            }
        }
        
        if(error != null) {
            json.put("error", error);
        }
        
        return new StreamingResolution("application/json", new StringReader(json.toString()));                
    }
}
