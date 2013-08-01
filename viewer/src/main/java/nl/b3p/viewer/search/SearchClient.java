/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.search;

import org.json.JSONArray;

/**
 *
 * @author Roy Braam
 */
public interface SearchClient {
    public static final String SEARCHTERM_HOLDER="[ZOEKWOORD]";
    
    public JSONArray search(String query);
}
