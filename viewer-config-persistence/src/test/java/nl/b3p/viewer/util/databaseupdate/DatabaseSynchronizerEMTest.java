/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.util.databaseupdate;

import java.io.IOException;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import javax.persistence.NoResultException;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.app.StartLayer;
import nl.b3p.viewer.config.app.StartLevel;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import org.junit.Before;
import org.junit.Test;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class DatabaseSynchronizerEMTest extends  DatabaseSynchronizerTestInterface {

    static DatabaseSynchronizer ds;

    private static boolean setupIsDone = false;

    @Before
    public void revertAndSetup() throws IOException, SQLException, URISyntaxException{
        if(setupIsDone){
            return;
        }
        setupIsDone = true;
        Application app = entityManager.find(Application.class, applicationId);
        List<StartLayer> startLayers = entityManager.createQuery("FROM StartLayer", StartLayer.class).getResultList();
        List<StartLevel> startLevels = entityManager.createQuery("FROM StartLevel", StartLevel.class).getResultList();
        
        for (StartLevel startLevel : startLevels) {
            entityManager.remove(startLevel);
        }
        
        for (StartLayer startLayer : startLayers) {
            entityManager.remove(startLayer);
        }
        
        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();
        assertEquals(6,entityManager.createQuery("FROM Level").getResultList().size());
        ds = new DatabaseSynchronizer();
        LinkedHashMap<String, UpdateElement> updates = DatabaseSynchronizer.updates;
        updates.put(""+TEST_VERSION_NUMBER, new UpdateElement(Collections.singletonList("convertApplicationsToStartLevelLayer"), DatabaseSynchronizerEM.class));
        ds.doInit(entityManager);
    }

    private Long levelId = 5L;
    
    @Test
    public void convertTestStartLevels() throws URISyntaxException, IOException, SQLException{
        List<StartLevel> sls = entityManager.createQuery("FROM StartLevel", StartLevel.class).getResultList();
        assertEquals(6, sls.size());
    }

    @Test
    public void convertTestStartLayers(){
        List<StartLayer> startLayers = entityManager.createQuery("FROM StartLayer", StartLayer.class).getResultList();
        assertEquals(5, startLayers.size());
    }

    @Test
    public void convertTestStartLevel(){
        Level level = entityManager.find(Level.class,levelId);
        assertNotNull(level);
        StartLevel sl = null;
        try{
            sl = entityManager.createQuery("FROM StartLevel where level = :level", StartLevel.class).setParameter("level", level).getSingleResult();

        }catch(NoResultException ex){
        }
        assertNotNull("StartLevel not found: conversion not correct", sl);
        assertEquals(level.getSelectedIndex(), sl.getSelectedIndex());
        assertEquals(level,sl.getLevel());
    }
    
}
