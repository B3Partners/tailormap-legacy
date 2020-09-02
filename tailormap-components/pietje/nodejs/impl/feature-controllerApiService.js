'use strict';


/**
 * 
 *
 * featuretype string 
 * objectGuid string 
 * returns Feature
 **/
exports.get = function(featuretype,objectGuid) {
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
 * featuretype string 
 * objectGuid string 
 * no response value expected for this operation
 **/
exports.delete = function(featuretype,objectGuid) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * 
 *
 * objectGuid string 
 * feature Feature 
 * returns Feature
 **/
exports.update = function(objectGuid,feature) {
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
 * feature Feature 
 * parentId string  (optional)
 * returns Feature
 **/
exports.save = function(feature,parentId) {
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
exports.getAll = function() {
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
exports.onPoint = function(x,y,scale) {
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

