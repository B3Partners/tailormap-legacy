/*
 * Copyright (C) 2015 B3Partners B.V.
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

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

/**
 *
 * @author Meine Toonen <meinetoonen@b3partners.nl>
 */
@Entity
public class StartLevel {

    @Id
    private Long id;
    
    
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Level level;
    
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Application application;
    
    private Integer selected_index;
    
    private boolean checked;
    
    // <editor-fold desc="Getters and setters" defaultstate="collapsed">
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Level getLevel() {
        return level;
    }

    public void setLevel(Level level) {
        this.level = level;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public Integer getSelected_index() {
        return selected_index;
    }

    public void setSelected_index(Integer selected_index) {
        this.selected_index = selected_index;
    }

    public boolean isChecked() {
        return checked;
    }

    public void setChecked(boolean checked) {
        this.checked = checked;
    }

    // </editor-fold>
}
