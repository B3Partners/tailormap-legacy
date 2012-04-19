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
package nl.b3p.viewer.config.security;

import javax.persistence.*;
import java.util.*;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@Table(name="group_")
public class Group {
    public static final Set<String> NOBODY_AUTHORIZED = new HashSet<String>(Arrays.asList(new String[] { null }));
    public static final Set<String> EVERYBODY_AUTHORIZED = Collections.EMPTY_SET;
    
    @Id
    private String name;

    @Lob
    private String description;

    @ManyToMany(mappedBy="groups")
    private Set<User> members = new HashSet<User>();

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<User> getMembers() {
        return members;
    }

    public void setMembers(Set<User> members) {
        this.members = members;
    }
}
