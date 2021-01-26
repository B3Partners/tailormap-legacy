package nl.b3p.gbi.converter;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class PaspoortTab {

    @JsonProperty("Name")
    private String naam;
    @JsonProperty("Caption")
    private String caption;
    @JsonProperty("IndexTab")
    private int index;
    @JsonProperty("PaspoortControls")
    private List<PaspoortControl> controls;

    public String getNaam() {
        return naam;
    }

    public void setNaam(String naam) {
        this.naam = naam;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    public List<PaspoortControl> getControls() {
        return controls;
    }

    public void setControls(List<PaspoortControl> controls) {
        this.controls = controls;
    }
}
