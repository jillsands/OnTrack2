import React, { useEffect, useState } from "react";
import logo from "../../images/Logo.png";

import "./Home.css";

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
    <div className="formContainer">
      <img className="logoImg" src={logo} alt="logo"></img>
      <p> Enter the nearest train station </p>
      <form action="/stations" method="post">
        <input id="stationInput" list="stations" name="stationCode" /> <br />
        <datalist id="stations">
          {stations?.map((station) => (
            <option value={station.code} label={station.name} />
          ))}
        </datalist>
        <input className="button" type="submit" value="Get Information" />
      </form>
    </div>
  );
}

export default Home;
