/*
 * Copyright (C) 2013-2016 B3Partners B.V.
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

import java.util.Iterator;
import java.util.List;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.lang3.mutable.MutableBoolean;
import org.apache.commons.lang3.tuple.MutablePair;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.persistence.EntityManager;

/**
 *
 * @author Roy Braam
 */
public abstract class UpdatableFeatureSource extends FeatureSource{    
    private static final Log log = LogFactory.getLog(UpdatableFeatureSource.class);
    private final int updatebatchsize = 50;

    /**
     * Update this featuresource.
     *
     * @return the result of the update
     * @throws java.lang.Exception if any
     */
    public FeatureSourceUpdateResult update(EntityManager em) throws Exception{
        final FeatureSourceUpdateResult result = new FeatureSourceUpdateResult(this);         
        try{
            List<SimpleFeatureType> newFeatureTypes = this.createFeatureTypes(result.getWaitPageStatus().subtask("",80));
            int processed = 0;
            //update and add the new featuretypes.
            for(SimpleFeatureType newFt : newFeatureTypes){
                MutableBoolean updated = new MutableBoolean();
                this.addOrUpdateFeatureType(newFt.getTypeName(), newFt, updated);

                MutablePair<SimpleFeatureType,UpdateResult.Status> ftResult = result.getFeatureTypeStatus().get(newFt.getTypeName());

                if (ftResult==null){
                    result.getFeatureTypeStatus().put(newFt.getTypeName(),new MutablePair(newFt, UpdateResult.Status.NEW));
                }else{
                    if(updated.isTrue()) {
                        log.info("Feature type: "+newFt.getTypeName()+" updated");  
                        ftResult.setRight(UpdateResult.Status.UPDATED);
                    }else{
                        ftResult.setRight(UpdateResult.Status.UNMODIFIED);
                    }
                }
                processed++;
                if(processed == updatebatchsize){
                    processed = 0;
                    if(!em.getTransaction().isActive()){
                        em.getTransaction().begin();
                    }
                    em.persist(this);
                    em.getTransaction().commit();
                    em.getTransaction().begin();
                }
            }
            if(!em.getTransaction().isActive()){
                em.getTransaction().begin();
            }
            em.persist(this);
            em.getTransaction().commit();
            em.getTransaction().begin();
            processed = 0;
            //remove featuretypes when not there
            Iterator<SimpleFeatureType> it = this.getFeatureTypes().iterator();
            while (it.hasNext()){
                SimpleFeatureType oldFt = it.next();
                boolean stillExists=false;
                for(SimpleFeatureType newFt : newFeatureTypes){
                    if (newFt.getTypeName().equals(oldFt.getTypeName())){
                        stillExists=true;
                        break;
                    }
                }
                if(!stillExists){
                    it.remove();
                    em.remove(oldFt);
                }
                if(processed == updatebatchsize){
                    processed = 0;
                    if(!em.getTransaction().isActive()){
                        em.getTransaction().begin();
                    }
                    em.persist(this);
                    em.getTransaction().commit();
                    em.getTransaction().begin();
                }
            }
            result.setStatus(UpdateResult.Status.UPDATED);
            
        }catch(Exception e){
            result.failedWithException(e);        
        }
        return result;
    }
    
    /**
     * return a list of featuretypes that are currently present in the
     * FeatureSource.
     *
     * @param wps status page to monitor featuretype creation
     * @return a list of created featuretypes
     * @throws java.lang.Exception if any
     */
    public abstract List<SimpleFeatureType> createFeatureTypes(WaitPageStatus wps) throws Exception;
}
