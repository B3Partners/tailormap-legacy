<%--
Copyright (C) 2011-2013 B3Partners B.V.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
--%>

<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@taglib uri="http://java.sun.com/jsp/jstl/xml" prefix="x" %>

<%@taglib prefix="stripes" uri="http://stripes.sourceforge.net/stripes.tld" %>
<%@taglib prefix="stripes-dynattr" uri="http://stripes.sourceforge.net/stripes-dynattr.tld" %>
<%@taglib prefix="security" uri="http://www.stripes-stuff.org/security.tld" %>

<%@taglib prefix="js" uri="http://www.b3partners.nl/taglibs/js-quote" %>

<c:set var="contextPath" value="${pageContext.request.contextPath}"/>

<%@page import="java.net.URL"%>
<c:set var="absoluteURIPrefix"><%

boolean needPort = "http".equals(request.getScheme()) && request.getServerPort() != 80
                || "https".equals(request.getScheme()) && request.getServerPort() != 443;

URL u;
if(needPort) {
    u = new URL(request.getScheme(), request.getServerName(), request.getServerPort(), "");
} else {
    u = new URL(request.getScheme(), request.getServerName(), "");
}

out.print(u.toString());
%></c:set>
<c:set var="requestLocale"><%= request.getLocale().getLanguage() %></c:set>
