/**
 * HtmlEditorImageUpload plugin for Ext htmlEditor
 *
 * Adds a button to upload/insert/edit images
 *
 * @author    Sami Racho
 * @date      December 2011
 * @version   0.3
 *
 * @license Ext.ux.form.HtmlEditor.imageUpload is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 * 
 * License details: http://www.gnu.org/licenses/lgpl.html
 */
/**
 * @class Ext.ux.form.HtmlEditor.imageUpload
 *
 * Creates new HtmlEditor.imageUpload plugin
 * @constructor
 * @param {Object} config The config object
 * 
 * How to use
 * 
	Just instatiate a new HtmlEditor.imageUpload inside htmlEditor plugins option:

	xtype: 'htmleditor',
	plugins: [new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', {submitUrl:'myUploadScript.php',})],
    height: 400,
    style: 'background-color: white;',
    anchor: '100%',
	value: ''
 */
 
Ext.define('Ext.ux.form.HtmlEditor.imageUpload', {

    /**
     * @cfg {Array} options
     * Associative array with all the strings.
     * If not specified it will show all the strings in english
     */
    lang: {
        'Display': '',
        'By Default': '',
        'Inline': '',
        'Block': '',
        'Insert/Edit Image': '',
        'Upload Image...': '',
        'Uploading your photo...': '',
        'Error': '',
        'Width': '',
        'Height': '',
        'Align': '',
        'Title': '',
        'Class': '',
        'Padding': '',
        'Margin': '',
        'Top': '',
        'Bottom': '',
        'Right': '',
        'Left': '',
        'None': '',
        'Size & Details': '',
        'More Options': '',
        'Style': '',
        'OK': '',
        'Cancel': '',
        'Delete Image': '',
        'Confirmation': '',
        'Are you sure you want to delete this image?': '',
        'Your photo has been uploaded.': '',
        'Real Size': ''
    },

    /**
     * @cfg {String} submitUrl
     * Path to the upload script.
     * Default 'htmlEditorImageUpload.php'
     */
    submitUrl: 'htmlEditorImageUpload.php',
	
	/**
     * @cfg {Boolean} disableServerSideEdit
     * Enables/disables server side image editing buttons.
     * Default false
     */
    disableServerSideEdit: false,
	
	/**
     * @cfg {String} disableDelete
     * Enables/disables server side image deletion.
     * Default false
     */
    disableDelete: false,
	
	/**
     * @cfg {String} styling
     * Enables/disables image css styling.
     * Default false
     */
    disableStyling: false,

    /**
     * @cfg {String} mamangerUrl
     * Path to the image manager script.
     * Default 'htmlEditorImageManager.php'
     */
    managerUrl: 'htmlEditorImageUpload.php',


    /**
     * @cfg {integer} pageSize
     * Number of images to show on the list.
     * Default 6
     */
    pageSize: 6,

  /**
   * @cfg {Boolean} values are:
   * true : Default
   * Allows the user to resize an image clicking on it and dragging with the mouse. (Only WebKit browsers)
   * false 
   * The image wont be resized if the user drags on it
   */
    dragResize: true,
	
	  /**
   * @cfg {Boolean} values are:
   * false : Default
   * Context menu for images enabled
   * true 
   * Context menu will not be avaible
   */
    enableContextMenu: false,

    /**
   * @cfg {Boolean} values are:
   * true : Default
   * Allows the user to resize an image clicking on it and using the mousewheel. (Only WebKit browsers & Opera)
   * false 
   * The image wont be resized if the user uses mousewheel on it
   */
    wheelResize: true,

    /**
     * @cfg {String} iframeCss
     * Path to the iframe css file. 
     * It's important to do not merge this css with other CSS files, because it will be applied to the htmleditor 
     * iframe head. If more css rules are included, it can suffer undesired effects
     * Default 'css/iframe_styles.css'
     */
    iframeCss: 'css/iframe_styles.css',
    
    t: function (str) {
        return this.lang[str] ? this.lang[str] : str;
    },
	
    constructor: function (config) {
        Ext.apply(this, config);
        this.callParent(arguments);
    },
	
    init: function (panel) {
        this.cmp = panel;
        this.cmp.on('render', this.onRender, this);
        this.cmp.on('initialize', this.initialize, this);
        this.cmp.on('beforedestroy', this.beforeDestroy, this);
    },
	
    initialize: function () {
        var me = this;
        var cmpDoc = this.cmp.getDoc();
        me.flyDoc = Ext.fly(cmpDoc);

        // Inject custom css file to iframe's head in order to simulate image control selector on click, over webKit and Opera browsers
        if ((Ext.isWebKit || Ext.isOpera)) me._injectCss(me.cmp, me.iframeCss);

        // attach context menu
        if(me.enableContextMenu)me._contextMenu();

		// attach events to control when the user interacts with an image
		me.cmp.mon(me.flyDoc, 'dblclick', me._dblClick, me);
		me.cmp.mon(me.flyDoc, 'mouseup', me._docMouseUp, me);
		me.cmp.mon(me.flyDoc, 'paste', me._removeSelectionHelpers, me);
		
        // mousewheel resize event
        if ((Ext.isWebKit || Ext.isOpera) && me.wheelResize) {	
			me.cmp.mon(me.flyDoc, 'mousewheel', me._wheelResize, me);
        }

        // mouse drag resize event
        if (Ext.isWebKit && me.dragResize) {	
			me.cmp.mon(me.flyDoc, 'drag', me._dragResize, me);
        }
    },
	
    beforeDestroy: function () {
        var me = this;
        if (me.uploadDialog) me.uploadDialog.destroy();
        if (me.contextMenu) contextMenu.destroy();
    },
	
    onRender: function () {

        var imageButton = Ext.create('Ext.button.Button', {
            iconCls: 'x-htmleditor-imageupload',
            handler: this._openImageDialog,
            scope: this,
            tooltip: this.t('Insert/Edit Image'),
            overflowText: this.t('Insert/Edit Image')
        });

        var toolbar = this.cmp.getToolbar();

        // we save a reference to this button to use it later
        this.imageButton = imageButton;

        this.cmp.getToolbar().add(imageButton);

    },
	
	//private
    _contextMenu: function () {
        var me = this;

        if (!me.contextMenu) {
            var editAction = Ext.create('Ext.Action', {
                text: me.t('Edit'),
                iconCls: 'x-htmleditor-imageupload-editbutton',
                disabled: false,
                handler: me._openImageDialog,
                scope: me
            });

            var deleteAction = Ext.create('Ext.Action', {
                iconCls: 'x-htmleditor-imageupload-deletebutton',
                text: me.t('Delete'),
                disabled: false,
                handler: function () {
                    me.cmp.execCmd('delete')
                }
            });

            var contextMenu = Ext.create('Ext.menu.Menu', {
                closeAction: 'hide',
                items: [
                editAction, deleteAction]
            });
            me.contextMenu = contextMenu;
        }

        me.flyDoc.on({
            contextmenu: function (e, htmlEl) {
                e.stopEvent();
                e.stopPropagation();
                var iframePos = this.cmp.getPosition();
                var elementPos = e.getXY();
                var pos = [iframePos[0] + elementPos[0], iframePos[1] + elementPos[1]];
                if (e.getTarget().tagName == 'IMG');
                Ext.Function.defer(function () {
                    me.contextMenu.showAt(pos)
                }, 100);

            },
            scope: me
        });
    },
	
    //private
    // instead of overriding the htmleditor header method we just append another css file to it's iframe head
    _injectCss: function (cmp, cssFile) {
        var frameName = cmp.iframeEl.dom.name;
        var iframe;

        if (document.frames) iframe = document.frames[frameName];
        else iframe = window.frames[frameName];

        // we have to add our custom css file to the iframe
        var ss = iframe.document.createElement("link");
        ss.type = "text/css";
        ss.rel = "stylesheet";
        ss.href = cssFile;

        if (document.all) iframe.document.createStyleSheet(ss.href);
        else iframe.document.getElementsByTagName("head")[0].appendChild(ss);

    },
	
    // private
    _dblClick: function (evt) {
        var me = this;
        var target = evt.getTarget();

        if (target.tagName == "IMG") {
            me._openImageDialog()
        }
    },
	
    //private
    _openImageDialog: function () {

        var me = this;
        var cmp = this.cmp;
        var doc = this.cmp.getDoc();
        var win = this.cmp.win;
        var sel = "";
        var range = "";
        var image = "";
        var imagesList = doc.body.getElementsByTagName("IMG");
        var imagesListLength = imagesList.length;

        //insertAtCursor function is completely useless for this purpose, so I need to write all this stuff to insert html at caret position	
        // I need to know if the browser uses the W3C way or the Internet Explorer method
        var ieBrowser = doc.selection && doc.selection.createRange ? true : false;
        var nonIeBrowser = win.getSelection && win.getSelection().getRangeAt ? true : false;

        if (nonIeBrowser) {
            sel = win.getSelection();
            // if focus is not in htmleditor area
            try {
                range = sel.getRangeAt(0);
            } catch (err) {
                win.focus();
                range = sel.getRangeAt(0);
            }

        } else if (ieBrowser) {
            //it's compulsory to get the focus before creating the range, if not we'll lose the caret position
            win.focus();
            sel = doc.selection;
            range = sel.createRange();
        }

        // to make the things easier, if the user has an image selected when he presses the image upload button, I mark it with a custom attr "iu_edit".
        // afterwards, if the user presses the ok button I just need to find the image with that attr, and replace it with the new one.
        if (Ext.isIE && sel.type == "Control" && range.item(0).tagName == "IMG") {
            image = r;
        } else if (range.startContainer == range.endContainer) {
            if (range.endOffset - range.startOffset < 2) {
                if (range.startContainer.hasChildNodes()) {
                    var r = range.startContainer.childNodes[range.startOffset];
                    if (r.tagName) {
                        if (r.tagName == "IMG") image = r;
                    }
                }
            }
        }

        if (!image) {
            //if we dont find the image we try to search by editable attr
            for (i = 0; i < imagesListLength; i++) {
                if (parseInt(imagesList[i].getAttribute('iu_edit')) > 0) {
                    image = imagesList[i];
                    break;
                }
            }
        }

        me.uploadDialog = Ext.create('Ext.ux.form.HtmlEditor.ImageDialog', {
            lang: me.lang,
            t: me.t,
            submitUrl: me.submitUrl,
            managerUrl: me.managerUrl,
            iframeDoc: doc,
            imageToEdit: image,
            pageSize: me.pageSize,
            imageButton: me.imageButton,
			disableServerSideEdit: me.disableServerSideEdit,
			disableStyling:me.styling,
			disableDelete : me.disableDelete
        });

        me.uploadDialog.on('close', function () {
            if (Ext.isIE) {
                me.imageButton.toggle(false);
                me._removeSelectionHelpers()
            }
        }, me);

        // custom event that fires when the user presses the ok button on the dialog
        me.uploadDialog.on('imageloaded', function () {

            var newImage = this.getImage();

            // if it's an edited image, we have to replace it with the new values
            if (image != "") {
                for (i = 0; i < imagesListLength; i++) {
                    if (parseInt(imagesList[i].getAttribute('iu_edit')) > 0) {
                        if (nonIeBrowser) {
                            imagesList[i].parentNode.replaceChild(newImage, imagesList[i]);
                            try {
                                if (sel) {
                                    sel.selectAllChildren(doc.body);
                                    sel.collapseToStart();
                                }

                            } catch (ex) {};
                        } else if (ieBrowser) {
                            imagesList[i].outerHTML = newImage.outerHTML;
                        }
                        break;
                    }
                }
            }
            // if not we just insert a new image on the document
            else {
                if (nonIeBrowser) {
                    range.insertNode(newImage);
                } else if (ieBrowser) {
                    win.focus();
                    range.select();
                    range.pasteHTML(newImage.outerHTML);
                }
            }

            me.imageToEdit = "";
            this.close();
            me.imageButton.toggle(false);
        });

        me.uploadDialog.show();
    },
	
    //private
	//Remove custom image attrs from the iframe body DOM
    _removeSelectionHelpers: function () {
        var me = this;
        var imagesList = me.cmp.getDoc().body.getElementsByTagName("IMG");
        var imagesListLength = imagesList.length;

        for (i = 0; i < imagesListLength; i++) {
            imagesList[i].removeAttribute('iu_edit');
        }
    },
	
	//private
	//When user uses mousewheel over an image
    _wheelResize: function (e) {
        var target = e.getTarget();
        if (target.tagName == "IMG" && target.getAttribute('iu_edit') == 1) {
            var delta = e.getWheelDelta();
            var width = target.style.width ? parseInt(target.style.width.replace(/[^\d.]/g, "")) : target.width;
            var height = target.style.height ? parseInt(target.style.height.replace(/[^\d.]/g, "")) : target.height;

            target.removeAttribute('height');
            target.style.removeProperty('height');

            // change just width to keep aspect ratio
            target.style.width = (delta < 1) ? width - 10 : width + 10;

            e.preventDefault();
        } else return;
    },
	
	//private
	//When user drags over an image
    _dragResize: function (e) {

        var target = e.getTarget();

        if (target.tagName == "IMG" && (target.getAttribute('iu_edit') == 1)) {
            var width = e.getX() - target.offsetLeft;
            var height = e.getY() - target.offsetTop;
            target.style.width = width + "px";
            target.style.height = height + "px";
            e.preventDefault();
        } else return;
    },
    
	//private
	//When user clicks on content editable area
    _docMouseUp: function (evt) {

        var me = this;
        var target = evt.getTarget();

        me._removeSelectionHelpers();

        if (target.tagName == "IMG") {
            me.imageButton.toggle(true);
            if ((me.wheelResize || me.dragResize) && (Ext.isWebKit || Ext.isOpera)) target.setAttribute('iu_edit', '1');
            else target.setAttribute('iu_edit', '2');

            // select image. 
            // On safari if we copy and paste the image, class attrs are converted to inline styles. It's a browser bug.
            if (Ext.isWebKit) {
                var sel = this.cmp.getWin().getSelection ? this.cmp.getWin().getSelection() : this.cmp.getWin().document.selection;
                sel.setBaseAndExtent(target, 0, target, 1);
            }
        } else me.imageButton.toggle(false);
    }
});

Ext.define('Ext.ux.form.HtmlEditor.ImageCropDialog', {
    extend: 'Ext.window.Window',
	imgSrc:'',
	randomId:'',
	bodyCls:'x-htmleditor-imageupload-cropdialog',
	naturalWidth:0,
	naturalHeight:0,
	maxWidth:700,
	maxHeight:500,
	height:350,
	width:400,
	minHeight:350,
	minWidth:400,
	myResizer:null,
	managerUrl:null,
	autoScroll:true,
	initComponent: function () {
		
		var me = this;		
		
		Ext.applyIf(me, {
            items: [
                {
					xtype:'container',
					html: { tag: 'div', id: 'myResizable', style: 'position: absolute;z-index:9999;' }
				},
				{
					xtype: 'image',
					itemId:'imageToCrop',
					src: me.imgSrc+'?'+Math.floor(Math.random()*111111),
					listeners: {
						afterrender: me._attachOnLoadEvent,
						scope:me
					}
				}
            ],
			dockedItems: [
			{
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [
                        {
                            labelWidth:50,
							xtype: 'slider',
							itemId:'zoomSlider',
                            width: 150,
                            value: 100,
							minValue:0,
							maxValue:200,
                            fieldLabel: i18next.t('viewer_admin_htmleditorimage_0'),
							listeners:{
								change:me._sliderChange,
								scope:me
							}
                        }
                    ]
            },{
                xtype: 'container',
                dock: 'bottom',
                padding: 4,
                items: [{
                    xtype: 'button',
                    style: {
                        'float': 'right'
                    },
                    text: i18next.t('viewer_admin_htmleditorimage_1'),
                    handler: me.close,
                    scope: me
                }, {
                    xtype: 'button',
                    style: {
                        'float': 'right',
                        'margin-right': '8px'
                    },
                    text: i18next.t('viewer_admin_htmleditorimage_2'),
                    handler: me._cropImage,
                    scope: me
                }]
            }]
        });

        me.callParent(arguments);
        me.setTitle('Crop Image');
	},
	
	//private
	_attachOnLoadEvent: function (comp) {
		var me = this;
		var flyImg = Ext.fly(comp.getEl().dom);
		comp.mon(flyImg, 'load', me._setupResizer, comp);
	},
	
	//private
	_sliderChange: function(slider)
	{
		var me = this;
		var imgToCrop = me.down('#imageToCrop');
		var zoom = Math.round(me.naturalWidth*(slider.getValue()/100));
		imgToCrop.setWidth(zoom);
	},
	
	//private
	_setupResizer: function(ev,el)
	{		
		var imageComp = this;
		var cropWindow = this.up('window');
		
		cropWindow.naturalWidth = el.width;
		cropWindow.naturalHeight = el.height;
		
		cropWindow.setWidth(el.width+12);
		cropWindow.setHeight(el.height+94);
		cropWindow.center();
		
		if(!cropWindow.myResizer)
		cropWindow.myResizer = Ext.create('Ext.resizer.Resizer', {
			el: 'myResizable',
			constrainTo:imageComp.getEl(),
			handles: 'all',
			minWidth: 16,
			minHeight: 16,
			width: 32,
			height: 32,
			pinned: true
		});
	},
	
	//private
	//method to crop the image
    _cropImage: function (fileField) {

        var me = this;

        Ext.Msg.show({
			title: i18next.t('viewer_admin_htmleditorimage_3'),
			msg: i18next.t('viewer_admin_htmleditorimage_4'),
			buttons: Ext.Msg.YESNO,
			closable: false,
			fn: function (btn) {
				if (btn == 'yes') {
					Ext.Ajax.request({
						url: me.managerUrl,
						method: 'POST',
						params: {
							'action': 'crop',
							'image': me.imgSrc,
							'zoom': me.down('#zoomSlider').getValue(),
							'width': me.myResizer.getEl().dom.offsetWidth,
							'height': me.myResizer.getEl().dom.offsetHeight,
							'offsetLeft': me.myResizer.getEl().dom.offsetLeft,
							'offsetTop':me.myResizer.getEl().dom.offsetTop
						},
						success: function (response) {
							
							var result = Ext.JSON.decode(response.responseText);
							
							if(result.success)
							{
								me.imgSrc = result.data['src'];
								me.fireEvent('imagecropped');
							}else{
								Ext.MessageBox.alert(i18next.t('viewer_admin_htmleditorimage_5'), i18next.t('viewer_admin_htmleditorimage_6') + result.errors);
							}
						}
					});
				}
			}
		});	
    }
});

Ext.define('Ext.ux.form.HtmlEditor.ImageDialog', {
    extend: 'Ext.window.Window',
    lang: null,
    t: null,
    submitUrl: null,
    managerUrl: null,
    iframeDoc: null,
    pageSize: null,
    imageToEdit: '',
    closeAction: 'destroy',
    width: 460,
    modal: true,
    resizable: false,
    layout: {
        type: 'fit'
    },
    title: '',   
    listeners: {
        show: function (panel) {
            // we force the focus on the dialog window to avoid control artifacts on IE
            this._loadImageDetails();
            panel.down('[name=src]').focus();
        },
        resize: function (panel) {
            panel.center();
        }
    },
    
    initComponent: function () {
        var me = this;
        var imageStore = Ext.create('Ext.data.Store', {
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: 'fullname',
                type: 'string'
            }, {
                name: 'src',
                type: 'string'
            }, {
                name: 'thumbSrc',
                type: 'string'
            }],
            proxy: {
                type: 'ajax',
                url: me.managerUrl,
                extraParams: {
                    action: 'imagesList'
                },
                reader: {
                    type: 'json',
                    root: 'data'
                }
            },
            autoLoad: false,
            pageSize: me.pageSize
        });

		// if I dont remove store records I get an internalId exception when refresh button is clicked
		imageStore.on('beforeload', function (store)
		{
			while (store.getCount(0) > 0)
			store.removeAt(0);
		});
		
        var alignStore = Ext.create('Ext.data.ArrayStore', {
            autoDestroy: true,
            idIndex: 0,
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: 'value',
                type: 'string'
            }],
            data: [
                [me.t('Left'), 'left'],
                [me.t('None'), 'none'],
                [me.t('Right'), 'right']
            ]
        });

        var displayStore = Ext.create('Ext.data.ArrayStore', {
            autoDestroy: true,
            idIndex: 0,
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: 'value',
                type: 'string'
            }],
            data: [
                [me.t('By Default'), ''],
                [me.t('Inline'), 'inline'],
                [me.t('Block'), 'block']
            ]
        });

        var unitsStore = Ext.create('Ext.data.ArrayStore', {
            autoDestroy: true,
            idIndex: 0,
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: 'value',
                type: 'string'
            }],
            data: [
                ['px', 'px'],
                ['%', '%'],
                ['em', 'em'],
                ['in', 'in'],
                ['cm', 'cm'],
                ['mm', 'mm'],
                ['ex', 'ex'],
                ['pt', 'pt'],
                ['pc', 'pc']
            ]
        });
		
        var imageEditButtons = [];
        if(!me.disableServerSideEdit) {
            imageEditButtons = [{
                xtype:'button',
                iconCls:'x-htmleditor-imageupload-cropbutton',
                itemId:'cropButton',
                disabled:true,
                handler: me._openCropDialogClick,
                scope:me,
                tooltip: i18next.t('viewer_admin_htmleditorimage_7')
            },{
                xtype:'button',
                itemId:'rotateButton',
                disabled:true,
                iconCls:'x-htmleditor-imageupload-rotatebutton',
                handler: me._rotateImageClick,
                scope:me,
                tooltip: i18next.t('viewer_admin_htmleditorimage_8')
            },{
                xtype:'button',
                itemId:'resizeButton',
                disabled:true,
                iconCls:'x-htmleditor-imageupload-resizebutton',
                handler: me._resizeImageClick,
                scope:me,
                tooltip: i18next.t('viewer_admin_htmleditorimage_9')
            }];
        }
        
        me.items = [{
            xtype: 'form',
            name: 'imageUploadForm',
            bodyPadding: 10,
            items: [{
                xtype: 'fieldcontainer',
                height: 36,
                padding: 4,
                width: 450,
                layout: {
                    columns: 2,
                    type: 'column'
                },
                items: [{
                    xtype: 'combobox',
                    name: 'src',
                    queryMode: 'remote',
                    fieldLabel: i18next.t('viewer_admin_htmleditorimage_10'),
                    labelWidth: 50,
                    columnWidth: 0.70,
                    margin: '0 4 0 0',
                    editable: true,
                    allowBlank: true,
                    store: imageStore,
                    displayField: 'src',
                    valueField: 'src',
                    needsRefresh: false,
                    checkChangeBuffer: 500,
                    listeners: {		
                        'expand': {
							fn: me._comboExpand,
							scope:me
						},
                        'change': {
							fn: me._comboChange,
							scope: me
						},
						'select':{
							fn: me._comboSelect,
							scope: me
						}
					},
                    tpl: '<tpl for="."><table class="x-boundlist-item" style="width:50%;float:left"><tr><td style="vertical-align:top;width:12px"><tpl if="'+me.disableDelete+' == false"><a title="' + me.t('Delete Image') + '" href="#" img_fullname="{fullname}" class="x-htmleditor-imageupload-delete"></a></tpl></td><td><div class="x-htmleditor-imageupload-thumbcontainer"><img src="{thumbSrc}"/></div></td></tr><tr><td colspan="2" style="text-align:center;font-size:12px">{name}</td></tr></table></tpl>',
                    listConfig: {
                        loadingText: 'Searching...',
                        emptyText: i18next.t('viewer_admin_htmleditorimage_11'),
                        listeners: {
                            el: {
                                click: {
                                    delegate: 'a.x-htmleditor-imageupload-delete',
									scope:me,
                                    fn: me._deleteImage
                                }
                            }
                        }
                    },
                    pageSize: me.pageSize
                }, {
                    xtype: 'filefield',
                    buttonOnly: true,
                    name: 'upload',
                    value: '',
                    columnWidth: 0.30,
                    buttonText: me.t('Upload Image...'),
                    listeners: {
                        change: me._uploadImage,
                        scope: me
                    }
                }]
            }, {
                xtype: 'fieldset',
                title: me.t('More Options'),
                itemId: 'fieldOptions',
                collapsible: true,
                layout: 'anchor',
                collapsed: true,
                defaults: {
                    anchor: '100%',
                    labelWidth: 72
                },
                items: [{
                    xtype: 'fieldset',
                    title: me.t('Size & Details'),
                    collapsible: true,
                    collapsed: false,
                    layout: {
                        type: 'table',
                        columns: 2
                    },
                    defaults: {
                        anchor: '100%',
                        labelWidth: 72
                    },
                    items: [{
                        xtype: 'container',
                        margin: 4,
                        layout: {
                            align: 'middle',
                            pack: 'center',
                            type: 'hbox'
                        },
                        style: {
                            border: '1px solid #ccc'
                        },
                        height: 130,
                        width: 130,
						padding: 2,
                        items: [{
                            xtype: 'image',
                            itemId: 'vistaPrevia',
							id:'',
                            resetImageSize: false,
                            listeners: {
                                afterrender: me._attachOnLoadEvent,
								scope: me
                            }
                        }]
                    }, {
                        xtype: 'fieldcontainer',
                        layout: {
                            type: 'table',
                            columns: 3
                        },
                        defaults: {
                            labelSeparator: ' ',
							fieldLabel: '',
                            labelAlign: 'left',
                            labelWidth: 72,
                            decimalSeparator: '.',
                            width: 164,
                            margin: '0 4 4 0'
                        },
                        items: [{
                            colspan: 3,
                            xtype: 'combobox',
                            width: 216,
                            name: 'float',
                            queryMode: 'local',
                            editable: false,
                            allowBlank: false,
                            fieldLabel: me.t('Align'),
                            value: 'left',
                            store: alignStore,
                            displayField: 'name',
                            valueField: 'value'
                        }, {
                            xtype: 'numberfield',
                            fieldLabel: me.t('Width'),
                            name: 'width',
                            minValue: 1,
                            maxValue: 9999,
                            constrainName: 'height',
                            listeners: {
                                change: me._checkConstrain
                            }
                        }, {
                            xtype: 'combobox',
                            name: 'widthUnits',
                            queryMode: 'local',
                            width: 48,
                            editable: false,
                            allowBlank: false,
                            emptyText: i18next.t('viewer_admin_htmleditorimage_12'),
                            value: 'px',
                            store: unitsStore,
                            displayField: 'name',
                            valueField: 'value'
                        }, {
                            rowspan: 2,
                            xtype: 'button',
                            itemId: 'constraintProp',
                            cls: 'x-htmleditor-imageupload-constrain',
                            enableToggle: true,
                            pressed: true,
                            style: {
                                border: '0px'
                            },
                            width: 24,
                            height: 50,
                            listeners: {
                                toggle: me._toggleConstrain,
                                scope: me
                            }
                        }, {
                            xtype: 'numberfield',
                            fieldLabel: me.t('Height'),
                            name: 'height',
                            minValue: 1,
                            maxValue: 9999,
                            constrainName: 'width',
                            listeners: {
                                change: me._checkConstrain
                            }
                        }, {
                            xtype: 'combobox',
                            name: 'heightUnits',
                            queryMode: 'local',
                            width: 48,
                            editable: false,
                            allowBlank: false,
                            emptyText: i18next.t('viewer_admin_htmleditorimage_13'),
                            value: 'px',
                            store: unitsStore,
                            displayField: 'name',
                            valueField: 'value'
                        }, {
                            colspan: 3,
                            xtype: 'displayfield',
                            fieldLabel: me.t('Real Size'),
                            itemId: 'realSize'
                        }]
                    },
					{
						xtype: 'fieldcontainer',
						hidden: me.serverSideEdit,
						layout: {
							type: 'table',
							columns: 4
						},
						defaults:{
							margin: '0 8 0 0'
						},
						padding: (imageEditButtons.length == 0 ? '0 0 0 3' : '0 0 0 12'),
						items: Ext.Array.merge(imageEditButtons, [{
								xtype:'button',
								itemId:'deleteButton',
								disabled:true,
								iconCls:'x-htmleditor-imageupload-deletebutton',
								handler: me._deleteImageClick,
								scope:me,
								tooltip: i18next.t('viewer_admin_htmleditorimage_14')
						}])
					},{
                        xtype: 'hiddenfield',
                        itemId: 'naturalWidth'
                    }, {
                        xtype: 'hiddenfield',
                        itemId: 'naturalHeight'
                    }, {
                        xtype: 'hiddenfield',
                        itemId: 'ratio'
                    }]
                }, {
                    xtype: 'fieldset',
					hidden:me.styling,
                    title: me.t('Style'),
                    collapsible: true,
                    layout: 'anchor',
                    collapsed: true,
                    items: [{
                        xtype: 'combobox',
                        name: 'display',
                        queryMode: 'local',
                        editable: false,
                        anchor: '100%',
                        labelWidth: 72,
                        allowBlank: false,
                        fieldLabel: me.t('Display'),
                        emptyText: me.t('None'),
                        value: '',
                        store: displayStore,
                        displayField: 'name',
                        valueField: 'value'
                    }, {
                        xtype: 'textfield',
                        name: 'title',
                        labelWidth: 72,
                        anchor: '100%',
                        fieldLabel: me.t('Title')
                    }, {
                        xtype: 'textfield',
                        name: 'className',
                        labelWidth: 72,
                        anchor: '100%',
                        fieldLabel: me.t('Class')
                    }, {
                        xtype: 'fieldcontainer',
                        layout: {
                            type: 'table',
                            columns: 4
                        },
                        fieldLabel: me.t('Padding'),
                        labelWidth: 73,
                        defaults: {
                            labelSeparator: ' ',
                            labelAlign: 'left',
                            labelWidth: 48,
                            width: 98,
                            decimalSeparator: '.',
                            margin: '0 4 4 0'
                        },
                        items: [{
                            xtype: 'numberfield',
                            fieldLabel: me.t('Top'),
                            name: 'paddingTop'
                        }, {
                            xtype: 'combobox',
                            name: 'paddingTopUnits',
                            queryMode: 'local',
                            width: 48,
                            editable: false,
                            allowBlank: false,
                            emptyText: i18next.t('viewer_admin_htmleditorimage_15'),
                            value: 'px',
                            store: unitsStore,
                            displayField: 'name',
                            valueField: 'value'
                        }, {
                            xtype: 'numberfield',
                            fieldLabel: me.t('Right'),
                            name: 'paddingRight'
                        }, {
                            xtype: 'combobox',
                            name: 'paddingRightUnits',
                            queryMode: 'local',
                            width: 48,
                            editable: false,
                            allowBlank: false,
                            emptyText: i18next.t('viewer_admin_htmleditorimage_16'),
                            value: 'px',
                            store: unitsStore,
                            displayField: 'name',
                            valueField: 'value'
                        }, {
                            xtype: 'numberfield',
                            fieldLabel: me.t('Bottom'),
                            name: 'paddingBottom'
                        }, {
                            xtype: 'combobox',
                            name: 'paddingBottomUnits',
                            queryMode: 'local',
                            editable: false,
                            allowBlank: false,
                            width: 48,
                            emptyText: i18next.t('viewer_admin_htmleditorimage_17'),
                            value: 'px',
                            store: unitsStore,
                            displayField: 'name',
                            valueField: 'value'
                        }, {
                            xtype: 'numberfield',
                            fieldLabel: me.t('Left'),
                            name: 'paddingLeft'
                        }, {
                            xtype: 'combobox',
                            name: 'paddingLeftUnits',
                            queryMode: 'local',
                            editable: false,
                            allowBlank: false,
                            width: 48,
                            emptyText: i18next.t('viewer_admin_htmleditorimage_18'),
                            value: 'px',
                            store: unitsStore,
                            displayField: 'name',
                            valueField: 'value',
                            margin: '0'
                        }]
                    }, {
                        xtype: 'fieldcontainer',
                        layout: {
                            type: 'table',
                            columns: 4
                        },
                        fieldLabel: me.t('Margin'),
                        labelWidth: 73,
                        defaults: {
                            labelSeparator: ' ',
                            labelAlign: 'left',
                            labelWidth: 48,
                            width: 98,
                            margin: '0 4 4 0'
                        },
                        items: [{
                            xtype: 'numberfield',
                            fieldLabel: me.t('Top'),
                            name: 'marginTop'
                        }, {
                            xtype: 'combobox',
                            name: 'marginTopUnits',
                            queryMode: 'local',
                            width: 48,
                            editable: false,
                            allowBlank: false,
                            emptyText: i18next.t('viewer_admin_htmleditorimage_19'),
                            value: 'px',
                            store: unitsStore,
                            displayField: 'name',
                            valueField: 'value'
                        }, {
                            xtype: 'numberfield',
                            fieldLabel: me.t('Right'),
                            name: 'marginRight'
                        }, {
                            xtype: 'combobox',
                            name: 'marginRightUnits',
                            queryMode: 'local',
                            width: 48,
                            editable: false,
                            allowBlank: false,
                            emptyText: i18next.t('viewer_admin_htmleditorimage_20'),
                            value: 'px',
                            store: unitsStore,
                            displayField: 'name',
                            valueField: 'value'
                        }, {
                            xtype: 'numberfield',
                            fieldLabel: me.t('Bottom'),
                            name: 'marginBottom'
                        }, {
                            xtype: 'combobox',
                            name: 'marginBottomUnits',
                            queryMode: 'local',
                            editable: false,
                            allowBlank: false,
                            width: 48,
                            emptyText: i18next.t('viewer_admin_htmleditorimage_21'),
                            value: 'px',
                            store: unitsStore,
                            displayField: 'name',
                            valueField: 'value'
                        }, {
                            xtype: 'numberfield',
                            fieldLabel: me.t('Left'),
                            name: 'marginLeft'
                        }, {
                            xtype: 'combobox',
                            name: 'marginLeftUnits',
                            queryMode: 'local',
                            editable: false,
                            allowBlank: false,
                            width: 48,
                            emptyText: i18next.t('viewer_admin_htmleditorimage_22'),
                            value: 'px',
                            store: unitsStore,
                            displayField: 'name',
                            valueField: 'value'
                        }]
                    }]
                }]
            }],
			dockedItems: [{
                xtype: 'container',
                dock: 'bottom',
                padding: 4,
                items: [{
                    xtype: 'button',
                    style: {
                        'float': 'right'
                    },
                    text: me.t('Cancel'),
                    handler: me.close,
                    scope: me
                }, {
                    xtype: 'button',
                    style: {
                        'float': 'right',
                        'margin-right': '8px'
                    },
                    text: me.t('OK'),
                    formBind: true,
                    handler: function () {
                        me.fireEvent('imageloaded');
                    },
                    scope: me
                }]
            }]
        }];
		
        me.callParent(arguments);
        me.setTitle(me.t('Insert/Edit Image'));
    },
	
	/**
     * Returns the current image with all the data specified in the form. (Size, borders, padding e.t.c)
     * @return {HTMLImageObject} 
     */
    getImage: function () {
        // we have to create the node on iframe's document or Opera will explode!
        var image = this.iframeDoc.createElement("img");
        var values = this.down('form').getForm().getValues();

        // set image attrs
        image.setAttribute('src', values['src']);
        if (values['title']) image.setAttribute('title', values['title']);
        if (values['className']) image.className = values['className'];
        if (values['display']) image.style.display = values['display'];
        if (values['width']) image.style.width = values['width'] + values['widthUnits'];
        if (values['height']) image.style.height = values['height'] + values['heightUnits'];
        if (values['paddingTop']) image.style.paddingTop = values['paddingTop'] + values['paddingTopUnits'];
        if (values['paddingBottom']) image.style.paddingBottom = values['paddingBottom'] + values['paddingBottomUnits'];
        if (values['paddingLeft']) image.style.paddingLeft = values['paddingLeft'] + values['paddingLeftUnits'];
        if (values['paddingRight']) image.style.paddingRight = values['paddingRight'] + values['paddingRightUnits'];
        if (values['marginTop']) image.style.marginTop = values['marginTop'] + values['marginTopUnits'];
        if (values['marginBottom']) image.style.marginBottom = values['marginBottom'] + values['marginBottomUnits'];
        if (values['marginLeft']) image.style.marginLeft = values['marginLeft'] + values['marginLeftUnits'];
        if (values['marginRight']) image.style.marginRight = values['marginRight'] + values['marginRightUnits'];
        if (values['cssFloat'] != 'none') {
            if (Ext.isIE) {
                image.style.styleFloat = values['float'];
            } else image.style.cssFloat = values['float'];
        }

        //internet explorer add this two attrs, and we dont need them
        image.removeAttribute("width");
        image.removeAttribute("height");

        return image;
    },
	
	//private
	_comboExpand: function (combo, options) {
		// I have to do this here because if I do store.load after Image Upload or Image Delete, the paging toolbar disappears.
		var me = this;
		if (combo.needsRefresh) {
			combo.store.currentPage = 1;
			combo.store.load({
				start: 0,
				limit: me.pageSize,
				page: 1
			})
		} else combo.needsRefresh = false;
	},
	
	//private
	_comboChange: function (combo, oldValue, newValue) {
		// in ie8 sometimes this event is fired and I dont know why. So if newValue is not defined I just ignore it.
		if (newValue == undefined) return;
		this._setPreviewImage(combo.getValue(), true);
	},
	
	//private
	_comboSelect: function(combo){
		this._setPreviewImage(combo.getValue(), true);
	},
	
	//private
	_attachOnLoadEvent: function (comp) {
		var flyImg = Ext.fly(comp.getEl().dom);
		comp.mon(flyImg, 'load', this._resizePreviewImage, comp);
	},
	
	//private
	// loads the selected image info into the form
    _loadImageDetails: function () {

        var image = this.imageToEdit;

        //if user has an image selected get the image attrs
        if (image != "") {

            var cssFloat = "";

            if (!image.style) image.style = new Object();

            if (Ext.isIE) {
                cssFloat = image.style.styleFloat ? image.style.styleFloat : 'none';
            } else {
                cssFloat = image.style.cssFloat ? image.style.cssFloat : 'none';
            }

            var values = {
                'display': image.style.display ? image.style.display : '',
                'widthUnits': image.style.width ? image.style.width.replace(/[\d.]/g, "") : 'px',
                'display': image.style.display ? image.style.display : '',
                'widthUnits': image.style.width ? image.style.width.replace(/[\d.]/g, "") : 'px',
                'heightUnits': image.style.height ? image.style.height.replace(/[\d.]/g, "") : 'px',
                'paddingTop': image.style.paddingTop ? image.style.paddingTop.replace(/[^\d.]/g, "") : '',
                'paddingTopUnits': image.style.paddingTop ? image.style.paddingTop.replace(/[\d.]/g, "") : 'px',
                'paddingLeft': image.style.paddingLeft ? image.style.paddingLeft.replace(/[^\d.]/g, "") : '',
                'paddingLeftUnits': image.style.paddingLeft ? image.style.paddingLeft.replace(/[\d.]/g, "") : 'px',
                'paddingBottom': image.style.paddingBottom ? image.style.paddingBottom.replace(/[^\d.]/g, "") : '',
                'paddingBottomUnits': image.style.paddingBottom ? image.style.paddingBottom.replace(/[\d.]/g, "") : 'px',
                'paddingRight': image.style.paddingRight ? image.style.paddingRight.replace(/[^\d.]/g, "") : '',
                'paddingRightUnits': image.style.paddingRight ? image.style.paddingRight.replace(/[\d.]/g, "") : 'px',
                'marginTop': image.style.marginTop ? image.style.marginTop.replace(/[^\d.]/g, "") : '',
                'marginTopUnits': image.style.marginTop ? image.style.marginTop.replace(/[\d.]/g, "") : 'px',
                'marginLeft': image.style.marginLeft ? image.style.marginLeft.replace(/[^\d.]/g, "") : '',
                'marginLeftUnits': image.style.marginLeft ? image.style.marginLeft.replace(/[\d.]/g, "") : 'px',
                'marginBottom': image.style.marginBottom ? image.style.marginBottom.replace(/[^\d.]/g, "") : '',
                'marginBottomUnits': image.style.marginBottom ? image.style.marginBottom.replace(/[\d.]/g, "") : 'px',
                'marginRight': image.style.marginRight ? image.style.marginRight.replace(/[^\d.]/g, "") : '',
                'marginRightUnits': image.style.marginRight ? image.style.marginRight.replace(/[\d.]/g, "") : 'px',
                'title': image.title,
                'className': image.className.replace("x-htmleditor-imageupload-bordeResize", "").replace("x-htmleditor-imageupload-bordeSelect", ""),
                'float': cssFloat
            };

            this.down('form').getForm().setValues(values);

            // show the image preview
            this._setPreviewImage(image.src, false);

            // I do this here because I dont want to fire the change events
            // In IE 8 combobox change event is fired even with setRawValue. Bug?
            this.down('[name=src]').setRawValue(image.src);
            this.down('[name=width]').setRawValue(image.style.width ? image.style.width.replace(/[^\d.]/g, "") : image.width);
            this.down('[name=height]').setRawValue(image.style.height ? image.style.height.replace(/[^\d.]/g, "") : image.height);


            this.down('#fieldOptions').expand();

        } else this.down('#fieldOptions').collapse();
    },
	
	//private
	//enables/disables constrain proportion toggle
    _toggleConstrain: function (btn) {
        var me = this;
        if (!btn.pressed) {
            btn.removeCls('x-htmleditor-imageupload-constrain');
            btn.addCls('x-htmleditor-imageupload-unconstrain');
        } else {
            btn.removeCls('x-htmleditor-imageupload-unconstrain');
            btn.addCls('x-htmleditor-imageupload-constrain');

            me.down('[name=width]').setRawValue(me.down('#naturalWidth').getValue());
            me.down('[name=height]').setRawValue(me.down('#naturalHeight').getValue());
        }
    },
	
	//private
	_deleteImage:function (ev, a) {
		
		var me = this;
		
		if (!me.disableDelete){
			Ext.Msg.show({
				title: me.t('Confirmation'),
				msg: me.t('Are you sure you want to delete this image?'),
				buttons: Ext.Msg.YESNO,
				closable: false,
				fn: function (btn) {
					if (btn == 'yes') {
						Ext.Ajax.request({
							url: me.managerUrl,
							method: 'POST',
							params: {
								'action': 'delete',
								'image': a.getAttribute ? a.getAttribute('img_fullname') : a
							},
							success: function (response) {
								
								var result = Ext.JSON.decode(response.responseText);
								if(result.success)
								{
									// delete the image from the list
									var combo = me.down('[name=src]');

									//if I do here a combo.store.load() to refresh, the paging toolbar disappears
									// so I'll do it on combo expand event
									combo.needsRefresh = true;

									combo.setValue('');
									me.down('form').getForm().reset();
									me._setPreviewImage('blank', true);
								}else{
									Ext.Msg.alert(me.t('Error'), 'Error: ' + result.errors);
								}
							}
						});
					}
				}
			});
		}
	},
	
	//private
	//method to upload the image to the server
    _uploadImage: function (fileField) {

        var me = this;

        var form = fileField.up('form').getForm();
        if (form.isValid()) {
            form.submit({
                url: me.submitUrl + '?action=upload',
                waitMsg: me.t('Uploading your photo...'),
                success: function (fp, o) {
                    Ext.Msg.alert('Success', me.t('Your photo has been uploaded.'));
                    var combo = me.down('[name=src]');
                    combo.needsRefresh = true;
                    combo.setRawValue(o.result.data['src']);
                    me._setPreviewImage(o.result.data['src'], true);
                },
                failure: function (form, action) {
                    if (action.result) Ext.Msg.alert(me.t('Error'), 'Error: ' + action.result.errors);
                    me.down('[name=upload]').reset();
                }
            });
        }
    },
	
	//private
	_serverAction: function (params) {

        var me = this;

		Ext.Ajax.request({
			url: me.managerUrl,
			method: 'POST',
			params: params,
			success: function (response) {
				
				var result = Ext.JSON.decode(response.responseText);
				
				if(result.success)
				{
					var combo = me.down('[name=src]');
                    combo.needsRefresh = true;
                    combo.setRawValue(result.data['src']);
                    me._setPreviewImage(result.data['src'], true);
					
				}else{
					Ext.MessageBox.alert(i18next.t('viewer_admin_htmleditorimage_23'), i18next.t('viewer_admin_htmleditorimage_24') + result.errors);
				}
			}
		});
	},
	
	//private
	_rotateImageClick: function(){
		var me = this;
		me._serverAction({
			action:'rotate',
			image: me.down('[name=src]').getValue()
		});
	},
	
	//private
	_resizeImageClick: function(){
		var me = this;
		var width = me.down('[name=width]').getValue();
		var height = me.down('[name=height]').getValue();
		
		Ext.Msg.show({
			title: me.t('Confirmation'),
			msg: me.t('Image will be permanently resized to: ')+width+'x'+height+' px',
			buttons: Ext.Msg.YESNO,
			closable: false,
			fn: function (btn) {
				if (btn == 'yes') {
						me._serverAction({
						action:'resize',
						image: me.down('[name=src]').getValue(),
						width: width,
						height: height
					});			
				}
			}
		});	
	},
	
	//private
	_deleteImageClick: function(){
		var me = this;
		var src = me.down('[name=src]').getValue();
		var imageName = src.substring(src.lastIndexOf('/')+1);
		me._deleteImage(null,imageName); 
	},
	
	//private
	_openCropDialogClick: function()
	{
		 var me = this;
		 var imageSrc = me.down('[name=src]').getValue();
		  
		 me.cropDialog = Ext.create('Ext.ux.form.HtmlEditor.ImageCropDialog', {
            imgSrc: imageSrc,
			managerUrl: me.managerUrl
        });
		
		me.cropDialog.on('imagecropped', function () {
			
			var combo = me.down('[name=src]');
            combo.needsRefresh = true;
            me._setPreviewImage(me.cropDialog.imgSrc, true);
			me.cropDialog.close()
		});
		
		me.cropDialog.show();
	},
	
	//private
	//Check if the image size respects aspect ratio
    _checkConstrain: function (combo, newValue, oldValue) {
        var sizeField = combo.up('form').down('[name=' + combo.constrainName + ']');
        if (!newValue || !sizeField.getValue()) return;
        if (newValue <= 0) {
            combo.setRawValue(oldValue);
            return;
        }
        if (combo.up('form').down('#constraintProp').pressed) {
            var ratio = combo.up('form').down('#ratio').getValue();

            // if I dont suspendEvents IE 8 fires change event and this function enters in a loop
            sizeField.suspendEvents();
            sizeField.setRawValue(Math.round((ratio * newValue)));
        }
    },
	
	//private
	//Loads selected image on preview panel
    _setPreviewImage: function (src, resetImageSize) {
        if (!this.previewComponent) this.previewComponent = this.down('#vistaPrevia');
        this.previewComponent.setWidth('');
        this.previewComponent.setHeight('');

        this.down('#vistaPrevia').resetImageSize = resetImageSize;
       
		// when I change the src the _resizePreviewImage method will be fired.
        // It happens because _resizePreviewImage is attached to the image onload event
		if(!(/^https:\/\//.test(src))) this.previewComponent.setSrc(src+'?'+Math.floor(Math.random()*111111));
		else this.previewComponent.setSrc(src);
    },
	
	//private
	//Resizes the image to fit on the preview panel
    _resizePreviewImage: function (evt, el) {
        var width, height;
        var comp = this;
        var myForm = comp.up('form');
        var image = el;
        var maxWidth = 124,
            maxHeight = 124;
        var constrainComp = myForm.down('#constraintProp');
        var widthComp = myForm.down('[name=width]');
        var heightComp = myForm.down('[name=height]')

        // save real image size
        myForm.down('#naturalWidth').setValue(image.width);
        myForm.down('#naturalHeight').setValue(image.height);
        myForm.down('#ratio').setValue(image.height / image.width);
        myForm.down('#realSize').setValue(image.width + 'x' + image.height);
		
		// enable server image editing buttons
		if (!comp.disableServerSideEdit){
			if(image.src!='' && image.src!='blank' && image.src.search(document.domain) >= 0)
			{
                if(myForm.down('#cropButton')) myForm.down('#cropButton').enable();
				if(myForm.down('#rotateButton')) myForm.down('#rotateButton').enable();
				if(myForm.down('#resizeButton')) myForm.down('#resizeButton').enable();
				if(myForm.down('#deleteButton')) myForm.down('#deleteButton').enable();
			}
			else{
				if(myForm.down('#cropButton')) myForm.down('#cropButton').disable();
				if(myForm.down('#rotateButton')) myForm.down('#rotateButton').disable();
				if(myForm.down('#resizeButton')) myForm.down('#resizeButton').disable();
				if(myForm.down('#deleteButton')) myForm.down('#deleteButton').disable();
			}
		}

        if (comp.resetImageSize == true) {
            widthComp.setRawValue(image.width);
            heightComp.setRawValue(image.height);
            myForm.down('[name=widthUnits]').setRawValue('px');
            myForm.down('[name=heightUnits]').setRawValue('px');

        } else {
            // toggle off constrain button if image ratio is different		
            if (Math.round(widthComp.getValue() / heightComp.getValue()) != Math.round(image.width / image.height)) constrainComp.toggle(false);
        }

        if (image.width >= image.height) {
            width = image.width < maxWidth ? image.width : maxWidth;
            height = Math.ceil((width / image.width) * image.height)
        } else {
            height = image.height < maxHeight ? image.height : maxHeight;
            width = Math.ceil((height / image.height) * image.width)
        }

        comp.setWidth(width);
        comp.setHeight(height);
    }
});