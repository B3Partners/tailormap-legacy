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
package nl.b3p.viewer.stripes;

import java.io.StringReader;
import java.lang.String;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.StartLayer;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.feature.FeatureCollection;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 * Called with Ajax when application starts up (only if not spun up within a 
 * certain time) to open DataStores for layers which need fast querying (maptip).
 * This hopefully speeds up subsequent accesses.
 * 
 * Grammar for "spun up" :) http://english.stackexchange.com/questions/23404/which-is-the-correct-past-tense-of-spin-span-or-spun
 * 
 * @author Matthijs Laan
 */
@UrlBinding("/action/spinupdatastores")
@StrictBinding
public class DataStoreSpinupActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(DataStoreSpinupActionBean.class);
    
    /**
     * Minimum time between spinups per application in milliseconds.
     */
    public static final int MINIMUM_SPINUP_INTERVAL = 1800 * 1000;

    private ActionBeanContext context;
    
    @Validate
    private Application application;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    @Override
    public ActionBeanContext getContext() {
        return context;
    }
    
    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }
    //</editor-fold>
    
    private SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private Date lastSpinupTime;
    
    private boolean isAlreadySpunup(Map<String,ClobElement> details) {
        lastSpinupTime = null;        
        try {
            String lastSpinupTimeString = ClobElement.nullSafeGet(details.get(Application.DETAIL_LAST_SPINUP_TIME));
            if(lastSpinupTimeString != null) {
                lastSpinupTime = sdf.parse(lastSpinupTimeString);
            }
        } catch(Exception e) {
        }
        if(lastSpinupTime != null) {
            if(lastSpinupTime.getTime() > (new Date().getTime() - MINIMUM_SPINUP_INTERVAL)) {
                return true;
            }
        }        
        return false;
    }
    
    public Resolution spinup() throws JSONException {
        
        JSONObject j = new JSONObject();
        j.put("success", Boolean.FALSE);
        
        if(application != null) {
            if(isAlreadySpunup(application.getDetails())) {
                j.put("error", "Already spun up recently, at " + sdf.format(lastSpinupTime));
                return new StreamingResolution("application/json", new StringReader(j.toString()));
            }          
            
            log.debug("Spinning up data stores for application " + application.getNameWithVersion());
            EntityManager em = Stripersist.getEntityManager();
            // Immediately save new time, so a new spinup isn't started during
            // this spin up which may take some time
            application.getDetails().put(Application.DETAIL_LAST_SPINUP_TIME, new ClobElement(sdf.format(new Date())));
            em.getTransaction().commit();

            application = em.find(Application.class, application.getId());
            Application.TreeCache tc = application.loadTreeCache(em);
            
            Map<FeatureSource,String> spunUpFeatureSources = new HashMap();
            int errorCount = 0, skipCount = 0, successCount = 0;
            for(ApplicationLayer al: tc.getApplicationLayers()) {
                StartLayer startLayer = al.getStartLayers().get(application);
                if(startLayer != null && startLayer.isChecked()) {
                    
                    // XXX check if this layer needs to be spun up by checking
                    // summary title field is filled - no other way to check if 
                    // maptip is used at the moment
                    
                    if(!ClobElement.isNotBlank(al.getDetails().get("summary.title"))) {
                        continue;
                    }
                    
                    try {
                        GeoService gs = al.getService();
                        Layer l = gs.getSingleLayer(al.getLayerName(), em);

                        // Can't check feature source detail only layer, but 
                        // usually 1:1...
                        // Checking GeoService details not appropriate, layers
                        // from the same service  may have a different feature 
                        // sources attached to it
                        
                        if(isAlreadySpunup(l.getDetails())) {                    
                            log.debug(String.format("Already spun up layer \"%s\" of %s geo service #%d \"%s\" at %s, skipping",
                                    l.getName(),
                                    gs.getProtocol(),
                                    gs.getId(),
                                    gs.getName(),
                                    l.getDetails().get(Application.DETAIL_LAST_SPINUP_TIME).getValue()));
                            skipCount++;
                            continue;
                        }
                        l.getDetails().put(Application.DETAIL_LAST_SPINUP_TIME, new ClobElement(sdf.format(new Date())));
                        
                        SimpleFeatureType sft = l.getFeatureType();
                        // Only open a DataStore for one layer per FeatureSource
                        if(sft != null) {
                            FeatureSource fs = sft.getFeatureSource();
                            if(spunUpFeatureSources.containsKey(fs)) {
                                log.debug(String.format("Not opening data store for second feature type (name \"%s\") "
                                        + "of %s feature source #%d \"%s\" because other type was already done: %s",
                                        sft.getTypeName(),
                                        fs.getProtocol(),
                                        fs.getId(),
                                        fs.getName(),
                                        spunUpFeatureSources.get(fs)));
                                continue;
                            }
                            
                            long startTime = System.currentTimeMillis();

                            log.debug(String.format("Requesting single feature for feature type name \"%s\" from %s "
                                    + "feature source #%d \"%s\" to spin it up for future requests...",
                                    sft.getTypeName(),
                                    fs.getProtocol(),
                                    fs.getId(),
                                    fs.getName()));
                            
                            org.geotools.data.Query q = new org.geotools.data.Query(sft.getTypeName());
                            q.setMaxFeatures(1);

                            org.geotools.data.FeatureSource gtfs = null;
                            try {
                                gtfs = sft.openGeoToolsFeatureSource();
                                FeatureCollection fc = gtfs.getFeatures(q);
                                long time = System.currentTimeMillis() - startTime;
                                log.debug(String.format("Type name \"%s\": request took %dms (feature count: %d)",
                                        sft.getTypeName(),
                                        time,
                                        fc.size()));
                                spunUpFeatureSources.put(sft.getFeatureSource(), "type name " + sft.getTypeName() + " took " + time + "ms");
                                successCount++;
                            } catch(Exception e) {
                                log.error("Error requesting feature", e);
                                spunUpFeatureSources.put(sft.getFeatureSource(), "(error requesting feature for type " + sft.getTypeName() + ")");
                                errorCount++;
                            } finally {
                                if(gtfs != null) {
                                    gtfs.getDataStore().dispose();                                
                                }
                            }
                        }
                    } catch(Exception e) {
                        log.error("Error", e);
                    }
                }
            }
            if (em.getTransaction().isActive()) {
                em.getTransaction().commit();
            }
            j.put("success", Boolean.TRUE);
            String summary = String.format("Succesfully spun up %d feature sources"
                    + ", already spun up: %d, errors: %d",
                    successCount,
                    skipCount,
                    errorCount);
            log.debug("Spinup summary for app " + application.getNameWithVersion() + ": " + summary);
            j.put("message", summary);
        } else {
            j.put("error", "Application not found");
        }
        return new StreamingResolution("application/json", new StringReader(j.toString()));
    }    

}
