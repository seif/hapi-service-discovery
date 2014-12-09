var joi = require("joi");

module.exports = {
  host: joi.string().hostname().required(),
  serviceType: joi.string().min(1).required(),
  serviceUri: joi.string().regex(/http(s)?:\/\/[A-Za-z0-9-\/+]+/i),
  onError: joi.func()
};
