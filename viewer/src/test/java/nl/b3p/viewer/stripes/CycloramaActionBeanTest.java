/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.stripes;

import java.util.Arrays;
import java.util.Calendar;
import java.util.Collection;
import org.geotools.xml.impl.DatatypeConverterImpl;
import org.junit.Assert;
import static org.junit.Assert.assertNotNull;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
//@RunWith(Parameterized.class)
public class CycloramaActionBeanTest {
   /* private String datestring;
    public CycloramaActionBeanTest(String datestring){
        this.datestring = datestring;
    }
    
    @Parameterized.Parameters
    public static Collection params() {
        return Arrays.asList(new Object[][]{
            {"2007-08-05T09:17:25.0000000+02:00"},
            {"2007-06-23T00:00:00"},
            {"2003-05-02T10:00:34.0000001+02:00"},
            {"2008-08-25T09:33:00.0000001+02:00"},
            {"2008-08-25T09:33:00.0000010+02:00"},
            {"2008-08-25T09:33:00.0000100+02:00"}
           / {"2008-08-25T09:33:00.0001000+02:00"}
           {"2008-08-25T09:33:00.0010000+02:00"},
            {"2008-08-25T09:33:00.0100000+02:00"},
            {"2008-08-25T09:33:00.1000000+02:00"},
            {"2016-12-10T13:00:49.0000000+00:00"}, // copy of below, but with zeros
            {"2016-12-10T13:00:49.0323840+00:00"},
            {"2008-08-25T09:33:00.4900000+02:00"}*

        }
        );
    }
    @Test
    public void testDateTime(){
        Calendar calendar = DatatypeConverterImpl.getInstance().parseDateTime(datestring);
        assertNotNull(calendar);
    }
    */
    @Test
    public void testRemoveDatesSingle(){
        CycloramaActionBean instance = new CycloramaActionBean();
        String test = "aap<atlas:recordedAt>pietje</atlas:recordedAt>noot";
        String result = instance.removeDates(test, "<atlas:recordedAt>", "</atlas:recordedAt>");
        Assert.assertEquals("aapnoot", result);
    }
    
    
    @Test
    public void testRemoveDatesMulti(){
        CycloramaActionBean instance = new CycloramaActionBean();
        String test = "aap<atlas:recordedAt>pietje</atlas:recordedAt>noot<atlas:recordedAt>puk</atlas:recordedAt>mies";
        String result = instance.removeDates(test, "<atlas:recordedAt>", "</atlas:recordedAt>");
        Assert.assertEquals("aapnootmies", result);
    }
    
    
    
    @Test
    public void testRemoveDatesNone(){
        CycloramaActionBean instance = new CycloramaActionBean();
        String test = "aapnoot";
        String result = instance.removeDates(test, "<atlas:recordedAt>", "</atlas:recordedAt>");
        Assert.assertEquals("aapnoot", result);
    }
    
}
