type Incident = {
    DateUpdated: string;
    Description: string;
    IncidentType: string; // Usually "Delay" or "Alert"
    LinesAffected: Array<string>; // "BL;RD;..."
}

export default Incident;