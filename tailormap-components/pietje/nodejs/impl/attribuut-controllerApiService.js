'use strict';


/**
 * 
 *
 * ids array 
 * returns array
 **/
exports.attributes = function(ids) {
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

