/*
 * Copyright (C) 2012 B3Partners B.V.
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
import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.lang3.mutable.MutableInt;
import org.apache.commons.lang3.tuple.MutablePair;

/**
 *
 * @author Matthijs Laan
 */
public class UpdateResult {

    public enum Status {
        FAILED, 
        MISSING,
        NEW,
        UNMODIFIED, CHANGED, UPDATED;
    }
    
    private Status status = Status.FAILED;
    
    private WaitPageStatus waitPageStatus = new WaitPageStatus();
    
    private GeoService geoService;
    
    private Error exception;
    
    private String message;
    
    private SortedMap<String, MutablePair<Layer,Status>> layerStatus = new TreeMap();
    
    private List<Layer> duplicateOrNoNameLayers = new ArrayList<Layer>();

    public UpdateResult(GeoService toUpdate) {
        this.geoService = toUpdate;
        
        Layer l = toUpdate.getTopLayer();
        if(l == null) {
            waitPageStatus.addLog("Before update: service has no layers");
        } else {
            
            final MutableInt layers = new MutableInt(0);
            l.accept(new Layer.Visitor() {
                @Override
                public boolean visit(Layer l) {
                    
                    // Keep consistency with GeoService.getLayer(): use the first
                    // layer in tree traversal for a given name - do not 
                    // overwrite with layers which come after                    
                    
                    // Separate these duplicate layers out together with virtual 
                    // no name layers; those cannot be reliably updated so are always 
                    // destroyed and recreated (user settings such as
                    // authorizations lost!)
                    
                    if(l.getName() == null || layerStatus.containsKey(l.getName())) {
                        duplicateOrNoNameLayers.add(l);
                    } else {
                        layerStatus.put(l.getName(), new MutablePair(l, Status.MISSING));
                    } 
                    layers.increment();
                    return true;
                }
            });
            
            waitPageStatus.addLog("Before update: service has %d layers (%d duplicate or no name)", 
                    layers.intValue(),
                    duplicateOrNoNameLayers.size());
        }       
    }
    
    public void failedWithException(Exception e) {
        setStatus(Status.FAILED);
        setMessage(String.format("Error updating %s service #%d \"%s\": %s: %s",
                geoService.getProtocol(),
                geoService.getId(),
                geoService.getName(),
                e.getClass().getName(),
                e.getMessage()));
    }
    
    public void changed() {
        status = Status.CHANGED;
    }
    
    public WaitPageStatus getWaitPageStatus() {
        return waitPageStatus;
    }

    public GeoService getGeoService() {
        return geoService;
    }

    public void setGeoService(GeoService geoService) {
        this.geoService = geoService;
    }
    
    public Error getException() {
        return exception;
    }

    public void setException(Error exception) {
        this.exception = exception;
    }
    
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public SortedMap<String, MutablePair<Layer, Status>> getLayerStatus() {
        return layerStatus;
    }

    public void setLayerStatus(SortedMap<String, MutablePair<Layer, Status>> layerStatus) {
        this.layerStatus = layerStatus;
    }

    public List<Layer> getDuplicateOrNoNameLayers() {
        return duplicateOrNoNameLayers;
    }

    public void setDuplicateOrNoNameLayers(List<Layer> duplicateOrNoNameLayers) {
        this.duplicateOrNoNameLayers = duplicateOrNoNameLayers;
    }
}
