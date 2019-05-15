/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.image;

import java.io.File;
import java.io.FileOutputStream;
import javax.swing.ImageIcon;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.tika.Tika;
import org.json.JSONObject;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 *
 * @author Roy Braam
 * @author mprins
 */
public class TilingIntegrationTest {

    private static final Log log = LogFactory.getLog(TilingIntegrationTest.class);
    private static final String DEST_DIR = "target" + File.separator + "test-output";
    
     /**
     * @settings a JSONObject in the following format:
     * {            
     *      requests: [
     *          {
     *              protocol: "",
     *              extent: "", //if extent is other then the given bbox.
     *              url: "",
     *              alpha: "",
     *              body: "",
     *              tileWidth: "", //default 256, for tiling
     *              tileHeight: "", //default 256, for tiling
     *              serverExtent: "" //server extent, for tiling
     *          }
     *      ],
     *      geometries: [
     *          wktgeom: "",
     *          color: ""
     *      ],
     *      bbox: "",
     *      width: "",
     *      height: "",
     *      srid: "",
     *      angle: "",
     *      quality: ""
     *  }
     */
    private static final String JSONCONFIG = "{"
            + "requests: [{"
            + "     protocol: 'WMSC',"
            + "     url: 'http://mapproxy.b3p.nl/service?request=GetMap&Service=WMS&Format=image/png&srs=epsg:28992&tiled=true&version=1.1.1&styles=&layers=brtachtergrondkaart',"
            + "     tileWidth: 256,"
            + "     tileHeight: 256,"
            + "     serverExtent: '-285401.92,22598.08,595401.9199999999,903401.9199999999',"
            + "     resolutions: '3440.64,1720.32,860.16,430.08,215.04,107.52,53.76,26.88,13.44,6.72,3.36,1.68,0.84,0.42,0.21'"
            + "}],"
            + "bbox: '0,300000,300000,600000',"
            + "width: 1024,"
            + "height: 1024,"
            + "srid: 28992"          
            + "}";

    @BeforeClass
    public static void setUp() {
        File destDir = new File(DEST_DIR);
        if (!destDir.exists()) {
            destDir.mkdir();
        }
    }

    @Test
    /* Test WMSc
     */
    public void wmscTest() throws Exception {
        CombineImageSettings settings = CombineImageSettings.fromJson(new JSONObject(JSONCONFIG));
        // this will produce a png because CombineImagesHandler#defaultReturnMime is image/png
        try (FileOutputStream fos = new FileOutputStream(DEST_DIR + File.separator + "WMSc.pngtest")) {
            CombineImagesHandler.combineImage(fos, settings, null);
        }

        File f = new File(DEST_DIR + File.separator + "WMSc.pngtest");
        try {
            ImageIcon i = new ImageIcon(f.getAbsolutePath());
        } catch (Exception e) {
            log.error("Maybe not a valid png?...", e);
            fail("Image may not be a valid png");
        }
        Tika tika = new Tika();
        assertEquals("Image is not a valid png", "image/png", tika.detect(f));
    }
}
