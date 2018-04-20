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

import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.Polygon;
import com.vividsolutions.jts.geom.PrecisionModel;
import com.vividsolutions.jts.io.ParseException;
import com.vividsolutions.jts.io.WKTReader;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.image.Bbox;
import nl.b3p.viewer.image.CombineImageSettings;
import nl.b3p.viewer.image.CombineImageWkt;
import nl.b3p.viewer.image.ImageTool;
import nl.b3p.viewer.util.ChangeMatchCase;
import nl.b3p.viewer.util.FlamingoCQL;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.FeatureIterator;
import org.geotools.filter.text.cql2.CQL;
import org.opengis.filter.Filter;
import org.geotools.geometry.jts.WKTReader2;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.FilterFactory2;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
@UrlBinding("/action/Buffer")
@StrictBinding
public class BufferActionBean implements ActionBean {

    private static final Log log = LogFactory.getLog(BufferActionBean.class);
    private ActionBeanContext context;
    @Validate
    private String bbox;
    @Validate
    private Long serviceId;
    @Validate
    private String layerName;
    @Validate
    private Integer width;
    @Validate
    private Integer height;
    @Validate
    private Integer buffer;
    @Validate
    private Integer maxFeatures = 250;
    @Validate
    private String color;
    
    @Validate
    private String[] features;
    
    @Validate
    private String filter;
    private final Integer MAX_FEATURES = 250;
    private static final String JSP = "/WEB-INF/jsp/error.jsp";

    //<editor-fold defaultstate="collapsed" desc="Getters and Setters">
    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public String getBbox() {
        return bbox;
    }

    public void setBbox(String bbox) {
        this.bbox = bbox;
    }

    public String getLayerName() {
        return layerName;
    }

    public void setLayerName(String layerName) {
        this.layerName = layerName;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getBuffer() {
        return buffer;
    }

    public void setBuffer(Integer buffer) {
        this.buffer = buffer;
    }

    public Integer getMaxFeatures() {
        return maxFeatures;
    }

    public void setMaxFeatures(Integer maxFeatures) {
        this.maxFeatures = maxFeatures;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getFilter() {
        return filter;
    }

    public void setFilter(String filter) {
        this.filter = filter;
    }

    public String[] getFeatures() {
        return features;
    }

    public void setFeatures(String[] features) {
        this.features = features;
    }
    //</editor-fold>
    
    @DefaultHandler
    public Resolution image() {
        final CombineImageSettings cis = new CombineImageSettings();
        try {
            
            cis.setBbox(bbox);
            cis.setWidth(width);
            cis.setHeight(height);
            Color c = Color.RED;
            if (color != null) {
                c = Color.decode("#" + color);
            }
            cis.setDefaultWktGeomColor(c);

            EntityManager em = Stripersist.getEntityManager();
            List<CombineImageWkt> wkts = getFeatures(cis.getBbox(), em);
            cis.setWktGeoms(wkts);

            final BufferedImage bi = ImageTool.drawGeometries(null, cis);
            if (bi!=null){
                StreamingResolution res = new StreamingResolution(cis.getMimeType()) {
                    @Override
                    public void stream(HttpServletResponse response) throws Exception {
                        ImageTool.writeImage(bi, cis.getMimeType(), response.getOutputStream());
                    }
                };
                return res;
            }else{     
                log.info("No geometries used to draw a buffer");               
            }
        } catch (Exception e) {
            log.error("Error generating buffered image", e);            
        }
        //if not returned, return a empty image
        final BufferedImage empty = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB_PRE);
        StreamingResolution res = new StreamingResolution(cis.getMimeType()) {
            @Override
            public void stream(HttpServletResponse response) throws Exception {
                ImageTool.writeImage(empty, cis.getMimeType(), response.getOutputStream());
            }
        };
        return res;
    }

    public Resolution bufferGeometry() throws JSONException{
        JSONObject json = new JSONObject();
        JSONArray featureArray = new JSONArray();
        json.put("success", Boolean.FALSE);
        json.put("features", featureArray);
        FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 28992);
        WKTReader reader = new WKTReader2(gf);
        Geometry geom;
        try {
            for (String feature : features) {

                geom = reader.read(feature);
                Geometry buffered = geom.buffer(buffer);
                featureArray.put(buffered.toText());
            }
            json.put("success",Boolean.TRUE);
        } catch (ParseException ex) {
            log.error("could not parse: ", ex);
            json.put("errorMessage",ex.getLocalizedMessage());
        }  
        
        return new StreamingResolution("application/json", new StringReader(json.toString()));  
    }
    
    private List<CombineImageWkt> getFeatures(Bbox bbox, EntityManager em ) throws Exception {
        List<CombineImageWkt> wkts = new ArrayList<CombineImageWkt>();
        GeoService gs = em.find(GeoService.class, serviceId);
        Layer l = gs.getLayer(layerName, em);

        if (l.getFeatureType() == null) {
            throw new Exception("Layer has no feature type");
        }

        FeatureSource fs = l.getFeatureType().openGeoToolsFeatureSource();

        String geomAttribute = fs.getSchema().getGeometryDescriptor().getLocalName();

        FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 28992);
        WKTReader reader = new WKTReader2(gf);
        Polygon p = (Polygon) reader.read(bbox.toWKT());
        Filter featureFilter = ff.intersects(ff.property(geomAttribute),ff.literal(p));

        if(filter != null){
            Filter attributeFilter = FlamingoCQL.toFilter(filter, em);
            attributeFilter = (Filter)attributeFilter.accept(new ChangeMatchCase(false), null);
            
            if(filter.indexOf("POINT") == -1){
                Filter and = ff.and(featureFilter, attributeFilter);
                featureFilter = and;
            }else{
                featureFilter = attributeFilter;
            }
        }
        Query q = new Query(fs.getName().toString());
        q.setFilter(featureFilter);
        
        q.setMaxFeatures(Math.min(maxFeatures, MAX_FEATURES));

        FeatureIterator<SimpleFeature> it = fs.getFeatures(q).features();

        try {
            while (it.hasNext()) {
                SimpleFeature f = it.next();
                Geometry g = (Geometry) f.getDefaultGeometry();
                if (g!=null){
                    g = g.buffer(buffer);                
                    wkts.add(new CombineImageWkt(g.toText()));
                }
            }
        } finally {
            it.close();
            fs.getDataStore().dispose();
        }
        return wkts;
    }
}
