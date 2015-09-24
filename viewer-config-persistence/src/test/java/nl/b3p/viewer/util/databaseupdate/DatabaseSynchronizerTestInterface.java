/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.util.databaseupdate;

import nl.b3p.viewer.config.metadata.Metadata;
import nl.b3p.viewer.util.TestUtil;
import static nl.b3p.viewer.util.TestUtil.originalVersion;
import org.junit.After;
import org.junit.Before;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public abstract class DatabaseSynchronizerTestInterface extends TestUtil {

    @After
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
