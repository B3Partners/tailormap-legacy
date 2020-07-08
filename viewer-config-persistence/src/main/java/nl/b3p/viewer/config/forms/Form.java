package nl.b3p.viewer.config.forms;

import nl.b3p.viewer.config.services.SimpleFeatureType;

import javax.persistence.*;

@Entity
public class Form {

    @Id
    private Long id;

    private String featureTypeName;
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    private SimpleFeatureType sft;

    @Lob
    @org.hibernate.annotations.Type(type="org.hibernate.type.StringClobType")
    private String json;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFeatureTypeName() {
        return featureTypeName;
    }

    public void setFeatureTypeName(String featureTypeName) {
        this.featureTypeName = featureTypeName;
    }

    public SimpleFeatureType getSft() {
        return sft;
    }

    public void setSft(SimpleFeatureType sft) {
        this.sft = sft;
    }

    public String getJson() {
        return json;
    }

    public void setJson(String json) {
        this.json = json;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
