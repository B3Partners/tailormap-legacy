/*
 * Copyright (C) 2015-2016 B3Partners B.V.
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
 * This class will update the database to its newest version. Here methods will
 * be made, which can be used in the databasesynchronizer class.
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class DatabaseSynchronizerEM {

    /**
     * convert Applications To start level Layer.
     *
     * @param em the entity manager to use
     */
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
        sl.setApplication(app);
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
