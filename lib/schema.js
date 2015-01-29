var joi = require("joi");

module.exports = {
  host: joi.string().regex(/[A-Za-z0-9-\.+]+(?::\d+)?/i).required(),
  serviceType: joi.string().min(1).required(),
  metadata: joi.object(),
  serviceUri: joi.string().regex(/http(s)?:\/\/[A-Za-z0-9-\/+]+/i),
  onError: joi.func()
};
