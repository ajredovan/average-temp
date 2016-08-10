const express = require('express');
const router = express.Router();

const got = require("got");
const forecastIo = require('../ForecastIO.js');
const KEYS = require('../keys.js');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.post('/getAverageTemp', (req, res, next) => {
  let startDate = req.body.sD;
  let endDate = req.body.eD;
  let location = req.body.location;

  let url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+location+'.json?country=us&access_token='+KEYS.MBKEY;
  got(url)
      .then((response) => {
        let parsedResp = JSON.parse(response.body);
        getForecast(parsedResp.features[0].center);
      });

  let getForecast = (center) => {
    let options = {
      exclude: ['currently','minutely','hourly','alerts','flags']
    }

    let between = daysBetween(startDate, endDate);
    console.log("days between "+between);

    callForecastIO(createDays(startDate, between), center);
  }

  let callForecastIO = (days, center) => {
    let temps = [],
        i = 0;
    new Promise((resolve, reject) => {
      days.map((day) => {
        let url = 'https://api.forecast.io/forecast/'+KEYS.FKEY+'/'+center[1]+','+center[0]+','+day.toISOString().slice(0,19);
        got(url.toString()).then((response) => {
          let resp = JSON.parse(response.body);
          temps.push(resp.currently.temperature);
          i++;
          if (i === days.length) {
            resolve(temps);
          }
        });
      });
    }).then((temps) => {
      //return to front
      let temp = getAverageTemp(temps);
      console.log("Average temp is: "+temp);
      res.json(Number(Math.round(temp+'e2')+'e-2')+'F');
    });
  }

  let daysBetween = (first, second) => {
    let oneDay = 24*60*60*1000, // hours*minutes*seconds*milliseconds
        firstDate = new Date(first),
        secondDate = new Date(second);

    return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
  }

  let createDays = (day, amount) => {
    let newDays = [],
        tempDate = new Date(day);
    newDays.push(tempDate);
    for (let i = 1; i <= amount; i++) {
      let newDate = new Date(day);
      newDate.setDate(tempDate.getDate() + i);
      newDays.push(newDate);
    }
    return newDays;
  }

  let getAverageTemp = (temps) => {
    let sum = temps.reduce((a, b) => {
      return a+b;
    });
    return sum / temps.length;
  }
});

module.exports = router;
