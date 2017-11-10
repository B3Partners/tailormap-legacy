<%@include file="/WEB-INF/jsp/taglibs.jsp" %>
<%@page contentType="text/css" %>
           
<c:set var="sprite">
    <c:choose>
        <c:when test="${fn:startsWith( actionBean.app.details.iconSprite.value, 'http')}">
            <c:out value="${actionBean.app.details.iconSprite.value}"/>
        </c:when>
        <c:otherwise>
            <c:out value="${contextPath}${actionBean.app.details.iconSprite.value}"/>
        </c:otherwise>
    </c:choose>
</c:set>
@import url('${contextPath}${actionBean.location}default/style.jsp');    
.olControlPanel{
    border: 0px transparent;
    background-color: transparent;
}

.olControlPanel div{
    width: 28px;
    height: 28px;
}
.olControlPanel .olControlZoomBoxItemInactive {
background: url("${sprite}") 514px 394px;    
}
.olControlPanel .olControlZoomBoxItemActive {    
    background: url("${sprite}") 0 394px;
}

.olControlPanel .olControlDragPanItemActive {
    background: url("${sprite}") 0 422px;    
}
.olControlPanel .olControlDragPanItemInactive {
    background: url("${sprite}") 514px 422px;    
}

.olControlPanel .olControlZoomOutItemActive {    
    background: url("${sprite}") 0 366px;
}
.olControlPanel .olControlZoomOutItemInactive {
    background: url("${sprite}") 514px 366px;
}
.olControlPanel .olControlIdentifyItemActive{
    background: url("${sprite}") 0 478px;
}
.olControlPanel .olControlIdentifyItemInactive{    
    background: url("${sprite}") 514px 478px;
}

.olControlPanel .olControlZoomToMaxExtentItemInactive {
    background: url("${sprite}") 514px 590px;
    width: 28px;
    height: 28px;
}

.olControlPanel .olControlMeasureItemActive{
    background: url("${sprite}") 0 450px;
}
.olControlPanel .olControlMeasureItemInactive{
    background: url("${sprite}") 514px 450px;
}

.olControlPanel .streetViewItemActive{
    background: url("${sprite}") -2px 196px !important;
}

.olControlPanel .streetViewItemInactive{
    background: url("${sprite}") 510px 196px !important;
}

.olControlPanel .olControlMeasureAreaItemInactive{
    background: url("${sprite}") 508px 107px;
}

.olControlPanel .olControlMeasureAreaItemActive{
    background: url("${sprite}") 538px 107px;
}

.olControlPanel .downloadMapItemInactive{
    background: url("${sprite}") 509px 136px;
}
.olControlPanel .downloadMapItemActive{
    background: url("${sprite}") 538px 135px;
}

.olControlPanel .currentLocationItemActive{
    background: url("${sprite}") -2px 166px;
}
.olControlPanel .currentLocationItemInactive{
    background: url("${sprite}") 538px 166px;
}

.olControlPanel .olControlDefaultItemActive{
    background: url("${sprite}") 0 338px;
}
.olControlPanel .olControlDefaultItemInactive{
    background: url("${sprite}") 514px 338px;
}

.olControlPanel .olControlNavigationHistoryPreviousItemActive{
    background: url("${sprite}") 0 534px;
}
.olControlPanel .olControlNavigationHistoryPreviousItemInactive{
    background: url("${sprite}") 514px 534px;
}

.olControlPanel .olControlNavigationHistoryNextItemActive{
    background: url("${sprite}") 0 562px;
}
.olControlPanel .olControlNavigationHistoryNextItemInactive{
    background: url("${sprite}") 514px 562px;
}

/*Border nav*/
.olControlPanPanel div{
    width: 28px !important;
    height: 28px !important;
}

.olControlPanPanel .olControlPanNorthItemInactive{
    background: url("${sprite}") 514px 786px !important;
}

.olControlPanPanel .olControlPanSouthItemInactive{
    background: url("${sprite}") 514px 702px !important;
}

.olControlPanPanel .olControlPanEastItemInactive{
    
    background: url("${sprite}") 514px 812px !important;
}

.olControlPanPanel .olControlPanWestItemInactive{
    background:  url("${sprite}") 514px 618px !important;
}

a.olControlZoomIn {
    background: url("${sprite}") 507px 74px !important;
}

a.olControlZoomIn:hover {
    background-position: 538px 74px !important;
}

a.olControlZoomOut {
    background: url("${sprite}") 507px 44px !important;
}

a.olControlZoomOut:hover {
    background-position: 538px 44px !important;
}

div.olControlZoom {
    background-color: transparent;
}
div.olControlZoom a {
    /* Hide text */
    text-indent: 100%;
    white-space: nowrap;
    overflow: hidden;
}
div.olControlZoom a:hover {
    background: transparent;
}
@media only screen and (max-width: 600px) {
    div.olControlZoom a:hover {
        background: transparent;
    }
}


.olControlPanel .olControlZoomBoxItemInactive:hover,
.olControlPanel .olControlZoomBoxItemActive:hover {
    background-position: -27px 394px;
}
.olControlPanel .olControlDragPanItemInactive:hover,
.olControlPanel .olControlDragPanItemActive:hover {
    background-position: -27px 422px;
}
.olControlPanel .olControlZoomOutItemInactive:hover,
.olControlPanel .olControlZoomOutItemActive:hover {
    background-position: -27px 366px;
}
.olControlPanel .olControlIdentifyItemInactive:hover,
.olControlPanel .olControlIdentifyItemActive:hover {
    background-position: -28px 478px;
}
.olControlPanel .olControlZoomToMaxExtentItemInactive:hover,
.olControlPanel .olControlZoomToMaxExtentItemActive:hover {
    background-position: -28px 590px;
}
.olControlPanel .olControlMeasureItemInactive:hover,
.olControlPanel .olControlMeasureItemActive:hover {
    background-position: -28px 450px;
}
.olControlPanel .olControlDefaultItemInactive:hover,
.olControlPanel .olControlDefaultItemActive:hover {
    background-position: -29px 338px;
}
.olControlPanel .olControlNavigationHistoryPreviousItemInactive:hover,
.olControlPanel .olControlNavigationHistoryPreviousItemActive:hover {
    background-position: -28px 534px;
}
.olControlPanel .olControlNavigationHistoryNextItemInactive:hover,
.olControlPanel .olControlNavigationHistoryNextItemActive:hover {
    background-position: -28px 562px;
}
.olControlPanPanel .olControlPanNorthItemInactive:hover,
.olControlPanPanel .olControlPanNorthItemActive:hover {
    background-position: -27px 786px !important;
}
.olControlPanPanel .olControlPanSouthItemInactive:hover,
.olControlPanPanel .olControlPanSouthItemActive:hover {
    background-position: -27px 702px !important;
}
.olControlPanPanel .olControlPanEastItemInactive:hover,
.olControlPanPanel .olControlPanEastItemActive:hover {
    background-position: -27px 812px !important;
}
.olControlPanPanel .olControlPanWestItemInactive:hover,
.olControlPanPanel .olControlPanWestItemActive:hover {
    background-position: -27px 618px !important;
}
.olControlPanel .streetViewItemInactive:hover,
.olControlPanel .streetViewItemActive:hover {
    background-position: -31px 196px !important;
}
.olControlPanel .olControlMeasureAreaItemInactive:hover,
.olControlPanel .olControlMeasureAreaItemActive:hover {
    background-position: -32px 107px;
}
.olControlPanel .downloadMapItemInactive:hover,
.olControlPanel .downloadMapItemActive:hover {
    background-position: -34px 136px;
}
.olControlPanel .currentLocationItemInactive:hover,
.olControlPanel .currentLocationItemActive:hover {
    background-position: -61px 166px;
}