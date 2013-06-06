/**
 * @author Shea Frederick - http://www.vinylfox.com
 * @class Ext.ux.form.HtmlEditor.MidasCommand
 * @extends Ext.util.Observable
 * <p>A base plugin for extending to create standard Midas command buttons.</p>
 * http://msdn.microsoft.com/en-us/library/ms533049%28v=VS.85%29.aspx
 * http://www.mozilla.org/editor/midas-spec.html
 */
Ext.ns('Ext.ux.form.HtmlEditor');
Ext.ux.form.HtmlEditor.Table = Ext.extend(Ext.util.Observable, {
    // Table language text
    langTitle       : 'Insert Table',
    langInsert      : 'Insert',
    langCancel      : 'Cancel',
    langRows        : 'Rows',
    langColumns     : 'Columns',
    langBorder      : 'Border',
    langCellLabel   : 'Label Cells',
    // private
    cmd: 'table',
    /**
     * @cfg {Boolean} showCellLocationText
     * Set true to display row and column informational text inside of newly created table cells.
     */
    showCellLocationText: true,
    /**
     * @cfg {String} cellLocationText
     * The string to display inside of newly created table cells.
     */
    cellLocationText: '{0}&nbsp;-&nbsp;{1}',
    /**
     * @cfg {Array} tableBorderOptions
     * A nested array of value/display options to present to the user for table border style. Defaults to a simple list of 5 varrying border types.
     */
    tableBorderOptions: [['none', 'Geen'], ['1px solid #000', 'Dun'], ['2px solid #000', 'Dik'], ['1px dashed #000', 'Gestreept'], ['1px dotted #000', 'Gestippeld']],
    // private
    init: function(cmp){
        this.cmp = cmp;
        this.cmp.on('render', this.onRender, this);
    },
    // private
    onRender: function(){
        var btn = this.cmp.getToolbar().add({
            xtype: 'button',
            iconCls: 'x-edit-table',
            handler: function(){
                if (!this.tableWindow){
                    this.tableWindow = new Ext.Window({
                        title: this.langTitle,
                        closeAction: 'hide',
                        width: 235,
                        items: [{
                            itemId: 'insert-table',
                            xtype: 'form',
                            border: false,
                            plain: true,
                            bodyStyle: 'padding: 10px;',
                            labelWidth: 65,
                            labelAlign: 'right',
                            items: [{
                                xtype: 'numberfield',
                                allowBlank: false,
                                allowDecimals: false,
                                fieldLabel: this.langRows,
                                name: 'row',
                                width: 200
                            }, {
                                xtype: 'numberfield',
                                allowBlank: false,
                                allowDecimals: false,
                                fieldLabel: this.langColumns,
                                name: 'col',
                                width: 200
                            }, {
                                xtype: 'combo',
                                fieldLabel: this.langBorder,
                                name: 'border',
                                forceSelection: true,
                                mode: 'local',
                                store: new Ext.data.ArrayStore({
                                    autoDestroy: true,
                                    fields: ['spec', 'val'],
                                    data: this.tableBorderOptions
                                }),
                                triggerAction: 'all',
                                value: 'none',
                                displayField: 'val',
                                valueField: 'spec',
                                anchor: '-15'
                            }, {
                            	xtype: 'checkbox',
                            	fieldLabel: this.langCellLabel,
                            	checked: this.showCellLocationText,
                            	listeners: {
                            		check: function(){
                            			this.showCellLocationText = !this.showCellLocationText;
                            		},
                            		scope: this
                            	}
                            }]
                        }],
                        buttons: [{
                            text: this.langInsert,
                            handler: function(){
                                var frm = this.tableWindow.getComponent('insert-table').getForm();
                                if (frm.isValid()) {
                                    var border = frm.findField('border').getValue();
                                    var rowcol = [frm.findField('row').getValue(), frm.findField('col').getValue()];
                                    if (rowcol.length == 2 && rowcol[0] > 0 && rowcol[1] > 0) {
                                        
                                        var doc = this.cmp.getDoc();
                                        var win = this.cmp.win;
                                        
                                        var table = doc.createElement('table');
                                        table.style.borderCollapse = 'collapse';
                                        table.style.width = '100%';

                                        var cellText = '&nbsp;';
                                        if (this.showCellLocationText){ cellText = this.cellLocationText; }
                                        for (var row = 0; row < rowcol[0]; row++) {
                                            var tableRow = doc.createElement('tr');
                                            for (var col = 0; col < rowcol[1]; col++) {
                                                var tableCell = doc.createElement('td');
                                                tableCell.style.border = border;
                                                tableCell.innerHTML = Ext.String.format(cellText, (row+1), String.fromCharCode(col+65));
                                                tableRow.appendChild(tableCell);
                                            }
                                            table.appendChild(tableRow);
                                        }
                                        
                                        // EDIT: copied this code from HtmlEditorImage
                                        // insertAtCursor function is completely useless for this purpose, so I need to write all this stuff to insert html at caret position	
                                        // I need to know if the browser uses the W3C way or the Internet Explorer method
                                        var sel = "";
                                        var range = "";
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
                                            range.insertNode(table);
                                        } else if (ieBrowser) {
                                            //it's compulsory to get the focus before creating the range, if not we'll lose the caret position
                                            win.focus();
                                            sel = doc.selection;
                                            range = sel.createRange();
                                            win.focus();
                                            range.select();
                                            range.pasteHTML(table.outerHTML);
                                        }
                                        
                                    }
                                    this.tableWindow.hide();
                                }else{
                                    if (!frm.findField('row').isValid()){
                                        frm.findField('row').getEl().frame();
                                    } else if (!frm.findField('col').isValid()){
                                        frm.findField('col').getEl().frame();
                                    }
                                }
                            },
                            scope: this
                        }, {
                            text: this.langCancel,
                            handler: function(){
                                this.tableWindow.hide();
                            },
                            scope: this
                        }]
                    });
                
                }else{
                    this.tableWindow.getEl().frame();
                }
                this.tableWindow.show();
            },
            scope: this,
            tooltip: this.langTitle,
            overflowText: this.langTitle
        });
    }
});