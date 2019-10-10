/*
 * Copyright (C) 2013-2017 B3Partners B.V.
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
package nl.b3p.viewer.print;

import java.io.StringWriter;
import java.util.Locale;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import net.sourceforge.stripes.action.RedirectResolution;
import nl.b3p.viewer.stripes.CombineImageActionBean;
import nl.b3p.viewer.stripes.PrintActionBean;
import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Mark Prins
 */
public class PrintUtil {

    private static final Log LOG = LogFactory.getLog(PrintUtil.class);

    /**
     *
     * @param params the value of params
     * @param url url to get
     * @param sessionID sessionid to use
     * @param ssosessionID the SSO session id to use (can be null)
     * @return url for overview map
     * @throws JSONException if any
     * @throws Exception if any
     */
    public static String getOverviewUrl(String params, String url, String sessionID, String ssosessionID) throws JSONException, Exception {
        JSONObject info = new JSONObject(params);
        info.remove("requests"); // Remove old requests, to replace them with overview-only parameters
        info.remove("geometries");
        info.remove("quality");

        JSONObject overview = info.getJSONObject("overview");
        info.put("bbox", overview.get("extent"));
        JSONArray reqs = new JSONArray();
        JSONObject image = new JSONObject();
        image.put("protocol", overview.optString("protocol", CombineImageActionBean.WMS));
        image.put("url", overview.get("overviewUrl"));
        image.put("extent", overview.get("extent"));
        reqs.put(image);
        info.put("requests", reqs);
        String overviewUrl = PrintUtil.getImageUrl(info.toString(), url, sessionID, ssosessionID);
        return overviewUrl;
    }

    /**
     * Get the image url for the CombineImageAction.
     *
     * @param param the json as string with params needed to create the image
     * @param url url to replace with CombineImageAction url
     * @param sessionID sessionid to use
     * @param ssosessionID the SSO session id to use (can be null)
     * @return url to (combined)image.
     * @throws java.lang.Exception if any
     */
    public static String getImageUrl(String param, String url, String sessionID, String ssosessionID) throws Exception {
        RedirectResolution cia = new RedirectResolution(CombineImageActionBean.class);
        RedirectResolution pa = new RedirectResolution(PrintActionBean.class);
        // url van print actionbean naar combineimage action bean, kopieer de sessionid naar de url
        // tomcat specifiek gedrag
        url = url.replace(pa.getUrl(new Locale("NL")), cia.getUrl(new Locale("NL")));
        url += ";jsessionid=" + sessionID;

        HttpClient client = new HttpClient();
        PostMethod method = null;
        try {
            method = new PostMethod(url);
            method.addParameter("params", param);
            method.addParameter("JSESSIONID", sessionID);
            if (ssosessionID != null) {
                method.addParameter("JSESSIONIDSSO", ssosessionID);
                Header cookieHeader = new Header("Cookie", null);
                cookieHeader.setValue("JSESSIONIDSSO=" + ssosessionID);
                method.setRequestHeader(cookieHeader);
            }
            int statusCode = client.executeMethod(method);
            if (statusCode != HttpStatus.SC_OK) {
                LOG.debug("Connection error for " + url);
                throw new Exception("Error connecting to server. HTTP status code: " + statusCode);
            }
            JSONObject response = new JSONObject(method.getResponseBodyAsString());
            if (!response.getBoolean("success")) {
                throw new Exception("Error getting image: " + response.getString("error"));
            }
            return response.getString("imageUrl");
        } finally {
            if (method != null) {
                method.releaseConnection();
            }
        }
    }

    /**
     * debugging utility for printing formatted PrintInfo.
     *
     * @param info the PrintInfoto render
     * @return xml rendering of PrintInfo
     * @throws JAXBException is any
     */
    public static String printInfoToString(PrintInfo info) throws JAXBException {
        JAXBContext context = JAXBContext.newInstance(PrintInfo.class);
        Marshaller m = context.createMarshaller();
        m.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
        StringWriter sw = new StringWriter();
        m.marshal(info, sw);
        String s = sw.toString();
        return s;
    }

    private PrintUtil() {
    }
}
