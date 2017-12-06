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
public class CombineWMTSUrl_old extends CombineTileImageUrl {

    private static final Log log = LogFactory.getLog(CombineTileImageUrl.class);

    private TileMatrixSet set;

   /*public CombineWMTSUrl(CombineTileImageUrl ctiu) {
        super(ctiu);
    }

    public CombineWMTSUrl() {
        super();
    }*/

    @Override
    public List<CombineImageUrl> calculateNewUrl(ImageBbox requestBbox) {
        List<CombineImageUrl> urls = new ArrayList<>();

        // haal huidige tilematrix op
        int tilematrixindex = getClosestZoomlevel(requestBbox);
        TileMatrix tm = set.getMatrices().get(tilematrixindex);
        Double pixelSpan = Double.valueOf(tm.getScaleDenominator()) * 0.00028 / TileService.metersPerUnit(tm.getMatrixSet().getCrs());

        double tileWidthInMeters = tm.getTileWidth() * pixelSpan;
        double tileHeightInMeters = tm.getTileHeight()* pixelSpan;
        
        Bbox imbbox = requestBbox.getBbox();

        String topleft = tm.getTopLeftCorner();
        double tileMatrixMinX = Double.valueOf(topleft.substring(0, topleft.indexOf(" ")));
        double tileMatrixMaxY = Double.valueOf(topleft.substring(topleft.indexOf(" ") + 1));

        double tileMatrixMinY = tileMatrixMaxY - (tm.getMatrixHeight() * tileHeightInMeters);
        double tileMatrixMaxX = tileMatrixMinX + (tm.getMatrixWidth() * tileWidthInMeters);

        double tileSpanX = tm.getTileWidth() * pixelSpan;
        double tileSpanY = tm.getTileWidth() * pixelSpan;

        double epsilon = 1e-6;
        int tileMinCol = (int)(floor(imbbox.getMinx() -tileMatrixMinX) / (tileSpanX + epsilon));
        int tileMaxCol = (int)(floor (imbbox.getMaxx() - tileMatrixMinX)/ (tileSpanX - epsilon));
        int tileMinRow = (int)(floor ((tileMatrixMaxY - imbbox.getMaxy())/ (tileSpanY + epsilon)));
        int tileMaxRow = (int)(floor ((tileMatrixMaxY - imbbox.getMiny()) / (tileSpanY -epsilon)));
        
        if(tileMinCol < 0 ){
            tileMinCol = 0;
        }
        
        if(tileMaxCol >= tm.getMatrixWidth()){
            tileMaxCol = tm.getMatrixWidth() -1;
        }
        
        if(tileMinRow < 0){
            tileMinRow = 0;
        }
        
        if(tileMaxRow >= tm.getMatrixHeight()){
            tileMaxRow = tm.getMatrixHeight() -1;
        }

        int imgX = 0, imgY = 0;
        for (int x = tileMinCol; x <= tileMaxCol; x++) {
            for (int y = tileMinRow; y <= tileMaxRow; y++) {
                
                double tileMinX = tileMatrixMinX + (x * tileWidthInMeters);
                double tileMinY = tileMatrixMinY + (y * tileHeightInMeters);
                double tileMaxX = tileMinX + tileWidthInMeters;
                double tileMaxY = tileMinY + tileHeightInMeters;
                
                Bbox tileBbox = new Bbox(tileMinX,tileMinY,tileMaxX,tileMaxY);
                
                CombineStaticImageUrl tile = createTile(requestBbox, tileBbox, x, y, tilematrixindex, imgX, imgY);
                urls.add(tile);
                imgY++;
            }
            imgY = 0;
            imgX++;
        }
        return urls;
    }


    @Override
    public CombineStaticImageUrl createTile(ImageBbox imageBbox, Bbox tileBbox, int tileIndexX, int tileIndexY, int zoomlevel, int imgIndexX, int imgIndexY) {
        CombineStaticImageUrl img = new CombineStaticImageUrl();
        String url = createUrl(imageBbox, tileBbox, imgIndexX, imgIndexY, zoomlevel);
        log.error("Image: " + imgIndexX + " - " + imgIndexY + " : " + url);
        TileMatrix tm = set.getMatrices().get(zoomlevel);
        
        int tileWidth = tm.getTileWidth();
        int tileHeight = tm.getTileHeight();
        
        int x = imgIndexX * tileWidth;
        int y = imgIndexY * tileHeight;
        
        img.setX(x);
        img.setY(y);
        img.setUrl(url);
        img.setAlpha(this.getAlpha());
        img.setBbox(tileBbox);
        img.setWidth(tileWidth);
        img.setHeight(tileHeight);
        return img;
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
}
