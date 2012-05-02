/*
 * Copyright (C) 2011 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.config.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import nl.b3p.web.WaitPageStatus;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(TileService.PROTOCOL)
public class TileService extends GeoService {
    public static final String PROTOCOL = "tiled";
    public static final String PARAM_RESOLUTIONS = "resolutions";
    public static final String PARAM_TILESIZE = "tileSize";
    public static final String PARAM_TILINGPROTOCOL = "tilingProtocol";
    public static final String PARAM_SERVICENAME = "ServiceName";
    public static final String PARAM_SERVICEBBOX= "serviceBbox";
    public static final String PARAM_IMAGEEXTENSION= "imageExtension";
    public static final String PARAM_CRS= "crs";
    
    private String tilingProtocol;

    public String getTilingProtocol() {
        return tilingProtocol;
    }

    public void setTilingProtocol(String tilingProtocol) {
        this.tilingProtocol = tilingProtocol;
    }

    @Override
    public GeoService loadFromUrl(String url, Map params, WaitPageStatus status) {
        status.setCurrentAction("Bezig met aanmaken tile service");
        try{
            TileService s = new TileService();
            s.setUrl(url);
            
            String serviceName = (String) params.get(PARAM_SERVICENAME);
            s.setName(serviceName);

            //make fake top layer for tiling.
            Layer topLayer = new Layer();
            topLayer.setVirtual(true);
            topLayer.setService(s);
            
            Layer tilingLayer = new Layer();
            tilingLayer.setName(serviceName);
            tilingLayer.setTitle(serviceName);
            tilingLayer.setParent(topLayer);
            tilingLayer.setService(s);
            
            TileSet ts = new TileSet();
            ts.setName(serviceName);
            if (params.containsKey(PARAM_RESOLUTIONS)){
                String resString = (String) params.get(PARAM_RESOLUTIONS);
                List<Double> resolutions = new ArrayList<Double>();
                String[] resTokens = resString.split(",");
                for (int i = 0; i < resTokens.length; i++){
                    resolutions.add(Double.parseDouble(resTokens[i].trim()));
                }
                ts.setResolutions(resolutions);
            }
            if (params.containsKey(PARAM_TILESIZE)){
                Integer size = (Integer) params.get(PARAM_TILESIZE);
                ts.setHeight(size);
                ts.setWidth(size);            
            }            
            
            if (params.containsKey(PARAM_SERVICEBBOX) && params.containsKey(PARAM_CRS)){
                String[] bboxTokens = ((String)params.get(PARAM_SERVICEBBOX)).split(",");
                BoundingBox bb = new BoundingBox();
                bb.setMinx(Double.parseDouble(bboxTokens[0].trim()));
                bb.setMiny(Double.parseDouble(bboxTokens[1].trim()));
                bb.setMaxx(Double.parseDouble(bboxTokens[2].trim()));
                bb.setMaxy(Double.parseDouble(bboxTokens[3].trim()));
                bb.setCrs(new CoordinateReferenceSystem((String)params.get(PARAM_CRS)));
                tilingLayer.getBoundingBoxes().put(bb.getCrs(), bb);
            }
            
            if (params.containsKey(PARAM_IMAGEEXTENSION)){
                tilingLayer.getDetails().put("image_extension",(String)params.get(PARAM_IMAGEEXTENSION));
            }
            //set tiling layer as child of top layer
            topLayer.getChildren().add(tilingLayer);
            s.setTopLayer(topLayer);
            
            Stripersist.getEntityManager().persist(ts);           
            tilingLayer.setTileset(ts);
            
            return s;
        }finally {
            status.setProgress(100);
            status.setCurrentAction("Service ingeladen");
            status.setFinished(true);
        }
    }

}
