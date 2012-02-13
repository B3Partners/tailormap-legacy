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
import java.util.*;
import javax.persistence.*;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.ServiceInfo;
import org.geotools.data.ows.LayerDescription;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.data.wms.*;
import org.geotools.data.wms.request.DescribeLayerRequest;
import org.geotools.data.wms.response.DescribeLayerResponse;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(WMSService.PROTOCOL)
public class WMSService extends GeoService {
    private static final Log log = LogFactory.getLog(WMSService.class);
    
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
            
            // XXX username / password by overriding HTTPClient?
            WebMapServer gtwms = new WebMapServer(new URL(url));

            WMSService wms = new WMSService();

            ServiceInfo si = gtwms.getInfo();
            wms.setName(si.getTitle());

            wms.setOverrideUrl(Boolean.TRUE.equals(params.get(PARAM_OVERRIDE_URL)));
            if(wms.getOverrideUrl()) {
                wms.setUrl(url);
            } else {
                wms.setUrl(si.getSource().toString());
            }

            wms.getKeywords().addAll(si.getKeywords());

            status.setProgress(30);
            status.setCurrentAction("Inladen layers...");
            status.setProgress(50);

            org.geotools.data.ows.Layer rl = gtwms.getCapabilities().getLayer();
            wms.setTopLayer(new Layer(rl, wms));
            
            status.setProgress(60);
            status.setCurrentAction("Gerelateerde WFS bronnen opzoeken...");
            
            StringBuffer layers = new StringBuffer();
            try {
                getAllNonVirtualLayers(layers, wms.getTopLayer());

                DescribeLayerRequest dlreq = gtwms.createDescribeLayerRequest();
                dlreq.setLayers(layers.toString());
                log.debug("Issuing DescribeLayer request for WMS " + url + " with layers=" + layers);
                DescribeLayerResponse dlr = gtwms.issueRequest(dlreq);
                
                Map<String,List<LayerDescription>> layerDescByWfs = new HashMap<String,List<LayerDescription>>();
                
                for(LayerDescription ld: dlr.getLayerDescs()) {
                    log.debug(String.format("DescribeLayer response, name=%s, wfs=%s, typeNames=%s",
                            ld.getName(),
                            ld.getWfs(),
                            Arrays.toString(ld.getQueries())
                    ));
                    if(ld.getWfs() != null && ld.getQueries() != null && ld.getQueries().length != 0) {
                        if(ld.getQueries().length != 1) {
                            log.debug("Cannot handle multiple typeNames for this layer, only using the first");
                        }
                        List<LayerDescription> lds = layerDescByWfs.get(ld.getWfs().toString());
                        if(lds == null) {
                            lds = new ArrayList<LayerDescription>();
                            layerDescByWfs.put(ld.getWfs().toString(), lds);
                        }
                        lds.add(ld);
                    }                                
                }
                
                status.setProgress(70);
                String action = "Gerelateerde WFS bron inladen";
                String[] wfses = (String[])layerDescByWfs.keySet().toArray(new String[] {});
                for(int i = 0; i < wfses.length; i++) {
                    String wfsUrl = wfses[i];

                    String thisAction = action + (wfses.length > 1 ? " (" + (i+1) + " van " + wfses.length + ")" : "");
                    status.setCurrentAction(thisAction + ": GetCapabilities...");
                    
                    Map p = new HashMap();
                    p.put(WFSDataStoreFactory.URL.key, wfsUrl);
                    // XXX use same password for WMS, maybe only if URLs have same hostname?
                    
                    try {
                        WFSFeatureSource wfsFs = new WFSFeatureSource(p);
                        wfsFs.loadFeatureTypes();
                        
                        boolean used = false;
                        for(LayerDescription ld: layerDescByWfs.get(wfsUrl)) {
                            Layer l = wms.getLayer(ld.getName());
                            if(l != null) {
                                SimpleFeatureType sft = wfsFs.getFeatureType(ld.getQueries()[0]);
                                l.setFeatureType(sft);
                                log.debug("Feature type for layer " + l.getName() + " set to feature type " + sft.getTypeName());
                                used = true;
                            }                            
                        }
                        if(used) {
                            log.debug("Type from WFSFeatureSource with url " + wfsUrl + " used by layer of WMS, persisting after finding unique name");
                            
                            wfsFs.setName(FeatureSource.findUniqueName(wms.getName()));
                            log.debug("Unique name found for WFSFeatureSource: " + wfsFs.getName());

                            Stripersist.getEntityManager().persist(wfsFs);
                        } else {
                            log.debug("No type from WFSFeatureSource with url " + wfsUrl + " used, not persisting!");
                        }
                    } catch(Exception e) {
                        log.error("Error loading WFS from url " + wfsUrl, e);
                    }                    
                }
            } catch(Exception e) {
                log.warn("DescribeLayer request failed for layers " + layers + " on service " + url, e);
            }            
            
            return wms;
        } finally {
            status.setProgress(100);
            status.setCurrentAction("Service ingeladen");
            status.setFinished(true);
        }
    }
    
    private void getAllNonVirtualLayers(StringBuffer sb, Layer l) {
        if(!l.isVirtual()) {
            if(sb.length() > 0) {
                sb.append(",");
            }
            sb.append(l.getName());
        }
        for(Layer child: l.getChildren()) {
            getAllNonVirtualLayers(sb, child);
        }
    }

    @Override
    public String toString() {
        return String.format("WMS service \"%s\" at %s", getName(), getUrl());
    }

}
