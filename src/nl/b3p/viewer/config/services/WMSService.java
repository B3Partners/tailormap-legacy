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
import java.util.Map;
import javax.persistence.*;
import nl.b3p.web.WaitPageStatus;
import org.geotools.data.ServiceInfo;
import org.geotools.data.wms.*;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(WMSService.PROTOCOL)
public class WMSService extends GeoService {
    public static final String PROTOCOL = "wms";

    public static final String PARAM_OVERRIDE_URL = "overrideUrl";
    
    private Boolean overrideUrl;

    public Boolean getOverrideUrl() {
        return overrideUrl;
    }

    public void setOverrideUrl(Boolean overrideUrl) {
        this.overrideUrl = overrideUrl;
    }

    @Override
    public WMSService loadFromUrl(String url, Map params, WaitPageStatus status) throws Exception {
        try {
            status.setCurrentAction("Ophalen informatie...");
            
            WebMapServer gtwms = new WebMapServer(new URL(url));

            WMSService wms = new WMSService();

            ServiceInfo si = gtwms.getInfo();
            wms.setName(si.getTitle());

            wms.setOverrideUrl(Boolean.TRUE.equals(params.get(PARAM_OVERRIDE_URL)));
            if(overrideUrl) {
                wms.setUrl(url);
            } else {
                wms.setUrl(si.getSource().toString());
            }

            wms.getKeywords().addAll(si.getKeywords());

            status.setProgress(30);
            status.setCurrentAction("Inladen layers...");
            status.setProgress(70);

            org.geotools.data.ows.Layer l = gtwms.getCapabilities().getLayer();
            wms.setTopLayer(new Layer(l, wms));
            
            return wms;
        } finally {
            status.setCurrentAction("");
            status.setProgress(100);
            status.setFinished(true);
        }
    }

    @Override
    public String toString() {
        return String.format("WMS service \"%s\" at %s", getName(), getUrl());
    }

}
