/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.config.services;

/**
 *
 * @author meine
 */
public enum WMSExceptionType {
    Xml("application/vnd.ogc.se_xml"),
    Inimage("application/vnd.ogc.se_inimage");
    
    private String description;

    WMSExceptionType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
