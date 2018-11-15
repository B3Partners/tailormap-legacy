Ext.onReady(function() {
    Ext.define('Doc', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'suggestion', type: 'string'}
        ]
    });
    Ext.define('Response', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'numFound', type: 'int'},
            {name: 'start', type: 'int'},
            {name: 'maxScore', type: 'float'},
            {name: 'docs', type: 'Doc'}
        ]
    });

    Ext.define('Answer', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'responseHeader', type: 'json', convert: null},
            {name: 'response', type: "Response"}
        ]
    });

    var panel = Ext.create('Ext.panel.Panel', {
        bodyPadding: 5, // Don't want content to crunch against the borders
        width: 400,
        height: 500,
        title: i18next.t('viewer_admin_search_0'),
        layout: {
            type: "vbox"
        },
        items: [
            {
                xtype: "panel",
                border: false,
                width: 400,
                height: 30,
                layout: {
                    type: "hbox",
                    border: 0
                },
                items: [{
                        xtype: "combo",
                        emptyText: i18next.t('viewer_admin_search_1'),
                        fieldLabel: i18next.t('viewer_admin_search_2'),
                        hideTrigger: true,
                        minChars: 1,
                        triggerAction: 'query',
                        queryMode: "remote",
                        id: 'searchTerm',
                        displayField: "suggestion",
                        listConfig: {
                            loadingMask: false
                        },
                        queryParam: "term",
                        listeners: {
                            afterRender: function(thisForm, options) {
                                this.keyNav = Ext.create('Ext.util.KeyNav', this.el, {
                                    enter: search,
                                    scope: this
                                });
                            }
                        },
                        store: {
                            autoLoad: false,
                            model: 'Doc',
                            proxy: {
                                type: 'ajax',
                                url: contextpath + '/action/configuresolr?autosuggest=true',
                                reader: {
                                    type: 'json',
                                    root: 'response.docs'
                                }
                            }

                        }
                    }, {
                        xtype: "button",
                        text: i18next.t('viewer_admin_search_3'),
                        handler: search
                    }]

            },
            {
                xtype: "label",
                html: { tag: 'b', html: i18next.t('viewer_admin_search_4') }
            },
            {
                xtype: "panel",
                border: false,
                id: "searchResults",
                height: 300,
                width: 500,
                layout: {
                    type: "vbox"
                },
                items: []
            }
        ],
        renderTo: Ext.getBody()
    });
});

function search() {
    var me = this;
    var results = Ext.getCmp("searchResults");
    typePanel = {};
    results.removeAll();
    results.setLoading("Laden...");
    var term = Ext.getCmp("searchTerm").getValue();
    var url = contextpath + "/action/configuresolr";
    Ext.Ajax.request({
        url: url,
        method: 'GET',
        scope: me,
        params: {
            term: term,
            search: true

        },
        success: function(response) {
            var results = Ext.getCmp("searchResults");
            results.setLoading(false);
            var msg = Ext.JSON.decode(response.responseText);
            if (msg.success) {
                processResults(msg.response.docs);
            } else {
                Ext.MessageBox.show({title: i18next.t('viewer_admin_search_5'), msg: i18next.t('viewer_admin_search_6') + msg.error, buttons: Ext.MessageBox.OK, icon: Ext.MessageBox.ERROR});
            }
        },
        failure: function(response) {

            var results = Ext.getCmp("searchResults");
            results.setLoading(false);
            Ext.MessageBox.show({title: i18next.t('viewer_admin_search_7'), msg: i18next.t('viewer_admin_search_8') + response.responseText, buttons: Ext.MessageBox.OK, icon: Ext.MessageBox.ERROR});
        }
    });
}

function processResults(docs) {
    for (var i = 0; i < docs.length; i++) {
        var doc = docs[i];
        createResult(doc);
    }
}

function createResult(doc) {
    var type = getTypePanel(doc.type);
    var typeResults = getTypePanel(doc.type);//Ext.getCmp(doc.type + "results");
    var result = Ext.create(Ext.panel.Panel, {
        id: doc.id + "-" + Ext.id(),
        border: false,
        width: 500,
        // height:50,
        layout: {
            type: "hbox"
        },
        items: [
            {
                id: Ext.id(),
                xtype: 'button',
                text: doc.values
            }
        ]
    });
    typeResults.add(result);
}

var typePanel = {};
function getTypePanel(type) {
    /* if (!typePanel.hasOwnProperty(type)) {
     var searchResults = Ext.getCmp("searchResults");
     var panel = Ext.create(Ext.panel.Panel, {
     id: type + Ext.id(),
     border: false,
     layout: {
     type: 'vbox'
     },
     items: [
     {
     xtype: "label",
     text: type
     },
     {
     xtype: "panel",
     width: 400,
     border: true,
     layout: {
     type: 'vbox'
     },
     id: type + "results"
     }
     ]
     });
     searchResults.add(panel);
     typePanel[type] = panel;
     }*/
    var searchResults = Ext.getCmp("searchResults");
    return searchResults;
}