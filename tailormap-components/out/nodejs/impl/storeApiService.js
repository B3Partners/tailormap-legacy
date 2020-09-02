'use strict';


/**
 * Returns pet inventories by status
 * Returns a map of status codes to quantities
 *
 * returns object
 **/
exports.getInventory = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "property1": 0,
  "property2": 0
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Place an order for a pet
 * 
 *
 * order Order 
 * returns Order
 **/
exports.placeOrder = function(order) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/xml'] = {
  "id": 0,
  "petId": 0,
  "quantity": 0,
  "shipDate": "2019-08-24T14:15:22Z",
  "status": "placed",
  "complete": false
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Find purchase order by ID
 * For valid response try integer IDs with value >= 1 and <= 10. Other values will generated exceptions
 *
 * orderId integer ID of pet that needs to be fetched
 * returns Order
 **/
exports.getOrderById = function(orderId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/xml'] = {
  "id": 0,
  "petId": 0,
  "quantity": 0,
  "shipDate": "2019-08-24T14:15:22Z",
  "status": "placed",
  "complete": false
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Delete purchase order by ID
 * For valid response try integer IDs with positive integer value. Negative or non-integer values will generate API errors
 *
 * orderId integer ID of the order that needs to be deleted
 * no response value expected for this operation
 **/
exports.deleteOrder = function(orderId) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}

