'use strict';

var utils = require('../utils/writer.js');
var wegvakonderdeel-controllerApi = require('../impl/wegvakonderdeel-controllerApiService');

module.exports.get_1 = function get_1 (req, res, next) {
  var objectGuid = req.swagger.params['objectGuid'].value;
  wegvakonderdeel-controllerApi.get_1(objectGuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.update_1 = function update_1 (req, res, next) {
  var objectGuid = req.swagger.params['objectGuid'].value;
  var wegvakonderdeel = req.swagger.params['wegvakonderdeel'].value;
  wegvakonderdeel-controllerApi.update_1(objectGuid,wegvakonderdeel)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.delete_1 = function delete_1 (req, res, next) {
  var objectGuid = req.swagger.params['objectGuid'].value;
  wegvakonderdeel-controllerApi.delete_1(objectGuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.save_1 = function save_1 (req, res, next) {
  var body = req.swagger.params['body'].value;
  wegvakonderdeel-controllerApi.save_1(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getAll_1 = function getAll_1 (req, res, next) {
  wegvakonderdeel-controllerApi.getAll_1()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getAllPaged = function getAllPaged (req, res, next) {
  var page = req.swagger.params['page'].value;
  var size = req.swagger.params['size'].value;
  var sort = req.swagger.params['sort'].value;
  wegvakonderdeel-controllerApi.getAllPaged(page,size,sort)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.wegvakkenOnPoint = function wegvakkenOnPoint (req, res, next) {
  var x = req.swagger.params['x'].value;
  var y = req.swagger.params['y'].value;
  var scale = req.swagger.params['scale'].value;
  wegvakonderdeel-controllerApi.wegvakkenOnPoint(x,y,scale)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
