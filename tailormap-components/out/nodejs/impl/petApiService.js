'use strict';


/**
 * Add a new pet to the store
 * 
 *
 * pet Pet 
 * no response value expected for this operation
 **/
exports.addPet = function(pet) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Update an existing pet
 * 
 *
 * pet Pet 
 * no response value expected for this operation
 **/
exports.updatePet = function(pet) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Finds Pets by status
 * Multiple status values can be provided with comma separated strings
 *
 * status array Status values that need to be considered for filter
 * returns array
 **/
exports.findPetsByStatus = function(status) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/xml'] = [
  {
    "id": 0,
    "category": {
      "id": 0,
      "name": "string"
    },
    "name": "doggie",
    "photoUrls": [
      "string"
    ],
    "tags": [
      {
        "id": 0,
        "name": "string"
      }
    ],
    "status": "available"
  }
];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Finds Pets by tags
 * Muliple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
 *
 * tags array Tags to filter by
 * returns array
 **/
exports.findPetsByTags = function(tags) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/xml'] = [
  {
    "id": 0,
    "category": {
      "id": 0,
      "name": "string"
    },
    "name": "doggie",
    "photoUrls": [
      "string"
    ],
    "tags": [
      {
        "id": 0,
        "name": "string"
      }
    ],
    "status": "available"
  }
];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Find pet by ID
 * Returns a single pet
 *
 * petId integer ID of pet to return
 * returns Pet
 **/
exports.getPetById = function(petId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/xml'] = {
  "id": 0,
  "category": {
    "id": 0,
    "name": "string"
  },
  "name": "doggie",
  "photoUrls": [
    "string"
  ],
  "tags": [
    {
      "id": 0,
      "name": "string"
    }
  ],
  "status": "available"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Updates a pet in the store with form data
 * 
 *
 * petId integer ID of pet that needs to be updated
 * name string  (optional)
 * status string  (optional)
 * no response value expected for this operation
 **/
exports.updatePetWithForm = function(petId,name,status) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Deletes a pet
 * 
 *
 * petId integer Pet id to delete
 * api_key string  (optional)
 * no response value expected for this operation
 **/
exports.deletePet = function(petId,api_key) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * uploads an image
 * 
 *
 * petId integer ID of pet to update
 * body string  (optional)
 * returns ApiResponse
 **/
exports.uploadFile = function(petId,body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "code": 0,
  "type": "string",
  "message": "string"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

