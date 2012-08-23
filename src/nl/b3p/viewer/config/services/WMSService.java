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

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;
import javax.persistence.*;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.MutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.ServiceInfo;
import org.geotools.data.ows.HTTPClient;
import org.geotools.data.ows.LayerDescription;
import org.geotools.data.ows.SimpleHttpClient;
import org.geotools.data.ows.Specification;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.data.wms.*;
import org.geotools.data.wms.request.DescribeLayerRequest;
import org.geotools.data.wms.response.DescribeLayerResponse;
import org.geotools.ows.ServiceException;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(WMSService.PROTOCOL)
public class WMSService extends GeoService implements Updatable {
    private static final Log log = LogFactory.getLog(WMSService.class);
    
    public static final String PROTOCOL = "wms";

    public static final String PARAM_OVERRIDE_URL = "overrideUrl";
    public static final String PARAM_USERNAME = "username";
    public static final String PARAM_PASSWORD = "password";
    
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

            WMSService wmsService = new WMSService();
            wmsService.setUsername((String)params.get(PARAM_USERNAME));
            wmsService.setPassword((String)params.get(PARAM_PASSWORD));
            wmsService.setUrl(url);
            wmsService.setOverrideUrl(Boolean.TRUE.equals(params.get(PARAM_OVERRIDE_URL)));
            
            WebMapServer wms = wmsService.getWebMapServer();
            
            if(Boolean.TRUE.equals(params.get(GeoService.PARAM_ONLINE_CHECK_ONLY))) {
                return null;
            }

            wmsService.load(wms, params, status);
            
            return wmsService;
        } finally {
            status.setProgress(100);
            status.setCurrentAction("Service ingeladen");
            status.setFinished(true);
        }
    }
    
    protected void load(WebMapServer wms, Map params, WaitPageStatus status) throws IOException, MalformedURLException, ServiceException {
        ServiceInfo si = wms.getInfo();
        setName(si.getTitle());

        String serviceUrl = si.getSource().toString();
        if(getOverrideUrl() &&!getUrl().equals(serviceUrl)) {
            getDetails().put(GeoService.DETAIL_OVERRIDDEN_URL, new ClobElement(serviceUrl));
        } else {
            setUrl(serviceUrl);
        }

        getKeywords().addAll(si.getKeywords());

        status.setCurrentAction("Inladen layers...");
        status.setProgress(50);

        org.geotools.data.ows.Layer rl = wms.getCapabilities().getLayer();
        setTopLayer(new Layer(rl, this));

        status.setProgress(60);
        status.setCurrentAction("Gerelateerde WFS bronnen opzoeken...");

        StringBuffer layers = new StringBuffer();
        try {
            getAllNonVirtualLayers(layers, getTopLayer());

            DescribeLayerRequest dlreq = wms.createDescribeLayerRequest();
            dlreq.setLayers(layers.toString());
            log.debug("Issuing DescribeLayer request for WMS " + getUrl() + " with layers=" + layers);
            DescribeLayerResponse dlr = wms.issueRequest(dlreq);

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
                p.put(WFSDataStoreFactory.USERNAME.key, getUsername());
                p.put(WFSDataStoreFactory.PASSWORD.key, getPassword());

                try {
                    WFSFeatureSource wfsFs = new WFSFeatureSource(p);
                    wfsFs.loadFeatureTypes();

                    boolean used = false;
                    for(LayerDescription ld: layerDescByWfs.get(wfsUrl)) {
                        Layer l = getLayer(ld.getName());
                        if(l != null) {
                            SimpleFeatureType sft = wfsFs.getFeatureType(ld.getQueries()[0]);
                            if(sft != null) {
                                l.setFeatureType(sft);
                                log.debug("Feature type for layer " + l.getName() + " set to feature type " + sft.getTypeName());
                                used = true;
                            }
                        }                            
                    }
                    if(used) {
                        log.debug("Type from WFSFeatureSource with url " + wfsUrl + " used by layer of WMS");

                        wfsFs.setName(FeatureSource.findUniqueName(getName()));
                        wfsFs.setLinkedService(this);
                        log.debug("Unique name found for WFSFeatureSource: " + wfsFs.getName());
                    } else {
                        log.debug("No type from WFSFeatureSource with url " + wfsUrl + " used!");
                    }
                } catch(Exception e) {
                    log.error("Error loading WFS from url " + wfsUrl, e);
                }                    
            }
        } catch(Exception e) {
            log.warn("DescribeLayer request failed for layers " + layers + " on service " + getUrl(), e);
        }                    
    }
    
    protected WebMapServer getWebMapServer() throws IOException, MalformedURLException, ServiceException {
        HTTPClient client = new SimpleHttpClient();
        client.setUser(getUsername());
        client.setPassword(getPassword());
        
        return new WebMapServer(new URL(getUrl()), client) {
            @Override
            protected void setupSpecifications() {
                specs = new Specification[] {
                    new WMS1_0_0(),
                    new WMS1_1_0(),
                    new WMS1_1_1()
                    // No WMS 1.3.0, GeoTools GetCaps parser cannot handle 
                    // ExtendedCapabilities such as inspire_common:MetadataUrl,
                    // for example PDOK. See:
                    // http://sourceforge.net/mailarchive/message.php?msg_id=28640690
                };
            }
        };        
    }
    
    @Override
    public UpdateResult update() {
        
        final UpdateResult result = new UpdateResult(this);
        try {
            Map params = new HashMap();
            params.put(PARAM_OVERRIDE_URL, getOverrideUrl());
            params.put(PARAM_USERNAME, getUsername());
            params.put(PARAM_PASSWORD, getPassword());
            WMSService update = loadFromUrl(getUrl(), params, result.getWaitPageStatus().subtask("", 80));

            if(!getUrl().equals(update.getUrl())) {
                this.setUrl(update.getUrl());
                result.changed();
            }
            
            // XXX does this lead to update(), needs equals() guards?
            if(Boolean.TRUE.equals(getOverrideUrl())) {
                getDetails().put(DETAIL_OVERRIDDEN_URL, update.getDetails().get(DETAIL_OVERRIDDEN_URL));
            } else {
                getDetails().remove(DETAIL_OVERRIDDEN_URL);
            }
            
            if(!getDetails().containsKey(DETAIL_ORIGINAL_NAME)) {
                getDetails().put(DETAIL_ORIGINAL_NAME, new ClobElement(update.getName()));
            } else {
                setName(update.getName());
            }
            
            if(!getKeywords().equals(update.getKeywords())) {
                getKeywords().clear();
                getKeywords().addAll(update.getKeywords());
            }
            
            updateLayers(update, result);
            updateLayerTree(update, result);
            // XXX update auto linked feature types
            // report non auto linked separately -- may affect multiple layers
            // anyway
            // XXX updateFeatureTypes(update, result);
            
            removeOrphanLayersAfterUpdate(result);
            // XXX removeOrphanFeatureTypes()
            // XXX removeOrphanFeatureSources()
            
        } catch(Exception e) {
            result.failedWithException(e);
        }
        return result;
    }
    
    private void updateLayers(final WMSService update, final UpdateResult result) {
        // Update result.layerStatus() which currently has all layers set
        // to MISSING. 
        // New layers are set to NEW, with a clone plucked from the updated service tree
        // Existing layers are set to UNMODIFIED or UPDATED (Layer entities modified).
        
        // Duplicate layers are not updated
        
        // Grouping layers (no name) are ignored
        
        update.getTopLayer().accept(new Layer.Visitor() {
            @Override
            public boolean visit(Layer l) {
                if(l.getName() == null) {
                    // Grouping layer only
                    return true;
                }
                
                MutablePair<Layer,UpdateResult.Status> layerStatus = result.getLayerStatus().get(l.getName());

                if(layerStatus == null) {
                    // New layer, pluck a copy from the tree that will be made 
                    // persistent.
                    // Plucking a clone is necessary because the children 
                    // and parent will be set on this instance later on and we 
                    // need the original children to traverse the updated service
                    // tree while doing that
                    l = l.pluckCopy();
                    result.getLayerStatus().put(l.getName(), new MutablePair(l, UpdateResult.Status.NEW));
                } else {

                    if(layerStatus.getRight() != UpdateResult.Status.MISSING) {
                        // Already processed, ignore duplicate layer
                        return true;
                    }

                    Layer old = layerStatus.getLeft();

                    // Pluck from old tree
                    old.setParent(null);
                    old.getChildren().clear();
                    
                    // The layer properties are ignored for update status, only
                    // its featuretype determines changed boolean
                    old.update(l);
                    layerStatus.setRight(UpdateResult.Status.UNMODIFIED);
                    
                    // XXX update feature type here or in separate method?
                    
                    //boolean layerUpdated = old.updateFeatureType(l);
                    //layerStatus.setRight(layerUpdated ? UpdateResult.Status.UPDATED : UpdateResult.Status.UNMODIFIED);
                    //changed.setValue(changed.booleanValue() | layerUpdated);
                }
                return true;
            }
        });
    }
    
    private void updateLayerTree(final WMSService update, final UpdateResult result) {

        Layer newTopLayer;
        
        String topLayerName = update.getTopLayer().getName();
        if(topLayerName == null) {
            // Start with a new no name topLayer
            newTopLayer = update.getTopLayer().pluckCopy();
        } else {
            // Old persistent top layer or new plucked copy from updated service
            newTopLayer = result.getLayerStatus().get(topLayerName).getLeft();
        }
        
        // Copy user set stuff over from old toplayer, even if name was changed 
        // or topLayer has no name
        newTopLayer.copyUserModifiedProperties(getTopLayer());

        newTopLayer.setParent(null);
        newTopLayer.setService(this);
        newTopLayer.getChildren().clear();
        setTopLayer(newTopLayer);
        
        // Do a breadth-first traversal to set the parent and fill the children
        // list of all layers.
        // For the breadth-first traversal save layers from updated service to 
        // visit with their (possibly persistent) parent layers from this service
        
        Queue<Pair<Layer,Layer>> q = new LinkedList();

        // Start at children of topLayer from updated service, topLayer handled
        // above
        for(Layer child: update.getTopLayer().getChildren()) {
            q.add(new ImmutablePair(child, newTopLayer));
        }
        
        Set<String> visitedLayerNames = new HashSet();
        
        do {
            // Remove from head of queue
            Pair<Layer,Layer> p = q.remove();
            
            Layer updateLayer = p.getLeft(); // layer from updated service
            Layer parent = p.getRight();     // parent layer from this
            
            Layer thisLayer;
            String layerName = updateLayer.getName();
            if(layerName == null) {
                // 'New' no name layer - we can't possibly guess if it is
                // the same as an already existing no name layer so always
                // new entity
                thisLayer = updateLayer.pluckCopy();
            } else {
                
                if(visitedLayerNames.contains(layerName)) {
                    // Duplicate layer in updated service -- ignore this one
                    thisLayer = null;
                } else {
                    // Find possibly already persistent updated layer
                    // (depth first) - if new already a pluckCopy()
                    thisLayer = result.getLayerStatus().get(layerName).getLeft();
                    visitedLayerNames.add(layerName);
                }
            }

            if(thisLayer != null) {
                thisLayer.setService(this);
                thisLayer.setParent(parent);
                parent.getChildren().add(thisLayer);
            }
            
            for(Layer child: updateLayer.getChildren()) {
                // Add add end of queue
                q.add(new ImmutablePair(child, thisLayer));
            }
        } while(!q.isEmpty());
    }
    
    private void removeOrphanLayersAfterUpdate(UpdateResult result) {
        // Remove old stuff: duplicate layers from old this service, old layers
        // with null name which are all replaced
        for(Layer l: result.getDuplicateOrNoNameLayers()) {
            Stripersist.getEntityManager().remove(l);
        }
        
        // Remove old layers from this service which are missing from updated
        // service
        for(Pair<Layer,UpdateResult.Status> p: result.getLayerStatus().values()) {
            if(p.getRight() == UpdateResult.Status.MISSING) {
                Stripersist.getEntityManager().remove(p.getLeft());
            }
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
