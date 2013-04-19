/*
 * Copyright (C) 2013 B3Partners B.V.
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

import java.util.Iterator;
import java.util.List;
import org.apache.commons.lang3.mutable.MutableBoolean;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *
 * @author Roy Braam
 */
public abstract class UpdatableFeatureSource extends FeatureSource{    
    private static final Log log = LogFactory.getLog(UpdatableFeatureSource.class);
    /**
     * Update this featuresource
     */
    public void update() throws Exception{
        List<SimpleFeatureType> newFeatureTypes = this.createFeatureTypes();
        //update and add the new featuretypes.
        for(SimpleFeatureType newFt : newFeatureTypes){
            MutableBoolean updated = new MutableBoolean();
            this.addOrUpdateFeatureType(newFt.getTypeName(), newFt, updated);
            if(updated.isTrue()) {
                log.info("Feature type: "+newFt.getTypeName()+" updated");
            }            
        }
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
            }
        }
        //return new UpdateResult(null);
    }
    
    /**
     * return a list of featuretypes that are currently present in the FeatureSource
     */
    public abstract List<SimpleFeatureType> createFeatureTypes() throws Exception;
}
