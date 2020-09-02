'use strict';

var utils = require('../utils/writer.js');
var attribuut-controllerApi = require('../impl/attribuut-controllerApiService');

module.exports.attributes = function attributes (req, res, next) {
  var ids = req.swagger.params['ids'].value;
  attribuut-controllerApi.attributes(ids)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
