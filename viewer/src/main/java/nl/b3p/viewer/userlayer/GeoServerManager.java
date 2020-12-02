package nl.b3p.viewer.userlayer;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.Header;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpStatus;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicHeader;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collection;

public class GeoServerManager {
    /**
     * geoserver path part of the url.
     *
     * @see #getBaseUrl()
     */
    public static final String GEOSERVER_PATTERN = "/geoserver/";
    private static final Log LOG = LogFactory.getLog(GeoServerManager.class);
    private final String baseUrl;
    private final String userName;
    private final String passWord;
    private final String workSpace;
    private final String storeName;

    /**
     * Constructs a manager.
     *
     * @param userName        GeoServer credential
     * @param passWord        GeoServer credential
     * @param targetWorkSpace GeoServer workspace
     * @param storeName       GeoServer datastore
     * @param baseUrl         Geoserver baseurl: url from original layer
     */
    public GeoServerManager(String userName, String passWord, String targetWorkSpace,
                            String storeName, String baseUrl) {
        this.userName = userName;
        this.passWord = passWord;
        this.workSpace = targetWorkSpace;
        this.storeName = storeName;
        this.baseUrl = baseUrl;

    }

    /**
     * Create a new WMS layer by POSTing a document to the GeoServer.
     *
     * @param layerName    name of the new layer
     * @param layerTitle   user friendly name of the new layer
     * @param resourceName database table
     * @return {@code true} when successful
     */
    public boolean createLayer(String layerName, String layerTitle, String resourceName) {
        boolean success = false;

        JSONObject content = new JSONObject();
        // The name of the resource. This name corresponds to the "published" name of the resource.
        content.put("name", layerName);
        // The native name of the resource.
        // This name corresponds to the physical resource that feature type is derived from
        // -- a shapefile name, a database table, etc...
        content.put("nativeName", resourceName);
        // The title of the resource. This is usually something that is meant to be displayed in a user interface.
        content.put("title", layerTitle);

        // optional - we assume that the workspace exists for now
        //        // Namespace of the layer
        //        JSONObject namespace = new JSONObject();
        //        // Name of the namespace
        //        namespace.put("name", "myNamespace");
        //        // URL to the namespace representation.
        //        namespace.put("link", "http://b3p.nl/");
        //        content.put("namespace", namespace);

        // A description of the resource. This is usually something that is meant to be displayed in a user interface.
        content.put("abstract", "created by Tailormap GeoServerManager");

        // A collection of keywords associated with the resource
        JSONObject keywords = new JSONObject();
        JSONArray keyword = new JSONArray();
        keyword.put("userlayer");
        keyword.put("Tailormap");
        keyword.put("GBI");
        keywords.put("string", keyword);
        content.put("keywords", keywords);
        // optional
        // "metadatalinks": {"metadataLink": [{"type": "string","metadataType": "string","content": "string"}]},
        // "dataLinks": {"metadataLink": [{"type": "string", "content": "string"}]},

        // The native coordinate reference system object of the resource.
        content.put("nativeCRS", "EPSG:28992");
        // Returns the identifier of coordinate reference system of the resource.
        content.put("srs", "EPSG:28992");
        JSONObject featureType = new JSONObject();
        featureType.put("featureType", content);
        LOG.trace("New featuretype JSON document:\n" + featureType.toString(4));
        HttpPost post = new HttpPost(
                this.baseUrl +
                        "rest/workspaces/" +
                        this.workSpace +
                        "/datastores/" +
                        this.storeName +
                        "/featuretypes"
        );
        post.setEntity(new StringEntity(featureType.toString(), StandardCharsets.UTF_8));
        post.addHeader(new BasicHeader(HttpHeaders.CONTENT_TYPE, "application/json"));

        try (CloseableHttpClient httpClient = getClient();
             CloseableHttpResponse response = httpClient.execute(post)) {
            LOG.debug(String.format("Result of creating WMS layer %s is %s: %s", layerName,
                    response.getStatusLine().getStatusCode(),
                    response.getStatusLine().getReasonPhrase()));
            success = (response.getStatusLine().getStatusCode() == HttpStatus.SC_CREATED);
        } catch (IOException e) {
            LOG.error("Creating WMS layer failed. " + e.getLocalizedMessage());
        }
        return success;
    }

    /**
     * execute a recursive delete request for the WMS layer.
     *
     * @param layerName WMS layer to remove
     * @return {@code true} when successful
     */
    public boolean deleteLayer(String layerName) {
        boolean success = false;
        HttpDelete delete = new HttpDelete(
                this.baseUrl +
                        "rest/workspaces/" +
                        this.workSpace +
                        "/layers/" +
                        layerName +
                        "?recurse=true"
        );

        try (CloseableHttpClient httpClient = getClient();
             CloseableHttpResponse response = httpClient.execute(delete)) {
            LOG.debug(String.format("Result of deleting WMS layer %s is %s: %s", layerName,
                    response.getStatusLine().getStatusCode(),
                    response.getStatusLine().getReasonPhrase()));
            success = (response.getStatusLine().getStatusCode() == HttpStatus.SC_OK);
        } catch (IOException e) {
            LOG.error("Deleting WMS layer failed. " + e.getLocalizedMessage());
        }
        return success;
    }

    public boolean deleteStyle(String layerName) {
        // curl -u admin:geoserver -XDELETE http://localhost:8080/geoserver/rest/styles/zoning?purge=true
        boolean success = false;
        HttpDelete delete = new HttpDelete(
                this.baseUrl + "rest/workspaces/" + this.workSpace + "/styles/" + layerName + "?purge=true"
        );

        try (CloseableHttpClient httpClient = getClient();
             CloseableHttpResponse response = httpClient.execute(delete)) {
            LOG.debug(String.format("Result of deleting CSS style %s is %s: %s", layerName,
                    response.getStatusLine().getStatusCode(),
                    response.getStatusLine().getReasonPhrase()));
            success = (response.getStatusLine().getStatusCode() == HttpStatus.SC_OK);
        } catch (IOException e) {
            LOG.error("Deleting style failed. " + e.getLocalizedMessage());
        }
        return success;
    }

    public boolean addStyleToLayer(String layerName, String cssStyle) {
        boolean success = false;
        // 2-step proces om style aan te maken
        JSONObject styleInfo = new JSONObject();
        JSONObject content = new JSONObject();
        content.put("name", layerName).put("filename", layerName + ".css");
        styleInfo.put("style", content);

        HttpPost post = new HttpPost(this.baseUrl + "rest/workspaces/" + this.workSpace + "/styles");
        post.setEntity(new StringEntity(styleInfo.toString(), ContentType.APPLICATION_JSON));
        post.addHeader(HttpHeaders.CONTENT_TYPE, "application/json");
        LOG.debug("posting style " + post.toString());


        // send something like
        //        /* @title dark-orange polygon */
        //        * {
        //            stroke: #000000;
        //            stroke-width: 0.5;
        //            fill: #ff9900;
        //        }

        //        curl -v -X PUT -u admin:geoserver \
        //        http://localhost:8080/geoserver/rest/workspaces/GBIuserlayers/styles/GBItest.css \
        //        -H "Content-Type: application/vnd.geoserver.geocss+css" \
        //        -d "/* @title dark-orange polygon */ * {stroke: #000000; stroke-width: 0.5; fill: #ff9900; }"

        HttpPut put = new HttpPut(this.baseUrl + "rest/workspaces/" + this.workSpace + "/styles/" + layerName + ".css");
        put.setEntity(new StringEntity(cssStyle, StandardCharsets.UTF_8));
        put.addHeader(HttpHeaders.CONTENT_TYPE, "application/vnd.geoserver.geocss+css");
        LOG.debug("putting CSS " + put.toString());


        // change default layer style
        //        curl -v -X PUT -u admin:geoserver \
        //        http://localhost:8080/geoserver/rest/workspaces/GBIuserlayers/layers/GBItest \
        //        -H  "Accept: application/json" \
        //        -H  "Content-Type: application/xml" \
        //        -d "<layer><defaultStyle><name>GBItest</name></defaultStyle><enabled>true</enabled></layer>"
        HttpPut putLayer = new HttpPut(
                this.baseUrl + "rest/workspaces/" + this.workSpace + "/layers/" + layerName);
        putLayer.setEntity(new StringEntity(
                "<layer><defaultStyle><name>" + layerName + "</name></defaultStyle><enabled>true</enabled></layer>",
                StandardCharsets.UTF_8));
        putLayer.addHeader(HttpHeaders.CONTENT_TYPE, "application/xml");
        LOG.debug("putting layer config " + putLayer.toString());

        try (
                CloseableHttpClient httpClient = getClient();
                CloseableHttpResponse response = httpClient.execute(post);
                CloseableHttpResponse response2 = httpClient.execute(put);
                CloseableHttpResponse response3 = httpClient.execute(putLayer)
        ) {
            if (response.getStatusLine().getStatusCode() != HttpStatus.SC_CREATED) {
                LOG.error(String.format("Result of creating CSS style %s is %s: %s", layerName,
                        response.getStatusLine().getStatusCode(),
                        response.getStatusLine().getReasonPhrase()));
            }
            if (response2.getStatusLine().getStatusCode() != HttpStatus.SC_OK) {
                LOG.error(String.format("Result of putting CSS style %s is %s: %s", layerName,
                        response2.getStatusLine().getStatusCode(),
                        response2.getStatusLine().getReasonPhrase()));
            }
            if (response3.getStatusLine().getStatusCode() != HttpStatus.SC_OK) {
                LOG.error(String.format("Result of changing default style on %s is %s: %s", layerName,
                        response3.getStatusLine().getStatusCode(),
                        response3.getStatusLine().getReasonPhrase()));
            }
            success = (response.getStatusLine().getStatusCode() == HttpStatus.SC_CREATED)
                    && (response2.getStatusLine().getStatusCode() == HttpStatus.SC_OK)
                    && (response3.getStatusLine().getStatusCode() == HttpStatus.SC_OK);
        } catch (IOException e) {
            LOG.error("Adding CSS style to layer failed. ", e);
        }

        return success;
    }

    /**
     * get the geoserver url, as determined in the constructor.
     *
     * @return the geoserver url
     * @see #GeoServerManager(String, String, String, String, String)
     */
    public String getBaseUrl() {
        return this.baseUrl;
    }

    private CloseableHttpClient getClient() {
        final Collection<Header> defaultHeaders = Arrays.asList(new Header[]{
                // geoserver is really picky about which headers get sent..
        });

        final CredentialsProvider provider = new BasicCredentialsProvider();
        // TODO narrow down AuthScope
        provider.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials(userName, passWord));

        return HttpClientBuilder.create()
                .setDefaultCredentialsProvider(provider)
                .setDefaultHeaders(defaultHeaders)
                .setUserAgent("Tailormap")
                .build();
    }

}
