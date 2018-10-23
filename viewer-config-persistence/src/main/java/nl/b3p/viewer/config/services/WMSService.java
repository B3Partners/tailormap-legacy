/*
 * Copyright (C) 2011-2016 B3Partners B.V.
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
package nl.b3p.viewer.config.services;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;
import javax.persistence.*;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.lang3.mutable.MutableBoolean;
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
 * Entity for saving WMS service metadata. Enables the administration module to
 * easily work with WMS service entities and the viewer to quickly marshall the
 * metadata without having to do a GetCapabilities request each time the viewer 
 * starts.
 * <p>
 * This requires an option to update the metadata should the service change, so
 * this class implements Updatable.
 * <p>
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(WMSService.PROTOCOL)
public class WMSService extends GeoService implements Updatable {
    private static final Log log = LogFactory.getLog(WMSService.class);
    
    /**
     * JPA DiscriminatorValue for this class.
     */
    public static final String PROTOCOL = "wms";

    /**
     * Parameter to specify the value for #getOverrideUrl().
     */
    public static final String PARAM_OVERRIDE_URL = "overrideUrl";

    /**
     * Parameter to specify the value for {@code skipDiscoverWFS}.
     *
     * @see #skipDiscoverWFS
     */
    public static final String PARAM_SKIP_DISCOVER_WFS = "skipDiscoverWFS";

   
    /* Detail key under which "true" is saved in details if in the WMS capabilities 
     * the <UserDefinedSymbolization> element has a positive SupportSLD attribute.
     */ 
    public static final String DETAIL_SUPPORT_SLD = "SupportSLD";
    
    /* Detail key under which "true" is saved in details if in the WMS capabilities 
     * the <UserDefinedSymbolization> element has a positive UserStyle attribute.
     */ 
    public static final String DETAIL_USER_STYLE = "UserStyle";
    

    /**
     * Additional persistent property for this subclass, so type must be nullable.
     */
    private Boolean overrideUrl;

    /**
     * Additional persistent property for this subclass to remember wether to
     * search for and join WFS attribute sources, so type must be nullable.
     */
    private Boolean skipDiscoverWFS;
    
    @Enumerated(EnumType.STRING)
    private WMSExceptionType exception_type = WMSExceptionType.Inimage;

    /**
     * Whether to use the original URL the Capabilities was loaded with or the
     * URL the WMS reports it is at in the Capabilities. Sometimes the URL reported
     * by the WMS is outdated, but it can also be used to migrate the service
     * to another URL or load Capabilities from a static XML Capabilities document
     * on a simple HTTP server. According to the standard the URL in the Capabilities
     * should be used, so set this to false by default except if the user requests
     * an override.
     *
     * @return true when set
     */
    public Boolean getOverrideUrl() {
        return overrideUrl;
    }

    public void setOverrideUrl(Boolean overrideUrl) {
        this.overrideUrl = overrideUrl;
    }
    
    public WMSExceptionType getException_type() {
        return exception_type;
    }

    public void setException_type(WMSExceptionType exception_type) {
        this.exception_type = exception_type;
    }

    public Boolean getSkipDiscoverWFS() {
        return skipDiscoverWFS;
    }

    public void setSkipDiscoverWFS(Boolean skipDiscoverWFS) {
        this.skipDiscoverWFS = skipDiscoverWFS;
    }

    @Override
    public String toString() {
        return String.format("WMS service \"%s\" at %s", getName(), getUrl());
    }

    //<editor-fold desc="Loading from WMS URL">
    /**
     * Load WMS metadata from URL or only check if the service is online when
     * PARAM_ONLINE_CHECK_ONLY is true.
     *
     * @param url The location of the WMS.
     * @param params Map containing parameters, keys are finals in this class.
     * @param status For reporting progress.
     * @param em the entity manager to use
     * @return the service as retrieved from the url
     * @throws java.lang.Exception if any
     */
    @Override
    public WMSService loadFromUrl(String url, Map params, WaitPageStatus status, EntityManager em) throws Exception {
        try {
            status.setCurrentAction("Ophalen informatie...");
            
            WMSService wmsService = new WMSService();
            wmsService.setUsername((String)params.get(PARAM_USERNAME));
            wmsService.setPassword((String)params.get(PARAM_PASSWORD));
            wmsService.setUrl(url);
            wmsService.setOverrideUrl(Boolean.TRUE.equals(params.get(PARAM_OVERRIDE_URL)));
            wmsService.setSkipDiscoverWFS(Boolean.TRUE.equals(params.get(PARAM_SKIP_DISCOVER_WFS)));
            WebMapServer wms = wmsService.getWebMapServer();
            
            if(Boolean.TRUE.equals(params.get(GeoService.PARAM_ONLINE_CHECK_ONLY))) {
                return null;
            }
            
            wmsService.load(wms, params, status, em);
            
            return wmsService;
        } finally {
            status.setProgress(100);
            status.setCurrentAction("Service ingeladen");
            status.setFinished(true);
        }
    }

    /**
     * Does the actual loading work.
     *
     * @param wms WMS service
     * @param params unused?
     * @param status progress page
     * @param em the entity manager to use
     * @throws IOException when retrieving the capabilities
     * @throws MalformedURLException if wms capabilities has improper urls
     * @throws ServiceException if any occurs parsng the capabilities etc.
     */
    protected void load(WebMapServer wms, Map params, WaitPageStatus status, EntityManager em) throws IOException, MalformedURLException, ServiceException {
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
        
        boolean supportsDescribeLayer = wms.getCapabilities().getRequest().getDescribeLayer() != null;
        
        status.setProgress(40);
        
        org.geotools.data.ows.Layer rl = wms.getCapabilities().getLayer();
        setTopLayer(new Layer(rl, this));

        if (this.getSkipDiscoverWFS()) {
            status.setProgress(80);
            log.debug("Skip trying to discover WFS associated with " + this.toString());
        } else {
            log.debug("Try to discover WFS associated with " + this.toString());
            Map<String, List<LayerDescription>> layerDescByWfs = null;

            // Some servers are shy about supporting DescribeLayer in the
            // Capabilities, so do the request anyway, but only if version is not
            // WMS 1.0.0
            if (!"1.0.0".equals(wms.getCapabilities().getVersion())) {
                try {
                    status.setProgress(60);
                    status.setCurrentAction("Gerelateerde WFS bronnen opzoeken...");

                    layerDescByWfs = getDescribeLayerPerWFS(wms);
                } catch (Exception e) {
                    if (supportsDescribeLayer) {
                        log.error("DescribeLayer request failed", e);
                    } else {
                        log.debug("DescribeLayer not supported in Capabilities, did request anyway but failed");
                    }
                }
            }

            if (layerDescByWfs != null) {
                status.setProgress(80);
                String action = "Gerelateerde WFS bron inladen...";

                String[] wfses = (String[]) layerDescByWfs.keySet().toArray(new String[]{});
                for (int i = 0; i < wfses.length; i++) {
                    String wfsUrl = wfses[i];

                    String wfsAction = action + (wfses.length > 1 ? " (" + (i + 1) + " van " + wfses.length + ")" : "");
                    status.setCurrentAction(wfsAction);

                    try {
                        List<LayerDescription> layerDescriptions = layerDescByWfs.get(wfsUrl);

                        loadLayerFeatureTypes(wfsUrl, layerDescriptions, em);
                    } catch (Exception e) {
                        log.error("Failed loading feature types from WFS " + wfsUrl, e);
                    }
                }
            }

        }
    }
    
    /**
     * Construct the GeoTools WebMapServer metadata object.
     *
     * @return the webmapserver for this service
     * @throws IOException when the http connection fails
     * @throws MalformedURLException when the url is invalid
     * @throws ServiceException when the service is invalid
     */
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
    //</editor-fold>
    
    // <editor-fold desc="Updating">
    /**
     * Reload the WMS capabilities metadata and update this entity if it is 
     * changed. If {@link #getOverrideUrl()} is false, will pickup URL changes
     * from the service.
     */
    @Override
    public UpdateResult update(EntityManager em) {
        
        initLayerCollectionsForUpdate();
        final UpdateResult result = new UpdateResult(this, em);
        
        try {
            Map params = new HashMap();
            params.put(PARAM_OVERRIDE_URL, getOverrideUrl());
            params.put(PARAM_USERNAME, getUsername());
            params.put(PARAM_PASSWORD, getPassword());
            params.put(PARAM_SKIP_DISCOVER_WFS, getSkipDiscoverWFS());
            WMSService update = loadFromUrl(getUrl(), params, result.getWaitPageStatus().subtask("", 80),em);
            
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
            
            // Find auto-linked FeatureSource (manually linked feature sources
            // not updated automatically)
            Set<FeatureSource> linkedFS = getAutomaticallyLinkedFeatureSources(getTopLayer(), em);
            Map<String,WFSFeatureSource> linkedFSByURL = createFeatureSourceMapByURL(linkedFS); 
            
            List<SimpleFeatureType> typesToRemove = new ArrayList();
            Set<SimpleFeatureType> updatedFeatureTypes = new HashSet();
            updateWFS(update, linkedFSByURL, updatedFeatureTypes, typesToRemove, result, em);            
            updateLayers(update, linkedFSByURL, updatedFeatureTypes, result, em);
            updateLayerTree(update, result);
            
            removeOrphanLayersAfterUpdate(result);
            removeFeatureTypes(typesToRemove, result);
            
            // WFSFeatureSources which are no longer used are not updated
            // Maybe remove these
            
            result.setStatus(UpdateResult.Status.UPDATED);
        } catch(Exception e) {
            result.failedWithException(e);
        }
        return result;
    }
    
    private Map<String, WFSFeatureSource> createFeatureSourceMapByURL(Collection<FeatureSource> fsCollection) {
        Map<String, WFSFeatureSource> map = new HashMap();
        for(FeatureSource fs: fsCollection) {
            map.put(fs.getUrl(), (WFSFeatureSource)fs);
        }
        return map;
    }
    
    private void removeFeatureTypes(Collection<SimpleFeatureType> typesToRemove, UpdateResult result) {
        if(typesToRemove.isEmpty()) {
            return;
        }

        SimpleFeatureType.clearReferences(typesToRemove);
        
        for(SimpleFeatureType typeToRemove: typesToRemove) {
            typeToRemove.getFeatureSource().getFeatureTypes().remove(typeToRemove);
            Stripersist.getEntityManager().remove(typeToRemove);
        }
    }
    
    private static Set<FeatureSource> getAutomaticallyLinkedFeatureSources(Layer top, EntityManager em) {
        final GeoService service = top.getService();
        final Set<FeatureSource> featureSources = new HashSet();
        top.accept(new Layer.Visitor() {
            @Override
            public boolean visit(Layer l, EntityManager em) {
                if(l.getFeatureType() != null) {
                    FeatureSource fs = l.getFeatureType().getFeatureSource();
                    // Do not include manually linked feature sources
                    if(fs.getLinkedService() == service) {
                        featureSources.add((WFSFeatureSource)fs);
                    }
                }
                return true;
            }
        }, em);
        return featureSources;
    }

    private void updateWFS(final WMSService updateWMS, final Map<String,WFSFeatureSource> linkedFSesByURL, Set<SimpleFeatureType> updatedFeatureTypes, Collection<SimpleFeatureType> outTypesToRemove, final UpdateResult result, EntityManager em) {
        
        final Set<FeatureSource> updateFSes = getAutomaticallyLinkedFeatureSources(updateWMS.getTopLayer(), em);
        
        for(FeatureSource fs: updateFSes) {
            
            WFSFeatureSource oldFS = linkedFSesByURL.get(fs.getUrl());

            if(oldFS == null) {
                log.info("Found new WFS with URL " + fs.getUrl() + " linked to WMS");
                
                // Make available for updating layers in map, will be persisted
                // by cascade from Layer
                linkedFSesByURL.put(fs.getUrl(), (WFSFeatureSource)fs);

                fs.setLinkedService(this);
            } else {
                log.info("Updating WFS with URL " + fs.getUrl() + " linked to WMS");
                
                // Update or add all feature types from updated FS
                for(SimpleFeatureType updateFT: fs.getFeatureTypes()) {
                    MutableBoolean updated = new MutableBoolean();
                    SimpleFeatureType updatedFT = oldFS.addOrUpdateFeatureType(updateFT.getTypeName(), updateFT, updated);
                    boolean isNew = updateFT == updatedFT;
                    if(updated.isTrue()) {
                        updatedFeatureTypes.add(updatedFT);
                    }
                    if(isNew) {
                        log.info("New feature type in WFS: " + updateFT.getTypeName());
                    }
                }
                
                // Find feature types which do not exist in updated FS
                // Remove these later on-
                // 
                Set<SimpleFeatureType> typesToRemove = new HashSet();
                for(SimpleFeatureType oldFT: oldFS.getFeatureTypes()) {
                    if(fs.getFeatureType(oldFT.getTypeName()) == null) {
                        // Don'tnot modify list which we are iterating on
                        typesToRemove.add(oldFT);
                        log.info("Feature type " + oldFT.getTypeName() + " does no longer exist");
                    }
                }
                outTypesToRemove.addAll(typesToRemove);
            }
        }        
    }
    
    /**
     * Internal update method for layers. Update result.layerStatus() which 
     * currently has all layers set to MISSING. New layers are set to NEW, with 
     * a clone plucked from the updated service tree. Existing layers are set to 
     * UNMODIFIED or UPDATED (Layer entities modified)
     * <p>
     * Duplicate layers are not updated (will be removed later).
     * <p>
     * Grouping layers (no name) are ignored.
     */
    private void updateLayers(final WMSService update, final Map<String,WFSFeatureSource> linkedFSesByURL, final Set<SimpleFeatureType> updatedFeatureTypes, final UpdateResult result, EntityManager em) {
        
        final WMSService updatingWMSService = this;
        
        update.getTopLayer().accept(new Layer.Visitor() {
            @Override
            public boolean visit(Layer l, EntityManager em) {
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
                    
                    if(l.getFeatureType() != null) {
                        // We may already have an updated previously persistent
                        // FeatureType / FeatureSource
                        // New FeatureSources were added to the linkedFSesByURL
                        // map in updateWFS()
                        WFSFeatureSource fs = linkedFSesByURL.get(l.getFeatureType().getFeatureSource().getUrl());
                        l.setFeatureType(fs.getFeatureType(l.getFeatureType().getTypeName()));
                    }
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
                    
                    // Only update feature type if not manually set to feature 
                    // type of feature source not automatically created by loading
                    // this service (has linkedService set to updatingWMSService)
                    if(old.getFeatureType() == null || old.getFeatureType().getFeatureSource().getLinkedService() == updatingWMSService) {
                        // FeatureType instance may be the same (already updated in
                        // updateWFS(), or a new FeatureType (put in linkedFSesByURL
                        // map by the same method)
                        if(l.getFeatureType() != null) {
                            WFSFeatureSource fs = linkedFSesByURL.get(l.getFeatureType().getFeatureSource().getUrl());
                            boolean wasNull = old.getFeatureType() == null;
                            old.setFeatureType(fs.getFeatureType(l.getFeatureType().getTypeName()));
                            
                            if(wasNull || updatedFeatureTypes.contains(old.getFeatureType())) {
                                layerStatus.setRight(UpdateResult.Status.UPDATED);
                            }
                        } else {
                            if(old.getFeatureType() != null) {
                                layerStatus.setRight(UpdateResult.Status.UPDATED);
                            }
                            old.setFeatureType(null);
                        }
                    }
                }
                return true;
            }
        }, em);
    }
    
    /**
     * Update the tree structure of Layers by following the tree structure and
     * setting the parent and children accordingly. Reuses entities for layers
     * which are UNMODIFIED or UPDATED and inserts new entities for NEW layers.
     * <p>
     * Because virtual layers with null name cannot be updated, those are always
     * recreated and user set properties are lost, except those set on the top
     * layer which are preserved.
     * <p>
     * Interface should disallow setting user properties (especially authorizations)
     * on virtual layers.
     */
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
        
        // XXX why did we need BFS?
        
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
    //</editor-fold>
    
    //<editor-fold desc="DescribeLayer and WFS">
    /**
     * Do a DescribeLayer request and put the response LayerDescription in a map
     * keyed by WFS URL
     * @param wms WebMapServer to get the DescribeLayer response from
     * @return A map keyed with the WFS URL containing LayerDescriptions for that WFS
     *   or null if something went wrong (non-fatal - warning logged)
     */
    private static Map<String, List<LayerDescription>> getDescribeLayerPerWFS(WebMapServer wms) {
        List<String> layers = new ArrayList<>();
        Map<String, List<LayerDescription>> layerDescByWfs = new HashMap<>();

        getAllNonVirtualLayers(layers, wms.getCapabilities().getLayer());
        int batchsize = 10;
        for (int i = 0; i < layers.size(); i += batchsize) {
            int to = (i + batchsize) > layers.size() ? layers.size() : (i + batchsize);
            List<String> tempLayers = layers.subList(i, to);
            getDescribeFeature(tempLayers, layerDescByWfs, wms);
        }

        return layerDescByWfs;
    }

    private static void getDescribeFeature(List<String> ls, Map<String, List<LayerDescription>> layerDescByWfs, WebMapServer wms) {
        DescribeLayerResponse dlr = null;
        String layers = String.join(",", ls);
        try {

            DescribeLayerRequest dlreq = null;
            if (wms.getCapabilities().getRequest().getDescribeLayer() != null) {
                dlreq = wms.createDescribeLayerRequest();
            } else {
                dlreq = new WMS1_1_0().createDescribeLayerRequest(wms.getInfo().getSource().toURL());
            }
            dlreq.setProperty("VERSION", wms.getCapabilities().getVersion());
            dlreq.setLayers(layers);

            log.debug("Issuing DescribeLayer request for WMS " + wms.getInfo().getSource().toString() + " with layers=" + layers);
            dlr = wms.issueRequest(dlreq);

        } catch (IOException | UnsupportedOperationException | ServiceException e) {
            log.warn("DescribeLayer request failed for layers " + layers + " on service " + wms.getInfo().getSource().toString(), e);
        }
        if (dlr != null) {
            for (LayerDescription ld : dlr.getLayerDescs()) {
                log.debug(String.format("DescribeLayer response, name=%s, wfs=%s, owsType=%s, owsURL=%s, typeNames=%s",
                        ld.getName(),
                        ld.getWfs(),
                        ld.getOwsType(),
                        ld.getOwsURL(),
                        Arrays.toString(ld.getQueries())
                ));
                String wfsUrl = ld.getWfs() != null ? ld.getWfs().toString() : null;
                if (wfsUrl == null && "WFS".equalsIgnoreCase(ld.getOwsType())) {
                    wfsUrl = ld.getOwsURL().toString();
                }
                // OGC 02-070 Annex B says the wfs/owsURL attributed are not required but 
                // implied. Some Deegree instance encountered has all attributes empty,
                // and apparently the meaning is that the WFS URL is the same as the 
                // WMS URL (not explicitly defined in the spec).
                if (wfsUrl == null) {
                    wfsUrl = wms.getInfo().getSource().toString();
                }
                if (wfsUrl != null && ld.getQueries() != null && ld.getQueries().length != 0) {
                    List<LayerDescription> lds = layerDescByWfs.get(wfsUrl);
                    if (lds == null) {
                        lds = new ArrayList<>();
                        layerDescByWfs.put(wfsUrl, lds);
                    }
                    lds.add(ld);
                }
            }
        }
    }

    /**
     * Get all non-virtual layers for the DescribeLayer request (layer with a
     * name is non-virtual).
     * @param sb StringBuffer building the LAYERS parameter for DescribeLayer
     * @param l the top layer
     */
    private static void getAllNonVirtualLayers(List<String> layers , org.geotools.data.ows.Layer l) {
        if(l.getName() != null) {
            layers.add(l.getName());
        }
        for(org.geotools.data.ows.Layer child: l.getChildren()) {
            getAllNonVirtualLayers(layers, child);
        }
    }
    
    /**
     * Set feature types for layers in the WMSService from the given WFS according
     * to the DescribeLayer response. When errors occur these are logged but no
     * exception is thrown. Note: DescribeLayer may return multiple type names
     * for a layer, this is not supported - only the first one is used.
     * @param wfsUrl the WFS URL
     * @param layerDescriptions description of which feature types of the WFS are
     *   used in layers of this service according to DescribeLayer
     * @param em the entity manager to use
     */
    public void loadLayerFeatureTypes(String wfsUrl, List<LayerDescription> layerDescriptions, EntityManager em) {
        Map p = new HashMap();
        p.put(WFSDataStoreFactory.URL.key, wfsUrl);
        p.put(WFSDataStoreFactory.USERNAME.key, getUsername());
        p.put(WFSDataStoreFactory.PASSWORD.key, getPassword());
        
        try {
            WFSFeatureSource wfsFs = new WFSFeatureSource(p);
            wfsFs.loadFeatureTypes();
            
            boolean used = false;
            for(LayerDescription ld: layerDescriptions) {
                Layer l = getLayer(ld.getName(), em);
                if(l != null) {
                    // Prevent warning when multiple queries for all the same type name
                    // by removing duplicates, but keeping sort order to pick the first
                    SortedSet<String> uniqueQueries = new TreeSet(Arrays.asList(ld.getQueries()));
                    if(uniqueQueries.size() != 1) {
                        // Allowed by spec but not handled by this application
                        log.warn("Cannot handle multiple typeNames for layer " + l.getName() + ", only using the first. Type names: " + Arrays.toString(ld.getQueries()));
                    }
                    // Queries is not empty, checked before this method is called
                    SimpleFeatureType sft = wfsFs.getFeatureType(uniqueQueries.first());
                    if (sft != null) {
                        // Type name may not exist in the referenced WFS
                        l.setFeatureType(sft);
                        log.debug("Feature type for layer " + l.getName() + " set to feature type " + sft.getTypeName());
                        used = true;
                    } else {
                        log.warn("Type name " + uniqueQueries.first() + " in WFS for described layer " + l.getName() + " does not exist!");
                    }
                }
            }
            if(used) {
                log.debug("Type from WFSFeatureSource with url " + wfsUrl + " used by layer of WMS");
                
                wfsFs.setLinkedService(this);
            } else {
                log.debug("No type from WFSFeatureSource with url " + wfsUrl + " used!");
            }
        } catch(Exception e) {
            log.error("Error loading WFS from url " + wfsUrl, e);
        }
    }
    //</editor-fold>
}
