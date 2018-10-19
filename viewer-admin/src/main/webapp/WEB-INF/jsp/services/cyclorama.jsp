<%--
    Document   : cyclorama
    Created on : Oct 9, 2014, 10:50:46 AM
    Author     : meine
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@include file="/WEB-INF/jsp/taglibs.jsp"%>

<stripes:layout-render name="/WEB-INF/jsp/templates/ext.jsp">
    <stripes:layout-component name="head">
        <title><fmt:message key="viewer_admin.cyclorama.0" /></title>
    </stripes:layout-component>

    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>

    <stripes:layout-component name="body">
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.CycloramaConfigurationActionBean">
        <div id="content">
            <p>
                <stripes:errors/>
                <stripes:messages/>
            </p>
            <stripes:select name="account" onchange="changeSelection(this)">
                <stripes:option value="-1" label=" <fmt:message key="viewer_admin.cyclorama.1" /> "/>
                <stripes:options-collection collection="${actionBean.accounts}" label="filename" value="id"/>
            </stripes:select>

                <table class="formtable">
                    <tr>
                        <td><fmt:message key="viewer_admin.cyclorama.2" />:</td>
                        <td><stripes-dynattr:text name="account.username">${account.username}</stripes-dynattr:text></td>
                </tr>
                <tr>
                        <td><fmt:message key="viewer_admin.cyclorama.3" />:</td>
                        <td><stripes-dynattr:password autocomplete="new-password" name="account.password"/></td>
                </tr>
                <tr>
                        <td><fmt:message key="viewer_admin.cyclorama.4" />:</td>
                        <td><stripes:file name="key"/></td>
                    </tr>
                    <tr>
                        <td><stripes:submit name="save" value="<fmt:message key="viewer_admin.cyclorama.5" />"/></td>
                        <c:if test="${not empty actionBean.account}">
                            <td><stripes:submit name="removeKey" value="<fmt:message key="viewer_admin.cyclorama.6" />"/></td>
                        </c:if>
                    </tr>
                </table>
            </stripes:form>
        </div>
        <script type="text/javascript">
            vieweradmin.components.Menu.setActiveLink('menu_cyclorama');

            function changeSelection(obj){
                var url = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.CycloramaConfigurationActionBean"/>';
                window.location = url + "?account="+obj.value;
            }
        </script>
    </stripes:layout-component>
</stripes:layout-render>
