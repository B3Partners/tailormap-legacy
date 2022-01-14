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
public class StartLayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "application")
    private Application application;
    
    @ManyToOne
    @JoinColumn(name = "application_layer")
    private ApplicationLayer applicationLayer;
    
    private Integer selectedIndex;
    
    private boolean checked;
    
    private boolean removed;

    public StartLayer deepCopy(ApplicationLayer appLayer, Application app) throws Exception{

        StartLayer copy = (StartLayer) BeanUtils.cloneBean(this);
        copy.setId(null);
        copy.setApplicationLayer(appLayer);
        copy.setApplication(app);
        //copy.setRemoved(removed);
        app.getStartLayers().add(copy);
        
        return copy;
    }

    // <editor-fold desc="Getters and Setters" defaultstate="collapsed">
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public ApplicationLayer getApplicationLayer() {
        return applicationLayer;
    }

    public void setApplicationLayer(ApplicationLayer applicationLayer) {
        this.applicationLayer = applicationLayer;
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

    public boolean isChecked() {
        return checked;
    }

    public void setChecked(boolean checked) {
        this.checked = checked;
    }
    
    // </editor-fold>
}
