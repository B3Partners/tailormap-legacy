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
package nl.b3p.viewer.util.databaseupdate;

import java.util.List;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class UpdateElement {

    private List<String> elements;
    private Class clazz;
    private boolean canFail = false;

    public UpdateElement(List<String> elements, Class clazz) {
        this(elements, clazz, false);
    }

    public UpdateElement(List<String> elements, Class clazz, boolean canFail) {
        this.elements = elements;
        this.clazz = clazz;
        this.canFail = canFail;
    }

    public void add(String element) {
        elements.add(element);
    }

    public List<String> getElements() {
        return elements;
    }

    public void setElements(List<String> elements) {
        this.elements = elements;
    }

    public Class getClazz() {
        return clazz;
    }

    public void setClazz(Class clazz) {
        this.clazz = clazz;
    }

    public boolean canFail() {
        return canFail;
    }

    public void setCanFail(boolean canFail) {
        this.canFail = canFail;
    }
    
}
