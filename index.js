require('es6-promise').polyfill()
require('isomorphic-fetch')
const fs = require('fs')
const moment = require('moment')

const APIKEY = process.env.WEATHER_API_KEY
const COUNTRY_CODE = 'NL'
const CITY = 'Eindhoven'
const END_DATE = '20170101'
const REQ_INTERVAL = 6000

let targetDate = ''
let requrl = ``
let weatherResponses = []
var dateCounter = moment("20160101", "YYYYMMDD")

moment().format('YYYYMMDD')

const fetchUrl = function (requrl) {
  fetch(requrl)
    .then((response) => {
      var contentType = response.headers.get("content-type")
      if(contentType && contentType.includes("application/json")) {
        return response.json()
      } else {
        return;
      }
    })
    .then((json) => { 
      if(json.history && Array.isArray(json.history.dailysummary)){
        weatherResponses.push(json.history.dailysummary[0]);
      } else {
        console.log(`Skipped date ${targetDate}`)
      }
      setTimeout(getNewDate, REQ_INTERVAL)
      console.log(`Finished ${targetDate}`)
    })
    .catch((error) => { 
      console.log(error)
    })
}


function getNewDate () {
  targetDate = moment(dateCounter).format("YYYYMMDD")
  
  if (targetDate == END_DATE) {
    whiteToFile()
    return;
  }

  requrl = `http://api.wunderground.com/api/${APIKEY}/history_${targetDate}/q/${COUNTRY_CODE}/${CITY}.json`
  dateCounter.add(1,'days')
  fetchUrl(requrl)
}

function whiteToFile () {
  let json = JSON.stringify(weatherResponses)
  fs.writeFile('eindhoven.json', json, 'utf8', ()=>{
    console.log(`Finished!`)
  })
}
getNewDate()