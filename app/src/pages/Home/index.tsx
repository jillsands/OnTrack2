import React, { useEffect, useState } from "react";
import AlertPane from "../../components/AlertPane";

import logo from "../../images/Logo.png";

import "./home.css";

type Station = {
  name: string;
  code: string;
  lines: Array<string>;
  address: string;
};

function Home() {
  const [stations, setStations] = useState<Array<Station>>([]);

  useEffect(() => {
    fetch("/api/stations")
      .then((res) => res.json())
      .then((data) => setStations(data.stations));
  }, []);

  return (
    <div className="homeContainer">
      <div className="column">
        <img className="logoImg" src={logo} alt="logo"></img>
        <p> Enter the nearest train station </p>
        <form action="/stations" method="post">
          <input id="stationInput" list="stations" name="stationCode" /> <br />
          <datalist id="stations">
            {stations?.map((station, i) => (
              <option value={station.code} label={station.name} key={i} />
            ))}
          </datalist>
          <input className="button" type="submit" value="Get Information" />
        </form>
      </div>
      <div className="column alertPanel">
        <AlertPane />
      </div>
    </div>
  );
}

export default Home;
