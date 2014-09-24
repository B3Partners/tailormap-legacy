/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package nl.b3p.mail;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

/**
 *
 * @author meine
 */
public class MailerTest {
    private Mailer mailer;
    
    public MailerTest() {
    }
    
    @Before
    public void setUpClass() {
        mailer = new Mailer();
        
    }
    
    @AfterClass
    public static void tearDownClass() {
    }
    
    @Before
    public void setUp() {
    }
    
    @After
    public void tearDown() {
    }

    // TODO add test methods here.
    // The methods must be annotated with annotation @Test. For example:
    //
    // @Test
    // public void hello() {}
    @Test
    public void testSendMail(){
        try{
            
       //     Mailer.sendMail(null, null, null, null, null, null);
        }catch(Exception e) {
           // Assert.fail("Exception occured: " + e.getLocalizedMessage());
        }
        
    }
}
