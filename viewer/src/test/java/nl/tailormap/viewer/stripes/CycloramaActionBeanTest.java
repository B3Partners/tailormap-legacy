/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.tailormap.viewer.stripes;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class CycloramaActionBeanTest {
    @Test
    public void testRemoveDatesSingle() {
        CycloramaActionBean instance = new CycloramaActionBean();
        String test = "aap<atlas:recordedAt>pietje</atlas:recordedAt>noot";
        String result = instance.removeDates(test, "<atlas:recordedAt>", "</atlas:recordedAt>");
        assertEquals("aapnoot", result);
    }


    @Test
    public void testRemoveDatesMulti() {
        CycloramaActionBean instance = new CycloramaActionBean();
        String test = "aap<atlas:recordedAt>pietje</atlas:recordedAt>noot<atlas:recordedAt>puk</atlas:recordedAt>mies";
        String result = instance.removeDates(test, "<atlas:recordedAt>", "</atlas:recordedAt>");
        assertEquals("aapnootmies", result);
    }


    @Test
    public void testRemoveDatesNone() {
        CycloramaActionBean instance = new CycloramaActionBean();
        String test = "aapnoot";
        String result = instance.removeDates(test, "<atlas:recordedAt>", "</atlas:recordedAt>");
        assertEquals("aapnoot", result);
    }

}
