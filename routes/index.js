var express = require('express');
var router = express.Router();

var got = require("got");
var forecastIo = require('../ForecastIO.js');
var KEYS = require('../keys.js');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.post('/getAverageTemp', (req, res, next) => {
  var startDate = req.body.sD;
  var endDate = req.body.eD;
  var location = req.body.location;

  var url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+location+'.json?country=us&access_token='+KEYS.MBKEY;
  got(url)
      .then((response) => {
        var parsedResp = JSON.parse(response.body);
        getForecast(parsedResp.features[0].center);
      });

  var getForecast = (center) => {
    var options = {
      exclude: ['currently','minutely','hourly','alerts','flags']
    }

    var between = daysBetween(startDate, endDate);
    console.log("days between "+between);

    callForecastIO(createDays(startDate, between), center);
  }

  var callForecastIO = (days, center) => {
    var temps = [],
        i = 0;
    new Promise((resolve, reject) => {
      days.map((day) => {
        var url = 'https://api.forecast.io/forecast/'+KEYS.FKEY+'/'+center[1]+','+center[0]+','+day.toISOString().slice(0,19);
        got(url.toString()).then((response) => {
          var resp = JSON.parse(response.body);
          temps.push(resp.currently.temperature);
          i++;
          if (i === days.length) {
            resolve(temps);
          }
        });
      });
    }).then((temps) => {
      //return to front
      var temp = getAverageTemp(temps);
      console.log("Average temp is: "+temp);
      res.json(Number(Math.round(temp+'e2')+'e-2')+'F');
    });
  }

  var daysBetween = (first, second) => {
    var oneDay = 24*60*60*1000, // hours*minutes*seconds*milliseconds
        firstDate = new Date(first),
        secondDate = new Date(second);

    return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
  }

  var createDays = (day, amount) => {
    var newDays = [],
        tempDate = new Date(day);
    newDays.push(tempDate);
    for (var i = 1; i <= amount; i++) {
      var newDate = new Date(day);
      newDate.setDate(tempDate.getDate() + i);
      newDays.push(newDate);
    }
    return newDays;
  }

  var getAverageTemp = (temps) => {
    var sum = temps.reduce((a, b) => {
      return a+b;
    });
    return sum / temps.length;
  }
});

module.exports = router;
