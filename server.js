//import all the necessary frameworks
const Datastore = require("nedb");
const fetch = require("node-fetch");
const express = require("express");
const app = express();
require("dotenv").config();

//set port to use either deploymnet environment port or local port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening at port: ${port}`));
app.use(express.static("public")); //allow expres to use public folder
app.use(express.json({ limit: "1mb" })); //limit the amount of data that can be posted to server

//create database
const db = new Datastore("database.db");
db.loadDatabase();

//get route for our api endpoint
app.get("/api", (request, response) => {
  db.find({}, (err, data) => {
    if (err) {
      response.end();
      return;
    }
    response.json(data);
  });
});

//post route for our api endpoint
app.post("/api", (request, response) => {
  const data = request.body;
  const timestamp = Date.now();
  data.timestamp = timestamp;
  db.insert(data);
  response.json(data);
});

//week10 add weather api url
app.get("/weather/:latlon", async (request, response) => {
  try {
    const latlon = request.params.latlon.split(",");
    const lat = latlon[0];
    const lon = latlon[1];
    const weather_api_key = process.env.API_KEY;
    const weather_api_url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat}%2C%20${lon}?unitGroup=metric&key=${weather_api_key}&contentType=json`;
    const weather_response = await fetch(weather_api_url);
    const weather_data = await weather_response.json();

    const airq_api_url = `https://api.openaq.org/v2/latest?radius=10000&coordinates=${lat},${lon}`;
    const airq_response = await fetch(airq_api_url);
    const airq_data = await airq_response.json();

    const data = {
      weather: weather_data,
      air: airq_data,
    };
    response.json(data);  
  } catch (error) {
    console.log(error);
  }
});
