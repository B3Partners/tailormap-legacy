package nl.tailormap.viewer.util.docker;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.URISyntaxException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DockerGeoserverHelperTest {
    private DockerGeoserverHelper instance;
    private InetSocketAddress address;
    private HttpServer mockServer;

    @BeforeEach
    public void before() {
        instance = new DockerGeoserverHelper();
        instance.setPort(availableAddressSingleton().getPort());
    }

    @Test
    public void testReturnsTrueIfGeoserverRunning() throws IOException {
        mockServerSingleton().start();
        assertTrue(instance.isRunning());
        mockServerSingleton().stop(0);
    }

    @Test
    public void testReturnsFalseIfGeoserverIsNotRunning() {
        assertFalse(instance.isRunning());
    }

    @Test
    public void testCorrectOwsUrl() throws MalformedURLException, URISyntaxException {
        String expected = "http://localhost:"+instance.getPort()+"/geoserver/ows";
        assertEquals(expected, instance.getOwsUri().toString());
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
