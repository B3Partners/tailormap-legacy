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
        <title><fmt:message key="viewer_admin.applicationtreelayer.0" /></title>
        <link rel="stylesheet" href="${contextPath}/resources/css/HtmlEditorExtensions.css" />
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <stripes:form beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeLayerActionBean" id="apptreelayerform" class="maximize">
            <stripes:hidden name="applicationLayer" value="${actionBean.applicationLayer.id}"/>
            <stripes:hidden name="attributesJSON" id="attributesJSON" value="${actionBean.attributesJSON}"/>
            <div id="tabs" class="maximize">
                <div id="settings-tab" class="tabdiv">
                    <a href="#Instellingen_Per_Kaartlaag_Help" title="<fmt:message key="viewer_admin.applicationtreelayer.1" />" class="helplink"></a>
                    <stripes:errors/>
                    <stripes:messages/>
                    <table class="formtable">
                        <tr>
                            <td><fmt:message key="viewer_admin.applicationtreelayer.2" />:</td>
                            <td>
                                <stripes:text id="titleAlias" name="details['titleAlias']" maxlength="255" size="30"/>
                                <fmt:message key="viewer_admin.applicationtreelayer.3" />
                            </td>
                        </tr>
                        <tr>
                            <td><fmt:message key="viewer_admin.applicationtreelayer.4" />:</td>
                            <td><stripes:text name="details['editfunction.title']" maxlength="255" size="30"/></td>
                        </tr>
                        <c:choose>
                            <c:when test="${!empty actionBean.styles}">
                                <tr>
                                    <td style="vertical-align: top"><fmt:message key="viewer_admin.applicationtreelayer.5" />:</td>
                                    <td>
                                        <stripes:select id="styleSelect" name="details['style']">
                                            <stripes:options-collection collection="${actionBean.styles}" value="id" label="title"/>
                                        </stripes:select><br>
                                        <fmt:message key="viewer_admin.applicationtreelayer.6" />: <a href="#" id="layerTitle">-</a><br>
                                        <fmt:message key="viewer_admin.applicationtreelayer.7" />: <a href="#"  id="styleTitle">-</a><br>
                                        <i><fmt:message key="viewer_admin.applicationtreelayer.8" /></i>
                                    </td>
                                </tr>
                            </c:when>
                            <c:otherwise>
                                <tr>
                                    <td><fmt:message key="viewer_admin.applicationtreelayer.9" />:</td>
                                    <td><fmt:message key="viewer_admin.applicationtreelayer.10" /></td>
                                </tr>
                            </c:otherwise>
                        </c:choose>
                        <tr>
                            <td style="vertical-align: top"><fmt:message key="viewer_admin.applicationtreelayer.11" />:</td>
                            <td>
                                <stripes:text name="details['legendImageUrl']" maxlength="255" size="80"/><br>
                                <fmt:message key="viewer_admin.applicationtreelayer.12" />
                            </td>
                        </tr>
                        <tr>
                            <td><fmt:message key="viewer_admin.applicationtreelayer.13" />:</td>
                            <td>
                                <stripes:text name="details['transparency']" maxlength="255" size="10" style="display: none;" id="details_transparency" />
                                <div id="details_transparency_slider" style="width: 200px; float: left;"></div>
                                <div style="float: left; margin-left: 15px;" id="transpSliderWarning"><fmt:message key="viewer_admin.applicationtreelayer.14" /></div>
                                <div style="clear: both;"></div>
                            </td>
                        </tr>
                        <tr>
                            <td><fmt:message key="viewer_admin.applicationtreelayer.15" />:</td>
                            <td>
                                <stripes:text name="details['influenceradius']" maxlength="255" size="10"/>
                                <fmt:message key="viewer_admin.applicationtreelayer.16" />
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <fieldset style="border: 1px gray ridge; width: 100%; padding: 2px;">
                                    <legend style="margin-left: 5px; padding: 2px"><fmt:message key="viewer_admin.applicationtreelayer.17" /></legend>
                                    <i><fmt:message key="viewer_admin.applicationtreelayer.18" /></i>
                                    <table class="formtable">
                                        <tr>
                                            <td><fmt:message key="viewer_admin.applicationtreelayer.19" />:</td>
                                            <td><stripes:text name="details['summary.title']" maxlength="255" size="30"/></td>
                                        </tr>
                                        <tr>
                                            <td><fmt:message key="viewer_admin.applicationtreelayer.20" />:</td>
                                            <td><stripes:text name="details['summary.image']" maxlength="255" size="30"/></td>
                                        </tr>
                                        <tr>
                                            <td valign="top"><fmt:message key="viewer_admin.applicationtreelayer.21" />:</td>
                                            <td>
                                                <div>
                                                    <stripes:checkbox class="use-plain-text-editor" name="details['summary.texteditor']" value="plain-text-editor" /> <fmt:message key="viewer_admin.applicationtreelayer.22" />
                                                </div>
                                                <div id="details_summary_description_container" style="width: 475px; height: 150px;"></div>
                                                <stripes:textarea name="details['summary.description']" rows="5" cols="27" style="display: none; width: 475px; height: 150px;" id="details_summary_description" />
                                                <a href="#" class="inlinehelp-toggle" data-target="related-features-help"><fmt:message key="viewer_admin.applicationtreelayer.23" /></a>
                                                <div class="inline-help related-features-help" style="display: none;"><fmt:message key="viewer_admin.applicationtreelayer.24" /></div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><fmt:message key="viewer_admin.applicationtreelayer.25" />:</td>
                                            <td><stripes:text name="details['summary.link']" maxlength="255" size="30"/></td>
                                        </tr>
                                        <tr>
                                            <td valign="top"><fmt:message key="viewer_admin.applicationtreelayer.26" />:</td>
                                            <td>
                                                <label><stripes:checkbox name="details['summary.noHtmlEncode']"/><fmt:message key="viewer_admin.applicationtreelayer.27" /></label><br>
                                                <label><stripes:checkbox name="details['summary.nl2br']"/><fmt:message key="viewer_admin.applicationtreelayer.28" /></label><br>
                                                <label><stripes:checkbox name="details['summary.retrieveUploads']"/><fmt:message key="viewer_admin.applicationtreelayer.29" /></label><br>
                                            </td>
                                        </tr>
                                    </table>
                                </fieldset>
                            </td>
                        </tr>
                    </table>
                </div>
                <div id="rights-tab" class="tabdiv">
                    <h1>
                        <fmt:message key="viewer_admin.applicationtreelayer.30" />:
                        <a href="#Rechten_Op_Kaartlaag_Help" title="<fmt:message key="viewer_admin.applicationtreelayer.31" />" class="helplink"></a>
                    </h1>
                    <fmt:message key="viewer_admin.applicationtreelayer.32" /> <br/>
                    <c:forEach var="group" items="${actionBean.allGroups}">
                        <stripes:checkbox name="groupsRead" value="${group.name}"/>
                        <stripes:checkbox name="groupsWrite" value="${group.name}"/>
                        ${group.name}<br/>
                    </c:forEach>
                </div>
                <div id="edit-tab" class="tabdiv">
                    <stripes:hidden name="details['editfeature.usernameAttribute']" id="details_editfeature_usernameAttribute"/>
                    <stripes:hidden name="details['editfeature.uploadDocument']" id="details_editfeature_uploadDocument"/>
                    <stripes:hidden name="details['editfeature.uploadDocument.types']" id="details_editfeature_uploadDocument_types"/>
                    <a href="#Edit_Per_Kaartlaag_Help" title="<fmt:message key="viewer_admin.applicationtreelayer.33" />" class="helplink"></a>
                    <c:choose>
                        <c:when test="${actionBean.editable}">
                            <fmt:message key="viewer_admin.applicationtreelayer.34" />
                        </c:when>
                        <c:otherwise>
                            <fmt:message key="viewer_admin.applicationtreelayer.35" />
                        </c:otherwise>
                    </c:choose>
                </div>
                <div id="filter-tab" class="tabdiv">
                    <a href="#Dataselectie_Filterfunctie_Per_Kaartlaag_Help" title="<fmt:message key="viewer_admin.applicationtreelayer.36" />" class="helplink"></a>
                    <fmt:message key="viewer_admin.applicationtreelayer.37" />
                </div>
                <div id="context-tab" class="tabdiv">
                    <a href="#Context_Info_Per_Kaartlaag_Help" title="<fmt:message key="viewer_admin.applicationtreelayer.38" />" class="helplink"></a>
                    <stripes:textarea cols="150" rows="5" name="details['context']" id="context_textarea" style="display: none;" />
                    <div id="contextHtmlEditorContainer" style="width: 475px; height: 400px;"></div>
                    <fmt:message key="viewer_admin.applicationtreelayer.39" />: <stripes:text name="details['metadataurl']" style="width: 390px;"/>
                </div>
            </div>
            <script type="text/javascript" src="${contextPath}/resources/js/ux/form/HtmlEditorImage.js"></script>
            <script type="text/javascript" src="${contextPath}/resources/js/ux/form/HtmlEditorTable.js"></script>
            <script type="text/javascript" src="${contextPath}/resources/js/application/applicationTreeLayer.js"></script>
            <script type="text/javascript" src="${contextPath}/resources/js/application/layer/attributes.js"></script>
            <script type="text/javascript">
                Ext.onReady(function() {
                    Ext.create('vieweradmin.components.ApplicationTreeLayer', {
                        attributes: ${actionBean.attributesConfig},
                        editable: ${actionBean.editable},
                        applicationLayer: "${actionBean.applicationLayer.id}",
                        applicationLayerFeatureType: ${actionBean.appLayerFeatureType != null ? actionBean.appLayerFeatureType : -1},
                        displayName: <js:quote value="${actionBean.displayName}"/>,
                        stylesTitleJson: ${actionBean.stylesTitleJson},
                        imagePath: "${contextPath}/resources/images/",
                        actionBeans: {
                            imageupload: <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.ImageUploadActionBean"/></js:quote>,
                            appTreeLayer: <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeLayerActionBean"/></js:quote>,
                            featureSourceURL: <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeSourceActionBean" event="getGridData"/></js:quote>,
                            featureTypesURL: <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="getFeatureTypes"/></js:quote>,
                            attributesURL: <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="getGridData"/></js:quote>,
                            getDBValuesUrl: <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeLayerActionBean" event="getUniqueValues"/></js:quote>
                        }
                    })
                });
            </script>
        </stripes:form>
    </stripes:layout-component>
</stripes:layout-render>
