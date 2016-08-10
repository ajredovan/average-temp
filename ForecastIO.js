var ForecastIo = require('forecastio');
var KEYS = require('./keys.js');

var forecastIo = new ForecastIo(KEYS.FKEY);

module.exports = forecastIo;
