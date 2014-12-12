/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.image;

import java.io.File;
import java.io.FileOutputStream;
import org.json.JSONObject;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 *
 * @author Roy Braam
 */
public class Tiling {
    @BeforeClass
    public static void setUpClass() throws Exception {
    }

    @AfterClass
    public static void tearDownClass() throws Exception {
    }

    @Before
    public void setUp() {
        File destDir = new File(DEST_DIR);
        if(!destDir.exists()) {
            destDir.mkdir();
        }
    }

    @After
    public void tearDown() {
    }

    private static final String DEST_DIR = "test-output";

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
            + "     url: 'http://geodata.nationaalgeoregister.nl/wmsc?request=GetMap&Service=WMS&Format=image/png&srs=epsg:28992&tiled=true&layers=brtachtergrondkaart',"
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
    @Test
    /* Test WMSc
     */
    public void wmscTest() throws Exception {
        CombineImageSettings settings = CombineImageSettings.fromJson(new JSONObject(JSONCONFIG));
        File f = new File(DEST_DIR + "/WMSc.png");
        FileOutputStream fos = new FileOutputStream(DEST_DIR + "/WMSc.png");
        CombineImagesHandler.combineImage(fos, settings);
    }
}
