/* global StreetSmartApi */

(function () {

    var loader = {
        hide: function () {
            document.querySelector(".loading").style.display = "none";
        }
    };

    function openByCoordinate(x, y, cyclomediaViewer) {
        cyclomediaViewer.openByCoordinate([x, y]).then(loader.hide, handlePromiseErrorMessage);
    }

    function openByImageId(imageId, cyclomediaViewer) {
        cyclomediaViewer.openByImageId(imageId, "EPSG:28992").then(loader.hide, handlePromiseErrorMessage);
    }

    function handlePromiseErrorMessage(err) {
        loader.hide();
        console.log(err.message);
    }

    function initApi(username, password) {
        return StreetSmartApi.init({
            targetElement: document.getElementById('streetsmartAPI1'),
            username: username,
            password: password,
            apiKey: "K3MRqDUdej4JGvohGfM5e78xaTUxmbYBqL0tSHsNWnwdWPoxizYBmjIBGHAhS3U1",
            srs: "EPSG:28992",
            locale: "nl",
            configurationUrl: 'https://atlas.cyclomedia.com/configuration',
            addressSettings: {
                locale: "nl",
                database: "CMDatabase"
            }
        });
    }

    function getQueryStringParameters() {
        return (function (a) {
            if (a == "")
                return {};
            var b = {};
            for (var i = 0; i < a.length; ++i)
            {
                var p = a[i].split('=', 2);
                if (p.length == 1)
                    b[p[0]] = "";
                else
                    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
            return b;
        })(window.location.search.substr(1).split('&'));
    }

    function init(qs) {
        if (qs["auth"]) {
            var auth = window.atob(qs["auth"]);
            var up = auth.split(":");
            qs["username"] = up[0];
            qs["password"] = up[1];
        }
        if (!qs["username"] || !qs["password"]) {
            alert("Username & Password are required");
        }
        initApi(qs["username"], qs["password"]).then(
            function () {
                console.log('Api: init: success!');
                var query = qs.x + ", " + qs.y;
                StreetSmartApi.open(query, {
                    viewerType: [StreetSmartApi.ViewerType.PANORAMA, StreetSmartApi.ViewerType.OBLIQUE],
                    srs: 'EPSG:28992'
                }).then(
                        function (result) {
                            console.log('Created component through API:', result);
                            if (result) {
                                for (let i = 0; i < result.length; i++) {
                                    if (result[i].getType() === StreetSmartApi.ViewerType.PANORAMA){
                                        window.panoramaViewer = result[i];
                                    }
                                }
                            }
                            loader.hide();
                        }.bind(this)
                        ).catch(
                        function (reason) {
                            loader.hide();
                            console.log('Failed to create component(s) through API: ' + reason);
                        }
                );
            },
            function (err) {
                console.log('Api: init: failed. Error: ', err);
                alert('Api Init Failed!');
            }
        );
    }

    init(getQueryStringParameters());
})();
