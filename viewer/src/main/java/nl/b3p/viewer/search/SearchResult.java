/*
 * Copyright (C) 2013 B3Partners B.V.
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
package nl.b3p.viewer.search;

import org.json.JSONArray;

/**
 *
 * @author Meine Toonen
 */
public class SearchResult {
    private JSONArray results;
    private Boolean limitReached;

    public JSONArray getResults() {
        return results;
    }

    public void setResults(JSONArray results) {
        this.results = results;
    }

    public Boolean getLimitReached() {
        return limitReached;
    }

    public void setLimitReached(Boolean limitReached) {
        this.limitReached = limitReached;
    }
}
