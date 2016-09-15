<%--
Copyright (C) 2011-2013 B3Partners B.V.

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

<!DOCTYPE html>
<html>
    <head>
        <title>Globespotter</title>
    </head>

    <body>
        <div style="margin-top: 5px; margin-left: 10px; margin-bottom: 5px; width: 800px; border: 1px solid #000; background-color: #eee;">
            <div style="padding: 5px; font-size: 1.2em;">
                <!--img src="<html:rewrite page="/images/icons/information.png"/>" /-->

                U kunt rondkijken door de linkermuisknop ingedrukt te houden boven de foto
                en de muis te bewegen. Met het scroll wheel op de muis kunt u in- en uitzoomen.
            </div>
        </div>
        <div style="margin-left: 10px;">
            <object id="Globespotter" name="TID">
                <param name="allowScriptAccess" value="always" />
                <param name="allowFullScreen" value="true" />

                <!-- Test API: https://www.globespotter.nl/api/test/viewer_bapi.swf -->
                <!-- 2.1 API: https://www.globespotter.nl/v2/api/bapi/viewer_bapi.swf -->
                <!-- 2.6 API: https://globespotter.cyclomedia.com/v26/api/viewer_api.swf -->

                <embed src="https://globespotter.cyclomedia.com/v2/api/bapi/viewer_bapi.swf"
                       quality="high" bgcolor="#888888"
                       width="800" height="400"
                       type="application/x-shockwave-flash"
                       allowScriptAccess="always"
                       allowfullscreen="true"
                       FlashVars="&APIKey=${actionBean.apiKey}&imageid=${actionBean.imageId}&MapSRSName=EPSG:28992&TID=${actionBean.tid}">
                </embed>
            </object>
        </div>

    </body>
</html>