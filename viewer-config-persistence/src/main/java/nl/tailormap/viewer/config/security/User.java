/*
 * Copyright (C) 2012-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config.security;

import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import javax.persistence.Transient;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.Principal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

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
