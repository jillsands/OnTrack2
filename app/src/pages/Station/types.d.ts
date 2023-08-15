type Station = {
    _id?: string;
    name?: string;
    code?: string;
    lines?: string[];
    address?: string;
};
  
  type ParkingInfo = {
    Code: string;
    Notes: null | string;
    AllDayParking: {
      TotalCount: number;
      RiderCost: number;
      NonRiderCost: number;
    };
    ShortTermParking: {
      TotalCount: number;
      SaturdayRiderCost: number;
      SaturdayNonRiderCost: number;
      Notes: null | string;
    };
  };
  
  type NextTrain = {
    Car: string;
    Destination: string;
    DestinationCode: string;
    DestinationName: string;
    Group: string;
    Line: string;
    LocationCode: string;
    LocationName: string;
    Min: string;
    PathToDestination: {
      LineCode: string;
      StationCode: string;
      StationName: string;
      SeqNum: number;
      DistanceToPrev: number;
    }[];
  };
  
  type StationData = {
    station?: Station;
    parkingInfo?: ParkingInfo[];
    nextTrains?: NextTrain[];
  };

export default StationData;