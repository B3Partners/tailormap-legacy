/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.search;

import java.io.IOException;
import java.io.StringWriter;
import nl.geozet.openls.databinding.gml.Point;
import nl.geozet.openls.databinding.openls.Address;
import nl.geozet.openls.databinding.openls.GeocodeResponse;
import nl.geozet.openls.databinding.openls.GeocodeResponseList;
import nl.geozet.openls.databinding.openls.GeocodedAddress;
import nl.geozet.openls.databinding.openls.OpenLSConstants;
import nl.geozet.openls.parser.OpenLSResponseParser;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Roy Braam
 */
public class OpenLSSearchClient implements SearchClient {

    private static final Log log = LogFactory.getLog(OpenLSSearchClient.class);
    private String url;
    private String method;
    private HttpClient client;
    private OpenLSResponseParser parser;

    public OpenLSSearchClient(String url, String method) {
        this.url = url;
        this.method = method;
        this.client = new HttpClient();
        this.parser = new OpenLSResponseParser();

    }

    @Override
    public JSONArray search(String query) {
        String queryUrl;
        if (this.url.contains(SEARCHTERM_HOLDER)) {
            queryUrl = this.url.replace(SEARCHTERM_HOLDER, query);
        } else {
            queryUrl = this.url + query;
        }
        HttpMethod method;
        if ("GET".equalsIgnoreCase(this.method)) {
            method = new GetMethod(queryUrl);
        } else {
            method = new PostMethod(queryUrl);
        }
        StringWriter sw = new StringWriter();
        try {
            int status = this.client.executeMethod(method);

            if (status == HttpStatus.SC_OK) {
                IOUtils.copy(method.getResponseBodyAsStream(), sw);
            } else {
                log.error("OpenLS server response with error: " + method.getResponseBodyAsString());
            }
        } catch (IOException ex) {
            log.error("Error while getting OpenLS response", ex);
        } finally {
            method.releaseConnection();
        }

        GeocodeResponse response = parser.parseOpenLSResponse(sw.toString());

        JSONArray result = new JSONArray();
        try {
            result = responseToResult(response);
        } catch (JSONException ex) {
            log.error("Error while converting OpenLS result to JSON result", ex);
        }
        return result;
    }

    private JSONArray responseToResult(GeocodeResponse response) throws JSONException {
        JSONArray results = new JSONArray();
        for (int l = 0; l < response.getGeocodeResponseListSize(); l++) {
            GeocodeResponseList list = response.getGeocodeResponseListAt(l);
            for (int g = 0; g < list.getGeocodedAddressSize(); g++) {
                GeocodedAddress geoAdress = list.getGeocodedAddressAt(g);
                if (geoAdress.hasPoint() && geoAdress.getPoint().getPosSize() > 0 && geoAdress.hasAddress()) {
                    JSONObject result = new JSONObject();
                    Point p = geoAdress.getPoint();

                    JSONObject point = new JSONObject();
                    point.put("x", p.getPosAt(0).getX());
                    point.put("y", p.getPosAt(0).getY());
                    result.put("location", point);

                    String type = null;
                    Address adr = geoAdress.getAddress();
                    StringBuilder label = new StringBuilder();
                    if (adr.hasStreetAddress() && adr.getStreetAddress().hasStreet()) {
                        type = "Street";
                        label.append(adr.getStreetAddress().getStreet().getStreet());
                        if (adr.hasStreetAddress() && adr.getStreetAddress().hasBuilding()) {
                            label.append(" " + adr.getStreetAddress().getBuilding().getNumber());
                        }
                    }
                    if (adr.hasPostalCode() && adr.getPostalCode().hasPostalCode()) {
                        label.append(" " + adr.getPostalCode().getPostalCode());
                    }
                    //MunicipalitySubdivision
                    if (adr.getPlaceByType(OpenLSConstants.PLACE_TYPE_MUNICIPALITYSUBDIVISION) != null) {
                        label.append(label.length() == 0 ? "" : ", ");
                        label.append(adr.getPlaceByType(OpenLSConstants.PLACE_TYPE_MUNICIPALITYSUBDIVISION));
                        if (type == null) {
                            type = OpenLSConstants.PLACE_TYPE_MUNICIPALITYSUBDIVISION;
                        }
                    }
                    //Municipality
                    if (adr.getPlaceByType(OpenLSConstants.PLACE_TYPE_MUNICIPALITY) != null
                            && !adr.getPlaceByType(OpenLSConstants.PLACE_TYPE_MUNICIPALITY).equals(adr.getPlaceByType(OpenLSConstants.PLACE_TYPE_MUNICIPALITYSUBDIVISION))) {
                        label.append(label.length() == 0 ? "" : ", ");
                        label.append(adr.getPlaceByType(OpenLSConstants.PLACE_TYPE_MUNICIPALITY));
                        if (type == null) {
                            type = OpenLSConstants.PLACE_TYPE_MUNICIPALITY;
                        }
                    }
                    //CountrySubdivision
                    if (adr.getPlaceByType(OpenLSConstants.PLACE_TYPE_COUNTRYSUBDIVISION) != null) {
                        label.append(label.length() == 0 ? "" : ", ");
                        label.append(" " + adr.getPlaceByType(OpenLSConstants.PLACE_TYPE_COUNTRYSUBDIVISION));
                        if (type == null) {
                            type = OpenLSConstants.PLACE_TYPE_COUNTRYSUBDIVISION;
                        }
                    }
                    result.put("label", label.toString());
                    if (type != null) {
                        result.put("type", type);
                    }
                    results.put(result);
                }

            }
        }
        return results;
    }
}
