/*
 * Copyright (C) 2011 B3Partners B.V.
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
import nl.b3p.viewer.config.security.User;
import nl.b3p.viewer.config.services.BoundingBox;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@Table(
        uniqueConstraints=
            @UniqueConstraint(columnNames={"name", "version"})
)
public class Application  {
    @Id
    private Long id;

    @Basic(optional=false)
    private String name;

    @Column(length=30)
    private String version;

    @Lob
    private String layout;

    @ElementCollection
    @JoinTable(joinColumns=@JoinColumn(name="username"))
    private Map<String,String> details = new HashMap<String,String>();

    @ManyToOne
    private User owner;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "crs.name", column = @Column(name="start_crs")),
        @AttributeOverride(name = "minx", column = @Column(name="start_minx")),
        @AttributeOverride(name = "maxx", column = @Column(name="start_maxx")),
        @AttributeOverride(name = "miny", column = @Column(name="start_miny")),
        @AttributeOverride(name = "maxy", column = @Column(name="start_maxy"))
    })
    private BoundingBox startExtent;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "crs.name", column = @Column(name="max_crs")),
        @AttributeOverride(name = "minx", column = @Column(name="max_minx")),
        @AttributeOverride(name = "maxx", column = @Column(name="max_maxx")),
        @AttributeOverride(name = "miny", column = @Column(name="max_miny")),
        @AttributeOverride(name = "maxy", column = @Column(name="max_maxy"))
    })
    private BoundingBox maxExtent;

    private boolean authenticatedRequired;

    @ManyToOne
    private Level root;

    @OneToMany(orphanRemoval=true, cascade=CascadeType.ALL, mappedBy="application")
    private Set<ConfiguredComponent> components = new HashSet<ConfiguredComponent>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getLayout() {
        return layout;
    }

    public void setLayout(String layout) {
        this.layout = layout;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    public void setDetails(Map<String, String> details) {
        this.details = details;
    }

    public boolean isAuthenticatedRequired() {
        return authenticatedRequired;
    }

    public void setAuthenticatedRequired(boolean authenticatedRequired) {
        this.authenticatedRequired = authenticatedRequired;
    }

    public Set<ConfiguredComponent> getComponents() {
        return components;
    }

    public void setComponents(Set<ConfiguredComponent> components) {
        this.components = components;
    }

    public BoundingBox getMaxExtent() {
        return maxExtent;
    }

    public void setMaxExtent(BoundingBox maxExtent) {
        this.maxExtent = maxExtent;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public Level getRoot() {
        return root;
    }

    public void setRoot(Level root) {
        this.root = root;
    }

    public BoundingBox getStartExtent() {
        return startExtent;
    }

    public void setStartExtent(BoundingBox startExtent) {
        this.startExtent = startExtent;
    }
}
