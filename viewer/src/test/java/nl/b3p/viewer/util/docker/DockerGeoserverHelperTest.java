package nl.b3p.viewer.util.docker;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.runners.Enclosed;
import org.junit.runner.RunWith;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.URISyntaxException;

public class DockerGeoserverHelperTest {
    private DockerGeoserverHelper instance;
    private InetSocketAddress address;
    private HttpServer mockServer;

    @Before
    public void before() {
        instance = new DockerGeoserverHelper();
        instance.setPort(availableAddressSingleton().getPort());
    }

    @Test
    public void testReturnsTrueIfGeoserverRunning() throws IOException {
        mockServerSingleton().start();
        Assert.assertTrue(instance.isRunning());
        mockServerSingleton().stop(0);
    }

    @Test
    public void testReturnsFalseIfGeoserverIsNotRunning() {
        Assert.assertFalse(instance.isRunning());
    }

    @Test
    public void testCorrectOwsUrl() throws MalformedURLException, URISyntaxException {
        String expected = "http://localhost:"+instance.getPort()+"/geoserver/ows";
        Assert.assertEquals(expected, instance.getOwsUri().toString());
    }

    private HttpServer mockServerSingleton() throws IOException {
        if (mockServer == null) {
            mockServer = HttpServer.create(address, 0);
            mockServer.createContext(instance.getBasefilepath(), new HttpHandler() {
                public void handle(HttpExchange exchange) throws IOException {
                    byte[] response = "".getBytes();
                    exchange.sendResponseHeaders(HttpURLConnection.HTTP_OK, response.length);
                    exchange.getResponseBody().write(response);
                    exchange.close();
                }
            });
        }
        return mockServer;
    }

    private InetSocketAddress availableAddressSingleton() {
        if (address == null) {
            address = new InetSocketAddress(8601);
        }
        return address;
    }
}
