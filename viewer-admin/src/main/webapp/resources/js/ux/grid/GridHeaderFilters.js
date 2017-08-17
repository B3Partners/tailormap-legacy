/**
 * Plugin that enable filters on the grid header.<br>
 * The header filters are integrated with new Ext4 <code>Ext.data.Store</code> filters.<br>
 * It enables:
 * <ul>
 * <li>Instances of <code>Ext.form.field.Field</code> subclasses that can be used as filter fields into column header</li>
 * <li>New grid methods to control header filters (get values, update, apply)</li>
 * <li>New grid events to intercept plugin and filters events</li>
 * </ul>
 * 
 * The plugins also enables the stateful feature for header filters so filter values are stored with grid status if grid is stateful.<br>
 * 
 * <h2>Enable filters on grid columns</h2>
 * The plugin checks the <code>filter</code> attribute that can be included into each column configuration.
 * The value of this attribute can be a <code>Ext.form.field.Field</code> configuration or an array of field configurations to enable more
 * than one filter on a single column.<br>
 * Field <code>readOnly</code> and <code>disabled</code> attributes are managed by the plugin to avoid filter update or filter apply.
 * The filter field configuration also supports some special attributes to control filter configuration:
 * <ul>
 * <li>
 *     <code>filterName</code>: the name of the filter that will be used when the filter is applied to store filters (as <code>property</code> of <code>Ext.util.Filter</code> attribute).
 *     If this attribute is not specified the column <code>dataIndex</code> will be used. <b>NOTE</b>: The filter name must be unique in a grid header. The plugin doesn't support correctly filters
 *     with same name.
 * </li>
 * </ul>
 * On the grid configuration the {@link #headerFilters} attribute is supported. The value must be an object with name-values pairs for filters to initialize. 
 * It can be used to initialize header filters in grid configuration.
 * 
 * <h2>Plugin configuration</h2>
 * The plugin supports also some configuration attributes that can be specified when the plugin is created (with <code>Ext.create</code>).
 * These parameters are:
 * <ul>
 * <li>{@link #stateful}: Enables filters save and load when grid status is managed by <code>Ext.state.Manager</code>. If the grid is not stateful this parameter has no effects</li>
 * <li>{@link #reloadOnChange}: Intercepts the special {@link #headerfilterchange} plugin-enabled grid event and automatically reload or refresh grid Store. Default true</li>
 * <li>{@link #ensureFilteredVisible}: If one filter on column is active, the plugin ensures that this column is not hidden (if can be made visible).</li>
 * <li>{@link #enableTooltip}: Enable active filters description tootip on grid header</li>
 * </ul>
 * 
 * <h2>Enabled grid methods</h2>
 * <ul>
 *     <li><code>setHeaderFilter(name, value, reset)</code>: Set a single filter value</li>
 *     <li><code>setHeaderFilters(filters, reset)</code>: Set header filters</li>
 *     <li><code>getHeaderFilters()</code>: Set header filters</li>
 *     <li><code>getHeaderFilterField(filterName)</code>: To access filter field</li>
 *     <li><code>resetHeaderFilters()</code>: Resets filter fields calling reset() method of each one</li>
 *     <li><code>clearHeaderFilters()</code>: Clears filter fields</li>
 *     <li><code>applyHeaderFilters()</code>: Applies filters values to Grid Store. The store will be also refreshed or reloaded if {@link #reloadOnChange} is true</li>
 * </ul>
 * 
 * <h2>Enabled grid events</h2>
 * <ul>
 *     <li>{@link #headerfilterchange} : fired by Grid when some header filter changes value</li>
 *     <li>{@link #headerfiltersrender} : fired by Grid when header filters are rendered</li>
 *     <li>{@link #beforeheaderfiltersapply} : fired before filters are applied to Grid Store</li>
 *     <li>{@link #headerfiltersapply} : fired after filters are applied to Grid Store</li>
 * </ul>
 * 
 * @author Damiano Zucconi - http://www.isipc.it
 * @version 0.1.0
 */
Ext.define('Ext.ux.grid.GridHeaderFilters',{
    
    ptype: 'gridheaderfilters',
    
    alternateClassName: ['Ext.ux.grid.plugin.HeaderFilters', 'Ext.ux.grid.header.Filters'],
    
    requires: [
        'Ext.container.Container',
        'Ext.tip.ToolTip'
    ],

    grid: null,
    
    fields: null,
    
    containers: null,
    
    storeLoaded: false,
    
    filterFieldCls: 'x-gridheaderfilters-filter-field',
    
    filterContainerCls: 'x-gridheaderfilters-filter-container',
    
    filterRoot: 'data',
    
    tooltipTpl: '{[values.filters.length == 0 ? this.text.noFilter : "<b>"+this.text.activeFilters+"</b>"]}<br><tpl for="filters"><tpl if="value != \'\'">{[values.label ? values.label : values.property]} = {value}<br></tpl></tpl>',
    
    lastApplyFilters: null,
    
    text: {
        activeFilters: 'Active filters',
        noFilter: 'No filter'
    },
    
    /**
    * @cfg {Boolean} stateful
    * Specifies if headerFilters values are saved into grid status when filters changes.
    * This configuration can be overridden from grid configuration parameter <code>statefulHeaderFilters</code> (if defined).
    * Used only if grid <b>is stateful</b>. Default = true.
    * 
    */
    stateful: true,
    
   /**
   * @cfg {Boolean} reloadOnChange
   * Specifies if the grid store will be auto-reloaded when filters change. The store
   * will be reloaded only if is was already loaded. If the store is local or it doesn't has remote filters
   * the store will be always updated on filters change.
   * 
   */
   reloadOnChange: true,
        
    /**
   * @cfg {Boolean} ensureFilteredVisible
   * If the column on wich the filter is set is hidden and can be made visible, the
   * plugin makes the column visible.
   */
    ensureFilteredVisible: true,
        
    /**
    * @cfg {Boolean} enableTooltip
    * If a tooltip with active filters description must be enabled on the grid header
    */
    enableTooltip: true,
    
   constructor: function(cfg) 
   {
       if(cfg)
       {
           Ext.apply(this,cfg);
       }
   },
    
   init: function(grid)
   {
       this.grid = grid;
        
        /*var storeProxy = this.grid.getStore().getProxy();
        if(storeProxy && storeProxy.getReader())
        {
            var reader = storeProxy.getReader();
            this.filterRoot = reader.root ? reader.root : undefined;
        }*/
        /**
         * @cfg {Object} headerFilters
         * <b>Configuration attribute for grid</b>
         * Allows to initialize header filters values from grid configuration.
         * This object must have filter names as keys and filter values as values.
         * If this plugin has {@link #stateful} enabled, the saved filters have priority and override these filters.
         * Use {@link #ignoreSavedHeaderFilters} to ignore current status and apply these filters directly.
         */
       if(!grid.headerFilters)
       {
           grid.headerFilters = {};
       }

       if(Ext.isBoolean(grid.statefulHeaderFilters))
       {
           this.setStateful(grid.statefulHeaderFilters);
       }

        this.grid.on({
            scope: this,
            afterrender: this.renderFilters,
            columnresize: this.resizeFilterContainer,
            beforedestroy: this.onDestroy,
            beforestatesave: this.saveFilters,
            afterlayout: this.adjustFilterWidth
        });
        
        this.grid.getStore().on({
            scope: this,
            load: this.onStoreLoad
        });
        
        if(this.reloadOnChange)
        {
            this.grid.on('headerfilterchange',this.reloadStore, this);
        }
        
        if(this.stateful)
        {
            this.grid.addStateEvents('headerfilterchange');
        }
        
        //Enable new grid methods
        Ext.apply(this.grid, 
        {
            headerFilterPlugin: this,
            setHeaderFilter: function(sName, sValue)
            {
                if(!this.headerFilterPlugin) return;
                var fd = {};
                fd[sName] = sValue;
                this.headerFilterPlugin.setFilters(fd);
            },
            /**
             * Returns a collection of filters corresponding to enabled header filters.
             * If a filter field is disabled, the filter is not included.
             * <b>This method is enabled on Grid</b>.
             * @method
             * @return {Array[Ext.util.Filter]} An array of Ext.util.Filter
             */
            getHeaderFilters: function()
            {
                if(!this.headerFilterPlugin) return null;
                return this.headerFilterPlugin.getFilters();
            },
            /**
             * Set header filter values
             * <b>Method enabled on Grid</b>
             * @method
             * @param {Object or Array[Object]} filters An object with key/value pairs or an array of Ext.util.Filter objects (or corresponding configuration).
             * Only filters that matches with header filters names will be set
             */
            setHeaderFilters: function(obj)
            {
                if(!this.headerFilterPlugin) return;
                this.headerFilterPlugin.setFilters(obj);
            },
            getHeaderFilterField: function(fn)
            {
                if(!this.headerFilterPlugin) return;
                if(this.headerFilterPlugin.fields[fn]) return this.headerFilterPlugin.fields[fn];
                else return null;
            },
            resetHeaderFilters: function()
            {
                if(!this.headerFilterPlugin) return;
                this.headerFilterPlugin.resetFilters();
            },
            clearHeaderFilters: function()
            {
                if(!this.headerFilterPlugin) return;
                this.headerFilterPlugin.clearFilters();
            },
            applyHeaderFilters: function()
            {
                if(!this.headerFilterPlugin) return;
                this.headerFilterPlugin.applyFilters();
            }
        });
   },
    
   
    
    saveFilters: function(grid, status)
    {
        status.savedHeaderFilters = this.stateful ? this.parseFilters() : grid.savedHeaderFilters;
    },
    
    setFieldValue: function(field, value)
    {
        var column = field.column;
        if(!Ext.isEmpty(value))
        {
            field.setValue(value);
            if(!Ext.isEmpty(value) && column.hideable && !column.isVisible() && !field.isDisabled() && this.ensureFilteredVisible)
            {
                column.setVisible(true);
            }
        }
        else
        {
            field.setValue('');
        }
    },
    
    renderFilters: function()
    {
        this.destroyFilters();
        
        this.fields = {};
        this.containers = {};

        var filters = this.grid.headerFilters;
        
        /**
         * @cfg {Boolean} ignoreSavedHeaderFilters
         * <b>Configuration parameter for grid</b>
         * Allows to ignore saved filter status when {@link #stateful} is enabled.
         * This can be useful to use {@link #headerFilters} configuration directly and ignore status.
         * The state will still be saved if {@link #stateful} is enabled.
         */
        if(this.stateful && this.grid.savedHeaderFilters && !this.grid.ignoreSavedHeaderFilters)
        {
            Ext.apply(filters, this.grid.savedHeaderFilters);
        }
        
        var storeFilters = this.parseStoreFilters();
        filters = Ext.apply(storeFilters, filters);
        
        var columns = this.grid.headerCt.getGridColumns();
        for(var c=0; c < columns.length; c++)
        {
            var column = columns[c];
            if(column.filter)
            {
                var filterContainerConfig = {
                    id: column.id + '-filtersContainer',
                    cls: this.filterContainerCls,
                    layout: 'anchor',
                    bodyStyle: {'background-color': 'transparent'},
                    border: false,
                    width: column.getWidth(),
                    listeners: {
                        scope: this,
                        element: 'el',
                        mousedown: function(e)
                        {
                            e.stopPropagation();
                        },
                        click: function(e)
                        {
                            e.stopPropagation();
                        },
                        keydown: function(e){
                             e.stopPropagation();
                        },
                        keypress: function(e){
                             e.stopPropagation();
                             if(e.getKey() == Ext.EventObject.ENTER)
                             {
                                 this.onFilterContainerEnter();
                             }
                        },
                        keyup: function(e){
                             e.stopPropagation();
                        }
                    },
                    items: []
                }
                
                var fca = [].concat(column.filter);
                    
                for(var ci = 0; ci < fca.length; ci++)
                {
                    var fc = fca[ci];
                    Ext.applyIf(fc, {
                        filterName: column.dataIndex,
                        fieldLabel: column.text || column.header,
                        hideLabel: fca.length == 1
                    });
                    var initValue = Ext.isEmpty(filters[fc.filterName]) ? null : filters[fc.filterName];
                    Ext.apply(fc, {
                        cls: this.filterFieldCls,
                        itemId: fc.filterName,
                        anchor: '-1'
                    });
                    var filterField = Ext.ComponentManager.create(fc);
                    filterField.column = column;
                    this.setFieldValue(filterField, initValue);
                    this.fields[filterField.filterName] = filterField;
                    filterContainerConfig.items.push(filterField);
                }
                
                var filterContainer = Ext.create('Ext.container.Container', filterContainerConfig);
                filterContainer.render(column.el);
                this.containers[column.id] = filterContainer;
                column.setPadding = Ext.Function.createInterceptor(column.setPadding, function(h){return false});
            }
        }
        
        if(this.enableTooltip)
        {
            this.tooltipTpl = new Ext.XTemplate(this.tooltipTpl,{text: this.text});
            this.tooltip = Ext.create('Ext.tip.ToolTip',{
                target: this.grid.headerCt.el,
                //delegate: '.'+this.filterContainerCls,
                renderTo: Ext.getBody()
            });        
            this.grid.on('headerfilterchange',function(grid, filters)
            {
                var sf = filters.filterBy(function(filt){
                    return !Ext.isEmpty(filt.value);
                });
                this.tooltip.update(this.tooltipTpl.apply({filters: sf.getRange()}));
            },this);
        }
        
        this.applyFilters();
        this.grid.fireEvent('headerfiltersrender',this.grid,this.fields,this.parseFilters());
    },
    
    onStoreLoad: function()
    {
        this.storeLoaded = true;
    },
    
    onFilterContainerEnter: function()
    {
        this.applyFilters();
    },
    
    resizeFilterContainer: function(headerCt,column,w,opts)
    {
        if(!this.containers) return;
        var cnt = this.containers[column.id];
        if(cnt)
        {
            cnt.setWidth(w);
            cnt.updateLayout();
        }
    },
    
    destroyFilters: function()
    {
        if(this.fields)
        {
            for(var f in this.fields)
                Ext.destroy(this.fields[f]);
            delete this.fields;
        }
    
        if(this.containers)
        {
            for(var c in this.containers)
                Ext.destroy(this.containers[c]);
            delete this.containers;
        }
    },
    
    onDestroy: function()
    {
        this.destroyFilters();
        Ext.destroy(this.tooltip, this.tooltipTpl);
    },
    
    adjustFilterWidth: function() 
    {        
        if(this.containers == null) return;
        var columns = this.grid.headerCt.getGridColumns();        
        for(var c=0; c < columns.length; c++) 
        {           
            var column = columns[c];            
            if (column.filter && column.flex) 
            {               
                this.containers[column.id].setWidth(column.getWidth()-1);            
            }
          }
     },
   
    resetFilters: function()
    {
        if(!this.fields) return;
        for(var fn in this.fields)
        {
            var f = this.fields[fn];
            if(!f.isDisabled() && !f.readOnly && Ext.isFunction(f.reset))
                f.reset();
        }
        this.applyFilters();
    },
    
    clearFilters: function()
    {
        if(!this.fields) return;
        for(var fn in this.fields)
        {
            var f = this.fields[fn];
            if(!f.isDisabled() && !f.readOnly)
                f.setValue('');
        }
        this.applyFilters();
    },
    
    setFilters: function(filters)
    {
        if(!filters) return;
        
        if(Ext.isArray(filters))
        {
            var conv = {};
            Ext.each(filters, function(filter) {
                var property = filter.getProperty();
                if(property)
                {
                    conv[property] = filter.getValue();
                }
            });
            filters = conv;
        }
        else if(!Ext.isObject(filters))
        {
            return;
        }




        this.initFilterFields(filters);
        this.applyFilters();
    },
    
    getFilters: function()
    {
        var filters = this.parseFilters();
        var res = new Ext.util.MixedCollection();
        for(var fn in filters)
        {
            var value = filters[fn];
            var field = this.fields[fn];
            res.add(new Ext.util.Filter({
                property: fn,
                value: value,
                root: this.filterRoot,
                label: field.fieldLabel
            }));
        }
        return res;
    },
    
    parseFilters: function()
    {
        var filters = {};
        if(!this.fields) return filters;
        for(var fn in this.fields)
        {
            var field = this.fields[fn];
            if(!field.isDisabled())
                filters[field.filterName] = field.getValue();
        }
        return filters;
    },
    
    initFilterFields: function(filters)
    {
        if(!this.fields) return;

        for(var fn in  filters)
        {
            var value = filters[fn];
            var field = this.fields[fn];
            if(field)
            {
                this.setFieldValue(filterField, initValue);
            }
        }
    },
    
    countActiveFilters: function()
    {
        var fv = this.parseFilters();
        var af = 0;
        for(var fn in fv)
        {
            if(!Ext.isEmpty(fv[fn]))
                af ++;
        }
        return af;
    },
    
    parseStoreFilters: function()
    {
        var sf = this.grid.getStore().getFilters();
        var res = {};
        sf.each(function(filter){
            var name = filter.getProperty();
            var value = filter.getValue();
            if(name && value)
            {
                res[name] = value;            
            }
        });
        return res;
    },
    
    applyFilters: function()
    {
        var filters = this.parseFilters();
        if(this.grid.fireEvent('beforeheaderfiltersapply', this.grid, filters, this.grid.getStore()) !== false)
        {
            var storeFilters = this.grid.getStore().filters;
            var exFilters = storeFilters.clone();
            var change = false;
            var active = 0;
            for(var fn in filters)
            {
                var value = filters[fn];
                
                var sf = storeFilters.findBy(function(filter){
                    return filter.getProperty() == fn;
                });
                
                if(Ext.isEmpty(value))
                {
                    if(sf)
                    {
                        storeFilters.remove(sf);
                        change = true;
                    }
                }
                else
                {
                    var field = this.fields[fn];
                    if(!sf || sf.value != filters[fn])
                    {
                        var newSf = new Ext.util.Filter({
                            root: this.filterRoot,
                            property: fn,
                            value: filters[fn],
                            label: field.fieldLabel
                        });
                        if(sf)
                        {
                            storeFilters.remove(sf);
                        }
                        storeFilters.add(newSf);
                        change = true;
                    }
                    active ++;
                }
            }
            
            this.grid.fireEvent('headerfiltersapply', this.grid, filters, active, this.grid.getStore());
            if(change)
            {
                var curFilters = this.getFilters();
                this.grid.fireEvent('headerfilterchange', this.grid, curFilters, this.lastApplyFilters, active, this.grid.getStore());
                this.lastApplyFilters = curFilters;
            }
        }
    },
    
    reloadStore: function()
    {
        var gs = this.grid.getStore();
        if(this.grid.getStore().remoteFilter)
        {
            if(this.storeLoaded)
            {
                gs.currentPage = 1;
                gs.load();
            }
        }
        else
      {
            if(gs.filters.getCount()) 
         {
                if(!gs.snapshot)
                    gs.snapshot = gs.data.clone();
                else
                {
                    gs.currentPage = 1;
                }
            gs.data = gs.snapshot.filter(gs.filters.getRange());
            var doLocalSort = gs.sortOnFilter && !gs.remoteSort;
            if(doLocalSort) 
                {
                    gs.sort();
                }
            // fire datachanged event if it hasn't already been fired by doSort
            if (!doLocalSort || gs.sorters.length < 1) 
            {
                gs.fireEvent('datachanged', gs);
                }
            }
           else
           {
                if(gs.snapshot)
                {
                    gs.currentPage = 1;
                    gs.data = gs.snapshot.clone();
                 delete gs.snapshot;
                 gs.fireEvent('datachanged', gs);
                }
            }
        }
    }
});