package nl.tailormap.gbi.converter;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class FormulierTest {

    private Formulier form;


    @BeforeEach
    public void init() {
        form = new Formulier();
        form.setFeatureType("pietje");
        FormulierTabConfig tabConfig = new FormulierTabConfig();
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
        assertNotEquals(0, jsonString.length());

        assertEquals(8, n.size());
        assertTrue(n.has("tabs"));
        assertTrue(n.has("name"));
        assertTrue(n.has("featureType"));
        assertTrue(n.has("newPossible"));
        assertTrue(n.has("tabConfig"));
        assertTrue(n.has("relation"));
        assertTrue(n.has("fields"));
        JsonNode tabConfig = n.get("tabConfig");
        assertEquals(2, tabConfig.size());

        assertTrue(tabConfig.has("1"));
        assertTrue(tabConfig.has("2"));

        assertEquals("bessie", tabConfig.get("1").textValue());
        assertEquals("bel", tabConfig.get("2").textValue());
    }
}