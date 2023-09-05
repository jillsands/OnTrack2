import { useEffect, useState } from "react";

import { HiClock } from "react-icons/hi";
import { PiWarningFill } from "react-icons/pi";

import type Incident from "./types";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://ontrack-3p50.onrender.com"
    : "";
const MINUTE_MS = 60000;

type Props = {
  // If included, indicates that only the alerts associated with indicated lines should be shown
  lines?: Array<string>;
};

const AlertPane = ({ lines }: Props) => {
  const [alerts, setAlerts] = useState<Array<Incident>>([]);

  useEffect(() => {
    fetchAlerts();

    // Refresh alerts every minute
    const interval = setInterval(() => fetchAlerts(), MINUTE_MS);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = () => {
    fetch(`${BASE_URL}/api/alerts`)
      .then((res) => res.json())
      .then((data) => {
        setAlerts(
          lines
            ? data.incidents.filter((incident: Incident) =>
                lines.some((line) => incident.LinesAffected.includes(line))
              )
            : data.incidents
        );
      });
  };
  const calculateTimePassed = (date: string) => {
    const currentTime = new Date(); // TODO: fix to work  in PST
    const timeUpdated = new Date(date);

    const yearsApart = currentTime.getFullYear() - timeUpdated.getFullYear();
    const monthsApart = currentTime.getMonth() - timeUpdated.getMonth();
    const daysApart = currentTime.getDate() - timeUpdated.getDate();
    const hoursApart = currentTime.getHours() - timeUpdated.getHours();
    const minutesApart = currentTime.getMinutes() - timeUpdated.getMinutes();

    if (yearsApart > 0) {
      return "Over a year ago";
    } else if (monthsApart > 0) {
      return `${monthsApart} month${monthsApart === 1 ? "" : "s"} ago`;
    } else if (daysApart > 0) {
      return `${daysApart} day${daysApart === 1 ? "" : "s"} ago`;
    } else if (hoursApart > 0) {
      return `${hoursApart} hour${hoursApart === 1 ? "" : "s"} ago`;
    } else {
      return `${minutesApart} min${minutesApart === 1 ? "" : "s"} ago`;
    }
  };

  return (
    <div id="alertPane">
      {alerts.length === 0 ? (
        <h3> No alerts to display </h3>
      ) : (
        alerts.map(
          ({ DateUpdated, Description, IncidentType, LinesAffected }, i) => (
            <div className={IncidentType} key={i}>
              <div id="alertHeader">
                {IncidentType === "Delay" ? (
                  <span className="centeredFlex">
                    <HiClock color="#fccd30" /> &nbsp; Delay
                  </span>
                ) : (
                  <span className="centeredFlex">
                    <PiWarningFill color="DF5757" /> &nbsp; {IncidentType}
                  </span>
                )}
                <span>
                  {LinesAffected.map((line, i) => (
                    <strong className={line} key={i}>
                      &#9679;
                    </strong>
                  ))}
                  {LinesAffected.join(", ")}
                  &nbsp;line{LinesAffected.length === 1 ? "" : "s"}
                </span>
                <span className="timePassed">
                  {calculateTimePassed(DateUpdated)}
                </span>
              </div>
              <div>{Description}</div>
            </div>
          )
        )
      )}
    </div>
  );
};

export default AlertPane;
