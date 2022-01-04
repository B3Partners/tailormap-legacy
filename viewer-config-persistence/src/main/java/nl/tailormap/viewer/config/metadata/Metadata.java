/*
 * Copyright (C) 2013-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config.metadata;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

/**
 *
 * @author Roy Braam
 */
@Entity
public class Metadata {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;    
    public static final String DATABASE_VERSION_KEY = "database_version";
    public static final String DEFAULT_APPLICATION = "default_application";
    public static final String DEFAULT_FORM_FEATURESOURCE = "default_form_featuresource";
    private String configKey;
    private String configValue;

    //<editor-fold defaultstate="collapsed" desc="Getters and Setters">
    public String getConfigKey() {
        return configKey;
    }
    
    public void setConfigKey(String configKey) {
        this.configKey = configKey;
    }
    
    public String getConfigValue() {
        return configValue;
    }
    
    public void setConfigValue(String configValue) {
        this.configValue = configValue;
    }
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    //</editor-fold>

}
