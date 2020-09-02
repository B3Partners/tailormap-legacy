'use strict';


/**
 * 
 *
 * objectGuid string 
 * returns Wegvakonderdeelplanning
 **/
exports.get_2 = function(objectGuid) {
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
 * wegvakonderdeelplanning Wegvakonderdeelplanning 
 * returns Wegvakonderdeelplanning
 **/
exports.update_2 = function(objectGuid,wegvakonderdeelplanning) {
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
exports.delete_2 = function(objectGuid) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * 
 *
 * page integer Zero-based page index (0..N) (optional)
 * size integer The size of the page to be returned (optional)
 * sort array Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported. (optional)
 * returns PageWegvakonderdeelplanning
 **/
exports.getAllPaged_1 = function(page,size,sort) {
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
 * body object 
 * returns Wegvakonderdeelplanning
 **/
exports.save_2 = function(body) {
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
exports.getAll_2 = function() {
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

