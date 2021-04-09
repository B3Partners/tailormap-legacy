/*
 * Copyright (C) 2013 B3Partners B.V.
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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.lang3.tuple.MutablePair;

/**
 *
 * @author Roy Braam
 */
public class FeatureSourceUpdateResult {
    private static final org.apache.commons.logging.Log log = org.apache.commons.logging.LogFactory.getLog(FeatureSourceUpdateResult.class);

    private FeatureSource featureSource;
    
    private UpdateResult.Status status = UpdateResult.Status.FAILED;
    
    private WaitPageStatus waitPageStatus = new WaitPageStatus();
    
    private Throwable exception;
    
    private String message = "Unknown error";
    
    private SortedMap<String, MutablePair<SimpleFeatureType,UpdateResult.Status>> featureTypeStatus = new TreeMap();
    
    public FeatureSourceUpdateResult(FeatureSource toUpdate) {
        this.featureSource = toUpdate;
        
        List<SimpleFeatureType> fts = this.featureSource.getFeatureTypes();
        if(fts.isEmpty()) {
            waitPageStatus.addLog("Before update: FeatureSource has no featuretypes");
        } else {
            for (SimpleFeatureType ft : fts){
                featureTypeStatus.put(ft.getTypeName(),new MutablePair(ft, UpdateResult.Status.MISSING));
            }            
            waitPageStatus.addLog("Before update: service has %d featuretypes", 
                    fts.size());
        }       
    }
    
    public Map<UpdateResult.Status,List<String>> getLayerNamesByStatus() {
        Map<UpdateResult.Status,List<String>> byStatus = new HashMap();
        byStatus.put(UpdateResult.Status.NEW, new ArrayList());
        byStatus.put(UpdateResult.Status.UNMODIFIED, new ArrayList());
        byStatus.put(UpdateResult.Status.UPDATED, new ArrayList());
        byStatus.put(UpdateResult.Status.MISSING, new ArrayList());
        
        for(Map.Entry<String,MutablePair<SimpleFeatureType,UpdateResult.Status>> entry: featureTypeStatus.entrySet()) {
            List<String> layers = byStatus.get(entry.getValue().getRight());
            layers.add(entry.getKey());
        }
        return byStatus;
    }
    
    public Map<UpdateResult.Status,List<SimpleFeatureType>> getFeatureTypeByStatus() {
        Map<UpdateResult.Status,List<SimpleFeatureType>> byStatus = new HashMap();
        byStatus.put(UpdateResult.Status.NEW, new ArrayList());
        byStatus.put(UpdateResult.Status.UNMODIFIED, new ArrayList());
        byStatus.put(UpdateResult.Status.UPDATED, new ArrayList());
        byStatus.put(UpdateResult.Status.MISSING, new ArrayList());
        
        for(Map.Entry<String,MutablePair<SimpleFeatureType,UpdateResult.Status>> entry: featureTypeStatus.entrySet()) {
            List<SimpleFeatureType> layers = byStatus.get(entry.getValue().getRight());
            layers.add(entry.getValue().getLeft());
        }
        return byStatus;
    }
    
    public void failedWithException(Exception e) {
        this.exception = e;
        setStatus(UpdateResult.Status.FAILED);
        String msg = String.format("Error updating %s service #%d \"%s\": %s: %s",
                featureSource.getProtocol(),
                featureSource.getId(),
                featureSource.getName(),
                e.getClass().getName(),
                e.getMessage());
        log.error(msg, e);
        setMessage(msg);        
    }
    
    //<editor-fold defaultstate="collapsed" desc="Getters setters">
    public void changed() {
        status = UpdateResult.Status.CHANGED;
    }
    
    public WaitPageStatus getWaitPageStatus() {
        return waitPageStatus;
    }
    
    public FeatureSource getFeatureSource() {
        return featureSource;
    }
    
    public void setFeatureSource(FeatureSource featureSource) {
        this.featureSource = featureSource;
    }
    
    public Throwable getException() {
        return exception;
    }
    
    public void setException(Throwable exception) {
        this.exception = exception;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public UpdateResult.Status getStatus() {
        return status;
    }
    
    public void setStatus(UpdateResult.Status status) {
        this.status = status;
    }
    
    public SortedMap<String, MutablePair<SimpleFeatureType, UpdateResult.Status>> getFeatureTypeStatus() {
        return featureTypeStatus;
    }
    
    public void setFeatureTypeStatus(SortedMap<String, MutablePair<SimpleFeatureType, UpdateResult.Status>> featureTypeStatus) {
        this.featureTypeStatus = featureTypeStatus;
    }
    //</editor-fold>
}
