/*
 * Copyright (C) 2018-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config;

/**
 *
 * @author Meine Toonen
 */
public class CRS {

    public CRS(String name, String code) {
        this.name = name;
        this.code = code;
    }
    
    private String name;
    private String code;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
    
    
}
