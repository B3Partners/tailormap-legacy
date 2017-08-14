/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global Ext */

/**
 * A 
 * 
 */

Ext.define( "viewer.components.CQLFilterWrapper",{
    filters:null,
    logicOperators:null,
    config:{
        id:null,
        cql:null,
        operator:null,
        // Possible values: ATTRIBUTE/GEOMETRY
        type: null
    },
    constructor : function (config){
        this.initConfig(config);
        this.filters = [];
        this.logicOperators = ["AND","OR"];
        if(!this.config.type){
            this.config.type = "ATTRIBUTE";
        }
    },
    getCQL : function (){
        var val = this.getInternalCQL();
        for (var i = 0 ; i < this.logicOperators.length;i++){
            val = Ext.String.trim(val);
            var op = this.logicOperators[i];
            if(val.indexOf(op) === 0){
                val = val.substr(op.length);
            }
        }
        return val;
    },
    getCQLWithoutType : function (type){
        var val = this.getInternalCQLWithoutType(type);
        for (var i = 0 ; i < this.logicOperators.length;i++){
            val = Ext.String.trim(val);
            var op = this.logicOperators[i];
            if(val.indexOf(op) === 0){
                val = val.substr(op.length);
            }
        }
        return val;
    },
    getInternalCQLWithoutType : function (type){
        var returnValue = "";
        if(this.config.type !== type){
            if(this.config.cql !== ""){
                returnValue = " " + this.config.operator + " " + this.config.cql;
            }
        }
        for(var i = 0 ; i < this.filters.length;i++){
            var f = this.filters[i];
            if(f.type !== type){
                returnValue += f.getInternalCQLWithoutType(type);
            }
        }
        return returnValue;
    },
    getInternalCQL : function (){
        var returnValue = "";
            
        if(this.config.cql !== ""){
            returnValue = " " + this.config.operator + " " + this.config.cql;
        }
        for(var i = 0 ; i < this.filters.length;i++){
            var f = this.filters[i];
            returnValue += f.getInternalCQL();
        }
        return returnValue;
    },
    addFilter : function (filter){
        this.filters.push(filter);
    },
    removeFilter : function (filter){
        this.removeFilterById(filter.config.id);
    },
    removeFilterById : function (id){
        for(var i = 0 ; i < this.filters.length;i++){
            var f = this.filters[i];
            if(f.config.id === id){
                this.filters.splice(i,1);
                break;
            }
        }
        return this;
    },
    addOrReplace : function (filter){
        this.removeFilter(filter);
        this.addFilter(filter);
    }
});