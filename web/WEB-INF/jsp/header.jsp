<%--
Copyright (C) 2011 B3Partners B.V.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@include file="/WEB-INF/jsp/taglibs.jsp"%>

<div id="header">
    <div id="menu">
        <ul>
            <li class="menu-level1">
                <a href="#">Gegevensregister</a>
                <ul class="slideoutmenu">
                    <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.GeoServiceRegistryActionBean" id="menu_services">Services en Kaartlagen</stripes:link></li>
                    <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.AttributeSourceActionBean" id="menu_attribuutbronnen">Attribuutbronnen</stripes:link></li>
                    <li><a href="#" id="menu_attributen">Attributen</a></li>
                    <li><a href="#" id="menu_documenten">Documenten</a></li>
                    <li><a href="#" id="menu_layerservices">Layer services</a></li>
                    <li><a href="#" id="menu_layer">Layer?</a></li>
                </ul>
            </li>
            <li class="menu-level1">
                <a href="#">Beheer toegang</a>
                <ul class="slideoutmenu">
                    <li><a href="#" id="menu_gebruikersgroepen">Gebruikersgroepen</a></li>
                    <li><a href="#" id="menu_gebruikers">Gebruikers</a></li>
                </ul>
            </li>
            <li class="menu-level1">
                <a href="#">Applicatiebeheer</a>
                <ul class="slideoutmenu">
                    <li><a href="#" id="menu_kiesapplicatie">Kies een applicatie</a></li>
                    <li>
                        <a href="#">Beheer applicatie 1</a>
                        <ul class="dropdownmenu">
                            <li><a href="#" id="menu_instellingen">Instellingen</a></li>
                            <li><a href="#" id="menu_boomstructuur">Boomstructuur met kaarten</a></li>
                            <li><a href="#" id="menu_startkaartbeeld">Startkaartbeeld</a></li>
                            <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.LayoutManagerActionBean" id="menu_layout">Layout met beschikbare componenten</stripes:link></li>
                        </ul>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</div>