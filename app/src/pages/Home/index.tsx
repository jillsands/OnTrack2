import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertPane from "../../components/AlertPane";

import logo from "../../images/Logo.png";

import "./home.css";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://ontrack-3p50.onrender.com"
    : "";

type Station = {
  name: string;
  code: string;
  lines: Array<string>;
  address: string;
};

function Home() {
  const navigate = useNavigate();

  const [stations, setStations] = useState<Array<Station>>([]);
  const [selectedStation, setSelectedStation] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}/api/stations`)
      .then((res) => res.json())
      .then((data) => setStations(data.stations));
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSelectedStation(event.target.value);

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevents default form submission behavior

    navigate(`/stations/${selectedStation}`);
  };

  return (
    <div className="homeContainer">
      <div className="column">
        <img className="logoImg" src={logo} alt="logo"></img>
        <p> Enter the nearest train station </p>
        <form>
          <input
            id="stationInput"
            list="stations"
            name="stationCode"
            onChange={handleChange}
          />{" "}
          <br />
          <datalist id="stations">
            {stations?.map((station, i) => (
              <option value={station.code} label={station.name} key={i} />
            ))}
          </datalist>
          <button className="button" onClick={handleSubmit}>
            Get Information
          </button>
        </form>
      </div>
      <div className="column alertPanel">
        <AlertPane />
      </div>
    </div>
  );
}

export default Home;
