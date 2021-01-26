package nl.b3p.gbi.converter;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.awt.*;
import java.io.IOException;
import java.util.Map;

public class TabConfigSerializer extends JsonSerializer<FormulierTabConfig> {

    @Override
    public void serialize(FormulierTabConfig value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        Map<String, String> tabs = value.getTabs();
        gen.writeObject(tabs);
    }
}
