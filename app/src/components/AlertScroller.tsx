import { useEffect, useState } from "react";

// TODO: create new api call, hook up to add alert scroller component
const AlertScroller = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch(`/api/alerts`)
      .then((res) => res.json())
      .then((data) => setAlerts(data));
  }, []);

  return (
    <div id="alertScroller">
      {alerts.map(() => (
        <div> </div>
      ))}
    </div>
  );
};

export default AlertScroller;
