/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.util.databaseupdate;

import java.util.List;
import javax.persistence.EntityManager;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.Application.TreeCache;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.app.StartLayer;
import nl.b3p.viewer.config.app.StartLevel;

/**
 * This class will update the database to its newest version. Here methods will be made, which can be used in the databasesynchronizer class.
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class DatabaseSynchronizerEM {

    public void convertApplicationsToStartLevelLayer(EntityManager em){
        List<Application> apps = em.createQuery("FROM Application", Application.class).getResultList();
        for (Application app : apps) {
            TreeCache tc = app.loadTreeCache(em);
            List<Level> levels = tc.getLevels();
            for (Level level : levels) {
                convertStartLevels(level, app, em);
            }
        }
        em.getTransaction().commit();
        em.getTransaction().begin();
    }

    private void convertStartLevels(Level level, Application app, EntityManager em){
        StartLevel sl = new StartLevel();
       // sl.setApplication(app);
        sl.setLevel(level);
        sl.setSelectedIndex(level.getSelectedIndex());
        em.persist(sl);
        List<ApplicationLayer> appLayers = level.getLayers();
        for (ApplicationLayer appLayer : appLayers) {
            convertStartLayer(appLayer, app, em);
        }
    }

    private void convertStartLayer(ApplicationLayer appLayer, Application app, EntityManager em){
        StartLayer sl = new StartLayer();
        sl.setApplication(app);
        sl.setApplicationLayer(appLayer);
        sl.setChecked(appLayer.isChecked());
        sl.setSelectedIndex(appLayer.getSelectedIndex());
        em.persist(sl);
    }

}
