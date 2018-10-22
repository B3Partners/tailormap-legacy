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

<!DOCTYPE html>
<html>
    <head>
        <title>Globespotter</title>
    </head>

    <body>
        <div style="margin-top: 5px; margin-left: 10px; margin-bottom: 5px; width: 800px; border: 1px solid #000; background-color: #eee;">
            <div style="padding: 5px; font-size: 1.2em;">
                <!--img src="<html:rewrite page="/images/icons/information.png"/>" /-->
               <fmt:message key="viewer.globespotter.0" />
            </div>
        </div>
        <div style="margin-left: 10px;">
            <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" id="viewer_api" width="800" height=400">
                    <param name="movie" value="viewer_api" />
                    <param name="allowScriptAccess" value="always" />
                    <param name="allowFullScreen" value="true" />
                    <embed src="https://globespotter.cyclomedia.com/v28/api/viewer_api.swf"
                        quality="high"
                        bgcolor="#888888"
                        width="800" height="400"
                        name="viewer_api"
                        align="middle"
                        play="true"
                        loop="false"
                        quality="high"
                        allowScriptAccess="always"
                        type="application/x-shockwave-flash"
                        pluginspage="http://www.adobe.com/go/getflashplayer"
                        allowFullScreen="true"
                        flashvars="APIKey=${actionBean.apiKey}&SRSNameViewer=EPSG:28992&imageId=${actionBean.imageId}&SRSNameAddress=EPSG:28992&AddressLanguageCode=nl"
                    >
                    </embed>
            </object>
        </div>

    </body>
</html>