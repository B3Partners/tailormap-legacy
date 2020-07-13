package nl.b3p.gbi.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import junit.framework.TestCase;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.net.URL;

import static org.junit.Assert.*;

public class FormulierTest{

    private Formulier form;


    @Before
    public void init() throws IOException {
        form = new Formulier();
        form.setFeatureType("pietje");
        FormulierTabConfig tabConfig=  new FormulierTabConfig();
        tabConfig.getTabs().put("1", "bessie");
        tabConfig.getTabs().put("2", "bel");
        form.setTabConfig(tabConfig);
    }

    @Test
    public void testStructure() throws IOException {
        assertNotNull(form);
        JsonNode n = form.toJSON();

        String jsonString = n.toPrettyString();
        assertNotNull(jsonString);
        System.out.println(jsonString);
        assertNotEquals(0,jsonString.length());

        assertEquals(1, n.size());
        n.fields().forEachRemaining(node->{
            assertEquals("config", node.getKey());
        });
        n.elements().forEachRemaining(child ->{
            // valideer elk paspoort config. Een child is een featuretypename met zijn opbouw
            assertTrue(child.has("pietje"));
            child.elements().forEachRemaining(configNode ->{
                assertTrue(configNode.has("tabs"));
                assertTrue(configNode.has("name"));
                assertTrue(configNode.has("featureType"));
                assertTrue(configNode.has("newPossible"));
                assertTrue(configNode.has("tabConfig"));
                assertTrue(configNode.has("relation"));
                assertTrue(configNode.has("fields"));
                JsonNode tabConfig = configNode.get("tabConfig");
                assertEquals(2,tabConfig.size());
  
                assertTrue(tabConfig.has("1"));
                assertTrue(tabConfig.has("2"));

                assertEquals("bessie", tabConfig.get("1").textValue());
                assertEquals("bel", tabConfig.get("2").textValue());


            });
        });
    }
}