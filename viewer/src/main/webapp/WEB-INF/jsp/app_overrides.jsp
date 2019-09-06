<%-- this file can be used to overrides settings in overlays --%>
<%--
Note that if you want to override the proxy actionbean url you will need to:
- add the following ovveride here:
<script type="text/javascript">
    actionBeans["proxy"]=<js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.OIGSProxyActionBean"/></js:quote>;
...

- add the proxy url in your context.xml:

<Parameter name="proxy" override="false" value="/action/oigsproxy/wms"/>

see also:
- https://github.com/flamingo-geocms/flamingo/issues/1456

--%>
