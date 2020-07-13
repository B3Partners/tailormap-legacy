package nl.b3p.gbi.converter;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class Paspoort {

    @JsonProperty("PaspoortNaam")
    private String naam;
    @JsonProperty("PaspoortBeschrijving")
    private String beschrijving;

    @JsonProperty("Tabelnaam")
    private String tabelnaam;

    @JsonProperty("Tabs")
    private List<PaspoortTab> tabs;

    public String getNaam() {
        return naam;
    }

    public void setNaam(String naam) {
        this.naam = naam;
    }

    public String getBeschrijving() {
        return beschrijving;
    }

    public void setBeschrijving(String beschrijving) {
        this.beschrijving = beschrijving;
    }

    public List<PaspoortTab> getTabs() {
        return tabs;
    }

    public void setTabs(List<PaspoortTab> tabs) {
        this.tabs = tabs;
    }

    public String getTabelnaam() {
        return tabelnaam;
    }

    public void setTabelnaam(String tabelnaam) {
        this.tabelnaam = tabelnaam;
    }
}
