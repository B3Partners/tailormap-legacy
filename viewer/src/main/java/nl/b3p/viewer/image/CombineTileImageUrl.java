/*
 * Copyright (C) 2012-2017 B3Partners B.V.
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

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Roy Braam
 */
public abstract class CombineTileImageUrl extends CombineImageUrl {

    protected Bbox serviceBbox = null;
    private Double[] resolutions = null;
    private Integer tileWidth = 256;
    private Integer tileHeight = 256;
    protected String extension;

    protected static double epsilon = 0.0000000001;

    public CombineTileImageUrl(CombineTileImageUrl ctiu) {
        super(ctiu);
    }

    public CombineTileImageUrl() {
        super();
    }

    public Integer getClosestZoomlevel(ImageBbox requestBbox) {
        /* calc resolution */
        Double res = null;
        if (requestBbox != null) {
            res = requestBbox.getUnitsPixelX();
        }

        Integer zoomlevel = null;
        if (resolutions != null) {
            for (int i = 0; i < resolutions.length; i++) {
                Double testRes = resolutions[i];

                if (((res - testRes) < epsilon) && ((res - testRes) > -epsilon)) {
                    zoomlevel = i;
                    break;
                } else if (res >= testRes) {
                    // Check if res is lower than lowest resolution in array (first element)
                    zoomlevel = i;
                    break;
                } else if (res < testRes) {
                    // Check if res is higher than highest resolution in array (last element)
                    zoomlevel = i;
                }
            }

        }
        return zoomlevel;
    }
    
    public Double getResolution(ImageBbox imbbox,Integer zoomlevel){
        return resolutions[zoomlevel];
    }

    @Override
    public List<CombineImageUrl> calculateNewUrl(ImageBbox imbbox) {
        List<CombineImageUrl> tileImages = new ArrayList<>();

        //get closest res
        Integer zoomlevel = getClosestZoomlevel(imbbox);
        Double closestResolution = getResolution(imbbox,zoomlevel); 

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

                CombineStaticImageUrl tile = createTile(imbbox, tileBbox, ix, iy, zoomlevel, numX, numY);

                tileImages.add(tile);
                numY++;
            }
            numX++;
            numY=0;
        }
        return tileImages;
    }

    /*
     * create the tile
     * @param imageBbox the original imageBbox reqeust
     * @param tileBbox the bbox of this tile
     * @param indexX
     * @param indexY
     * @param zoomlevel
     * @return
     */
    public CombineStaticImageUrl createTile(ImageBbox imageBbox, Bbox tileBbox, int tileIndexX, int tileIndexY, int zoomlevel, int imgIndexX, int imgIndexY) {

        CombineStaticImageUrl tile = new CombineStaticImageUrl();
        tile.setBbox(tileBbox);
        tile.setUrl(getUrl());
        tile.setAlpha(this.getAlpha());
        Bbox requestBbox = imageBbox.getBbox();
        Double msx = (requestBbox.getMaxx() - requestBbox.getMinx()) / imageBbox.getWidth();
        Double msy = (requestBbox.getMaxy() - requestBbox.getMiny()) / imageBbox.getHeight();

        Double posX = Math.ceil( (tileBbox.getMinx() - requestBbox.getMinx()) / msx );
        Double posY = Math.ceil( (requestBbox.getMaxy() - tileBbox.getMaxy()) / msy );
        Double width = Math.ceil( (tileBbox.getMaxx() - tileBbox.getMinx()) / msx );
        Double height = Math.ceil( (tileBbox.getMaxy() - tileBbox.getMiny()) / msy );

        tile.setX(posX.intValue());
        tile.setY(posY.intValue());

        tile.setWidth(width.intValue());
        tile.setHeight(height.intValue());

        tile.setUrl(createUrl(imageBbox, tileBbox, tileIndexX, tileIndexY,zoomlevel));

        return tile;
    }

    /**
     * Get the index number X of the tile on coordinate 'xCoord'.
     *
     * @param xCoord The x coord.
     * @param res The resolution for which the tile should be calculated
     * @param max not used?
     * @return the zoomlevel
     */
    public Integer getTileIndexX(Double xCoord, Double res, boolean max) {
        Double tileSpanX = res * getTileWidth();
        Double tileIndexX = Math.floor((xCoord - serviceBbox.getMinx()) / (tileSpanX + epsilon));
        if (tileIndexX < 0) {
            tileIndexX = 0.0;
        }
        Double maxBboxX = Math.floor((serviceBbox.getMaxx() - serviceBbox.getMinx()) / (tileSpanX + epsilon));
        if (tileIndexX > maxBboxX) {
            tileIndexX = maxBboxX;
        }
        return tileIndexX.intValue();
    }

    /**
     * Get the index number Y of the tile on coordinate 'yCoord' on zoomlevel
     * 'zoomLevel'.
     *
     * @param yCoord The y coord.
     * @param res The resolution for which the tile should be calculated
     * @param max not used?
     * @return the zoomlevel
     */
    public Integer getTileIndexY(double yCoord, Double res, boolean max) {
        Double tileSpanY = res * getTileHeight();
        Double tileIndexY = Math.floor((yCoord - serviceBbox.getMiny()) / (tileSpanY + epsilon));
        if (tileIndexY < 0) {
            tileIndexY = 0.0;
        }
        Double maxBboxY = Math.floor((serviceBbox.getMaxy() - serviceBbox.getMiny()) / (tileSpanY + epsilon));
        if (tileIndexY > maxBboxY) {
            tileIndexY = maxBboxY;
        }
        return tileIndexY.intValue();
    }

    //<editor-fold defaultstate="collapsed" desc="Getters setters">
    /**
     * @return the bbox
     */
    public Bbox getServiceBbox() {
        return serviceBbox;
    }

    /**
     * @param bbox the bbox to set
     */
    public void setServiceBbox(Bbox bbox) {
        this.serviceBbox = bbox;
    }

    /**
     * @return the resolutions
     */
    public Double[] getResolutions() {
        return resolutions;
    }

    /**
     * @param resolutions the resolutions to set
     */
    public void setResolutions(Double[] resolutions) {
        this.resolutions = resolutions;
    }

    /**
     * @return the tileWidth
     */
    public Integer getTileWidth() {
        return tileWidth;
    }

    /**
     * @param tileWidth the tileWidth to set
     */
    public void setTileWidth(Integer tileWidth) {
        this.tileWidth = tileWidth;
    }

    /**
     * @return the tileHeight
     */
    public Integer getTileHeight() {
        return tileHeight;
    }

    /**
     * @param tileHeight the tileHeight to set
     */
    public void setTileHeight(Integer tileHeight) {
        this.tileHeight = tileHeight;
    }

    public String getExtension() {
        return extension;
    }

    public void setExtension(String extension) {
        this.extension = extension;
    }

    //</editor-fold>
    protected abstract String createUrl(ImageBbox imageBbox, Bbox tileBbox, int indexX, int indexY, int zoomlevel);

}
