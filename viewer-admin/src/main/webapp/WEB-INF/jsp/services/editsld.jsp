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
        <title><fmt:message key="viewer_admin.editsld.0" /></title>
    </stripes:layout-component>
    <stripes:layout-component name="body">

<div id="formcontent" style="height: 620px">
<stripes:errors/>
<stripes:messages/>
<stripes:form beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean">

    <stripes:hidden name="service"/>
    <stripes:hidden name="sld"/>

    <c:set var="edit" value="${!empty actionBean.sld.id}"/>

    <span id="headertext" style="display: none">
    <c:if test="${!edit}"><fmt:message key="viewer_admin.editsld.1" /> <c:out value="${actionBean.service.name}"/></c:if>
    <c:if test="${edit}"><fmt:message key="viewer_admin.editsld.2" /> <c:out value="${actionBean.sld.title}"/> <fmt:message key="viewer_admin.editsld.3" /> <c:out value="${actionBean.service.name}"/></c:if>
    </span>

    <p>
    <script type="text/javascript">
        
        function checkType() {
            var type = Ext.query("input:checked[name='sldType']")[0].value;
            Ext.fly('external').setVisibilityMode(Ext.Element.DISPLAY).setVisible(type == "external");
            Ext.fly('body').setVisibilityMode(Ext.Element.DISPLAY).setVisible(type == "body");
        }
        Ext.onReady(function() {
            checkType();
            appendPanel('headertext', 'formcontent');
        });
    </script>
    
    <fmt:message key="viewer_admin.editsld.4" /> *: <stripes:text name="sld.title" maxlength="255" size="30"/><br>
    <br>
    <label><stripes:checkbox name="sld.defaultStyle"/> <fmt:message key="viewer_admin.editsld.5" /></label><br>
    <fieldset>
        <legend><fmt:message key="viewer_admin.editsld.6" /></legend>
        <label><stripes:radio name="sldType" value="external" onchange="checkType()"/><fmt:message key="viewer_admin.editsld.7" /></label><br>
        <label><stripes:radio name="sldType" value="body" onchange="checkType()"/><fmt:message key="viewer_admin.editsld.8" /></label>
    </fieldset>
    <div id="external">
       <fmt:message key="viewer_admin.editsld.9" /> *: <stripes:text name="sld.externalUrl" maxlength="1000" size="80"/><br>
        <fmt:message key="viewer_admin.editsld.10" />
    </div>
    <div style="margin: 5px 0px 5px 0px;">
        <fmt:message key="viewer_admin.editsld.11" />: <stripes:text name="sld.extraLegendParameters" maxlength="255" size="30"/><br/>
    </div>
    <div class="submitbuttons">
        <c:choose>
            <c:when test="${!edit}">
                <stripes:submit name="saveSld" value="<fmt:message key="viewer_admin.editsld.12" />"/>
            </c:when>
            <c:otherwise>
                <stripes:submit name="saveSld" value="<fmt:message key="viewer_admin.editsld.13" />"/>
                <stripes:submit name="deleteSld" onclick="return deleteConfirm();" value="<fmt:message key="viewer_admin.editsld.14" />"/>
                <script type="text/javascript">
                    function deleteConfirm() {
                        return confirm('<fmt:message key="viewer_admin.editsld.15" />');
                    }
                </script>
            </c:otherwise>
        </c:choose>
        <stripes:url var="url" beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean">
            <stripes:param name="service" value="${actionBean.service.id}"/>
        </stripes:url>
        <stripes:button name="cancel" class="extlikebutton" value="<fmt:message key="viewer_admin.editsld.16" />" onclick="window.location.href='${url}'" />
    </div>
    <div id="body">
        <fmt:message key="viewer_admin.editsld.17" />:<br>
        <stripes:submit name="generateSld" value="<fmt:message key="viewer_admin.editsld.18" />"/>
        <stripes:submit name="validateSldXml" value="<fmt:message key="viewer_admin.editsld.19" />" onclick="return confirm('Let op! Het valideren kan lang duren en heeft internettoegang nodig om de XML schema\\'s op te halen. Wilt u doorgaan?');"/>
        <stripes:submit name="cqlToFilter" value="<fmt:message key="viewer_admin.editsld.20" />" onclick="doCqlToFilter(); return false;"/>&nbsp;&nbsp; <a href="http://udig.github.com/docs/user/Constraint%20Query%20Language.html" target="_blank"><fmt:message key="viewer_admin.editsld.21" /></a>
        <br>
        <script type="text/javascript">
            var cql = "";
            function doCqlToFilter() {
                var res = prompt('<fmt:message key="viewer_admin.editsld.22" />:', cql);
                if(!res) { 
                    return;
                }
                cql = res;
                <stripes:url var="url" beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean" event="cqlToFilter"/>
                Ext.Ajax.request({
                    url: <js:quote value="${url}"/>,
                    params: {cql: cql}, 
                    success: function(result) {
                        var response = Ext.JSON.decode(result.responseText);

                        if(response.success) {
                            Ext.getDom("filterXml").innerHTML = Ext.String.htmlEncode(response.filter);
                            Ext.getDom("cqlText").innerHTML = Ext.String.htmlEncode(cql);
                            Ext.fly('filter').setVisibilityMode(Ext.Element.DISPLAY).setVisible(true);
                        } else {
                            alert(response.error);
                        }
                    },
                    failure: function(result) {
                        alert("<fmt:message key="viewer_admin.editsld.23" /> " + result.status + " " + result.statusText + ": " + result.responseText);
                    }
                });                
            }
        </script>
        <div id="filter" style="display: none">
            <br>
            <a href="#" onclick="Ext.fly('filter').setVisibilityMode(Ext.Element.DISPLAY).setVisible(false);"><fmt:message key="viewer_admin.editsld.24" /></a>
            <br>
            <b><fmt:message key="viewer_admin.editsld.25" />: </b><span style="font-family: monospace" id="cqlText"></span>
            <div id="filterXml" style="font-family: monospace; white-space: pre">
                
            </div>
        </div>
        <br>
        <c:choose>
            <c:when test="${actionBean.context.eventName == 'generateSld'}">
                <textarea name="sld.sldBody" rows="20" cols="100" wrap="off" style="font-family: monospace"><c:out value="${actionBean.generatedSld}"/></textarea>
            </c:when>
            <c:otherwise>
                <stripes-dynattr:textarea name="sld.sldBody" rows="20" cols="100" wrap="off" style="font-family: monospace"/>
            </c:otherwise>
        </c:choose>
    </div>
    
</stripes:form>
</div>

    </stripes:layout-component>
</stripes:layout-render>    