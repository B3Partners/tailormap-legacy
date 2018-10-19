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
        <title>___Edit gebruiker___</title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="formcontent">
            <stripes:errors/>
            <stripes:messages/>
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.UserActionBean">
                <c:choose>
                    <c:when test="${actionBean.context.eventName == 'edit' ||(not empty actionBean.context.validationErrors)}">
                    <h1 id="headertext">___Gebruiker bewerken___</h1>
                    <stripes:hidden name="user" value="${actionBean.user.username}"/>

                    <table class="formtable">
                        <tr>
                            <td>
                                <table>
                                    <tr>
                                        <td>___Naam___:</td>
                                        <td><stripes:text name="details['name']" maxlength="255" size="30"/></td>
                                    </tr>
                                    <tr>
                                        <td>___Organisatie___:</td>
                                        <td><stripes:text name="details['organization']" maxlength="255" size="30"/></td>
                                    </tr>
                                    <tr>
                                        <td>___Functie___:</td>
                                        <td><stripes:text name="details['position']" maxlength="255" size="30"/></td>
                                    </tr>
                                    <tr>
                                        <td>___Adres___:</td>
                                        <td><stripes:text name="details['address']" maxlength="255" size="30"/></td>
                                    </tr>
                                    <tr>
                                        <td>___Plaats___:</td>
                                        <td><stripes:text name="details['city']" maxlength="255" size="30"/></td>
                                    </tr>
                                    <tr>
                                        <td>___E-mailadres___:</td>
                                        <td><stripes:text name="details['email']" maxlength="255" size="30"/></td>
                                    </tr>
                                    <tr>
                                        <td>___Telefoon___:</td>
                                        <td><stripes:text name="details['phone']" maxlength="255" size="30"/></td>
                                    </tr>
                                    <tr>
                                        <td>___Gebruikersnaam___ *:</td>
                                        <td><stripes-dynattr:text name="username" required="" disabled="${!empty actionBean.user.username}" maxlength="255" size="30">${user.username}</stripes-dynattr:text></td>
                                    </tr>
                                    <tr>
                                        <td>___Wachtwoord___ ${empty actionBean.user.username ? '*' : '___(laat leeg om niet te wijzigen)___'}:</td>
                                        <td>
                                          <c:choose>
                                            <c:when test="${empty actionBean.user.username}">
                                              <stripes-dynattr:password name="password" autocomplete="new-password" required="" maxlength="255" size="30"/>
                                            </c:when>
                                            <c:otherwise>
                                              <stripes-dynattr:password name="password" autocomplete="new-password" maxlength="255" size="30"/>
                                            </c:otherwise>
                                          </c:choose>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                            <td valign="top">
                                <h1>___Groepen___:</h1>
                                <c:forEach var="group" items="${actionBean.allGroups}">
                                    <stripes:checkbox name="groups" value="${group.name}"/> ${group.name}<br />
                                </c:forEach>
                            </td>
                            <td valign="top">
                                <div id="ip-list"></div>
                            </td>
                        </tr>
                    </table>
                    <div class="submitbuttons">
                        <stripes:submit name="save" value="___Opslaan___"/>
                        <stripes:reset name="cancel" class="extlikebutton" value="___Annuleren___"/>

                        <stripes:url var="url" beanclass="nl.b3p.viewer.admin.stripes.UserActionBean" event="authorizations">
                            <stripes:param name="user" value="${actionBean.user}"/>
                        </stripes:url>
                        <stripes:button name="authorizations" class="extlikebutton" id="autorizatieoverzichtbutton" value="Autorisatieoverzicht"/>
                    </div>
                    <script type="text/javascript" src="${contextPath}/resources/js/security/ipmanager.js"></script>
                    <script type="text/javascript">
                        Ext.onReady(function() {
                            Ext.create('vieweradmin.components.IpManager', {
                                ipList: ${actionBean.ipJSON}
                            });
                            Ext.get('autorizatieoverzichtbutton').on('click', function(evt, htmlel, eOpts) {
                                getParent().vieweradmin.components.iFramePopupController.loadPage(${js:quote(url)}, 'Autorisatieoverzicht');
                            }, '', {
                                stopEvent: true
                            });
                        });
                    </script>
                </c:when>
                <c:when test="${actionBean.context.eventName == 'save' || actionBean.context.eventName == 'delete'}">
                        <script type="text/javascript">
                            var frameParent = getParent();
                            if(frameParent && frameParent.vieweradmin_components_User) {
                                frameParent.vieweradmin_components_User.reloadGrid();
                            }
                        </script>
                        <stripes:submit name="edit" value="___Nieuwe gebruiker___"/>
                </c:when>
                <c:otherwise>
                    <stripes:submit name="edit" value="___Nieuwe gebruiker___"/>
                </c:otherwise>
            </c:choose>
        </stripes:form>
        <c:if test="${actionBean.context.eventName == 'edit'}">
            <br />
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.UserActionBean">
                <stripes:submit name="edit" value="___Nieuwe gebruiker___"/>
            </stripes:form>
        </c:if>
        </div>
        <script type="text/javascript">
            Ext.onReady(function() {
                appendPanel('headertext', 'formcontent');
            });
        </script>
    </stripes:layout-component>
</stripes:layout-render>

