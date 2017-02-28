/*
 * Copyright (C) 2015-2016 B3Partners B.V.
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
package nl.b3p.viewer.util.databaseupdate;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import javax.persistence.EntityManager;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.Application.TreeCache;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.app.StartLayer;
import nl.b3p.viewer.config.app.StartLevel;
import nl.b3p.viewer.config.services.FeatureTypeRelation;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * This class will update the database to its newest version. Here methods will
 * be made, which can be used in the databasesynchronizer class.
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class DatabaseSynchronizerEM {
    private static final Log log = LogFactory.getLog(DatabaseSynchronizerEM.class);

    /**
     *
     * @param em Entitymanager on which the update must happen.
     */
    public void updateApplicationLayersAttributesOrder(EntityManager em){
        List<ApplicationLayer> appLayers = em.createQuery("From ApplicationLayer").getResultList();
        for (ApplicationLayer applicationLayer : appLayers) {
            Layer layer = applicationLayer.getService().getSingleLayer(applicationLayer.getLayerName(),em);
            if (layer != null) {
                updateAttributeOrder(applicationLayer, layer.getFeatureType(), em);
            }
        }
    }
   
    void updateAttributeOrder(ApplicationLayer applicationLayer, final SimpleFeatureType layerSft, EntityManager em) {
        List<ConfiguredAttribute> cas = applicationLayer.getAttributes();
        log.info("Sorting layer " + applicationLayer.getLayerName());
        //Sort the attributes, by featuretype: neccessary for related featuretypes
        Collections.sort(cas, new Comparator<ConfiguredAttribute>() {
            @Override
            public int compare(ConfiguredAttribute o1, ConfiguredAttribute o2) {
                if(layerSft == null){
                    return -1;
                }
                if (o1.getFeatureType() == null) {
                    return -1;
                }
                if (o2.getFeatureType() == null) {
                    return 1;
                }
                if (o1.getFeatureType().getId().equals(layerSft.getId())) {
                    return -1;
                }
                if (o2.getFeatureType().getId().equals(layerSft.getId())) {
                    return 1;
                }
                return o1.getFeatureType().getId().compareTo(o2.getFeatureType().getId());
            }
        });

        if (layerSft != null) {
            // Sort the attributes by name (per featuretype)
            sortPerFeatureType(layerSft, cas);
        }
        
        applicationLayer.setAttributes(cas);
        em.persist(applicationLayer);

    }

    private void sortPerFeatureType(final SimpleFeatureType layerSft, List<ConfiguredAttribute> cas) {
        List<FeatureTypeRelation> relations = layerSft.getRelations();
        for (FeatureTypeRelation relation : relations) {
            SimpleFeatureType foreign = relation.getForeignFeatureType();
            // Sort the attributes of the foreign featuretype. The "owning" featuretype is sorted below, so it doesn't need a call to this method.
            sortPerFeatureType(foreign, cas);
        }
        // Sort the attributes of the given SimpleFeatureType (layerSft), ordering by attributename
        Collections.sort(cas, new Comparator<ConfiguredAttribute>() {
            @Override
            public int compare(ConfiguredAttribute o1, ConfiguredAttribute o2) {
                if (o1.getFeatureType() == null) {
                    return 0;
                }
                if (o2.getFeatureType() == null) {
                    return 0;
                }
                if (o1.getFeatureType().getId().equals(layerSft.getId()) && o2.getFeatureType().getId().equals(layerSft.getId())) {
                    return o1.getAttributeName().compareTo(o2.getAttributeName());
                } else {
                    return 0;
                }
            }
        });
        for (ConfiguredAttribute ca : cas) {
            log.info(ca.getAttributeName());
        }
    }
    

}
