/* Server Set Up */
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();

app.use(express.static(__dirname + "/"));
app.use(bodyParser.urlencoded({ extended: false }));

const REQUEST_HEADER = {
  api_key: "c55e8989aa3c4bcd9deb248baf620a03",
};

const PORT_NUMBER = process.env.PORT || 4444;
console.log(`Server running at: http://localhost:${PORT_NUMBER}`);

/* Establishing Mongo connection, DB is pre-populated with station info */
require("dotenv").config();
const username = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

const uri = `mongodb+srv://${username}:${password}@cluster0.w3o8kiy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

/* API */
app.get("/api/stations", async (request, response) => {
  try {
    await client.connect();
    console.log("connected");
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

/* Redirects to prettier url */
app.post("/stations", async (request, response) => {
  /* Note: Gallery Place, Fort Totten, L'Enfant Plaza, and
     Metro Center have multiple platforms, thus multiple station codes */
  const stationCode = request.body.stationCode;
  response.redirect(`stations/${stationCode}`);
});

const getAvailableParking = async (stationCode) => {
  let parkingInfo = await axios.get(
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
      params: { stationCode: stationCode },
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
          .db(databaseAndCollection.db)
          .collection(databaseAndCollection.collection)
          .findOne({ name: train.DestinationName });
        destinationCode = cursor.code;
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

    response.json({ station, parkingInfo, nextTrains });
  } catch (e) {
    console.error(e);
    response.send(e);
  } finally {
    await client.close();
  }
});

app.listen(PORT_NUMBER);