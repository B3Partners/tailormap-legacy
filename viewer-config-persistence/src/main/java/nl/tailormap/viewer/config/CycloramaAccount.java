/*
 * Copyright (C) 2014-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config;

import org.hibernate.annotations.Type;
import org.json.JSONException;
import org.json.JSONObject;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;

/**
 *
 * @author Meine Toonen
 */
@Entity
public class CycloramaAccount {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private String filename;
    @Lob
    @Type(type = "org.hibernate.type.TextType")
    private String privateBase64Key;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPrivateBase64Key() {
        return privateBase64Key;
    }

    public void setPrivateBase64Key(String privateBase64Key) {
        this.privateBase64Key = privateBase64Key;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public JSONObject toJSON() throws JSONException{
        JSONObject account = new JSONObject();
        account.put("username",username);
        account.put("id",id);
        account.put("filename",filename);
        return account;
    }

}
