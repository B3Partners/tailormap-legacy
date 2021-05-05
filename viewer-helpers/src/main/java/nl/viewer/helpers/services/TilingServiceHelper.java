package nl.viewer.helpers.services;

import nl.commons.HttpClientConfigured;
import nl.viewer.config.ClobElement;
import nl.viewer.config.services.*;
import nl.web.WaitPageStatus;
import nl.viewer.config.services.*;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpUriRequest;
import org.geotools.geometry.jts.JTS;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.json.JSONArray;
import org.json.JSONObject;
import org.locationtech.jts.geom.Envelope;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.naming.OperationNotSupportedException;
import javax.persistence.EntityManager;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static nl.viewer.config.services.TileService.*;

public class TilingServiceHelper implements GeoServiceHelper {

    private static final Log log = LogFactory.getLog(TilingServiceHelper.class);
    private static final DefaultGeographicCRS wgs84 = DefaultGeographicCRS.WGS84;

    @Override
    public GeoService loadServiceFromURL(String url, Map params, WaitPageStatus status, EntityManager em) throws Exception {
        return TilingServiceHelper.loadFromURL(url,params,status,em);
    }

    public static GeoService loadFromURL(String url, Map params, WaitPageStatus status, EntityManager em) throws Exception {
        status.setCurrentAction("Bezig met aanmaken tile service");
        try{
            String tp =(String) params.get(PARAM_TILINGPROTOCOL);
            TileService s = null;
            if(tp.equals(TILING_PROTOCOL_WMTS)){
                s = TilingServiceHelper.parseWMTSCapabilities(url, params, status, em);
            } else {
                s = new TileService();
                s.setUrl(url);

                String serviceName = (String) params.get(PARAM_SERVICENAME);
                s.setName(serviceName);
                s.setTilingProtocol(tp);

                //make fake top layer for tiling.
                Layer topLayer = new Layer();
                topLayer.setVirtual(true);
                topLayer.setService(s);

                Layer tilingLayer = new Layer();
                tilingLayer.setName(serviceName);
                tilingLayer.setTitle(serviceName);
                tilingLayer.setParent(topLayer);
                tilingLayer.setService(s);

                TileSet ts = new TileSet();
                Boolean unique = false;
                String tsName = serviceName;
                for (int i = 0; i < 100; i++) {
                    if (em.find(TileSet.class, tsName) == null) {
                        unique = true;
                        break;
                    }
                    tsName = serviceName + "(" + (i + 1) + ")";
                }
                ts.setName(tsName);
                if (params.containsKey(PARAM_RESOLUTIONS)) {
                    String resString = (String) params.get(PARAM_RESOLUTIONS);
                    ts.setResolutions(resString);
                }
                if (params.containsKey(PARAM_TILESIZE)) {
                    Integer size = (Integer) params.get(PARAM_TILESIZE);
                    ts.setHeight(size);
                    ts.setWidth(size);
                }

                if (params.containsKey(PARAM_SERVICEBBOX) && params.containsKey(PARAM_CRS)) {
                    String bounds = (String) params.get(PARAM_SERVICEBBOX);
                    BoundingBox bb = new BoundingBox();
                    bb.setBounds(bounds);
                    bb.setCrs(new CoordinateReferenceSystem((String) params.get(PARAM_CRS)));
                    tilingLayer.getBoundingBoxes().put(bb.getCrs(), bb);
                }

                if (params.containsKey(PARAM_IMAGEEXTENSION)
                        && params.get(PARAM_IMAGEEXTENSION) != null
                        && StringUtils.isNotBlank((String) params.get(PARAM_IMAGEEXTENSION))) {
                    tilingLayer.getDetails().put("image_extension", new ClobElement((String) params.get(PARAM_IMAGEEXTENSION)));
                }
                //set tiling layer as child of top layer
                topLayer.getChildren().add(tilingLayer);
                s.setTopLayer(topLayer);

                em.persist(ts);
                tilingLayer.setTileset(ts);
            }
            return s;
        }finally {
            status.setProgress(90);
            status.setCurrentAction("Service ingeladen");
        }
    }


    private static TileService parseWMTSCapabilities(String url, Map params, WaitPageStatus status, EntityManager em){
        TileService s = null;
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            DocumentBuilder builder = factory.newDocumentBuilder();

            String username = null;
            String password = null;

            if(params.containsKey(GeoService.PARAM_USERNAME) && params.containsKey(GeoService.PARAM_PASSWORD)){
                username = (String)params.get(GeoService.PARAM_USERNAME);
                password = (String)params.get(GeoService.PARAM_PASSWORD);
            }


            final HttpClientConfigured client = new HttpClientConfigured(username, password, url);

            HttpUriRequest req = new HttpGet(url);

            HttpResponse response;
            org.w3c.dom.Document doc = null;
            try {
                response = client.execute(req);

                int statusCode = response.getStatusLine().getStatusCode();
                if (statusCode >= 200 && statusCode < 300) {
                    final HttpResponse finalResponse = response;
                    final HttpEntity entity = response.getEntity();

                    try {
                        doc = builder.parse(entity.getContent());
                    } catch(Exception e){
                        log.error("Failed to retrieve getcapabilities: " + e.getLocalizedMessage());
                        return null;
                    }finally {
                        if (finalResponse != null) {
                            client.close(finalResponse);
                        }
                        client.close();
                    }
                } else {
                    throw new IOException("HTTP status: " + statusCode + " reason: " + response.getStatusLine().getReasonPhrase());
                }
            } catch(IOException e){
                log.error("Check request; Failed to retrieve getcapabilities: " + e.getLocalizedMessage());
                return null;
            }
            // Hack: when using the correct XpathFactory.newInstance() it sometimes returned JSTLXPathFactoryImpl, which was incorrect and
            // couldn't compile valid xpathexpressions
            XPathFactory xPathfactory = new org.apache.xpath.jaxp.XPathFactoryImpl();
            XPath xpath = xPathfactory.newXPath();
            log.error("Parsing wmts getcap with following objects:");
            log.error("Xpath: " + xpath.getClass().toGenericString());
            log.error("xPathfactory: " + xPathfactory.getClass().toGenericString());
            /*
            log welke xpath implementatie er is
            log of xpathconstants.string er is
            */
            // Service info
            s = new TileService();
            s.setTilingProtocol(TILING_PROTOCOL_WMTS);

            XPathExpression expr = xpath.compile("/Capabilities/ServiceIdentification/Title");
            log.error("XPathExpression: " + expr);
            log.error("XPathConstants: " + XPathConstants.class.toGenericString());
            log.error("XPathConstants.STRING: " + XPathConstants.STRING);
            String serviceName = (String)expr.evaluate(doc, XPathConstants.STRING);
            s.setName(serviceName);

            expr = xpath.compile("/Capabilities/OperationsMetadata/Operation[@name='GetTile']//Constraint/AllowedValues/Value[.='KVP']/../../..//Get/@href");
            String getTile = (String)expr.evaluate(doc, XPathConstants.STRING);
            if(getTile.isEmpty()){
                expr = xpath.compile("/Capabilities/OperationsMetadata/Operation[@name='GetTile']//Constraint/AllowedValues/Value[.='KVP']/../../../@href");
                getTile = (String)expr.evaluate(doc, XPathConstants.STRING);
            }
            if(getTile.isEmpty()){
                getTile = url;
                status.addLog("viewer_admin.geoservice.52");
            }
            s.setUrl(getTile);


            List<TileMatrixSet> matrices = parseMatrixSets(xpath, doc);
            s.setMatrixSets(matrices);

            // Create lookup list for later linking it to layers
            Map<String, TileMatrixSet> matricesByIdentifier = new HashMap<>();
            for (TileMatrixSet matrix : matrices) {
                matrix.setTileService(s);
                matricesByIdentifier.put(matrix.getIdentifier(), matrix);
            }

            // Layers
            //make fake top layer for tiling.
            Layer topLayer = new Layer();
            topLayer.setVirtual(true);
            topLayer.setService(s);

            List<Layer> layers = parseLayers(xpath, doc, topLayer, s, matricesByIdentifier);
            //set tiling layer as child of top layer
            topLayer.setChildren(layers);
            s.setTopLayer(topLayer);

            em.persist(s);

            // Matrices

            return s;
        }catch (ParserConfigurationException | XPathExpressionException ex) {
            log.error("Error reading capabilities: ", ex);
        }
        return s;
    }

    private static List<Layer> parseLayers(XPath xpath, org.w3c.dom.Document doc, Layer topLayer, GeoService s, Map<String, TileMatrixSet> matricesByIdentifier) throws XPathExpressionException{
        List<Layer> layers = new ArrayList<>();
        XPathExpression expr = xpath.compile("/Capabilities/Contents/Layer");
        NodeList nl = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < nl.getLength(); i++) {
            Node l = nl.item(i);
            layers.add(parseLayer(xpath, l, topLayer, s, matricesByIdentifier));
        }
        return layers;
    }

    private static Layer parseLayer(XPath xpath, Node l, Layer topLayer, GeoService s,Map<String, TileMatrixSet> matricesByIdentifier) throws XPathExpressionException {
        Layer layer = new Layer();
        layer.setParent(topLayer);
        layer.setService(s);

        XPathExpression expr = xpath.compile("Identifier");
        String name = (String) expr.evaluate(l, XPathConstants.STRING);
        layer.setName(name);

        expr = xpath.compile("Title");
        String title = (String) expr.evaluate(l, XPathConstants.STRING);
        layer.setTitle(title);

        expr = xpath.compile("Format");
        String format = (String) expr.evaluate(l, XPathConstants.STRING);
        layer.getDetails().put("image_extension", new ClobElement(format));


        expr = xpath.compile("TileMatrixSetLink/TileMatrixSet");
        NodeList tileMatrixSets = (NodeList) expr.evaluate(l, XPathConstants.NODESET);

        List<TileMatrixSet> tmses = new ArrayList<>();
        for (int i = 0; i < tileMatrixSets.getLength(); i++) {
            Node matrixSet = tileMatrixSets.item(i);
            String tileMatrixSetIdentifier = matrixSet.getFirstChild().getNodeValue();
            TileMatrixSet tms = matricesByIdentifier.get(tileMatrixSetIdentifier);
            tmses.add(tms);
        }
        layer.setMatrixSets(tmses);
        parseBoundingBox(layer, xpath, l, tmses);


        expr = xpath.compile("Style");
        NodeList styles = (NodeList) expr.evaluate(l, XPathConstants.NODESET);
        JSONArray stylesJSON = new JSONArray();
        for (int i = 0; i < styles.getLength(); i++) {
            JSONObject styleJSON = new JSONObject();
            stylesJSON.put(styleJSON);

            Node style = styles.item(i);
            expr = xpath.compile("Identifier");
            String identifier = (String) expr.evaluate(style, XPathConstants.STRING);
            styleJSON.put("identifier", identifier);

            if( style.getAttributes().getNamedItem("isDefault") != null ){
                String isDefault = style.getAttributes().getNamedItem("isDefault").getNodeValue();
                styleJSON.put("isDefault", isDefault);
            }

        }
        layer.getDetails().put(Layer.DETAIL_WMS_STYLES, new ClobElement(stylesJSON.toString()));

        return layer;
    }

    private static void parseBoundingBox(Layer layer,XPath xpath, Node l, List<TileMatrixSet> tmses) throws XPathExpressionException{
        XPathExpression expr = xpath.compile("WGS84BoundingBox/LowerCorner");
        String lowercorner = (String) expr.evaluate(l, XPathConstants.STRING);

        expr = xpath.compile("WGS84BoundingBox/UpperCorner");
        String uppercorner = (String) expr.evaluate(l, XPathConstants.STRING);

        if(lowercorner != null && uppercorner != null && !lowercorner.isEmpty() && ! uppercorner.isEmpty()){
            try {
                double lat1 = Double.parseDouble(uppercorner.substring(0, uppercorner.indexOf(" ")));
                double lon1 = Double.parseDouble(uppercorner.substring(uppercorner.indexOf(" ")+1));

                double lat2 = Double.parseDouble(lowercorner.substring(0, lowercorner.indexOf(" ")));
                double lon2 = Double.parseDouble(lowercorner.substring(lowercorner.indexOf(" ")+1));

                Envelope env = new Envelope(lat1, lat2,lon2,lon1);

                for (TileMatrixSet tms : tmses) {
                    if(!tms.getCrs().contains("28992")){
                        continue;
                    }
                    org.opengis.referencing.crs.CoordinateReferenceSystem targetCRS = CRS.decode(tms.getCrs());

                    MathTransform transform = CRS.findMathTransform(wgs84, targetCRS, false);
                    Envelope newBBox = JTS.transform(env, transform);
                    BoundingBox bbox = new BoundingBox();
                    CoordinateReferenceSystem crs = new CoordinateReferenceSystem(tms.getCrs());
                    bbox.setCrs(crs);
                    bbox.setMaxx(newBBox.getMaxX());
                    bbox.setMinx(newBBox.getMinX());
                    bbox.setMaxy(newBBox.getMaxY());
                    bbox.setMiny(newBBox.getMinY());
                    layer.getBoundingBoxes().put(crs, bbox);
                }
            } catch (FactoryException | TransformException ex) {
                log.error("cannot parse bounding boxes",ex);
            }

        }
    }

    public static List<TileMatrixSet> parseMatrixSets(XPath xpath, Document doc) throws XPathExpressionException {
        List<TileMatrixSet> tmses = new ArrayList<>();

        XPathExpression expr = xpath.compile("/Capabilities/Contents/TileMatrixSet");
        NodeList tileMatrixSets = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < tileMatrixSets.getLength(); i++) {
            Node matrixSet = tileMatrixSets.item(i);
            tmses.add(parseTileMatrixSet(xpath, matrixSet));
        }

        return tmses;
    }


    public static TileMatrixSet parseTileMatrixSet(XPath xpath, Node matrixSet) throws XPathExpressionException{
        TileMatrixSet tms = new TileMatrixSet();
        List<TileMatrix> tileMatrices = new ArrayList<>();
        tms.setMatrices(tileMatrices);

        XPathExpression expr = xpath.compile("TileMatrix");
        NodeList tileMatricesNodes = (NodeList) expr.evaluate(matrixSet, XPathConstants.NODESET);
        for (int i = 0; i < tileMatricesNodes.getLength(); i++) {
            Node tileMatrix = tileMatricesNodes.item(i);
            tileMatrices.add(parseTileMatrix(xpath, tileMatrix,tms));
        }

        expr = xpath.compile("Identifier");
        String identifier = (String) expr.evaluate(matrixSet, XPathConstants.STRING);
        tms.setIdentifier(identifier);

        expr = xpath.compile("SupportedCRS");
        String crs = (String) expr.evaluate(matrixSet, XPathConstants.STRING);
        tms.setCrs(crs);

        TileMatrix tm = tileMatrices.get(tileMatrices.size()-1);
        // parse boundingbox
        String topLeft = tm.getTopLeftCorner();
        double minX = new Double(topLeft.substring(0, topLeft.indexOf(" ")));
        double maxY = new Double(topLeft.substring(topLeft.indexOf(" ")+1));
        double scaleDenominator = new Double(tm.getScaleDenominator());
        double pixelSpan = scaleDenominator * 0.00028 / metersPerUnit(crs);
        double tileSpanX = tm.getTileWidth() * pixelSpan;
        double tileSpanY = tm.getTileHeight() * pixelSpan;
        double maxX =  minX + tileSpanX * tm.getMatrixWidth();
        double minY = maxY - tileSpanY * tm.getMatrixHeight();

        BoundingBox bb = new BoundingBox();
        bb.setCrs(new CoordinateReferenceSystem(crs));

        bb.setMinx(minX);
        bb.setMaxx(maxX);
        bb.setMaxy(maxY);
        bb.setMiny(minY);
        tms.setBbox(bb);
        return tms;
    }

    public static double metersPerUnit(String crs){
        return 1;
    }

    private static TileMatrix parseTileMatrix(XPath xpath, Node tileMatrix, TileMatrixSet tms) throws XPathExpressionException{
        TileMatrix tm = new TileMatrix();
        tm.setMatrixSet(tms);

        XPathExpression expr = xpath.compile("Identifier");
        String identifier = (String) expr.evaluate(tileMatrix, XPathConstants.STRING);
        tm.setIdentifier(identifier);

        expr = xpath.compile("ScaleDenominator");
        String scaledenom = (String) expr.evaluate(tileMatrix, XPathConstants.STRING);
        tm.setScaleDenominator(scaledenom);

        expr = xpath.compile("TopLeftCorner");
        String topLeft = (String) expr.evaluate(tileMatrix, XPathConstants.STRING);
        tm.setTopLeftCorner(topLeft);

        expr = xpath.compile("TileWidth");
        int tileWidth = ((Double) expr.evaluate(tileMatrix, XPathConstants.NUMBER)).intValue();
        tm.setTileWidth(tileWidth);

        expr = xpath.compile("TileHeight");
        int tileHeight = ((Double) expr.evaluate(tileMatrix, XPathConstants.NUMBER)).intValue();
        tm.setTileHeight(tileHeight);

        expr = xpath.compile("MatrixWidth");
        int matrixidth = ((Double) expr.evaluate(tileMatrix, XPathConstants.NUMBER)).intValue();
        tm.setMatrixWidth(matrixidth);

        expr = xpath.compile("MatrixHeight");
        int matrixHeight = ((Double) expr.evaluate(tileMatrix, XPathConstants.NUMBER)).intValue();
        tm.setMatrixHeight(matrixHeight);

        expr = xpath.compile("Title");
        String title = (String) expr.evaluate(tileMatrix, XPathConstants.STRING);
        tm.setTitle(title);

        expr = xpath.compile("Abstract");
        String desc = (String) expr.evaluate(tileMatrix, XPathConstants.STRING);
        tm.setDescription(desc);

        return tm;
    }

    @Override
    public UpdateResult updateService(EntityManager em, GeoService service) throws Exception {
        throw new OperationNotSupportedException("Updating tiling services not implemented");
    }
}
