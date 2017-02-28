/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Roy Braam
 */
public class TileServerSettings {
    private Bbox bbox = null;
    private Double[] resolutions = null;
    private Integer tileWidth = null;
    private Integer tileHeight = null;
    private String url=null;
    
    
    public List<CombineImageUrl> getTilingImages(CombineImageSettings settings) 
            throws MalformedURLException, Exception {
        
        List<CombineImageUrl> tileImages = new ArrayList<CombineImageUrl>();
        
        /* Bbox van verzoek */        
        Bbox requestBbox = null;
        if (settings.getBbox() != null) {           
            requestBbox = settings.getBbox(); 
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
        if (resolutions!=null) {                        
            for (int i=0; i < resolutions.length; i++) {
                Double testRes = resolutions[i];
                
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
        if (this.getTileWidth() != null && useRes != null) {
            tileWidthMapUnits = this.getTileWidth() * useRes;
        }
        if (this.getTileWidth() != null && useRes != null) {
            tileHeightMapUnits = this.getTileWidth() * useRes;
        }
        
        /* 4) Berekenen benodigde tile indexen */
        Integer minTileIndexX = null;
        Integer maxTileIndexX = null;
        Integer minTileIndexY = null;
        Integer maxTileIndexY = null;        
        if (tileWidthMapUnits != null && tileWidthMapUnits > 0 
                && tileHeightMapUnits != null && tileHeightMapUnits > 0) {  
            
            minTileIndexX = getTilingCoord(bbox.getMinx(), bbox.getMaxx(), tileWidthMapUnits, requestBbox.getMinx());
            maxTileIndexX = getTilingCoord(bbox.getMinx(), bbox.getMaxx(), tileWidthMapUnits, requestBbox.getMaxx());
            minTileIndexY = getTilingCoord(bbox.getMiny(), bbox.getMaxy(), tileHeightMapUnits, requestBbox.getMiny());
            maxTileIndexY = getTilingCoord(bbox.getMiny(), bbox.getMaxy(), tileHeightMapUnits, requestBbox.getMaxy());            
        }
        
        /* 5) Opbouwen nieuwe tile url en per url ook x,y positie van tile bepalen 
         zodat drawImage deze op de juiste plek kan zetten */
        for (int ix = minTileIndexX; ix <= maxTileIndexX; ix++) {
            for (int iy = minTileIndexY; iy <= maxTileIndexY; iy++) {
                double[] tempBbox = new double[4];
                
                tempBbox[0] = bbox.getMinx() + (ix * tileWidthMapUnits);
                tempBbox[1] = bbox.getMiny() + (iy * tileHeightMapUnits);
                tempBbox[2] = tempBbox[0] + tileWidthMapUnits;                
                tempBbox[3] = tempBbox[1] + tileHeightMapUnits;
                
                Bbox tileBbox = new Bbox(tempBbox);                
                
                CombineStaticImageUrl tile = calcTilePosition(mapWidth, mapHeight, tileBbox, requestBbox, ix, iy);               
                 
                String newUrl = createTileUrl(tile);
                
                CombineImageUrl url = new CombineWmsUrl(); 
                url.setUrl(newUrl);
                url.setRealUrl(new URL(newUrl));
                
                tileImages.add(tile);
            }            
        }
        
        return tileImages;
    }
    /*
     * Calculate the index of the tiling.
     */
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
    
    /*
     * Calculate the position of the tile.
     */
    public CombineStaticImageUrl calcTilePosition(Integer mapWidth, Integer mapHeight,
            Bbox tileBbox, Bbox requestBbox, int offsetX, int offsetY) {
        
        CombineStaticImageUrl tile = new CombineStaticImageUrl();
        tile.setBbox(tileBbox);
        tile.setUrl(this.url);
        
        Double msx = (requestBbox.getMaxx() - requestBbox.getMinx()) / mapWidth;
        Double msy = (requestBbox.getMaxy() - requestBbox.getMiny()) / mapHeight;
        
        Double posX = Math.floor( (tileBbox.getMinx() - requestBbox.getMinx()) / msx );
        Double posY = Math.floor( (requestBbox.getMaxy() - tileBbox.getMaxy()) / msy );
        Double width = Math.floor( (tileBbox.getMaxx() - tileBbox.getMinx()) / msx );
        Double height = Math.floor( (tileBbox.getMaxy() - tileBbox.getMiny()) / msy );
        
        tile.setX(posX.intValue() - offsetX);
        tile.setY(posY.intValue() + offsetY);
        
        tile.setWidth(width.intValue());
        tile.setHeight(height.intValue());
                
        return tile;
    }
    //<editor-fold defaultstate="collapsed" desc="Getters and Setters">
    public Bbox getBbox() {
        return bbox;
    }
    
    public void setBbox(Bbox bbox) {
        this.bbox = bbox;
    }
    
    public Double[] getResolutions() {
        return resolutions;
    }
    /**
     * Sets the resolutions
     * @param commaSeperatedResolutions a string with the comma seperated resolutions.
     */
    public void setResolutions(String commaSeperatedResolutions){
        String[] tokens=null;
        if (commaSeperatedResolutions.indexOf(",")>0){
            tokens = commaSeperatedResolutions.split(",");
        }else{
            tokens = commaSeperatedResolutions.split(" ");
        }
        
        Double[] res = new Double[tokens.length];
        for (int i=0; i < tokens.length; i++){
            res[i]=Double.parseDouble(tokens[i]);
        }
        this.resolutions=res;
    }
    
    public void setResolutions(Double[] resolutions) {
        this.resolutions = resolutions;
    }
    
    public Integer getTileWidth() {
        return tileWidth;
    }
    
    public void setTileWidth(Integer tileWidth) {
        this.tileWidth = tileWidth;
    }
    
    public Integer getTileHeight() {
        return tileHeight;
    }
    
    public void setTileHeight(Integer tileHeight) {
        this.tileHeight = tileHeight;
    }
    //</editor-fold>

    private String createTileUrl(CombineStaticImageUrl tile) {
        String sizes = null;
        if (this.getTileWidth() != null && this.getTileHeight() != null) {
            sizes = "&WIDTH=" + this.getTileWidth() + "&HEIGHT=" + this.getTileHeight();
        }
        String bboxString = "&BBOX=" + tile.getBbox().toString();
        String newUrl = this.url + sizes + bboxString;
        return newUrl;
    }
    
}
