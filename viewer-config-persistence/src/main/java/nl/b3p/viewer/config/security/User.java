/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.Principal;
import javax.persistence.*;
import java.util.*;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@Table(name="user_")
public class User implements Principal{
    // See edituser.jsp
    public static final String DETAIL_EMAIL = "email";
    
    public static final int MIN_PASSWORD_LENGTH = 8;

    private static final String DIGEST_ALGORITM = "SHA-1";
    private static final String DIGEST_CHARSET = "UTF-8";

    @Id
    private String username;

    private String password;

    @ManyToMany
    @JoinTable(name="user_groups", joinColumns=@JoinColumn(name="username"), inverseJoinColumns=@JoinColumn(name="group_"))
    private Set<Group> groups = new HashSet<Group>();

    @ElementCollection
    @JoinTable(joinColumns=@JoinColumn(name="username"))
    private Map<String,String> details = new HashMap<String,String>();
    
    
    @ElementCollection
    @Column(name="ipaddress", length = 45)
    @CollectionTable(joinColumns = @JoinColumn(name="user_"))
    private Set<String> ips = new HashSet<String>();
    
    @Transient
    private boolean authenticatedByIp = false;

    public void changePassword(String password) throws NoSuchAlgorithmException, UnsupportedEncodingException {

        MessageDigest md = (MessageDigest) MessageDigest.getInstance(DIGEST_ALGORITM);
        md.update(password.getBytes(DIGEST_CHARSET));
        byte[] digest = md.digest();

        /* Converteer byte array naar hex-weergave */
        StringBuilder sb = new StringBuilder(digest.length*2);
        for(int i = 0; i < digest.length; i++) {
            sb.append(Integer.toHexString(digest[i] >> 4 & 0xf)); /* and mask met 0xf nodig door sign-extenden van bytes... */
            sb.append(Integer.toHexString(digest[i] & 0xf));
        }
        setPassword(sb.toString());
    }
    
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

    public Set<String> getIps() {
        return ips;
    }

    public void setIps(Set<String> ips) {
        this.ips = ips;
    }

    public boolean checkRole(String role){
        for (Group group : groups) {
            if(group.getName().equals(role)){
                return true;
            }
        }
        return false;
    }

    public boolean isAuthenticatedByIp() {
        return authenticatedByIp;
    }

    public void setAuthenticatedByIp(boolean authenticatedByIp) {
        this.authenticatedByIp = authenticatedByIp;
    }

    @Override
    public String getName() {
        return username;
    }
}
