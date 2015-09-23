/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.util.databaseupdate;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Collections;
import java.util.LinkedHashMap;
import nl.b3p.viewer.config.metadata.Metadata;
import nl.b3p.viewer.util.TestUtil;
import org.junit.After;
import static org.junit.Assert.*;
import org.junit.Test;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class DatabaseSynchronizerTest extends TestUtil{

    private int TEST_VERSION_NUMBER = 666;

    @Test
    public void testSQLScriptUpdate(){

        DatabaseSynchronizer ds = new DatabaseSynchronizer();
        LinkedHashMap<String, UpdateElement> updates = DatabaseSynchronizer.updates;
        assertFalse(updates.isEmpty());
        Metadata metadata = entityManager.createQuery("From Metadata where configKey = :v", Metadata.class).setParameter("v", Metadata.DATABASE_VERSION_KEY).getSingleResult();
        String oldVersion = metadata.getConfigValue();

        updates.put("" + TEST_VERSION_NUMBER, new UpdateElement(Collections.singletonList("emptySql.sql"), String.class));
        ds.doInit(entityManager);

        Metadata newMetadata = entityManager.createQuery("From Metadata where configKey = :v", Metadata.class).setParameter("v", Metadata.DATABASE_VERSION_KEY).getSingleResult();
        assertNotEquals(oldVersion, newMetadata.getConfigValue());
        assertEquals(TEST_VERSION_NUMBER, Integer.parseInt(newMetadata.getConfigValue()));
    }

    @After
    public void incrementVersionNumber(){
        TEST_VERSION_NUMBER++;
    }

    @Test
    public void testCodeUpdate() throws NoSuchMethodException, IllegalAccessException, IllegalArgumentException, InvocationTargetException{
        Metadata metadata = entityManager.createQuery("From Metadata where configKey = :v", Metadata.class).setParameter("v", Metadata.DATABASE_VERSION_KEY).getSingleResult();
        String oldVersion = metadata.getConfigValue();

        DatabaseSynchronizer ds = new DatabaseSynchronizer();
        LinkedHashMap<String, UpdateElement> updates = DatabaseSynchronizer.updates;
        updates.put("" + TEST_VERSION_NUMBER, new UpdateElement(Collections.singletonList("convertApplication"), DatabaseSynchronizerEM.class));
        ds.doInit(entityManager);
        Metadata newMetadata = entityManager.createQuery("From Metadata where configKey = :v", Metadata.class).setParameter("v", Metadata.DATABASE_VERSION_KEY).getSingleResult();

        assertEquals(TEST_VERSION_NUMBER, Integer.parseInt(newMetadata.getConfigValue()));
        assertNotEquals(oldVersion, newMetadata.getConfigValue());

    }
    
    @Test
    public void testCodeUpdateWrongMethodname() throws NoSuchMethodException, IllegalAccessException, IllegalArgumentException, InvocationTargetException{
        Metadata metadata = entityManager.createQuery("From Metadata where configKey = :v", Metadata.class).setParameter("v", Metadata.DATABASE_VERSION_KEY).getSingleResult();
        String oldVersion = metadata.getConfigValue();

        DatabaseSynchronizer ds = new DatabaseSynchronizer();
        LinkedHashMap<String, UpdateElement> updates = DatabaseSynchronizer.updates;
        updates.put("" + TEST_VERSION_NUMBER, new UpdateElement(Collections.singletonList("nonExistentMethod"), DatabaseSynchronizerEM.class));
        ds.doInit(entityManager);
        Metadata newMetadata = entityManager.createQuery("From Metadata where configKey = :v", Metadata.class).setParameter("v", Metadata.DATABASE_VERSION_KEY).getSingleResult();
        assertEquals(oldVersion, newMetadata.getConfigValue());

    }
}
