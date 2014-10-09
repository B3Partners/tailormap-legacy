<%--
    Document   : cyclorama
    Created on : Oct 9, 2014, 10:50:46 AM
    Author     : meine
--%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib prefix="stripes" uri="http://stripes.sourceforge.net/stripes.tld" %>
<stripes:layout-render name="/WEB-INF/jsp/templates/ext.jsp">


    <stripes:layout-component name="head">
        <title>Cyclorama</title>
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
                <stripes:option value="-1" label=" -- Nieuwe key -- "/>
                <stripes:options-collection collection="${actionBean.accounts}" label="filename" value="id"/>
            </stripes:select>

                <table class="formtable">
                    <tr>
                        <td>Gebruikersnaam</td>
                        <td><stripes:text name="account.username"/></td>
                    </tr>
                    <tr>
                        <td>Wachtwoord</td>
                        <td><stripes:text name="account.password"/></td>
                    </tr>
                    <tr>
                        <td>PFX-bestand</td>
                        <td><stripes:file name="key"/></td>
                    </tr>
                    <tr>
                        <td><stripes:submit name="save" value="Opslaan"/></td>
                    </tr>
                </table>
            </stripes:form>
        </div>
        <script type="text/javascript">
            var activelink = 'menu_cyclorama';

            function changeSelection(obj){
                var url = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.CycloramaConfigurationActionBean"/>';
                window.location = url + "?account="+obj.value;
            }
        </script>
    </stripes:layout-component>
</stripes:layout-render>