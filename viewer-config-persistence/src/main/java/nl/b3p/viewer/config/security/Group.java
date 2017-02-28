/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
    public static final String ADMIN = "Admin";
    public static final String REGISTRY_ADMIN = "RegistryAdmin";
    public static final String USER_ADMIN = "UserAdmin";
    public static final String APPLICATION_ADMIN = "ApplicationAdmin";
    public static final String SERVICE_ADMIN = "ServiceAdmin";
    public static final String EXTENDED_USER = "ExtendedUser";
    
    public static final List<String> DEFAULT_GROUPS = Collections.unmodifiableList(Arrays.asList(
            ADMIN, 
            REGISTRY_ADMIN, 
            USER_ADMIN, 
            APPLICATION_ADMIN, 
            EXTENDED_USER, 
            SERVICE_ADMIN));
    
    @Id
    private String name;

    @Lob
    @org.hibernate.annotations.Type(type="org.hibernate.type.StringClobType")
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
