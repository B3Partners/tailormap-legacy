/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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

import java.util.*;
import javax.persistence.*;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONException;
import org.json.JSONObject;
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
    public void checkOnline(EntityManager em) throws Exception {
    }
    
    @Override
    public GeoService loadFromUrl(String url, Map params, WaitPageStatus status, EntityManager em) {
        status.setCurrentAction("Bezig met aanmaken tile service");
        try{
            TileService s = new TileService();
            s.setUrl(url);
            
            String serviceName = (String) params.get(PARAM_SERVICENAME);
            s.setName(serviceName);
            
            String tp =(String) params.get(PARAM_TILINGPROTOCOL);
            s.setTilingProtocol(tp);

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
            Boolean unique = false;
            String tsName=serviceName;
            for (int i=0; i < 100; i++){
                if(em.find(TileSet.class,tsName)==null){
                    unique=true;
                    break;
                }
                tsName = serviceName+"("+(i+1)+")";
            }
            ts.setName(tsName);
            if (params.containsKey(PARAM_RESOLUTIONS)){
                String resString = (String) params.get(PARAM_RESOLUTIONS);
                ts.setResolutions(resString);
            }
            if (params.containsKey(PARAM_TILESIZE)){
                Integer size = (Integer) params.get(PARAM_TILESIZE);
                ts.setHeight(size);
                ts.setWidth(size);            
            }            
            
            if (params.containsKey(PARAM_SERVICEBBOX) && params.containsKey(PARAM_CRS)){
                String bounds = (String)params.get(PARAM_SERVICEBBOX);
                BoundingBox bb = new BoundingBox();
                bb.setBounds(bounds);
                bb.setCrs(new CoordinateReferenceSystem((String)params.get(PARAM_CRS)));
                tilingLayer.getBoundingBoxes().put(bb.getCrs(), bb);
            }
            
            if (params.containsKey(PARAM_IMAGEEXTENSION) && 
                    params.get(PARAM_IMAGEEXTENSION)!=null &&
                    StringUtils.isNotBlank((String)params.get(PARAM_IMAGEEXTENSION))){
                tilingLayer.getDetails().put("image_extension", new ClobElement((String)params.get(PARAM_IMAGEEXTENSION)));
            }
            //set tiling layer as child of top layer
            topLayer.getChildren().add(tilingLayer);
            s.setTopLayer(topLayer);
            
            em.persist(ts);
            tilingLayer.setTileset(ts);
            
            return s;
        }finally {
            status.setProgress(100);
            status.setCurrentAction("Service ingeladen");
            status.setFinished(true);
        }
    }
    
    protected void parseWMTSCapabilities(String url, Map params, WaitPageStatus status){
        
    }
    
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
    
    @Override
    public JSONObject toJSONObject(boolean flatten, Set<String> layersToInclude,boolean validXmlTags, EntityManager em) throws JSONException {
        JSONObject o = super.toJSONObject(flatten, layersToInclude,validXmlTags,em);
        if(tilingProtocol != null) {
            o.put("tilingProtocol", tilingProtocol);
        }
        return o;
    }    
    
    @Override
    public JSONObject toJSONObject(boolean flatten, Set<String> layersToInclude,boolean validXmlTags, boolean includeAuthorizations, EntityManager em) throws JSONException {
        JSONObject o = super.toJSONObject(flatten, layersToInclude,validXmlTags, includeAuthorizations,em);
        if(tilingProtocol != null) {
            o.put("tilingProtocol", tilingProtocol);
        }
        return o;
    }    

}
