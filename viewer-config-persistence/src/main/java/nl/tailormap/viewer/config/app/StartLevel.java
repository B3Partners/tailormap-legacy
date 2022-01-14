/*
 * Copyright (C) 2015-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config.app;

import org.apache.commons.beanutils.BeanUtils;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
@Entity
public class StartLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "level_")
    private Level level;
    
    @ManyToOne
    @JoinColumn(name = "application")
    private Application application;
    
    private Integer selectedIndex;
    
    private boolean removed;

    public StartLevel deepCopy(Application app, Level levelCopy) throws Exception{
        StartLevel copy = (StartLevel) BeanUtils.cloneBean(this);
        copy.setId(null);
        copy.setSelectedIndex(selectedIndex);
        copy.setApplication(app);
        copy.setLevel(levelCopy);
       // copy.setRemoved(removed);
        app.getStartLevels().add(copy);
        return copy;
        
    }

    // <editor-fold desc="Getters and setters" defaultstate="collapsed">
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Level getLevel() {
        return level;
    }

    public void setLevel(Level level) {
        this.level = level;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public Integer getSelectedIndex() {
        return selectedIndex;
    }

    public void setSelectedIndex(Integer selectedIndex) {
        this.selectedIndex = selectedIndex;
    }

    public boolean isRemoved() {
        return removed;
    }

    public void setRemoved(boolean removed) {
        this.removed = removed;
    }
    // </editor-fold>


}
