/*
 * Copyright (C) 2017 B3Partners B.V.
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
package nl.b3p.viewer.image;

import java.io.UnsupportedEncodingException;
import static java.lang.Math.floor;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import nl.b3p.viewer.config.services.TileMatrix;
import nl.b3p.viewer.config.services.TileMatrixSet;
import nl.b3p.viewer.config.services.TileService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;

/**
 *
 * @author Meine Toonen
 */
public class CombineWMTSUrl extends CombineTileImageUrl {

    private static final Log log = LogFactory.getLog(CombineTileImageUrl.class);

    private TileMatrixSet set;

    public CombineWMTSUrl(CombineTileImageUrl ctiu) {
        super(ctiu);
    }

    public CombineWMTSUrl() {
        super();
    }

    @Override
    protected String createUrl(ImageBbox imageBbox, Bbox tileBbox, int indexX, int indexY, int zoomlevel) {
        try {
            TileMatrix tm = set.getMatrices().get(zoomlevel);
            
            //service=WMTS&request=GetTile&version=1.0.0&layer=etopo2&style=default&format=image/png&TileMatrixSet= WholeWorld_CRS_84 &TileMatrix=10m&TileRow=1&TileCol=3
            String tileUrl = url + "request=GetTile&version=1.0.0&format=image/png&SERVICE=WMTS&layer=" + "brtachtergrondkaart" + "&TileMatrixSet="
                    + URLEncoder.encode(set.getIdentifier(), "UTF-8") + "&TileRow=" + indexY + "&TileCol=" + indexX
                    + "&TileMatrix=" + URLEncoder.encode(tm.getIdentifier(), "UTF-8");
            
            return tileUrl;
        } catch (UnsupportedEncodingException ex) {
            log.error("Cannot encode identifier:" + ex);
            return null;
        }
    }

    public void setMatrixSet(JSONObject matrixSet) {
        set = TileMatrixSet.fromJSONObject(matrixSet);
    }

    @Override
    public Integer getClosestZoomlevel(ImageBbox requestBbox) {

        double res = requestBbox.getUnitsPixelX();
        int dpi = 72;
        double dpm = 0.0254; // ratio for converting inches to meters
        double scale = res * (dpi / dpm);
        
            
        List<TileMatrix> matrices = set.getMatrices();
        int index = - 1;
        for (int i = 0; i < matrices.size(); i++) {
            TileMatrix tm = matrices.get(i);
            TileMatrix next = matrices.get(i + 1);
            double scCur = Double.valueOf(tm.getScaleDenominator());
            double scNext = Double.valueOf(next.getScaleDenominator());
            if (scale < scCur && scale > scNext) {
                index = i;
                break;
            }

        }
        return index;
    }

   // @Override
    public List<CombineImageUrl> calculateNewUrsl(ImageBbox imbbox) {
        List<CombineImageUrl> tileImages = new ArrayList<>();

        //get closest res
        Integer indexOfMatrix = getClosestZoomlevel(imbbox);
        TileMatrix tm = set.getMatrices().get(indexOfMatrix);
        Double closestResolution = Double.valueOf(tm.getScaleDenominator()) * 0.00028 / TileService.metersPerUnit(tm.getMatrixSet().getCrs());
        //Double closestResolution = resolutions[zoomlevel];

        // calc width in mapRes per tile: so the number of meter along the x axis
        Double tileWidthMapUnits = null;
        // calc height in mapRes per tile: so the number of meter along the y axis
        Double tileHeightMapUnits = null;
        if (this.getTileWidth() != null && closestResolution != null) {
            tileWidthMapUnits = this.getTileWidth() * closestResolution;
        }
        if (this.getTileWidth() != null && closestResolution != null) {
            tileHeightMapUnits = this.getTileWidth() * closestResolution;
        }

        // calc which tiles are needed 
        Integer minTileIndexX = null;
        Integer maxTileIndexX = null;
        Integer minTileIndexY = null;
        Integer maxTileIndexY = null;

        Bbox bbox = imbbox.getBbox();
        if (tileWidthMapUnits != null && tileWidthMapUnits > 0
                && tileHeightMapUnits != null && tileHeightMapUnits > 0) {

            minTileIndexX = getTileIndexX(bbox.getMinx(), closestResolution,false);
            maxTileIndexX = getTileIndexX(bbox.getMaxx(), closestResolution,true);
            minTileIndexY = getTileIndexY(bbox.getMiny(),closestResolution,false);
            maxTileIndexY = getTileIndexY(bbox.getMaxy(),closestResolution,true);
        }


        /* 5) Opbouwen nieuwe tile url en per url ook x,y positie van tile bepalen
         zodat drawImage deze op de juiste plek kan zetten */
        int numX = 0;
        int numY = 0;
        for (int ix = minTileIndexX; ix <= maxTileIndexX; ix++) {
            for (int iy = minTileIndexY; iy <= maxTileIndexY; iy++) {
                double[] tempBbox = new double[4];

                tempBbox[0] = serviceBbox.getMinx() + (ix * tileWidthMapUnits);
                tempBbox[1] = serviceBbox.getMiny() + (iy * tileHeightMapUnits);
                tempBbox[2] = tempBbox[0] + tileWidthMapUnits;
                tempBbox[3] = tempBbox[1] + tileHeightMapUnits;
                Bbox tileBbox = new Bbox(tempBbox);

                CombineStaticImageUrl tile = createTile(imbbox, tileBbox, ix, iy, indexOfMatrix, numX, numY);
               // CombineStaticImageUrl tile = createTile(imbbox, tileBbox, ix , iy, indexOfMatrix,                 (numX * tm.getTileWidth()) - xOffset , (numY * tm.getTileHeight()) - yOffset);
              
                tileImages.add(tile);
                numY++;
            }
            numX++;
            numY=0;
        }
        return tileImages;
    }

   //  @Override
    public List<CombineImageUrl> calcudlateNewUrl(ImageBbox imbbox){
        List<CombineImageUrl> tileImages = new ArrayList<>();

        //get tilematrix
        Integer indexOfMatrix = getClosestZoomlevel(imbbox);
        TileMatrix tm = set.getMatrices().get(indexOfMatrix);
        
        // calc which tiles are needed 
        String topleft = tm.getTopLeftCorner();
        double tileMatrixMinX = Double.valueOf(topleft.substring(0, topleft.indexOf(" ")));
        double tileMatrixMaxY = Double.valueOf(topleft.substring(topleft.indexOf(" ")+1));
        
        int matrixHeight = tm.getMatrixHeight();
        int matrixWidth = tm.getMatrixWidth();
        
        double bBoxMinX = imbbox.getBbox().getMinx();
        double bBoxMinY = imbbox.getBbox().getMiny();
        double bBoxMaxX = imbbox.getBbox().getMaxx();
        double bBoxMaxY = imbbox.getBbox().getMaxy();
        
        double pixelSpan = Double.valueOf(tm.getScaleDenominator()) * 0.00028 / TileService.metersPerUnit(tm.getMatrixSet().getCrs());
        double tileSpanX = tm.getTileWidth() * pixelSpan;
        double tileSpanY = tm.getTileHeight() * pixelSpan;
        double tileMatrixMaxX = tileMatrixMinX + tileSpanX * matrixWidth;
        double tileMatrixMinY = tileMatrixMaxY - tileSpanY * matrixHeight;

        int minTileIndexX = (int) floor((bBoxMinX - tileMatrixMinX) / tileSpanX + epsilon);
        int maxTileIndexX = (int)floor((bBoxMaxX - tileMatrixMinX)/ tileSpanX + epsilon);
        int minTileIndexY = (int)floor((tileMatrixMaxY - bBoxMaxY) /tileSpanY + epsilon);
        int maxTileIndexY = (int) floor((tileMatrixMaxY - bBoxMinY) / tileSpanY - epsilon);
        


        //to avoid requesting out-of-range tiles
        if (minTileIndexX < 0) {
            minTileIndexX = 0;
        }
        if (maxTileIndexX >= matrixWidth) {
            maxTileIndexX = matrixWidth - 1;
        }
        if (minTileIndexY < 0) {
            minTileIndexY = 0;
        }
        if (maxTileIndexY >= matrixHeight) {
            maxTileIndexY = matrixHeight - 1;
        }
        
        int xOffset = (int) floor(((bBoxMinX - tileMatrixMinX) / tileSpanX ) %1 * tm.getTileWidth());
        int yOffset = (int)floor(((tileMatrixMaxY - bBoxMaxY) /tileSpanY) %1 * tm.getTileHeight());

        double tileWidthMapUnits = imbbox.getUnitsPixelX() * tm.getTileWidth();
        double tileHeightMapUnits = imbbox.getUnitsPixelY() * tm.getTileHeight();

        Bbox requestBbox = imbbox.getBbox();
         // 5) Opbouwen nieuwe tile url en per url ook x,y positie van tile bepalen
         //zodat drawImage deze op de juiste plek kan zetten 
        int numX = 0;
        int numY =0;
        for (int ix = minTileIndexX; ix <= maxTileIndexX; ix++) {
            for (int iy = minTileIndexY; iy <= maxTileIndexY; iy++) {
                double[] tempBbox = new double[4];

                tempBbox[0] = serviceBbox.getMinx() + (ix * tileWidthMapUnits);
                tempBbox[1] = serviceBbox.getMiny() + (iy * tileHeightMapUnits);
                tempBbox[2] = tempBbox[0] + tileWidthMapUnits;
                tempBbox[3] = tempBbox[1] + tileHeightMapUnits;

                Bbox tileBbox = new Bbox(tempBbox);
                //int posX = (int)Math.floor((tileBbox.getMinx() - requestBbox.getMinx()) / tileSpanX);
                int posX = (int)Math.floor((tempBbox[0] - requestBbox.getMinx()) / tileSpanX);
                int posY = (int)Math.floor((requestBbox.getMaxy() - tileBbox.getMaxy()) / tileSpanY);
                Double width = Math.floor((tileBbox.getMaxx() - tileBbox.getMinx()) / tileSpanX);
                Double height = Math.floor((tileBbox.getMaxy() - tileBbox.getMiny()) / tileSpanY);



                CombineStaticImageUrl tile = createTile(imbbox, tileBbox, ix , iy, indexOfMatrix, (numX * tm.getTileWidth()) - xOffset , (numY * tm.getTileHeight()) - yOffset);
                tileImages.add(tile);
                numY++;
            }
            numX++;
            numY=0;
        }
        return tileImages;
    }
     

    public Double getResolution(Integer zoomelevel) {
        TileMatrix tm = set.getMatrices().get(zoomelevel);
        double pixelSpan = Double.valueOf(tm.getScaleDenominator()) * 0.00028 / TileService.metersPerUnit(tm.getMatrixSet().getCrs());
        return pixelSpan;
    }

    @Override
    public CombineStaticImageUrl createTile(ImageBbox imageBbox, Bbox tileBbox, int tileX, int tileY, int matrixId, int imgPosX, int imgPosY) {
        try {
            CombineStaticImageUrl img = new CombineStaticImageUrl();
            TileMatrix tm = set.getMatrices().get(matrixId);

            //service=WMTS&request=GetTile&version=1.0.0&layer=etopo2&style=default&format=image/png&TileMatrixSet= WholeWorld_CRS_84 &TileMatrix=10m&TileRow=1&TileCol=3
            String tileUrl = url + "request=GetTile&version=1.0.0&format=image/png&SERVICE=WMTS&layer=" + "brtachtergrondkaart" + "&TileMatrixSet="
                    + URLEncoder.encode(set.getIdentifier(), "UTF-8") + "&TileRow=" + tileY + "&TileCol=" + tileX
                    + "&TileMatrix=" + URLEncoder.encode(tm.getIdentifier(), "UTF-8");

            log.error(imgPosX + " - " + imgPosY + ":" + tileUrl);
            img.setUrl(tileUrl);
            img.setHeight(tm.getTileHeight());
            img.setWidth(tm.getTileWidth());
            img.setBbox(tileBbox);

            String topleft = tm.getTopLeftCorner();
            double tileMatrixMinX = Double.valueOf(topleft.substring(0, topleft.indexOf(" ")));
            double tileMatrixMaxY = Double.valueOf(topleft.substring(topleft.indexOf(" ") + 1));

            double bBoxMinX = imageBbox.getBbox().getMinx();
            double bBoxMaxY = imageBbox.getBbox().getMaxy();
            double pixelSpan = Double.valueOf(tm.getScaleDenominator()) * 0.00028 / TileService.metersPerUnit(tm.getMatrixSet().getCrs());
            double tileSpanX = tm.getTileWidth() * pixelSpan;
            double tileSpanY = tm.getTileHeight() * pixelSpan;

            int xOffset = (int) floor(((bBoxMinX - tileMatrixMinX) / tileSpanX) % 1 * tm.getTileWidth());
            int yOffset = (int) floor(((tileMatrixMaxY - bBoxMaxY) / tileSpanY) % 1 * tm.getTileHeight());
            img.setX(imgPosX*tm.getTileWidth() - xOffset);
            img.setY(imgPosY*tm.getTileHeight() - yOffset);

            /* img.setX(numX);
            img.setY(numY);*/
            img.setAlpha(this.getAlpha());
            return img;
        } catch (UnsupportedEncodingException ex) {
            log.error("Cannot encode url params", ex);
            return null;
        }
    }

}
