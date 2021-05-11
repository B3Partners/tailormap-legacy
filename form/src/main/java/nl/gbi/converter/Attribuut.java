package nl.gbi.converter;

public class Attribuut {
    private Integer id;
    private String naam;
    private String kolom_naam;
    private String object_naam;
    private String tabel_naam;
    private Boolean muteerbaar;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNaam() {
        return naam;
    }

    public void setNaam(String naam) {
        this.naam = naam;
    }

    public String getKolom_naam() {
        return kolom_naam;
    }

    public void setKolom_naam(String kolom_naam) {
        this.kolom_naam = kolom_naam;
    }

    public String getObject_naam() {
        return object_naam;
    }

    public void setObject_naam(String object_naam) {
        this.object_naam = object_naam;
    }

    public String getTabel_naam() {
        return tabel_naam;
    }

    public void setTabel_naam(String tabel_naam) {
        this.tabel_naam = tabel_naam;
    }

    public Boolean getMuteerbaar() {
        return muteerbaar;
    }

    public void setMuteerbaar(Boolean muteerbaar) {
        this.muteerbaar = muteerbaar;
    }
}
