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
        <title><fmt:message key="viewer_admin.waitpage.0" /></title>
    </stripes:layout-component>
    <stripes:layout-component name="body">

        <script type="text/javascript">

var progress = Ext.create('Ext.ProgressBar', {
   renderTo: Ext.getBody(),
   animate: false,
   width: 500
});

function update() {
    // Dit request wordt door @WaitPage server side gedelayed 
    Ext.Ajax.request({
        url: window.location.href,
        params: {ajax: true},
        success: function(response, opts) {
            var obj = Ext.decode(response.responseText);
            progress.updateProgress(obj.progress / 100, obj.currentAction);
            if(!obj.finished) {
                setTimeout(function() {
                    update();
                }, 0);
            } else {
                window.location.reload();
            }
        },
        failure: function(response, opts) {
            console.log('server-side failure with status code ' + response.status);
        }
    });
}
setTimeout(function() {
    update();
}, 0);


        </script>

    </stripes:layout-component>
</stripes:layout-render>
