/*
 * Copyright (C) 2012 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.config.app;

import java.util.*;
import javax.persistence.*;
import nl.b3p.viewer.config.services.Document;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@Table(name="level_")
public class Level {
    @Id
    private Long id;

    @ManyToOne
    private Level parent;
    
    @Basic(optional=false)
    private String name;

    private boolean checked;

    @OneToMany(orphanRemoval=true, cascade= CascadeType.ALL)
    @JoinTable(name="level_children", inverseJoinColumns=@JoinColumn(name="child"))
    @OrderColumn(name="list_index")
    private List<Level> children = new ArrayList<Level>();

    private boolean background;

    @OneToMany(orphanRemoval=true, cascade= CascadeType.ALL)
    @JoinTable(name="level_layers", inverseJoinColumns=@JoinColumn(name="layer"))
    @OrderColumn(name="list_index")
    private List<ApplicationLayer> layers = new ArrayList<ApplicationLayer>();

    @ManyToMany
    @JoinTable(name="level_documents", inverseJoinColumns=@JoinColumn(name="document"))
    @OrderColumn(name="list_index")
    private List<Document> documents = new ArrayList<Document>();

    @Lob
    private String info;

    @ElementCollection
    @JoinTable(joinColumns=@JoinColumn(name="level_"))
    @Column(name="role_name")
    private Set<String> readers = new HashSet<String>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isChecked() {
        return checked;
    }

    public void setChecked(boolean checked) {
        this.checked = checked;
    }

    public List<Level> getChildren() {
        return children;
    }

    public void setChildren(List<Level> children) {
        this.children = children;
    }

    public String getInfo() {
        return info;
    }

    public void setInfo(String info) {
        this.info = info;
    }

    public List<ApplicationLayer> getLayers() {
        return layers;
    }

    public void setLayers(List<ApplicationLayer> layers) {
        this.layers = layers;
    }

    public Level getParent() {
        return parent;
    }

    public void setParent(Level parent) {
        this.parent = parent;
    }

    public Set<String> getReaders() {
        return readers;
    }

    public void setReaders(Set<String> readers) {
        this.readers = readers;
    }

    public boolean isBackground() {
        return background;
    }

    public void setBackground(boolean background) {
        this.background = background;
    }

    public List<Document> getDocuments() {
        return documents;
    }

    public void setDocuments(List<Document> documents) {
        this.documents = documents;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}