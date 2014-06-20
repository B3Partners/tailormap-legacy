/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Protocol/WFS/v1.js
 * @requires OpenLayers/Format/WFST/v1_1_0.js
 */

/**
 * Class: OpenLayers.Protocol.WFS.v1_1_0
 * A WFS v1.1.0 protocol for vector layers.  Create a new instance with the
 *     <OpenLayers.Protocol.WFS.v1_1_0> constructor.
 *
 * Differences from the v1.0.0 protocol:
 *  - uses Filter Encoding 1.1.0 instead of 1.0.0
 *  - uses GML 3 instead of 2 if no format is provided
 *  
 * Inherits from:
 *  - <OpenLayers.Protocol.WFS.v1>
 */
OpenLayers.Protocol.WFS.v1_1_0.Get = OpenLayers.Class(OpenLayers.Protocol.WFS.v1_1_0, {
    
    /**
     * APIMethod: read
     * Construct a request for reading new features.  Since WFS splits the
     *     basic CRUD operations into GetFeature requests (for read) and
     *     Transactions (for all others), this method does not make use of the
     *     format's read method (that is only about reading transaction
     *     responses).
     *
     * Parameters:
     * options - {Object} Options for the read operation, in addition to the
     *     options set on the instance (options set here will take precedence).
     *
     * To use a configured protocol to get e.g. a WFS hit count, applications
     * could do the following:
     *
     * (code)
     * protocol.read({
     *     readOptions: {output: "object"},
     *     resultType: "hits",
     *     maxFeatures: null,
     *     callback: function(resp) {
     *         // process resp.numberOfFeatures here
     *     }
     * });
     * (end)
     *
     * To use a configured protocol to use WFS paging (if supported by the
     * server), applications could do the following:
     *
     * (code)
     * protocol.read({
     *     startIndex: 0,
     *     count: 50
     * });
     * (end)
     *
     * To limit the attributes returned by the GetFeature request, applications
     * can use the propertyNames option to specify the properties to include in
     * the response:
     *
     * (code)
     * protocol.read({
     *     propertyNames: ["DURATION", "INTENSITY"]
     * });
     * (end)
     */
    read: function(options) {
        OpenLayers.Protocol.prototype.read.apply(this, arguments);
        options = OpenLayers.Util.extend({}, options);
        OpenLayers.Util.applyDefaults(options, this.options || {});
        var response = new OpenLayers.Protocol.Response({requestType: "read"});
        
        options.params = {};
        options.params["SERVICE"] = "WFS";
        options.params["FILTER"] = OpenLayers.Format.XML.prototype.write.apply(
            this.format, [this.format.writeNode("ogc:Filter", options.filter)]
        );
        options.params["TYPENAME"] = options.featureType;
        options.params["REQUEST"] = "GetFeature";
        options.params["VERSION"] = this.version;
        options.params["SRSNAME"] = options.srsName;

        response.priv = OpenLayers.Request.GET({
            url: options.url,
            callback: this.createCallback(this.handleRead, response, options),
            params: options.params,
            headers: options.headers,
            proxy: contextPath+"/action/proxy/wfs?url="
        });

        return response;
    },
   
    CLASS_NAME: "OpenLayers.Protocol.WFS.v1_1_0.Get"
});
