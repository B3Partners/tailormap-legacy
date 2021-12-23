/*
 * Copyright (C) 2012-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config.security;

import org.hibernate.annotations.Type;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
    @Type(type = "org.hibernate.type.TextType")
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
