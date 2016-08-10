const ForecastIo = require('forecastio');
const KEYS = require('./keys.js');

let forecastIo = new ForecastIo(KEYS.FKEY);

module.exports = forecastIo;
