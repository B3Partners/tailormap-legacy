'use strict';

var utils = require('../utils/writer.js');
var wegvakonderdeelplanning-controllerApi = require('../impl/wegvakonderdeelplanning-controllerApiService');

module.exports.get_2 = function get_2 (req, res, next) {
  var objectGuid = req.swagger.params['objectGuid'].value;
  wegvakonderdeelplanning-controllerApi.get_2(objectGuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.update_2 = function update_2 (req, res, next) {
  var objectGuid = req.swagger.params['objectGuid'].value;
  var wegvakonderdeelplanning = req.swagger.params['wegvakonderdeelplanning'].value;
  wegvakonderdeelplanning-controllerApi.update_2(objectGuid,wegvakonderdeelplanning)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.delete_2 = function delete_2 (req, res, next) {
  var objectGuid = req.swagger.params['objectGuid'].value;
  wegvakonderdeelplanning-controllerApi.delete_2(objectGuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getAllPaged_1 = function getAllPaged_1 (req, res, next) {
  var page = req.swagger.params['page'].value;
  var size = req.swagger.params['size'].value;
  var sort = req.swagger.params['sort'].value;
  wegvakonderdeelplanning-controllerApi.getAllPaged_1(page,size,sort)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.save_2 = function save_2 (req, res, next) {
  var body = req.swagger.params['body'].value;
  wegvakonderdeelplanning-controllerApi.save_2(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getAll_2 = function getAll_2 (req, res, next) {
  wegvakonderdeelplanning-controllerApi.getAll_2()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
