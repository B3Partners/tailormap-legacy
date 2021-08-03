/*
 * Copyright (C) 2015 B3Partners B.V.
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
package nl.tailormap.viewer.util.databaseupdate;

import nl.tailormap.viewer.config.metadata.Metadata;
import nl.tailormap.viewer.util.TestUtil;
import org.junit.jupiter.api.AfterEach;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public abstract class DatabaseSynchronizerTestInterface extends TestUtil {

    @AfterEach
    public void removeUpdates(){
        revertDBVersion();
        DatabaseSynchronizer.updates.remove("" + TEST_VERSION_NUMBER);
        incrementVersionNumber();
    }
     private void revertDBVersion(){
        if(!entityManager.getTransaction().isActive()){
            entityManager.getTransaction().begin();
        }
        Metadata metadata = entityManager.createQuery("From Metadata where configKey = :v", Metadata.class).setParameter("v", Metadata.DATABASE_VERSION_KEY).getSingleResult();
        metadata.setConfigValue(originalVersion);
        entityManager.persist(metadata);
        entityManager.getTransaction().commit();
    }


    private void incrementVersionNumber(){
        TEST_VERSION_NUMBER++;
    }

}
