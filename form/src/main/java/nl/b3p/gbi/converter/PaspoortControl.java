package nl.b3p.gbi.converter;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PaspoortControl {

    @JsonProperty("Name")
    private String naam;
    @JsonProperty("Column")
    private String kolom;
    @JsonProperty("IndexControl")
    private int index;
    @JsonProperty("TypeOfControl")
    private String type;
    @JsonProperty("Top")
    private int top;
    @JsonProperty("Height")
    private int height;
    @JsonProperty("Width")
    private int width;
    @JsonProperty("Domain")
    private String domein;
    @JsonProperty("Locked")
    private Boolean locked;

    public String getNaam() {
        return naam;
    }

    public void setNaam(String naam) {
        this.naam = naam;
    }

    public String getKolom() {
        return kolom;
    }

    public void setKolom(String kolom) {
        this.kolom = kolom;
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getTop() {
        return top;
    }

    public void setTop(int top) {
        this.top = top;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public String getDomein() {
        return domein;
    }

    public void setDomein(String domein) {
        this.domein = domein;
    }

    public Boolean getLocked() {
        return locked;
    }

    public void setLocked(Boolean locked) {
        this.locked = locked;
    }
}
