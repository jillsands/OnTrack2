import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ImageMagnifier from "../../components/ImageMagnifier";
import AlertPane from "../../components/AlertPane";
import LoadingPage from "../../components/LoadingPage";

import { FaChevronDown } from "react-icons/fa";
import { BsFillCaretRightFill } from "react-icons/bs";
import MetroMap from "../../images/MetroMap.png";

import "./station.css";

import type StationData from "./types";

const MINUTE_MS = 60000;

function Station() {
  const { stationCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [stationData, setStationData] = useState<StationData>({});
  const { station = {}, parkingInfo = [], nextTrains = [] } = stationData;

  useEffect(() => {
    fetchStationData();

    // Refresh data every minute
    const interval = setInterval(() => fetchStationData(), MINUTE_MS);
    return () => clearInterval(interval);
  }, []);

  const fetchStationData = () => {
    fetch(`/api/stations/${stationCode}`)
      .then((res) => res.json())
      .then((data) => {
        setStationData(data);
        setLoading(false);
      });
  };
  const renderParkingInfo = () => {
    if (parkingInfo && !(parkingInfo.length === 0)) {
      const {
        AllDayParking: { TotalCount: totalAllDayParking },
        ShortTermParking: { TotalCount: totalShortTermParking },
      } = parkingInfo[0];
      return (
        <>
          <h3> Available Parking </h3>
          <div className="row">All day: &nbsp; {totalAllDayParking}</div>
          <div className="row">Metered: &nbsp; {totalShortTermParking}</div>
        </>
      );
    }
    return <h3> Parking information not available </h3>;
  };

  function togglePathDisplayed(event: React.MouseEvent<SVGElement>) {
    let pathNumber = event.currentTarget.id.slice(-1);
    const path = document.getElementById(`path${pathNumber}`);

    if (path) {
      const currentDisplay = path.style.display;
      path.style.display = currentDisplay === "block" ? "none" : "block";
    }
  }

  const renderNextTrains = () =>
    nextTrains?.map(({ Line, Min, DestinationName, PathToDestination }, i) => (
      <div key={i}>
        <div className="row centered">
          <FaChevronDown
            className="chevron"
            onClick={togglePathDisplayed}
            id={`pathTitle${i}`}
          />
          <span className={`column ${Line} filled`}>
            {Min}
            <span className="minsLabel">
              {!(Min === "ARR" || Min === "BRD" || Min === "") && "mins"}
            </span>
          </span>
          <BsFillCaretRightFill className="caret" />
          &nbsp; {DestinationName}
        </div>
        <div id={`path${i}`} className="path">
          {PathToDestination?.map(({ StationCode, StationName }, i) => (
            <div key={i}>
              <span className={`${Line} filled`} />
              <a href={`/stations/${StationCode}`}> {StationName} </a> <br />
            </div>
          ))}
        </div>
      </div>
    ));

  return loading ? (
    <LoadingPage />
  ) : (
    <div className="stationContainer">
      <h1> {station?.name} Metro Station </h1>
      <h4> {station?.address} </h4>
      <p>
        Lines: &nbsp;
        {station?.lines?.map((line, i) => (
          <span title={line} key={i}>
            <strong className={line}>&#9679;</strong>
          </span>
        ))}
      </p>
      <div className="row">
        <div className="column list">
          <h3> Arriving Trains </h3>
          {nextTrains?.length === 0
            ? "No incoming trains to display"
            : renderNextTrains()}
          {renderParkingInfo()}
          <AlertPane lines={station.lines} />
        </div>
        <div className="column">
          <ImageMagnifier imageSrc={MetroMap} />
        </div>
      </div>
    </div>
  );
}

export default Station;
