/* Server Set Up */
const axios = require("axios");
const axiosRetry = require("axios-retry");
const bodyParser = require("body-parser");
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");

require("dotenv").config();

const USERNAME = process.env.MONGO_DB_USERNAME;
const PASSWORD = process.env.MONGO_DB_PASSWORD;

const REQUEST_HEADER = {
  api_key: "c55e8989aa3c4bcd9deb248baf620a03",
};

const PORT_NUMBER = process.env.PORT || 4444;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

/* Set middleware of CORS  */
app.use((request, response, next) => {
  response.setHeader(
    "Access-Control-Allow-Origin",
    "https://ontrack-tkib.onrender.com"
  );
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  response.setHeader("Access-Control-Allow-Credentials", true);
  response.setHeader("Access-Control-Allow-Private-Network", true);
  response.setHeader("Access-Control-Max-Age", 7200);

  next();
});

/* Establishing Mongo connection, DB is pre-populated with station info */
const uri = `mongodb+srv://${USERNAME}:${PASSWORD}@cluster0.w3o8kiy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

/* Setting up axios-retry */
axiosRetry(axios, {
  retries: 3, // number of retries
  retryDelay: () => 2000, // wait 2 seconds between retries
  retryCondition: (error) => error.response.status === 429, // code for 'Too Many Requests'
});

/* API */
app.get("/api/stations", async (request, response) => {
  try {
    await client.connect();
    const cursor = client
      .db(process.env.MONGO_DB_NAME)
      .collection(process.env.MONGO_COLLECTION)
      .find();

    const stations = await cursor.toArray();
    response.json({ stations });
  } catch (e) {
    console.error(e);
    response.send(e);
  } finally {
    await client.close();
  }
});

// Note: I think this WMATA API is down :(. Been returning empty results for over a week
const getAvailableParking = async (stationCode) => {
  const parkingInfo = await axios.get(
    `https://api.wmata.com/Rail.svc/json/jStationParking?StationCode=${stationCode}`,
    { headers: REQUEST_HEADER }
  );
  return parkingInfo.data.StationsParking;
};

const getIncomingTrains = async (stationCode, lines) => {
  const linesServiced = lines.join(",");

  const nextTrainsResponse = await axios.get(
    `https://api.wmata.com/StationPrediction.svc/json/GetPrediction/${linesServiced}`,
    {
      params: { stationCode },
      headers: REQUEST_HEADER,
    }
  );

  let nextTrains = nextTrainsResponse.data.Trains.filter(
    ({ DestinationName }) => DestinationName && DestinationName != "Train" // Filter empty entries
  );

  let trainsAndPathData = await Promise.all(
    nextTrains.map(async (train) => {
      // Use DB for buggy destination codes
      let destinationCode = train.DestinationCode;
      if (!destinationCode) {
        const cursor = await client
          .db(process.env.MONGO_DB_NAME)
          .collection(process.env.MONGO_COLLECTION)
          .findOne({ name: train.DestinationName });

        if (cursor) {
          destinationCode = cursor.code;
        } else {
          return { ...train };
        }
      }

      const pathToDestResponse = await axios.get(
        `https://api.wmata.com/Rail.svc/json/jPath?FromStationCode=${stationCode}&ToStationCode=${destinationCode}`,
        { headers: REQUEST_HEADER }
      );

      const pathToDestination = pathToDestResponse.data.Path;
      pathToDestination.shift(); // first value will be current station

      return { ...train, PathToDestination: pathToDestination };
    })
  );

  return trainsAndPathData;
};

app.get("/api/stations/:code", async (request, response) => {
  try {
    await client.connect();

    const stationCode = request.params.code;
    const station = await client
      .db(process.env.MONGO_DB_NAME)
      .collection(process.env.MONGO_COLLECTION)
      .findOne({ code: stationCode });

    // Available Parking Spots At Station
    const parkingInfo = await getAvailableParking(stationCode);

    // Incoming Trains
    const nextTrains = await getIncomingTrains(stationCode, station.lines);

    // TODO: add catch for invalid station code (and other errors from above)
    response.json({ station, parkingInfo, nextTrains });
  } catch (e) {
    console.error(e);
    response.send(e);
  } finally {
    await client.close();
  }
});

app.get("/api/alerts", async (request, response) => {
  const alerts = await axios.get(
    `https://api.wmata.com/Incidents.svc/json/Incidents`,
    {
      headers: REQUEST_HEADER,
    }
  );

  const validLines = ["GR", "YL", "SV", "OR", "RD", "BL"];

  const incidents = alerts.data.Incidents.filter(({ LinesAffected }) => {
    const validLinesAffected = LinesAffected.split(";").filter((line) =>
      validLines.includes(line)
    );

    return validLinesAffected.length >= 1;
  }).map((incident) => {
    const { DateUpdated, Description, IncidentType, LinesAffected } = incident;

    return {
      DateUpdated,
      Description,
      IncidentType,
      LinesAffected: LinesAffected.split(";").filter((line) =>
        validLines.includes(line)
      ),
    };
  });

  response.json({ incidents });
});

/* Handles any requests that don't match the ones above */
app.get("*", (request, response) => {
  response.sendStatus(404);
});

app.listen(PORT_NUMBER);
console.log(`Server running at: http://localhost:${PORT_NUMBER}`);
