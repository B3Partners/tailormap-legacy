package nl.b3p.gbi.converter;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.util.HashMap;
import java.util.Map;

public class FormulierTabConfig {

    private Map<String, String> tabs = new HashMap<>();

    public Map<String, String> getTabs() {
        return tabs;
    }

    public void setTabs(Map<String, String> tabs) {
        this.tabs = tabs;
    }
}
