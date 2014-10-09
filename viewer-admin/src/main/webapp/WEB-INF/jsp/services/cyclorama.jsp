<%--
    Document   : cyclorama
    Created on : Oct 9, 2014, 10:50:46 AM
    Author     : meine
--%>

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
        <div id="content">
            <p>
                <stripes:errors/>
                <stripes:messages/>
            </p>

            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.CycloramaConfigurationActionBean">
                <table class="formtable">
                    <tr>
                        <td>Gebruikersnaam</td>
                        <td><stripes:text name="username"/></td>
                    </tr>
                    <tr>
                        <td>Wachtwoord</td>
                        <td><stripes:text name="password"/></td>
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
            </script>
    </stripes:layout-component>
</stripes:layout-render>