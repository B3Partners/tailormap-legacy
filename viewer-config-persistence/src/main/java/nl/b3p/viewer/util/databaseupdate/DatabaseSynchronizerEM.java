/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.util.databaseupdate;

import java.util.List;
import javax.persistence.EntityManager;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.Level;

/**
 * This class will update the database to its newest version. Here methods will be made, which can be used in the databasesynchronizer class.
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class DatabaseSynchronizerEM {

    public String convertApplicationsToStartLevelLayer(){
        return "aapnootmies";
    }

    private void convertStartLevels(List<Level> levels, Application app, EntityManager em){
        
    }
    
    private void convertStartLayers(List<ApplicationLayer> appLayers, Application app, EntityManager em){

    }

}
