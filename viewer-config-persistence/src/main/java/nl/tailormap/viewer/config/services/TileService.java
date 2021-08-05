/*
 * Copyright (C) 2011-2017 B3Partners B.V.
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
package nl.tailormap.viewer.config.services;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.persistence.CascadeType;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.EntityManager;
import javax.persistence.FetchType;
import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Matthijs Laan
 * @author Meine Toonen
 */
@Entity
@DiscriminatorValue(TileService.PROTOCOL)
public class TileService extends GeoService {
    private static final Log log = LogFactory.getLog(TileService.class);
    public static final String PROTOCOL = "tiled";
    public static final String PARAM_RESOLUTIONS = "resolutions";
    public static final String PARAM_TILESIZE = "tileSize";
    public static final String PARAM_TILINGPROTOCOL = "tilingProtocol";
    public static final String PARAM_SERVICENAME = "ServiceName";
    public static final String PARAM_SERVICEBBOX= "serviceBbox";
    public static final String PARAM_IMAGEEXTENSION= "imageExtension";
    public static final String PARAM_CRS= "crs";
    
    public static final String TILING_PROTOCOL_WMTS = "WMTS";
    public static final String TILING_PROTOCOL_TMS = "TMS";
    
    @OneToMany(cascade=CascadeType.ALL, fetch=FetchType.LAZY, mappedBy="tileService")
    private List<TileMatrixSet> matrixSets = new ArrayList<>();


    private String tilingProtocol;

    /**
     * Get the layer that contains the tiling settings etc.
     * @return the layer with tiling settings
     */
    public Layer getTilingLayer(){
        if (this.getTopLayer()!=null && this.getTopLayer().getChildren().size()>0){
            return this.getTopLayer().getChildren().get(0);
        }
        return null;
    }
    

    
    // <editor-fold desc="Getters and setters"  defaultstate="collapsed">
    
    public List<TileMatrixSet> getMatrixSets() {
        return matrixSets;
    }

    public void setMatrixSets(List<TileMatrixSet> matrixSets) {
        this.matrixSets = matrixSets;
    }
    
    public String getTilingProtocol() {
        return tilingProtocol;
    }

    public void setTilingProtocol(String tilingProtocol) {
        this.tilingProtocol = tilingProtocol;
    }

    //@Override
    public void checkOnline(EntityManager em) throws Exception {
    }
    
    // </editor-fold>
}
