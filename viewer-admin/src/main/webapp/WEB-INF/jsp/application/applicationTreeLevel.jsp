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
        <title><fmt:message key="viewer_admin.applicationtreelevel.0" /></title>
        <link rel="stylesheet" href="${contextPath}/resources/css/HtmlEditorExtensions.css" />
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <stripes:form beanclass="nl.tailormap.viewer.admin.stripes.ApplicationTreeLevelActionBean" id="levelform" class="maximize">
            <stripes:hidden name="level" value="${actionBean.level.id}"/>
            <c:if test="${actionBean.context.eventName!='delete'}">
                <h1 id="headertext"><fmt:message key="viewer_admin.applicationtreelevel.1" />: <c:out value="${actionBean.level.name}"/></h1>
                <div id="tabs" class="maximize">
                    <div id="tree-tab" class="tabdiv">
                        <stripes:errors/>
                        <stripes:messages/>
                        <div id="tree" class="tree-selection-tree">
                            <div id="servicetree-container"></div>
                        </div>
                        <div id="layerselection-buttons" class="tree-selection-buttons"></div>
                        <div id="layerselection" class="tree-selection-tree">
                            <div id="selected-layers"></div>
                        </div>
                        <div id="layermove-buttons" class="tree-selection-buttons"></div>
                        <div style="clear: both;"></div>
                        <stripes:hidden id="selectedlayersinput" name="selectedlayers" />
                    </div>

                    <div id="rights-tab" class="tabdiv">
                        <a href="#Rechten_Per_Niveau_Help" title="<fmt:message key="viewer_admin.applicationtreelevel.2" />" class="helplink"></a>
                        <h1><fmt:message key="viewer_admin.applicationtreelevel.3" />:</h1>
                        <c:forEach var="group" items="${actionBean.allGroups}">
                            <stripes:checkbox name="groupsRead" value="${group.name}"/> ${group.name}<br>
                        </c:forEach>
                    </div>

                    <div id="documents-tab" class="tabdiv">
                        <a href="#Documenten_Per_Niveau_Help" title="<fmt:message key="viewer_admin.applicationtreelevel.4" />" class="helplink"></a>
                        <div id="doctree" class="tree-selection-tree">
                            <div id="documenttree-container"></div>
                        </div>
                        <div id="docselection-buttons" class="tree-selection-buttons"></div>
                        <div id="docselection" class="tree-selection-tree">
                            <div id="selected-doc"></div>
                        </div>
                        <div id="docmove-buttons" class="tree-selection-buttons"></div>
                        <div style="clear: both;"></div>
                        <stripes:hidden id="selecteddocsinput" name="selecteddocs" />
                    </div>

                    <div id="context-tab" class="tabdiv">
                        <a href="#Context_Info_Per_Niveau_Help" title="<fmt:message key="viewer_admin.applicationtreelevel.5" />" class="helplink"></a>
                        <stripes:textarea cols="150" rows="5" name="level.info" id="context_textarea" style="display: none;" />
                        <div id="contextHtmlEditorContainer" style="width: 475px; height: 400px;"></div>
                        <fmt:message key="viewer_admin.applicationtreelevel.6" />: <stripes:text name="level.url"   style="width: 390px;"/>
                    </div>

                </div>
            </c:if>
            <c:if test="${actionBean.context.eventName == 'save' || actionBean.context.eventName == 'delete'}">
                <script type="text/javascript">
                    var frameParent = getParent();
                    if(frameParent && frameParent.renameNode) {
                        if ("${actionBean.context.eventName}" == "save" && '${actionBean.level.name}' != ''){
                            frameParent.renameNode('n${actionBean.level.id}','${actionBean.level.name}');
                            frameParent.refreshNode('n${actionBean.level.id}');
                        }else if ("${actionBean.context.eventName}" == "delete"){
                            frameParent.refreshNode('n${actionBean.level.parent.id}');
                        }
                        
                    }
                </script>
            </c:if>
        </stripes:form>
        
        <script type="text/javascript">
            // Definition of URLS and icons... how are we going to do this?
            var treeurl = '<stripes:url beanclass="nl.tailormap.viewer.admin.stripes.GeoServiceRegistryActionBean" event="tree"/>';
            var selectedlayersurl = '<stripes:url beanclass="nl.tailormap.viewer.admin.stripes.ApplicationTreeActionBean" event="loadSelectedLayers"/>';
            var pathSelectionUrl = '<stripes:url beanclass="nl.tailormap.viewer.admin.stripes.ApplicationTreeActionBean" event="loadRegistryPath"/>';
            var doctreeurl = '<stripes:url beanclass="nl.tailormap.viewer.admin.stripes.ApplicationTreeActionBean" event="loadDocumentTree"/>';
            var selecteddocsurl = '<stripes:url beanclass="nl.tailormap.viewer.admin.stripes.ApplicationTreeActionBean" event="loadSelectedDocuments"/>';
            var levelid = '${actionBean.level.id}';
            var layersAllowed = ${actionBean.layersAllowed};

            var foldericon = '${contextPath}/resources/images/folder.png';
            var serviceokicon = '${contextPath}/resources/images/serviceok.png';
            var serviceerroricon = '${contextPath}/resources/images/serviceerror.png';
            var layericon = '${contextPath}/resources/images/map.png';
            var documenticon = '${contextPath}/resources/images/document.png';
            var movelefticon = '${contextPath}/resources/images/move-left.gif';
            var moverighticon = '${contextPath}/resources/images/move-right.gif';
            var moveupicon = '${contextPath}/resources/images/move-up.gif';
            var movedownicon = '${contextPath}/resources/images/move-down.gif';
            
            var unremoveicon = '${contextPath}/resources/images/bin.png';
            var removeicon = '${contextPath}/resources/images/bin_empty.png';

            vieweradmin.components.Menu.setActiveLink('menu_boomstructuur');
            
            var actionBeans = { 
                "appTreeLevel": <js:quote><stripes:url beanclass="nl.tailormap.viewer.admin.stripes.ApplicationTreeLevelActionBean"/></js:quote>,
                "imageupload": <js:quote><stripes:url beanclass="nl.tailormap.viewer.admin.stripes.ImageUploadActionBean"/></js:quote>
            };
        </script>
        <script type="text/javascript" src="${contextPath}/resources/js/ux/form/HtmlEditorImage.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/ux/form/HtmlEditorTable.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/ux/b3p/TreeSelection.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/application/applicationTreeLevel.js"></script>
    </stripes:layout-component>
</stripes:layout-render>