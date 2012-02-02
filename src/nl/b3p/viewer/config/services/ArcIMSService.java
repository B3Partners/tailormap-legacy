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

import java.net.URL;
import javax.persistence.*;
import nl.b3p.geotools.data.arcims.ArcIMSServer;
import nl.b3p.geotools.data.arcims.AxlLayerInfo;
import nl.b3p.web.WaitPageStatus;
import org.geotools.data.ServiceInfo;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue("arcims")
public class ArcIMSService extends GeoService {

    private String serviceName;

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    @Override
    public GeoService loadFromUrl(String url, WaitPageStatus status) throws Exception {
        try {
            status.setCurrentAction("Ophalen informatie...");
            
            
            ArcIMSServer gtims = new ArcIMSServer(new URL(url), serviceName);

            ArcIMSService ims = new ArcIMSService();

            ServiceInfo si = gtims.getInfo();
            ims.setName(si.getTitle());
            ims.setUrl(url);

            status.setProgress(30);
            status.setCurrentAction("Inladen layers...");
            status.setProgress(70);

            /* ArcIMS has a flat layer structure, create a virtual top layer */
            
            Layer top = new Layer();
            
            top.setVirtual(true);
            top.setTitle("Layers");
            top.setService(ims);

            for(AxlLayerInfo axlLayerInfo: gtims.getAxlServiceInfo().getLayers()) {
                top.getChildren().add(parseAxlLayerInfo(axlLayerInfo, ims));
            }
            ims.setTopLayer(top);
            
            return ims;
        } finally {
            status.setCurrentAction("");
            status.setProgress(100);
            status.setFinished(true);
        }
    }
    
    @Override
    public JSONObject toJSONObject() throws JSONException {
        JSONObject o = super.toJSONObject();
        if(serviceName != null) {
            o.put("ServiceName", serviceName);
        }
        return o;
    }
    
    private Layer parseAxlLayerInfo(AxlLayerInfo axl, GeoService service) {
        Layer l = new Layer();
        l.setService(service);
        l.setFilterable(true);
        l.setQueryable(true);
        l.setName(axl.getId());
        l.setTitle(axl.getName());
        l.getDetails().put("axl_type", axl.getType());
        String s = axl.getMinscale();
        if(s != null) {
            try {
                l.setMinScale(Double.parseDouble(s.replace(',', '.')));
            } catch(NumberFormatException nfe) {
            }
        }
        s = axl.getMaxscale();
        if(s != null) {
            try {
                l.setMaxScale(Double.parseDouble(s.replace(',', '.')));
            } catch(NumberFormatException nfe) {
            }
        }
        return l;
    }
}
