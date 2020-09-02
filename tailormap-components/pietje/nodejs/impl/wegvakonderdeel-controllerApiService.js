'use strict';


/**
 * 
 *
 * objectGuid string 
 * returns Wegvakonderdeel
 **/
exports.get_1 = function(objectGuid) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['*/*'] = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 
 *
 * objectGuid string 
 * wegvakonderdeel Wegvakonderdeel 
 * returns Wegvakonderdeel
 **/
exports.update_1 = function(objectGuid,wegvakonderdeel) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['*/*'] = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 
 *
 * objectGuid string 
 * no response value expected for this operation
 **/
exports.delete_1 = function(objectGuid) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * 
 *
 * body object 
 * returns Wegvakonderdeel
 **/
exports.save_1 = function(body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['*/*'] = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 
 *
 * returns array
 **/
exports.getAll_1 = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['*/*'] = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 
 *
 * page integer Zero-based page index (0..N) (optional)
 * size integer The size of the page to be returned (optional)
 * sort array Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported. (optional)
 * returns PageWegvakonderdeel
 **/
exports.getAllPaged = function(page,size,sort) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['*/*'] = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 
 *
 * x number 
 * y number 
 * scale number 
 * returns array
 **/
exports.wegvakkenOnPoint = function(x,y,scale) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['*/*'] = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

