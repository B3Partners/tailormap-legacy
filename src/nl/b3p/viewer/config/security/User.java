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
@Table(name="user_")
public class User {
    @Id
    private String username;

    private String password;

    @ManyToMany
    @JoinTable(name="user_groups", joinColumns=@JoinColumn(name="username"), inverseJoinColumns=@JoinColumn(name="group_"))
    private Set<Group> groups = new HashSet<Group>();

    @ElementCollection
    @JoinTable(joinColumns=@JoinColumn(name="username"))
    private Map<String,String> details = new HashMap<String,String>();

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    public void setDetails(Map<String, String> details) {
        this.details = details;
    }

    public Set<Group> getGroups() {
        return groups;
    }

    public void setGroups(Set<Group> groups) {
        this.groups = groups;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
