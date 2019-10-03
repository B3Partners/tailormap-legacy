package nl.b3p.viewer.image;

import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *@author Roy
 */
public class CombineImagesHandler {

    private static final Log log = LogFactory.getLog(CombineImagesHandler.class);
    private static String defaultReturnMime = "image/png";
    private static int defaultMaxResponseTime = 30000;

    public static void combineImage(OutputStream out, CombineImageSettings settings, HttpServletRequest req, String sessionid, String ssosessionid) throws Exception {
        combineImage(out, settings, defaultReturnMime, defaultMaxResponseTime, req, sessionid, ssosessionid);
    }

    public static void combineImage(OutputStream out, CombineImageSettings settings, String returnMime, int maxResponseTime, HttpServletRequest req, String sessionid, String ssosessionid) throws Exception {
        combineImage(out, settings, returnMime, maxResponseTime, null, null, req, sessionid, ssosessionid);
    }
    
    public static void combineImage(OutputStream out, CombineImageSettings settings, 
            String returnMime, int maxResponseTime, String uname, String pw, HttpServletRequest req, String sessionid, String ssosessionid) throws Exception {
        
        /* Calc urls for tiles */
        /*List<TileImage> tilingImages = new ArrayList();
        if (settings.getTilingServiceUrl() != null) {            
            tilingImages = getTilingImages(settings);
        }*/
        
        /**
         * Re calc the urls when needed.
         */        
        List<CombineImageUrl> urls = settings.getCalculatedUrls();        
        
        List<ReferencedImage> refImages = null;
        
        if (urls!=null && urls.size() >0 ) {
            //Get the images by the urls
            ImageManager im = new ImageManager(urls, maxResponseTime, uname, pw, req, sessionid, ssosessionid);
            try {
                im.process();
                im.shutdown();
                refImages = im.getCombinedImages();
            } catch (Exception e) {
                throw e;
            }
        }else{
            refImages = new ArrayList<ReferencedImage>();
            refImages.add(new ReferencedImage(new BufferedImage(settings.getWidth(),settings.getHeight(),BufferedImage.TYPE_INT_ARGB_PRE)));
        }
        
        BufferedImage returnImage = null;
        //Combine the images
        ImageBbox bb=settings.getRequestBbox();
        BufferedImage combinedImages = ImageTool.combineImages(refImages, returnMime, bb.getWidth(),bb.getHeight());
        //if there is a wkt then add it to the image
        try {
            if (settings.getWktGeoms() != null) {
                returnImage = ImageTool.drawGeometries(combinedImages, settings);
            } else {
                returnImage = combinedImages;
            }
        } catch (Exception e) {
            log.error("Can not draw geometry. Return image without geometries: ", e);
            returnImage = combinedImages;
        }
        //rotate the image back and cut the original bbox.
        if (settings.getAngle()!=null &&settings.getAngle()!=0 && settings.getAngle()!=360){           
            
            //new img
            BufferedImage rot = new BufferedImage(settings.getWidth(),settings.getHeight(),BufferedImage.TYPE_INT_ARGB_PRE);
            Graphics2D gr=(Graphics2D) rot.getGraphics();
            int h = returnImage.getHeight();
            int w = returnImage.getWidth();
            
            //transform to mid and then rotate with anchor point the mid of the image.
            AffineTransform xform = new AffineTransform();   
            xform.setToTranslation((settings.getWidth()-w)/2,(settings.getHeight()-h)/2);            
            xform.rotate(Math.toRadians(360-settings.getAngle()),w/2,h/2);
            
            gr.drawImage(returnImage,xform,null);
            gr.dispose();
            returnImage=rot;
        }   
        
        try {
            ImageTool.writeImage(returnImage, returnMime, out);
        } catch (Exception ex) {
            log.error(ex);
        }
    }    
    
}
