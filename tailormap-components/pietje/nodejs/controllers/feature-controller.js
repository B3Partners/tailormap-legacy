'use strict';

var utils = require('../utils/writer.js');
var feature-controllerApi = require('../impl/feature-controllerApiService');

module.exports.get = function get (req, res, next) {
  var featuretype = req.swagger.params['featuretype'].value;
  var objectGuid = req.swagger.params['objectGuid'].value;
  feature-controllerApi.get(featuretype,objectGuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.delete = function delete (req, res, next) {
  var featuretype = req.swagger.params['featuretype'].value;
  var objectGuid = req.swagger.params['objectGuid'].value;
  feature-controllerApi.delete(featuretype,objectGuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.update = function update (req, res, next) {
  var objectGuid = req.swagger.params['objectGuid'].value;
  var feature = req.swagger.params['feature'].value;
  feature-controllerApi.update(objectGuid,feature)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.save = function save (req, res, next) {
  var feature = req.swagger.params['feature'].value;
  var parentId = req.swagger.params['parentId'].value;
  feature-controllerApi.save(feature,parentId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getAll = function getAll (req, res, next) {
  feature-controllerApi.getAll()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.onPoint = function onPoint (req, res, next) {
  var x = req.swagger.params['x'].value;
  var y = req.swagger.params['y'].value;
  var scale = req.swagger.params['scale'].value;
  feature-controllerApi.onPoint(x,y,scale)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
