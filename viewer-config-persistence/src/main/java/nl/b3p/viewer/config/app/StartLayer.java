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
import javax.persistence.ManyToOne;
import org.apache.commons.beanutils.BeanUtils;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
@Entity
public class StartLayer {

    @Id
    private Long id;
    
    @ManyToOne
    private Application application;
    
    @ManyToOne
    private ApplicationLayer applicationLayer;
    
    private Integer selectedIndex;
    
    private boolean checked;
    
    private boolean removed;

    StartLayer deepCopy(ApplicationLayer appLayer , Application app) throws Exception{

        StartLayer copy = (StartLayer) BeanUtils.cloneBean(this);
        copy.setId(null);
        copy.setApplicationLayer(appLayer);
        copy.setApplication(app);
        //copy.setRemoved(removed);
        app.getStartLayers().add(copy);
        
        return copy;
    }

    // <editor-fold desc="Getters and Setters" defaultstate="collapsed">
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public ApplicationLayer getApplicationLayer() {
        return applicationLayer;
    }

    public void setApplicationLayer(ApplicationLayer applicationLayer) {
        this.applicationLayer = applicationLayer;
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

    public boolean isChecked() {
        return checked;
    }

    public void setChecked(boolean checked) {
        this.checked = checked;
    }
    
    // </editor-fold>
}
