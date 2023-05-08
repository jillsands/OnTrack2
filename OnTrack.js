/* Server Set Up */
const path = require("path");
const express = require("express");  
const bodyParser = require("body-parser");
const axios = require('axios');
const app = express();  
app.use(express.static(__dirname + '/'));
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));
const portNumber = 4444; 

console.log("Server running at: http://localhost:4444, deployed at: https://ontrack-3p50.onrender.com")

/* Establishing Mongo connection, DB is pre-populated with station info */
require("dotenv").config({ path: path.resolve(__dirname, ".env")})
const userName = process.env.MONGO_DB_USERNAME; // taken from the .env file
const password = process.env.MONGO_DB_PASSWORD;
const databaseAndCollection = { db: process.env.MONGO_DB_NAME, 
                                collection: process.env.MONGO_COLLECTION };
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${userName}:${password}@cluster0.w3o8kiy.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, 
                                { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

/* ROUTES */
app.get("/", async (request, response) => {
    try {
        await client.connect();
        const cursor = client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find({},  { projection : { name: 1, code: 1,  _id: 0 }})
        const stations = await cursor.toArray(); 
        response.render("index", {stations});
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
    response.redirect(`stations/${stationCode}`)
});

app.get("/stations/:code", async (request, response) => {
    try {
        await client.connect();
        
        const stationCode = request.params.code;
        const station = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne({code: stationCode})
    
        // Available Parking Spots At Station 
        let parkingInfo = await axios.get(`https://api.wmata.com/Rail.svc/json/jStationParking?StationCode=${stationCode}`, { headers: {api_key: "c55e8989aa3c4bcd9deb248baf620a03" }})
        parkingInfo = parkingInfo.data.StationsParking
    
        // Incoming Trains
        const lineServiced = station.lines.join(",")
        let nextTrains = await axios.get(`https://api.wmata.com/StationPrediction.svc/json/GetPrediction/${lineServiced}`, { params: { stationCode: stationCode}, headers: {api_key: "c55e8989aa3c4bcd9deb248baf620a03" }})
        nextTrains = nextTrains.data.Trains
        nextTrains = nextTrains.filter(({DestinationName}) => DestinationName && DestinationName != "Train") // Filter empty entries
        nextTrains = await Promise.all(nextTrains.map(async (train) => {
            // Fix buggy destination codes
            let destinationCode = train.DestinationCode
            if (destinationCode == null) {
                const cursor = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne({name: train.DestinationName})
                destinationCode = cursor.code
            }

            // Add path to destination
            let pathToDest = await axios.get(`https://api.wmata.com/Rail.svc/json/jPath?FromStationCode=${stationCode}&ToStationCode=${destinationCode}`, { headers: {api_key: "c55e8989aa3c4bcd9deb248baf620a03" }});
            pathToDest = pathToDest.data.Path;
            pathToDest.shift();
            
            return {...train, pathToDest}
        }))

        response.render("station", { station, parkingInfo, nextTrains})
    } catch (e) {
        console.error(e);
        response.send(e);
    } finally {
        await client.close();
    }
});

app.listen(portNumber);

