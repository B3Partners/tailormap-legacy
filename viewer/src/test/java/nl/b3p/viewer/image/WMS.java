/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.image;

import java.io.File;
import java.io.FileOutputStream;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;

/**
 *
 * @author Roy Braam
 */
public class WMS {

    @Before
    public void setUp() {
        File destDir = new File(DEST_DIR);
        if(!destDir.exists()) {
            destDir.mkdir();
        }
    }


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
            + "     protocol: 'WMS',"
            + "     url: 'http://osm.kaartenbalie.nl/wms/mapserver?REQUEST=GetMap&ID=layer1&STYLES=&TRANSPARENT=TRUE&SRS=EPSG:28992&VERSION=1.1.1&EXCEPTIONS=application/vnd.ogc.se_xml&LAYERS=OpenStreetMap,bron_osm,railways,highways50_4000,highways0_50,primaryroads50_400,roads50_100,roads0_50,streets30_70,streets0_30,provinciegrens,greens,waterwood,residentialandindustry,basislaag,places&FORMAT=image/png&HEIGHT=783&WIDTH=1264&BBOX=16048.5312899105,392484.035759898,271108.556832695,550484.035759898',"            
            + "}],"
            + "bbox: '16048.5312899105,392484.035759898,271108.556832695,550484.035759898',"
            + "width: 3000,"
            + "height: 3000,"
            + "srid: 28992"          
            + "}";
    @Test
    /* Test WMSc
     */
    public void wmsTest() throws Exception {
        CombineImageSettings settings = CombineImageSettings.fromJson(new JSONObject(JSONCONFIG));
        FileOutputStream fos = new FileOutputStream(DEST_DIR + File.separator + "WMS_split.png");
        CombineImagesHandler.combineImage(fos, settings,null);
    }
}
