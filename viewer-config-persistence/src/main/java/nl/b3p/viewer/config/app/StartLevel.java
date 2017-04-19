/*
 * Copyright (C) 2015-2016 B3Partners B.V.
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
package nl.b3p.viewer.config.app;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import org.apache.commons.beanutils.BeanUtils;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
@Entity
public class StartLevel {

    @Id
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "level_")
    private Level level;
    
    @ManyToOne
    private Application application;
    
    private Integer selectedIndex;
    
    private boolean removed;

    StartLevel deepCopy(Application app, Level levelCopy) throws Exception{
        StartLevel copy = (StartLevel) BeanUtils.cloneBean(this);
        copy.setId(null);
        copy.setSelectedIndex(selectedIndex);
        copy.setApplication(app);
        copy.setLevel(levelCopy);
       // copy.setRemoved(removed);
        app.getStartLevels().add(copy);
        return copy;
        
    }

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

    public Integer getSelectedIndex() {
        return selectedIndex;
    }

    public void setSelectedIndex(Integer selectedIndex) {
        this.selectedIndex = selectedIndex;
    }

    public boolean isRemoved() {
        return removed;
    }

    public void setRemoved(boolean removed) {
        this.removed = removed;
    }
    // </editor-fold>


}
