/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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

import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import javax.persistence.*;
import nl.b3p.geotools.data.arcims.ArcIMSServer;
import nl.b3p.geotools.data.arcims.axl.AxlField;
import nl.b3p.geotools.data.arcims.axl.AxlFieldInfo;
import nl.b3p.geotools.data.arcims.axl.AxlLayerInfo;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.lang3.mutable.MutableBoolean;
import org.apache.commons.lang3.tuple.MutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.geotools.data.ServiceInfo;
import org.geotools.data.ows.HTTPClient;
import org.geotools.data.ows.SimpleHttpClient;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(ArcIMSService.PROTOCOL)
public class ArcIMSService extends GeoService implements Updatable {
    private static final org.apache.commons.logging.Log log = org.apache.commons.logging.LogFactory.getLog(ArcIMSService.class);
    
    public static final String PROTOCOL = "arcims";
      
    public static final String PARAM_SERVICENAME = "ServiceName";
    
    private static final String TOPLAYER_ID = "-1";
    
    @Basic
    private String serviceName;

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }
    
    @Override
    public void checkOnline(EntityManager em) throws Exception {
        Map params = new HashMap();
        params.put(PARAM_ONLINE_CHECK_ONLY, Boolean.TRUE);
        if(getServiceName() != null) {
            params.put(PARAM_SERVICENAME, getServiceName());
        }
        
        loadFromUrl(getUrl(), params, new WaitPageStatus() {
            @Override
            public void setCurrentAction(String currentAction) {
                // no debug logging
                super.currentAction.set(currentAction);
            }          

            @Override
            public void addLog(String message) {
                // no debug logging
                logs.add(message);
            }            
        },em);
    }    

    //<editor-fold desc="Loading service metadata from ArcIMS">
    @Override
    public ArcIMSService loadFromUrl(String url, Map params, WaitPageStatus status, EntityManager em) throws Exception {
        try {
            status.setCurrentAction("Ophalen informatie...");
            
            ArcIMSService ims = new ArcIMSService();
            ims.setUsername((String)params.get(PARAM_USERNAME));
            ims.setPassword((String)params.get(PARAM_PASSWORD));
            
            HTTPClient client = new SimpleHttpClient();
            client.setUser(ims.getUsername());
            client.setPassword(ims.getPassword());
            
            serviceName = (String)params.get(PARAM_SERVICENAME);
            
            ArcIMSServer gtims = new ArcIMSServer(new URL(url), serviceName, client);
            
            if(Boolean.TRUE.equals(params.get(GeoService.PARAM_ONLINE_CHECK_ONLY))) {
                return null;
            }
            
            ServiceInfo si = gtims.getInfo();
            ims.setName(si.getTitle());
            ims.setServiceName(gtims.getServiceName());
            ims.setUrl(url);
            
            status.setProgress(50);
            status.setCurrentAction("Inladen layers...");
            
            /* Automatically create featuresource, persisted by cascade from Layer.featureType */
            ArcXMLFeatureSource fs = new ArcXMLFeatureSource();
            fs.setLinkedService(ims);
            fs.setName(ims.getName());
            fs.setServiceName(ims.getServiceName());
            fs.setUsername(ims.getUsername());
            fs.setPassword(ims.getPassword());
            
            fs.setUrl(url);
            
            /* ArcIMS has a flat layer structure, create a virtual top layer */
            
            Layer top = new Layer();
            
            top.setVirtual(true);
            top.setTitle("Layers");
            top.setService(ims);
            
            for(AxlLayerInfo axlLayerInfo: gtims.getAxlServiceInfo().getLayers()) {
                top.getChildren().add(parseAxlLayerInfo(axlLayerInfo, ims, fs, top));
            }
            ims.setTopLayer(top);
            
            return ims;
        } finally {
            status.setCurrentAction("");
            status.setProgress(90);
        }
    }
    
    private Layer parseAxlLayerInfo(AxlLayerInfo axl, GeoService service, ArcXMLFeatureSource fs, Layer parent) {
        Layer l = new Layer();
        l.setParent(parent);
        l.setService(service);
        l.setFilterable(AxlLayerInfo.TYPE_FEATURECLASS.equals(axl.getType()));
        l.setQueryable(true);
        l.setName(axl.getId());
        l.setTitle(axl.getName());
        l.getDetails().put("axl_type", new ClobElement(axl.getType()));
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
        
        if(axl.getFclass() != null) {
            SimpleFeatureType sft = new SimpleFeatureType();
            sft.setFeatureSource(fs);
            sft.setTypeName(axl.getId());
            sft.setWriteable(false);
            sft.setDescription(axl.getName());
            
            for(AxlFieldInfo axlField: axl.getFclass().getFields()) {
                AttributeDescriptor att = new AttributeDescriptor();
                sft.getAttributes().add(att);
                att.setName(axlField.getName());
                
                String type;
                switch(axlField.getType()) {
                    case AxlField.TYPE_SHAPE:
                        if(sft.getGeometryAttribute() == null) {
                            sft.setGeometryAttribute(att.getName());
                        }
                        type = AttributeDescriptor.TYPE_GEOMETRY;
                        break;
                    case AxlField.TYPE_BOOLEAN:
                        type = AttributeDescriptor.TYPE_BOOLEAN;
                        break;
                    case AxlField.TYPE_ROW_ID:
                    case AxlField.TYPE_BIG_INTEGER:
                    case AxlField.TYPE_SMALL_INTEGER:
                    case AxlField.TYPE_INTEGER:
                        type = AttributeDescriptor.TYPE_INTEGER;
                        break;
                    case AxlField.TYPE_DOUBLE:
                    case AxlField.TYPE_FLOAT:
                        type = AttributeDescriptor.TYPE_DOUBLE;
                        break;
                    case AxlField.TYPE_DATE:
                        type = AttributeDescriptor.TYPE_DATE;
                        break;
                    case AxlField.TYPE_CHAR:
                    case AxlField.TYPE_STRING:
                    default:
                        type = AttributeDescriptor.TYPE_STRING;
                }
                att.setType(type);
            }
            fs.getFeatureTypes().add(sft);
            l.setFeatureType(sft);
        }
        
        return l;
    }
    //</editor-fold>

    //<editor-fold desc="Updating">
    @Override
    public UpdateResult update(EntityManager em) {
        
        initLayerCollectionsForUpdate();
        
        final UpdateResult result = new UpdateResult(this, em);
        
        try {
            Map params = new HashMap();
            params.put(PARAM_USERNAME, getUsername());
            params.put(PARAM_PASSWORD, getPassword());
            if(getServiceName() != null) {
                params.put(PARAM_SERVICENAME, getServiceName());
            }            
            
            ArcIMSService update = loadFromUrl(getUrl(), params, result.getWaitPageStatus().subtask("", 80),em);
            
            // Find auto-linked FeatureSource (manually linked feature sources
            // not updated automatically) (TODO: maybe provide option to do that)
            ArcXMLFeatureSource linkedFS = null;
            try {
                linkedFS = (ArcXMLFeatureSource)Stripersist.getEntityManager().createQuery(
                    "from FeatureSource where linkedService = :this")
                    .setParameter("this", this)
                    .getSingleResult();
            } catch(NoResultException nre) {
                // linked FeatureSource was removed by user
            }
            
            updateLayers(update, linkedFS, result);
            removeOrphanLayersAfterUpdate(result);
            
            if(linkedFS != null && linkedFS.getFeatureTypes().isEmpty()) {
                log.debug("Linked ArcGISFeatureSource has no type names anymore, removing it");
                Stripersist.getEntityManager().remove(linkedFS);
            }
            
            
            result.setStatus(UpdateResult.Status.UPDATED);
        } catch(Exception e) {
            result.failedWithException(e);
        } 
        return result;
    }
    
    private void updateLayers(final ArcIMSService update, final ArcXMLFeatureSource linkedFS, final UpdateResult result) {
        /* This is a lot simpler than WMS, because layers always have an id
         * (name in WMS and our Layer object)
         * 
         * And even simpler than ArcGIS because layers have no tree structure.
         */
        
        getTopLayer().getChildren().clear();
        
        SimpleFeatureType ft;
        
        for(Layer updateLayer: update.getTopLayer().getChildren()) {

            MutablePair<Layer,UpdateResult.Status> layerStatus = result.getLayerStatus().get(updateLayer.getName());
            Layer updatedLayer;
            
            if(layerStatus == null) {
                // New layer
                ft = updateLayer.getFeatureType();
                if(updateLayer.getFeatureType() != null) {
                    
                    if(linkedFS != null) {
                        linkedFS.addOrUpdateFeatureType(updateLayer.getName(), ft, new MutableBoolean());
                    } else {
                        // New FeatureSource to be persisted
                        ft.getFeatureSource().setLinkedService(this); 
                    }
                }
                
                result.getLayerStatus().put(updateLayer.getName(), new MutablePair(updateLayer, UpdateResult.Status.NEW));

                updatedLayer = updateLayer;
            } else {
                
                assert(layerStatus.getRight() == UpdateResult.Status.MISSING);
                
                Layer old = layerStatus.getLeft();
                               
                old.update(updateLayer);
                
                layerStatus.setRight(UpdateResult.Status.UNMODIFIED);     
                
                // Do not overwrite manually set feature source
                if(old.getFeatureType() == null || old.getFeatureType().getFeatureSource().getLinkedService() == this) {
                    if(updateLayer.getFeatureType() == null) {
                        // If was set before the old feature type will be removed 
                        // later when all orphan MISSING layers are removed
                        if(old.getFeatureType() != null) {
                            layerStatus.setRight(UpdateResult.Status.UPDATED);     
                        }
                        old.setFeatureType(null);
                    } else {
                        if(linkedFS != null) {
                            MutableBoolean updated = new MutableBoolean(false);
                            ft = linkedFS.addOrUpdateFeatureType(updateLayer.getName(), updateLayer.getFeatureType(), updated);
                            if(old.getFeatureType() == null || updated.isTrue()) {
                                layerStatus.setRight(UpdateResult.Status.UPDATED);     
                            }
                        } else {
                            ft = updateLayer.getFeatureType();  
                            // New FeatureSource to be persisted
                            ft.getFeatureSource().setLinkedService(this);
                            layerStatus.setRight(UpdateResult.Status.UPDATED);     
                        }
                        old.setFeatureType(ft);
                    }   
                }
                
                updatedLayer = old;
            }
            
            assert updatedLayer.getChildren().isEmpty();
            
            updatedLayer.setService(this);
            updatedLayer.setParent(getTopLayer());
            getTopLayer().getChildren().add(updatedLayer);
        }     
    }    
    
    private void removeOrphanLayersAfterUpdate(UpdateResult result) {

        assert(result.getDuplicateOrNoNameLayers().size() == 1);
        assert(result.getDuplicateOrNoNameLayers().get(0) == getTopLayer());
        
        // Remove old layers from this service which are missing from updated
        // service
        for(Pair<Layer,UpdateResult.Status> p: result.getLayerStatus().values()) {
            if(p.getRight() == UpdateResult.Status.MISSING) {
                Layer removed = p.getLeft();
                if(removed.getFeatureType() != null) {
                    removed.getFeatureType().getFeatureSource().removeFeatureType(removed.getFeatureType());
                }
                Stripersist.getEntityManager().remove(removed);
            }
        }
    }        
    
    //</editor-fold>
    
    //<editor-fold desc="Add serviceName to toJSONObject()">
    
    @Override
    public JSONObject toJSONObject(boolean flatten, Set<String> layersToInclude, boolean validXmlTags, EntityManager em) throws JSONException {
        return toJSONObject(flatten, layersToInclude, validXmlTags,false, em);
    }
    
    @Override
    public JSONObject toJSONObject(boolean flatten, Set<String> layersToInclude, boolean validXmlTags, boolean includeAuthorizations, EntityManager em) throws JSONException {
        JSONObject o = super.toJSONObject(flatten, layersToInclude,validXmlTags,includeAuthorizations, em);
        if(serviceName != null) {
            o.put("serviceName", serviceName);
        }
        return o;
    }
    
    @Override
    public JSONObject toJSONObject(boolean flatten, EntityManager em) throws JSONException {
        return toJSONObject(flatten, null,false, em);
    }
    //</editor-fold>
}
