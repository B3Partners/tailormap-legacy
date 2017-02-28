/*
 * Copyright (C) 2014 B3Partners B.V.
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
package nl.b3p.viewer.config;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Lob;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Meine Toonen
 */
@Entity
public class CycloramaAccount {


    @Id
    private Long id;

    private String username;
    private String password;
    private String filename;
    @Lob
    @org.hibernate.annotations.Type(type="org.hibernate.type.StringClobType")
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
