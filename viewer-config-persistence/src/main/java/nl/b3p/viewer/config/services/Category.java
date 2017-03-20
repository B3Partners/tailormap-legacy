/*
 * Copyright (C) 2011-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.config.services;

import java.util.*;
import javax.persistence.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 * Entity to categorize geo services in a tree structure. A Category is like a
 * directory in a file system containing GeoService entities like files.
 * <p>
 * There always exists a category with id=0 and name="root". This category should
 * not be shown in the user interface, only its children as root elements.
 * <p>
 * If the readers list is not empty, only roles listed in readers are allowed
 * read access. Same with writers. Parent readers and writers override the lists
 * of children.
 *
 * @author Matthijs Laan
 */
@Entity
@Table(
        uniqueConstraints=
            @UniqueConstraint(columnNames={"parent", "name"})
)
public class Category {
    private static final Long ROOT_CATEGORY_ID = 0L;
    
    @Id
    private Long id;

    @Basic(optional=false)
    private String name;

    @ManyToOne
    private Category parent;

    @ManyToMany // Actually @OneToMany, workaround for HHH-1268
    @JoinTable(inverseJoinColumns=@JoinColumn(name="child"))
    @OrderColumn(name="list_index")
    private List<Category> children = new ArrayList<Category>();

    @ManyToMany // Actually @OneToMany, workaround for HHH-1268
    @JoinTable(inverseJoinColumns=@JoinColumn(name="service"))
    @OrderColumn(name="list_index")
    private List<GeoService> services = new ArrayList<GeoService>();

    @ElementCollection
    @Column(name="role_name")
    private Set<String> readers = new HashSet<String>();

    @ElementCollection
    @Column(name="role_name")
    private Set<String> writers = new HashSet<String>();

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public List<Category> getChildren() {
        return children;
    }

    public void setChildren(List<Category> children) {
        this.children = children;
    }

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

    public Category getParent() {
        return parent;
    }

    public void setParent(Category parent) {
        this.parent = parent;
    }

    public Set<String> getReaders() {
        return readers;
    }

    public void setReaders(Set<String> readers) {
        this.readers = readers;
    }

    public Set<String> getWriters() {
        return writers;
    }

    public void setWriters(Set<String> writers) {
        this.writers = writers;
    }

    public List<GeoService> getServices() {
        return services;
    }

    public void setServices(List<GeoService> services) {
        this.services = services;
    }
    //</editor-fold>

    public static Category getRootCategory() {
        return Stripersist.getEntityManager().find(Category.class, ROOT_CATEGORY_ID);
    }
}
