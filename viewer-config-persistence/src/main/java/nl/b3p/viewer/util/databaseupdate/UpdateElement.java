/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.util.databaseupdate;

import java.util.List;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
public class UpdateElement {

    private List<String> elements;
    private Class clazz;

    public UpdateElement(List<String> elements, Class clazz) {
        this.elements = elements;
        this.clazz = clazz;
    }

    public void add(String element) {
        elements.add(element);
    }

    public List<String> getElements() {
        return elements;
    }

    public void setElements(List<String> elements) {
        this.elements = elements;
    }

    public Class getClazz() {
        return clazz;
    }

    public void setClazz(Class clazz) {
        this.clazz = clazz;
    }

    
}
