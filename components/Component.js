function Component(){
    this.component = true;
}

Component.prototype.isComponent = function(){
    return this.component;
}

Component.prototype.bind = function(event,handler){
    throw("Component.bind(): .bind() must be made!");
}

Ext.extend(Component,Ext.util.Observable,{});