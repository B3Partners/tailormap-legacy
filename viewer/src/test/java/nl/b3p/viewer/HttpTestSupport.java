/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import org.junit.After;
import org.junit.Before;

/**
 *
 * @author Roy Braam
 * @author mprins
 */
public class HttpTestSupport{
    
    protected HttpServer httpServer;
    
    public HttpTestSupport(){
        try{
            httpServer = HttpServer.create(new InetSocketAddress(0), 0);
        }catch(IOException ioe){
            ioe.printStackTrace();
        }
    }
    
    @Before
    public void setUpHttpServer() {
        httpServer.start();
    }
    
    @After
    public void tearDownHttpServer() {
        httpServer.stop(0);
    }
}