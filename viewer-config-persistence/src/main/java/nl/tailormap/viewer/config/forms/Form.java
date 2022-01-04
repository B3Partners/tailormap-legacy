/*
 * Copyright (C) 2020-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config.forms;

import nl.tailormap.viewer.config.services.SimpleFeatureType;
import org.hibernate.annotations.Type;

import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Form {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String featureTypeName;
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sft")
    private SimpleFeatureType sft;

    @ElementCollection
    @CollectionTable(joinColumns = @JoinColumn(name = "form"))
    @Column(name="role_name")
    private Set<String> readers = new HashSet<>();

    @Lob
    @Type(type = "org.hibernate.type.TextType")
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

    public Set<String> getReaders() {
        return readers;
    }

    public void setReaders(Set<String> readers) {
        this.readers = readers;
    }
}
