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

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@include file="/WEB-INF/jsp/taglibs.jsp"%>

<stripes:layout-render name="/WEB-INF/jsp/templates/ext.jsp">
    <stripes:layout-component name="head">
        <title>___Applicatie instellingen___</title>
        <link rel="stylesheet" href="${contextPath}/resources/css/HtmlEditorExtensions.css" />
    </stripes:layout-component>
    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="content">
            <h1 id="headertext">___Applicatie instellingen___: <c:out value="${actionBean.applicationName}"/></h1>
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.ApplicationSettingsActionBean" id="settingsForm" class="maximize">

                <stripes:hidden name="application" value="${actionBean.application}"/>
                <stripes:hidden name="mashupName"/>
                <stripes:hidden name="mustUpdateComponents"/>

                <div id="tabs" class="maximize">
                    <div id="config" class="tabdiv">

                        <stripes:errors/>
                        <stripes:messages/>

                        <table class="formtable">
                            <tr>
                                <td>___Naam___:</td>
                                <td><stripes:text name="name" maxlength="255" size="30"/></td>
                            </tr>
                            <tr>
                                <td>___Versie___:</td>
                                <td><stripes:text name="version" maxlength="255" size="30"/></td>
                            </tr>
                            <tr>
                                <td>___Titel (optioneel)___:</td>
                                <td><stripes:text name="title" maxlength="255" size="30"/></td>
                            </tr>
                            <tr>
                                <td>___Steunkleur 1 (achtergrond)___:</td>
                                <td>
                                    <stripes:text name="details['steunkleur1']" maxlength="255" size="15" style="float: left;" id="steunkleur1" />
                                    <div id="steunkleur_colorpicker1" style="float: left;"></div>
                                    <div style="clear: both;"></div>
                                </td>
                            </tr>
                            <tr>
                                <td>___Steunkleur 2 (tekstkleur)___:</td>
                                <td>
                                    <stripes:text name="details['steunkleur2']" maxlength="255" size="15" style="float: left;" id="steunkleur2" />
                                    <div id="steunkleur_colorpicker2" style="float: left;"></div>
                                    <div style="clear: both;"></div>
                                </td>
                            </tr>
                            <tr>
                                <td>___Tekst font___:</td>
                                <td><stripes:text name="details['font']" maxlength="255" size="30"/></td>
                            </tr>
                            <tr>
                                <td>___Spritebestand icoontjes___:</td>
                                <td><stripes:text name="details['iconSprite']" maxlength="255" size="60"/></td>
                            </tr>
                            <tr>
                                <td>___Metadata link___:</td>
                                <td><stripes:text name="details['stylesheetMetadata']" maxlength="255" size="60"/></td>
                            </tr>
                            <tr>
                                <td>___Locatie print stylesheets___:</td>
                                <td><stripes:text name="details['stylesheetPrint']" maxlength="255" size="60"/></td>
                            </tr>
                            <tr>
                                <td>___Eigenaar___:</td>
                                <td><stripes:text name="owner" maxlength="255" size="30"/></td>
                            </tr>
                            <tr>
                                <td>___Start extensie___:</td>
                                <td>
                                    ___lo-x___ <stripes:text name="startExtent.minx" maxlength="255" size="8"/>
                                    ___lo-y___ <stripes:text name="startExtent.miny" maxlength="255" size="8"/>
                                </td>
                            </tr>
                            <tr>
                                <td>&nbsp;</td>
                                <td>
                                    ___rb-x___ <stripes:text name="startExtent.maxx" maxlength="255" size="8"/>
                                    ___rb-y___ <stripes:text name="startExtent.maxy" maxlength="255" size="8"/>
                                </td>
                            </tr>
                            <tr>
                                <td>___Maximale extensie___:</td>
                                <td>
                                    ___lo-x___ <stripes:text name="maxExtent.minx" maxlength="255" size="8"/>
                                    ___lo-y___ <stripes:text name="maxExtent.miny" maxlength="255" size="8"/>
                                </td>
                            </tr>
                            <tr>
                                <td>&nbsp;</td>
                                <td>
                                    ___rb-x___ <stripes:text name="maxExtent.maxx" maxlength="255" size="8"/>
                                    ___rb-y___ <stripes:text name="maxExtent.maxy" maxlength="255" size="8"/>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div id="security" class="tabdiv">
                        <table class="formtable">
                            <tr>
                                <td colspan="2">
                                    <label><stripes:checkbox name="authenticatedRequired"/> ___Inloggen verplicht___</label>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <label><stripes:checkbox name="details['returnAfterLogout']"/> ___Na uitloggen direct terugkeren naar de applicatie (niet loginscherm tonen)___</label>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <h1>___Toegang___:</h1>
                                    <c:forEach var="group" items="${actionBean.allGroups}">
                                        <stripes:checkbox name="groupsRead" value="${group.name}"/> ${group.name}<br>
                                    </c:forEach>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div id="remarks" class="tabdiv">
                        <a href="#Instellingen_Per_Applicatie_Help" title="___Help___" class="helplink"></a>
                        ___Opmerkingen___
                        <div id="details_opmerkingen_container" style="margin-top: 5px; width: 525px; height: 350px;">
                            <stripes:textarea id="details_opmerkingen" cols="80" rows="5" name="details['opmerking']" style="margin-top: 5px; display: none;" />
                        </div>
                        <div style="clear: both;"></div>
                    </div>
                </div>

            </stripes:form>
        </div>

        <script type="text/javascript" src="${contextPath}/resources/js/ux/form/HtmlEditorImage.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/ux/form/HtmlEditorTable.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/ux/b3p/ColorPickerButton.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/application/applicationSettings.js"></script>
        <script type="text/javascript">
            Ext.onReady(function() {
                Ext.create("vieweradmin.components.ApplicationSettings", {
                    actionBeans: {
                        imageupload: <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.ImageUploadActionBean"/></js:quote>
                    },
                    steunkleur1: "${actionBean.application.details['steunkleur1']}",
                    steunkleur2: "${actionBean.application.details['steunkleur2']}"
                });
            });
        </script>
    </stripes:layout-component>
</stripes:layout-render>
