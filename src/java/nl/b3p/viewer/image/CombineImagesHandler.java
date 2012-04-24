package nl.b3p.viewer.image;

import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *@author Roy
 */
public class CombineImagesHandler {

    private static final Log log = LogFactory.getLog(CombineImagesHandler.class);
    private static String defaultReturnMime = "image/png";
    private static int defaultMaxResponseTime = 30000;

    public static void combineImage(OutputStream out, CombineImageSettings settings) throws Exception {
        combineImage(out, settings, defaultReturnMime, defaultMaxResponseTime);
    }

    public static void combineImage(OutputStream out, CombineImageSettings settings, String returnMime, int maxResponseTime) throws Exception {
        combineImage(out, settings, returnMime, maxResponseTime, null, null);
    }
    
    public static void combineImage(OutputStream out, CombineImageSettings settings, 
            String returnMime, int maxResponseTime, String uname, String pw) throws Exception {
        
        /* Calc urls for tiles */
        List<TileImage> tilingImages = new ArrayList();
        if (settings.getTilingServiceUrl() != null) {            
            tilingImages = getTilingImages(settings);
        }
        
        /**
         * Re calc the urls when needed.
         */        
        List normalUrls = settings.getCalculatedUrls();
        if (normalUrls == null) {
            normalUrls = settings.getUrls();
        }
        
        /* NOTE: Opletten dat de tiling combined images urls pas na de normale urls
         * worden toegeveoegd aan de List zodat deze als eerste inde buffered images
         * komen */
        List urls = new ArrayList();
        if (tilingImages != null && tilingImages.size() > 0) {
            for (TileImage tileImage : tilingImages) {
                urls.add(tileImage.getCombineImageUrl());
            }
        }
        
        if (normalUrls != null && normalUrls.size() > 0) {
            urls.addAll(normalUrls);
        }
        
        BufferedImage[] bi = null;
        
        if (urls.size() >0 ) {
            //Get the images by the urls
            ImageManager im = new ImageManager(urls, maxResponseTime, uname, pw);        
            try {
                im.process();
                bi = im.getCombinedImages();
            } catch (Exception e) {
                throw e;
            }
        }else{
            bi = new BufferedImage[1];
            bi[0]=new BufferedImage(settings.getWidth(),settings.getHeight(),BufferedImage.TYPE_INT_ARGB_PRE);
        }
        Float[] alphas = null;

        for (int i = 0; i < urls.size(); i++) {
            CombineImageUrl ciu = (CombineImageUrl) urls.get(i);
            if (ciu.getAlpha() != null) {
                if (alphas == null) {
                    alphas = new Float[urls.size()];
                }
                alphas[i] = ciu.getAlpha();
            }
        }

        BufferedImage returnImage = null;
        //Combine the images
        BufferedImage combinedImages = ImageTool.combineImages(bi, returnMime, alphas, tilingImages);
        //if there is a wkt then add it to the image
        try {
            if (settings.getWktGeoms() != null) {
                returnImage = ImageTool.drawGeometries(combinedImages, settings);
            } else {
                returnImage = combinedImages;
            }
        } catch (Exception e) {
            log.error("Kan geometrien niet tekenen. Return image zonder alle geometrien: ", e);
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
            xform.setToTranslation((settings.getWidth()-w),(settings.getHeight()-h)/2);            
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
    public static List<TileImage> getTilingImages(CombineImageSettings settings) 
            throws MalformedURLException, Exception {
        
        List<TileImage> tileImages = new ArrayList();
        
        /* Bbox van verzoek */        
        Bbox requestBbox = null;
        if (settings.getBbox() != null) {           
            requestBbox = settings.getBbox(); 
       }
        
        /* Bbox van service */
        Bbox serviceBbox = null;        
        if (settings.getTilingBbox() != null) {
            serviceBbox = new Bbox(settings.getTilingBbox());
        }
        
        /* 1) Berekenen resolutie */        
        Double res = null;    
        if (requestBbox != null) {            
            Integer mapWidth = settings.getWidth();
            
            res = (requestBbox.getMaxx() - requestBbox.getMinx()) / mapWidth;
        }
            
        /* 2) Bekijk de service resoluties voor mogelijk resample tiles. Pak de
         eerstvolgende kleinere service resolutie */
        Double useRes = null;
        if (settings.getTilingResolutions() != null && res != null) {
            String[] resolutions = null;
            if (settings.getTilingResolutions().indexOf(",") > 0) {
                resolutions = settings.getTilingResolutions().split(",");
            }
            
            if (resolutions == null && settings.getTilingResolutions().indexOf(" ") > 0) {
                resolutions = settings.getTilingResolutions().split(" ");
            }
            
            for (int i=0; i < resolutions.length; i++) {
                Double testRes = new Double(resolutions[i]);
                
                if ( ((res - testRes) < 0.0000000001) && ((res-testRes) > -0.0000000001) ) {
                    useRes = testRes;
                    break;
                } else if (res >= testRes) {
                    useRes = testRes;
                    break;
                }
            }
            
            if (useRes == null) {
                useRes = res;
            }
        }
        
        /* Deze later hergebruiken voor berekening tile positie */        
        Integer mapWidth = null;
        Integer mapHeight = null;        
        if (settings.getWidth() != null) {
            mapWidth = settings.getWidth();
        }        
        if (settings.getHeight() != null) {
            mapHeight = settings.getHeight();
        }
        
        /* 3) Berekenen grote van tiles in mapunits */
        Double tileWidthMapUnits = null;
        Double tileHeightMapUnits = null;        
        if (settings.getTilingTileWidth() != null && useRes != null) {
            tileWidthMapUnits = settings.getTilingTileWidth() * useRes;
        }
        if (settings.getTilingTileHeight() != null && useRes != null) {
            tileHeightMapUnits = settings.getTilingTileWidth() * useRes;
        }
        
        /* 4) Berekenen benodigde tile indexen */
        Integer minTileIndexX = null;
        Integer maxTileIndexX = null;
        Integer minTileIndexY = null;
        Integer maxTileIndexY = null;        
        if (tileWidthMapUnits != null && tileWidthMapUnits > 0 
                && tileHeightMapUnits != null && tileHeightMapUnits > 0) {  
            
            minTileIndexX = getTilingCoord(serviceBbox.getMinx(), serviceBbox.getMaxx(), tileWidthMapUnits, requestBbox.getMinx());
            maxTileIndexX = getTilingCoord(serviceBbox.getMinx(), serviceBbox.getMaxx(), tileWidthMapUnits, requestBbox.getMaxx());
            minTileIndexY = getTilingCoord(serviceBbox.getMiny(), serviceBbox.getMaxy(), tileHeightMapUnits, requestBbox.getMiny());
            maxTileIndexY = getTilingCoord(serviceBbox.getMiny(), serviceBbox.getMaxy(), tileHeightMapUnits, requestBbox.getMaxy());            
        }
        
        /* 5) Opbouwen nieuwe tile url en per url ook x,y positie van tile bepalen 
         zodat drawImage deze op de juiste plek kan zetten */
        for (int ix = minTileIndexX; ix <= maxTileIndexX; ix++) {
            for (int iy = minTileIndexY; iy <= maxTileIndexY; iy++) {
                double[] bbox = new double[4];
                
                bbox[0] = serviceBbox.getMinx() + (ix * tileWidthMapUnits);
                bbox[1] = serviceBbox.getMiny() + (iy * tileHeightMapUnits);
                bbox[2] = bbox[0] + tileWidthMapUnits;                
                bbox[3] = bbox[1] + tileHeightMapUnits;
                
                Bbox tileBbox = new Bbox(bbox);                
                
                TileImage tile = calcTilePosition(mapWidth, mapHeight, tileBbox, requestBbox, ix, iy);               
                 
                String serviceUrl = settings.getTilingServiceUrl();
                
                String sizes = null;
                if (settings.getTilingTileWidth() != null && settings.getTilingTileHeight() != null) {
                    sizes = "&WIDTH=" + settings.getTilingTileWidth() + "&HEIGHT=" + settings.getTilingTileHeight();
                }
                
                String bboxString = "&BBOX=" + tileBbox.getMinx() + "," + tileBbox.getMiny() + "," + tileBbox.getMaxx() + "," + tileBbox.getMaxy();
                
                String newUrl = serviceUrl + sizes + bboxString;
                
                CombineImageUrl url = new CombineImageUrl(); 
                url.setUrl(newUrl);
                url.setRealUrl(new URL(newUrl));
                tile.setCombineImageUrl(url);
                
                tileImages.add(tile);
            }            
        }
        
        return tileImages;
    }
    
    public static TileImage calcTilePosition(Integer mapWidth, Integer mapHeight,
            Bbox tileBbox, Bbox requestBbox, int offsetX, int offsetY) {
        
        TileImage tile = new TileImage();
        
        Double msx = (requestBbox.getMaxx() - requestBbox.getMinx()) / mapWidth;
        Double msy = (requestBbox.getMaxy() - requestBbox.getMiny()) / mapHeight;
        
        Double posX = Math.floor( (tileBbox.getMinx() - requestBbox.getMinx()) / msx );
        Double posY = Math.floor( (requestBbox.getMaxy() - tileBbox.getMaxy()) / msy );
        Double width = Math.floor( (tileBbox.getMaxx() - tileBbox.getMinx()) / msx );
        Double height = Math.floor( (tileBbox.getMaxy() - tileBbox.getMiny()) / msy );
        
        tile.setPosX(posX.intValue() - offsetX);
        tile.setPosY(posY.intValue() + offsetY);
        
        tile.setImageWidth(width.intValue());
        tile.setImageHeight(height.intValue());
        
        tile.setMapWidth(mapWidth);
        tile.setMapHeight(mapHeight);
        
        return tile;
    }
    
    public static int getTilingCoord(Double serviceMin, Double serviceMax,
            Double tileSizeMapUnits, Double coord) {
        
        double epsilon = 0.00000001;        
        Double tileIndex = 0.0;
        
        tileIndex = Math.floor( (coord - serviceMin) / (tileSizeMapUnits + epsilon) );
        
        if (tileIndex < 0) {
            tileIndex = 0.0;
        }
        
        Double maxBbox = Math.floor( (serviceMax - serviceMin) / (tileSizeMapUnits + epsilon) );
        
        if (tileIndex > maxBbox) {
            tileIndex = maxBbox;
        }
        
        return tileIndex.intValue();   
    }
}
