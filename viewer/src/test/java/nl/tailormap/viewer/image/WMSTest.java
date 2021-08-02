/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.tailormap.viewer.image;

import org.apache.http.HttpStatus;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URISyntaxException;

import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * @author Roy Braam
 */
public class WMSTest {

    private static final String DEST_DIR = "target" + File.separator + "test-output";
    private static final String REQUEST_URL = "https://mapproxy.b3p.nl/service?request=GetMap&Service=WMS&Format=image/png&srs=epsg:28992&version=1.1.1&styles=&layers=brtachtergrondkaart&width=1024&height=1024&bbox=0,300000,300000,600000";
    /**
     * {@code settings} a JSONObject in the following format:
     * {
     * requests: [
     * {
     * protocol: "",
     * extent: "", //if extent is other then the given bbox.
     * url: "",
     * alpha: "",
     * body: "",
     * tileWidth: "", //default 256, for tiling
     * tileHeight: "", //default 256, for tiling
     * serverExtent: "" //server extent, for tiling
     * }
     * ],
     * geometries: [
     * wktgeom: "",
     * color: ""
     * ],
     * bbox: "",
     * width: "",
     * height: "",
     * srid: "",
     * angle: "",
     * quality: ""
     * }
     */
    private static final String JSONCONFIG = "{"
            + "requests: [{"
            + "     protocol: 'WMS',"
            + "     url: '" + REQUEST_URL + "',"
            + "}],"
            + "bbox: '0,300000,300000,600000',"
            + "width: 1024,"
            + "height: 1024,"
            + "srid: 28992"
            + "}";

    @BeforeEach
    public void setUp() {
        boolean isOnline = false;
        try {
            HttpURLConnection connection = (HttpURLConnection) new URI(REQUEST_URL).toURL().openConnection();
            connection.setRequestMethod("GET");
            connection.connect();
            isOnline = (connection.getResponseCode() == HttpStatus.SC_OK);
        } catch (IOException | URISyntaxException e) {
            // ignore..
        }
        assumeTrue(isOnline, "skip if mapproxy.b3p.nl is offline");

        File destDir = new File(DEST_DIR);
        if (!destDir.exists()) {
            destDir.mkdir();
        }
    }

    @Test
    public void wmsTest() throws Exception {
        CombineImageSettings settings = CombineImageSettings.fromJson(new JSONObject(JSONCONFIG));
        FileOutputStream fos = new FileOutputStream(DEST_DIR + File.separator + "WMS_split.png");
        CombineImagesHandler.combineImage(fos, settings, null, null, null);
    }
}
