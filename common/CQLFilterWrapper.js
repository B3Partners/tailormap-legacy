/* 
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
        operator:null
    },
    constructor : function (config){
        this.initConfig(config);
        this.filters = [];
        this.logicOperators = ["AND","OR"];
    },
    getCQL : function (){
        var val = this.getInternalCQL();
        for (var i = 0 ; i < this.logicOperators.length;i++){
            val = Ext.String.trim(val);
            var op = this.logicOperators[i];
            if(val.indexOf(op) == 0){
                val = val.substr(op.length);
            }
        }
        return val;
    },
    getInternalCQL : function (){
        var returnValue = "";
            
        if(this.cql != ""){
            returnValue = " " + this.operator + " " + this.cql;
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
        for(var i = 0 ; i < this.filters.length;i++){
            var f = this.filters[i];
            if(f.id == filter.id){
                this.filters.splice(i,1);
                break;
            }
        }
    },
    removeFilterById : function (id){
        for(var i = 0 ; i < this.filters.length;i++){
            var f = this.filters[i];
            if(f.id == id){
                this.filters.splice(i,1);
                break;
            }
        }
    },
    addOrReplace : function (filter){
        this.removeFilter(filter);
        this.addFilter(filter);
    }
});