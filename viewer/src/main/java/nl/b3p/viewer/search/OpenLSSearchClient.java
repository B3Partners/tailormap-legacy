/*
 * Copyright (C) 2013 B3Partners B.V.
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
package nl.b3p.viewer.search;

import java.io.IOException;
import java.net.URL;
import nl.geozet.openls.databinding.gml.Point;
import nl.geozet.openls.databinding.openls.Address;
import nl.geozet.openls.databinding.openls.GeocodeResponse;
import nl.geozet.openls.databinding.openls.GeocodeResponseList;
import nl.geozet.openls.databinding.openls.GeocodedAddress;
import nl.geozet.openls.databinding.openls.OpenLSConstants;
import nl.geozet.openls.parser.OpenLSResponseParser;
import org.apache.commons.httpclient.util.URIUtil;
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
public class OpenLSSearchClient extends SearchClient {

    private static final Log log = LogFactory.getLog(OpenLSSearchClient.class);
    private String url;
    private OpenLSResponseParser parser;

    public OpenLSSearchClient(String url) {
        this.url = url;
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

        JSONArray result = new JSONArray();
        String response = null;
        try {
            String encodedQuery = URIUtil.encodeQuery(queryUrl, "UTF-8");
            response = IOUtils.toString(new URL(encodedQuery).openStream(), "UTF-8");
            GeocodeResponse gecoderResponse = parser.parseOpenLSResponse(response);

            try {
                result = responseToResult(gecoderResponse);
            } catch (JSONException ex) {
                log.error("Error while converting OpenLS result to JSON result", ex);
            }
        } catch (IOException ex) {
            log.error("Error while getting OpenLS response", ex);
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

    @Override
    public JSONObject autosuggest(String query) {
        throw new UnsupportedOperationException("Not supported."); 
    }
}
