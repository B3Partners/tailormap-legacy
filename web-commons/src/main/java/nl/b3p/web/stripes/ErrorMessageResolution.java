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
package nl.b3p.web.stripes;

import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.StreamingResolution;
import org.json.JSONObject;

/**
 *
 * @author matthijsln
 */
public class ErrorMessageResolution extends StreamingResolution {

    public ErrorMessageResolution(String message) {
        super("text/plain", message);
        setCharacterEncoding("UTF-8");
    }

    public ErrorMessageResolution(JSONObject json) {
        super("application/json", json.toString());
        setCharacterEncoding("UTF-8");
    }

    @Override
    protected void stream(HttpServletResponse response) throws Exception {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        super.stream(response);
    }
}