import React, { useEffect, useState } from "react";
import ImageMagnifier from "../../components/ImageMagnifier";

import { FaChevronDown } from "react-icons/fa";
import { BsFillCaretRightFill } from "react-icons/bs";
import MetroMap from "../../images/MetroMap.png";

import "./station.css";

import type StationData from "./types";
import { useParams } from "react-router-dom";

function Station() {
  const { stationCode } = useParams();
  const [stationData, setStationData] = useState<StationData>({});
  const { station = {}, parkingInfo = [], nextTrains = [] } = stationData;

  useEffect(() => {
    fetch(`/api/stations/${stationCode}`)
      .then((res) => res.json())
      .then((data) => setStationData(data));
  }, []);

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
      <>
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
          {PathToDestination?.map(({ StationCode, StationName }) => (
            <>
              <span className={`${Line} filled`} />
              <a href={`/stations/${StationCode}`}> {StationName} </a> <br />
            </>
          ))}
        </div>
      </>
    ));

  return (
    <div className="stationContainer">
      <h1> {station?.name} Metro Station </h1>
      <h4> {station?.address} </h4>
      <div className="row">
        <div className="column list">
          <h3> Arriving Trains </h3>
          {renderNextTrains()}
          {renderParkingInfo()}
        </div>
        <div className="column">
          <ImageMagnifier imageSrc={MetroMap} />
        </div>
      </div>
    </div>
  );
}

export default Station;
