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

import java.awt.Color;
import java.io.*;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.StyleLibrary;
import nl.b3p.viewer.util.ChangeMatchCase;
import nl.b3p.viewer.util.FeatureToJson;
import nl.b3p.web.SharedSessionData;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eclipse.emf.common.util.URI;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.filter.text.cql2.CQL;
import org.geotools.filter.text.cql2.CQLException;
import org.geotools.filter.text.ecql.ECQL;
import org.geotools.styling.*;
import org.geotools.xml.Encoder;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.stripesstuff.stripersist.Stripersist;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

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

    public static final String FORMAT_JSON = "json";
    public static final String FORMAT_XML = "xml";

    @Validate
    private Long id;

    @Validate
    private String layer;

    @Validate
    private String style;

    @Validate
    private String filter;

    @Validate
    private String color;

    @Validate
    private String commonAndFilter;

    @Validate
    private String commonOrFilter;

    @Validate
    private Boolean useRuleFilter = false;

    @Validate
    private String featureTypeName;

    @Validate
    private String format;

    @Validate
    private ApplicationLayer applicationLayer;

    @Validate
    private String sldId;
    @Validate
    private String sessId;

    private byte[] sldXml;
    private StyledLayerDescriptor newSld;
    private StyleFactory sldFactory;

    private final Encoder filterEncoder = new org.geotools.xml.Encoder(new org.geotools.filter.v1_0.OGCConfiguration());

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

    public String getFilter() {
        return filter;
    }

    public void setFilter(String filter) {
        this.filter = filter;
    }

    public String getFeatureTypeName() {
        return featureTypeName;
    }

    public void setFeatureTypeName(String featureTypeName) {
        this.featureTypeName = featureTypeName;
    }

    public String getLayer() {
        return layer;
    }

    public void setLayer(String layer) {
        this.layer = layer;
    }

    public String getStyle() {
        return style;
    }

    public void setStyle(String style) {
        this.style = style;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public ApplicationLayer getApplicationLayer() {
        return applicationLayer;
    }

    public void setApplicationLayer(ApplicationLayer appLayer) {
        this.applicationLayer = appLayer;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getCommonAndFilter() {
        return commonAndFilter;
    }

    public void setCommonAndFilter(String commonAndFilter) {
        this.commonAndFilter = commonAndFilter;
    }

    public String getCommonOrFilter() {
        return commonOrFilter;
    }

    public void setCommonOrFilter(String commonOrFilter) {
        this.commonOrFilter = commonOrFilter;
    }

    public String getSldId() {
        return sldId;
    }

    public void setSldId(String sldId) {
        this.sldId = sldId;
    }

    public String getSessId() {
        return sessId;
    }

    public void setSessId(String sessId) {
        this.sessId = sessId;
    }
    //</editor-fold>

    private void getSldXmlOrCreateNewSld() throws Exception {

        if (id != null) {
            StyleLibrary sld = Stripersist.getEntityManager().find(StyleLibrary.class, id);
            if (sld == null) {
                throw new IllegalArgumentException("Can't find SLD in Flamingo service registry with id " + id);
            }
            if (sld.getExternalUrl() == null) {
                sldXml = sld.getSldBody().getBytes("UTF8");
            } else {
                // retrieve external sld
                try {
                    InputStream externalSld = new URL(sld.getExternalUrl()).openStream();
                    ByteArrayOutputStream bos = new ByteArrayOutputStream();
                    IOUtils.copy(externalSld, bos);
                    externalSld.close();
                    bos.flush();
                    bos.close();
                    sldXml = bos.toByteArray();
                } catch (IOException e) {
                    throw new IOException("Error retrieving external SLD from URL " + sld.getExternalUrl(), e);
                }
            }
        } else {
            // No SLD from database or external SLD; create new empty SLD

            newSld = sldFactory.createStyledLayerDescriptor();

            FilterFactory2 filterFactory = CommonFactoryFinder.getFilterFactory2();
            String[] layers = null;
            String[] filters = null;
            String[] styles = null;
            String[] colors = null;

            if (layer != null) {
                layers = layer.split(",");
            }
            if (filter != null) {
                try {
                    JSONArray jsonFilters = new JSONArray(filter);
                    filters = new String[jsonFilters.length()];
                    for (int i = 0; i < jsonFilters.length(); i++) {
                        filters[i] = jsonFilters.getString(i);
                    }
                } catch (JSONException je) {
                    log.warn("error while parsing filters to JSON", je);
                    filters = filter.split(",");
                }

            }
            if (color != null) {
                colors = color.split(",");
            }
            if (style != null) {
                styles = style.split(",");
            }

            Filter andFilter = null;
            Filter orFilter = null;
            if (commonAndFilter != null) {
                //GeoServer encodes the sld url even if its a valid url
                if (commonAndFilter.indexOf("%") > 0) {
                    commonAndFilter = URI.decode(commonAndFilter);
                }
                andFilter = ECQL.toFilter(commonAndFilter);
            }
            if (commonOrFilter != null) {
                //GeoServer encodes the sld url even if its a valid url
                if (commonOrFilter.indexOf("%") > 0) {
                    commonOrFilter = URI.decode(commonOrFilter);
                }
                orFilter = ECQL.toFilter(commonOrFilter);
            }
            if (layers != null) {

                for (int i = 0; i < layers.length; i++) {
                    Filter filter = null;
                    if (filters != null && i < filters.length && !"none".equals(filters[i]) && filters[i].length() > 0) {
                        filter = ECQL.toFilter(filters[i]);
                    }
                    NamedLayer nl = sldFactory.createNamedLayer();
                    nl.setName(layers[i]);

                    newSld.addStyledLayer(nl);
                    //Combine flt with allAndFilter and allOrFilter
                    if (andFilter != null) {
                        if (filter == null) {
                            filter = andFilter;
                        } else {
                            filter = filterFactory.and(filter, andFilter);
                        }
                    }
                    if (orFilter != null) {
                        if (filter == null) {
                            filter = orFilter;
                        } else {
                            filter = filterFactory.or(filter, orFilter);
                        }
                    }
                    if (styles != null && i < styles.length && !"none".equals(styles[i])) {
                        NamedStyle ns = sldFactory.createNamedStyle();
                        ns.setName(styles[i]);
                        nl.addStyle(ns);
                    } else if (colors != null && i < colors.length) {
                        //create featureTypeStyle
                        FeatureTypeStyle fts = sldFactory.createFeatureTypeStyle();
                        Rule r = sldFactory.createRule();
                        if (useRuleFilter && filter != null) {
                            r.setFilter(filter);
                        }
                        PolygonSymbolizer ps = createPolygonSymbolizer(sldFactory, colors[i]);
                        r.symbolizers().add(ps);
                        fts.rules().add(r);
                        // add style to namedlayer
                        Style style = sldFactory.createStyle();
                        style.setDefault(true);
                        style.setName("default");
                        style.featureTypeStyles().add(fts);
                        nl.addStyle(style);
                    } else {
                        NamedStyle ns = sldFactory.createNamedStyle();
                        ns.setName("default");
                        nl.addStyle(ns);
                    }

                    //if no featuretypestyle (created with color) then make featuretypeconstraint
                    if (!useRuleFilter && filter != null) {
                        // XXX name should be a feature type name from DescribeLayer response
                        // use extra parameter...
                        FeatureTypeConstraint ftc = sldFactory.createFeatureTypeConstraint(layers[i], filter, new Extent[]{});
                        nl.setLayerFeatureConstraints(new FeatureTypeConstraint[]{ftc});
                    }
                }
            }
        }
    }

    private static final String NS_SLD = "http://www.opengis.net/sld";
    private static final String NS_SE = "http://www.opengis.net/se";

    private void addFilterToExistingSld() throws Exception {
        Filter f = CQL.toFilter(filter);

        f = (Filter) f.accept(new ChangeMatchCase(false), null);

        if (featureTypeName == null) {
            featureTypeName = layer;
        }
        FeatureTypeConstraint ftc = sldFactory.createFeatureTypeConstraint(featureTypeName, f, new Extent[]{});

        if (newSld == null) {

            SLDTransformer sldTransformer = new SLDTransformer();
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            sldTransformer.transform(ftc, bos);

            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setNamespaceAware(true);
            DocumentBuilder db = dbf.newDocumentBuilder();

            Document sldXmlDoc = db.parse(new ByteArrayInputStream(sldXml));

            Document ftcDoc = db.parse(new ByteArrayInputStream(bos.toByteArray()));

            String sldVersion = sldXmlDoc.getDocumentElement().getAttribute("version");
            if ("1.1.0".equals(sldVersion)) {
                // replace sld:FeatureTypeName element generated by GeoTools
                // by se:FeatureTypeName
                NodeList sldFTNs = ftcDoc.getElementsByTagNameNS(NS_SLD, "FeatureTypeName");
                if (sldFTNs.getLength() == 1) {
                    Node sldFTN = sldFTNs.item(0);
                    Node seFTN = ftcDoc.createElementNS(NS_SE, "FeatureTypeName");
                    seFTN.setTextContent(sldFTN.getTextContent());
                    sldFTN.getParentNode().replaceChild(seFTN, sldFTN);
                }
            }

            // Ignore namespaces to tackle both SLD 1.0.0 and SLD 1.1.0
            // Add constraint to all NamedLayers, not only to the layer specified
            // in layers parameter
            NodeList namedLayers = sldXmlDoc.getElementsByTagNameNS(NS_SLD, "NamedLayer");
            for (int i = 0; i < namedLayers.getLength(); i++) {
                Node namedLayer = namedLayers.item(i);

                // Search where to insert the FeatureTypeConstraint from our ftcDoc
                // Insert LayerFeatureConstraints after sld:Name, se:Name or se:Description
                // and before sld:NamedStyle or sld:UserStyle so search backwards.
                // If we find an existing LayerFeatureConstraints, use that
                NodeList childs = namedLayer.getChildNodes();
                Node insertBefore = null;
                Node layerFeatureConstraints = null;
                int j = childs.getLength() - 1;
                do {
                    Node child = childs.item(j);

                    if ("LayerFeatureConstraints".equals(child.getLocalName())) {
                        layerFeatureConstraints = child;
                        break;
                    }
                    if ("Description".equals(child.getLocalName()) || "Name".equals(child.getLocalName())) {
                        break;
                    }
                    insertBefore = child;
                    j--;
                } while (j >= 0);
                Node featureTypeConstraint = sldXmlDoc.adoptNode(ftcDoc.getDocumentElement().cloneNode(true));
                if (layerFeatureConstraints == null) {
                    layerFeatureConstraints = sldXmlDoc.createElementNS(NS_SLD, "LayerFeatureConstraints");
                    layerFeatureConstraints.appendChild(featureTypeConstraint);
                    namedLayer.insertBefore(layerFeatureConstraints, insertBefore);
                } else {
                    layerFeatureConstraints.appendChild(featureTypeConstraint);
                }
            }

            TransformerFactory tf = TransformerFactory.newInstance();
            Transformer t = tf.newTransformer();
            DOMSource source = new DOMSource(sldXmlDoc);
            bos = new ByteArrayOutputStream();
            StreamResult result = new StreamResult(bos);
            t.transform(source, result);
            sldXml = bos.toByteArray();
        }
    }

    private PolygonSymbolizer createPolygonSymbolizer(StyleFactory styleFactory, String color) {
        FilterFactory2 filterFactory = CommonFactoryFinder.getFilterFactory2();

        Color col = Color.GRAY;
        if (color.startsWith("#")) {
            col = new Color(Integer.parseInt(color.substring(1), 16));
        }
        // create a partially opaque outline stroke
        Stroke stroke = styleFactory.createStroke(
                filterFactory.literal(col),
                filterFactory.literal(1),
                filterFactory.literal(0.9));

        // create a partial opaque fill
        Fill fill = styleFactory.createFill(
                filterFactory.literal(col),
                filterFactory.literal(0.9));

        PolygonSymbolizer sym = styleFactory.createPolygonSymbolizer(stroke, fill, null);
        return sym;
    }

    @DefaultHandler
    public Resolution create() throws JSONException, UnsupportedEncodingException {
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);
        String error = null;

        try {
            sldFactory = CommonFactoryFinder.getStyleFactory();

            getSldXmlOrCreateNewSld();

            if (newSld == null && filter != null) {
                addFilterToExistingSld();
            }

            if (newSld != null) {
                SLDTransformer sldTransformer = new SLDTransformer();
                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                sldTransformer.transform(newSld, bos);
                sldXml = bos.toByteArray();
            }

        } catch (Exception e) {
            log.error(String.format("Error creating sld for layer=%s, style=%s, filter=%s, id=%d",
                    layer,
                    style,
                    filter,
                    id), e);

            error = e.toString();
            if (e.getCause() != null) {
                error += "; cause: " + e.getCause().toString();
            }
        }

        if (error != null) {
            if (FORMAT_JSON.equals(format)) {
                json.put("error", error);
                return new StreamingResolution("application/json", new StringReader(json.toString()));
            } else {
                return new ErrorResolution(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, error);
            }
        } else {
            if (FORMAT_JSON.equals(format)) {
                json.put("sld", new String(sldXml, "UTF8"));
                json.put("success", Boolean.TRUE);
                return new StreamingResolution("application/json", new StringReader(json.toString()));
            } else {
                return new StreamingResolution("text/xml", new ByteArrayInputStream(sldXml));
            }
        }
    }
    /*
     * Reformat the flt with the relations of this featureType
     */

    public Resolution transformFilter() throws JSONException {

        FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
        List<Integer> ar = new ArrayList<Integer>();
        ar.add(1);
        ar.add(2);
        ar.add(3);
        Filter fil = ff.equals(ff.property("id"), ff.literal(ar));

        String s = CQL.toCQL(fil);
        JSONObject json = new JSONObject();
        String error = null;
        try {
            json.put("success", Boolean.FALSE);
            if (filter != null && applicationLayer != null) {
                Layer layer = applicationLayer.getService().getLayer(applicationLayer.getLayerName());
                if (layer == null) {
                    error = "Layer not found";
                } else {
                    SimpleFeatureType sft = layer.getFeatureType();
                    Filter f = ECQL.toFilter(filter);
                    f = (Filter) f.accept(new ChangeMatchCase(false), null);
                    f = FeatureToJson.reformatFilter(f, sft);
                    // TODO remove
                    String cqlFilter = ECQL.toCQL(f);
                    json.put("filter", cqlFilter);
                    //
                    // flt CQL opslaan in sessie,
                    // per kaartlaag is er 1 flt in de sessie, dus iedere keer overschrijven
                    String sId = context.getRequest().getSession().getId();
                    Map<String, String> sharedData = SharedSessionData.find(sId);
                    sharedData.put(applicationLayer.getId().toString(), cqlFilter);
                    json.put("sessId", sId);
                    json.put("sldId", applicationLayer.getId().toString());
                    json.put("success", Boolean.TRUE);
                }

            } else {
                error = "No filter to transform or no applicationlayer";
            }
        } catch (Exception e) {
            log.error("Error while reformatting filter", e);
            error = e.toString();
        }
        if (error != null) {
            json.put("error", error);
        }
        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    public Resolution findSLD() throws CQLException, JSONException, UnsupportedEncodingException {
        Map<String, String> sharedData = SharedSessionData.find(sessId);

        filter = sharedData.get(sldId);
        

//        filter = "(id = 17345 OR id = 17347 OR id = 1331 OR id = 3305 OR id = 3596 OR id = 4796 OR id = 8477 OR id = 12114 OR id = 12436 OR id = 12996 OR id = 12998 OR id = 13000 OR id = 13120 OR id = 17348 OR id = 13184 OR id = 14082 OR id = 17349 OR id = 14774 OR id = 14865 OR id = 15150 OR id = 17335 OR id = 1606 OR id = 12995 OR id = 88 OR id = 134 OR id = 199 OR id = 247 OR id = 248 OR id = 251 OR id = 328 OR id = 329 OR id = 338 OR id = 355 OR id = 356 OR id = 358 OR id = 359 OR id = 379 OR id = 391 OR id = 475 OR id = 476 OR id = 755 OR id = 845 OR id = 834 OR id = 902 OR id = 903 OR id = 997 OR id = 998 OR id = 1037 OR id = 1075 OR id = 1145 OR id = 1184 OR id = 1185 OR id = 1187 OR id = 1332 OR id = 1338 OR id = 1351 OR id = 1430 OR id = 1634 OR id = 1655 OR id = 1790 OR id = 1837 OR id = 1830 OR id = 1918 OR id = 2031 OR id = 2084 OR id = 2150 OR id = 2157 OR id = 2491 OR id = 2492 OR id = 2582 OR id = 2681 OR id = 2734 OR id = 2739 OR id = 2769 OR id = 2778 OR id = 2868 OR id = 2880 OR id = 2895 OR id = 2910 OR id = 2927 OR id = 2933 OR id = 3053 OR id = 3112 OR id = 3208 OR id = 3270 OR id = 3277 OR id = 3310 OR id = 3316 OR id = 3320 OR id = 3321 OR id = 3323 OR id = 3398 OR id = 3646 OR id = 3774 OR id = 3746 OR id = 3752 OR id = 3771 OR id = 3887 OR id = 3997 OR id = 4195 OR id = 4203 OR id = 4217 OR id = 4262 OR id = 4300 OR id = 4303 OR id = 4514 OR id = 4546 OR id = 4550 OR id = 4662 OR id = 4663 OR id = 4677 OR id = 4720 OR id = 4795 OR id = 4862 OR id = 4850 OR id = 4877 OR id = 4891 OR id = 4935 OR id = 4936 OR id = 5065 OR id = 5067 OR id = 5068 OR id = 5129 OR id = 5130 OR id = 5226 OR id = 5341 OR id = 5458 OR id = 5513 OR id = 5517 OR id = 5552 OR id = 5585 OR id = 5597 OR id = 5598 OR id = 5633 OR id = 5685 OR id = 5785 OR id = 5823 OR id = 5813 OR id = 5892 OR id = 5895 OR id = 5904 OR id = 5963 OR id = 5964 OR id = 6036 OR id = 6039 OR id = 6041 OR id = 6132 OR id = 6183 OR id = 6280 OR id = 6300 OR id = 6379 OR id = 6380 OR id = 6634 OR id = 6637 OR id = 6683 OR id = 6684 OR id = 6694 OR id = 6784 OR id = 7022 OR id = 7036 OR id = 7039 OR id = 7051 OR id = 7054 OR id = 7189 OR id = 7238 OR id = 7307 OR id = 7311 OR id = 7320 OR id = 7442 OR id = 7446 OR id = 7466 OR id = 7545 OR id = 7546 OR id = 7548 OR id = 7554 OR id = 7555 OR id = 7563 OR id = 7567 OR id = 7578 OR id = 7581 OR id = 7587 OR id = 7596 OR id = 7774 OR id = 7850 OR id = 7909 OR id = 7947 OR id = 8107 OR id = 8112 OR id = 8136 OR id = 8141 OR id = 8156 OR id = 8158 OR id = 8207 OR id = 8245 OR id = 8242 OR id = 8282 OR id = 8330 OR id = 8321 OR id = 8322 OR id = 8323 OR id = 8324 OR id = 8325 OR id = 8326 OR id = 8327 OR id = 8328 OR id = 8405 OR id = 8493 OR id = 8503 OR id = 8506 OR id = 8593 OR id = 8595 OR id = 8737 OR id = 8738 OR id = 8795 OR id = 8802 OR id = 8809 OR id = 8863 OR id = 8864 OR id = 8865 OR id = 9222 OR id = 9238 OR id = 9297 OR id = 9435 OR id = 9441 OR id = 9471 OR id = 9598 OR id = 9676 OR id = 9678 OR id = 9748 OR id = 9863 OR id = 9865 OR id = 9866 OR id = 9869 OR id = 9862 OR id = 9896 OR id = 9897 OR id = 9898 OR id = 9899 OR id = 9901 OR id = 9902 OR id = 9903 OR id = 9906 OR id = 9915 OR id = 9916 OR id = 10003 OR id = 10304 OR id = 10507 OR id = 10509 OR id = 10510 OR id = 10578 OR id = 10593 OR id = 10600 OR id = 10636 OR id = 10696 OR id = 10762 OR id = 10970 OR id = 10977 OR id = 10979 OR id = 11006)";
//        // "id = 17350 OR id = 17345 OR id = 17346 OR id = 17347 OR id =
//        filter = filter.replace("OR id = ", ",");
//        filter = filter.substring(1);
//        filter = filter.replace("id = ", "id in (");

        // omzetten naar een 'id in (....)' werkt niet omdat die dan wordt gesplit...

//        String cql = sharedData.get(sldId);
//        final Filter flt;
//        if (cql != null) {
//            flt = CQL.toFilter(cql);
//        } else {
//            // return a non-filtering flt
//            flt = Filter.INCLUDE;
//        }
//        return new StreamingResolution("text/xml") {
//            @Override
//            public void stream(HttpServletResponse response) throws IOException {
//                filterEncoder.encode(flt, org.geotools.filter.v1_0.OGC.Filter, response.getOutputStream());
//            }
//        };
        return this.create();
    }
}
