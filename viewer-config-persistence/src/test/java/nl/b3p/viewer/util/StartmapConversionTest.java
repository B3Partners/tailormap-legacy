/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.util;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.List;
import javax.persistence.EntityNotFoundException;
import javax.persistence.NoResultException;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.app.StartLayer;
import nl.b3p.viewer.config.app.StartLevel;
import static nl.b3p.viewer.util.TestUtil.entityManager;
import nl.b3p.viewer.util.databaseupdate.ScriptRunner;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import org.junit.Before;
import org.junit.Test;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class StartmapConversionTest extends TestUtil {
    
    @Before
    public void revertChanged() throws IOException, SQLException, URISyntaxException{
        Application app = entityManager.find(Application.class, applicationId);
        List<StartLayer> startLayers = entityManager.createQuery("FROM StartLayer WHERE application = :app", StartLayer.class).setParameter("app", app).getResultList();
        List<StartLevel> startLevels = entityManager.createQuery("FROM StartLevel WHERE application = :app", StartLevel.class).setParameter("app", app).getResultList();
        
        for (StartLevel startLevel : startLevels) {
            entityManager.remove(startLevel);
        }
        
        for (StartLayer startLayer : startLayers) {
            entityManager.remove(startLayer);
        }
        
        entityManager.getTransaction().commit();
        entityManager.getTransaction().begin();
        assertEquals(6,entityManager.createQuery("FROM Level").getResultList().size());
        File f = new File(TestUtil.class.getResource("/../classes/scripts/postgresql-convertToStartLayerLevel.sql").toURI());
        executeScript(f);
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
