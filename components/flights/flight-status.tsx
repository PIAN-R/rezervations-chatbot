import { differenceInHours, format } from "date-fns";
import { ArrowUpRightSmallIcon } from "../custom/icons";
import { Plane, Clock, MapPin, AlertCircle } from "lucide-react";

const SAMPLE = {
  flightNumber: "BA142",
  departure: {
    cityName: "London",
    airportCode: "LHR",
    airportName: "London Heathrow Airport",
    timestamp: "2024-10-08T18:30:00Z",
    terminal: "5",
    gate: "A10",
  },
  arrival: {
    cityName: "New York",
    airportCode: "JFK",
    airportName: "John F. Kennedy International Airport",
    timestamp: "2024-10-09T07:30:00Z",
    terminal: "7",
    gate: "B22",
  },
  totalDistanceInMiles: 3450,
};

export function Row({ row = SAMPLE.arrival, type = "arrival" }) {
  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row">
        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-2 items-center">
            <div className="bg-foreground text-background rounded-full size-fit">
              {type === "arrival" ? (
                <div className="rotate-90">
                  <ArrowUpRightSmallIcon size={16} />
                </div>
              ) : (
                <ArrowUpRightSmallIcon size={16} />
              )}
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">
              {row.airportCode}
            </div>
            <div>·</div>
            <div className="text-sm sm:text-base truncate max-w-32 sm:max-w-64 text-muted-foreground">
              {row.airportName}
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-medium">
            {format(new Date(row.timestamp), "h:mm a")}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 items-end justify-center mt-auto">
        <div className="text-sm sm:text-sm bg-amber-400 rounded-md w-fit px-2 text-amber-900">
          {row.gate}
        </div>
        <div className="text-sm text-muted-foreground">
          Terminal {row.terminal}
        </div>
      </div>
    </div>
  );
}

export function FlightStatus({ flightStatus = SAMPLE }) {
  // Check if we have real data or fallback data
  const hasRealData = flightStatus !== SAMPLE;
  const hasValidTimestamps = flightStatus.departure.timestamp && flightStatus.arrival.timestamp;

  if (!hasRealData) {
    return (
      <div className="flex flex-col gap-2 bg-muted rounded-lg p-4">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">Sample flight status</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Real flight status data is temporarily unavailable. Showing sample data for demonstration.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 bg-muted rounded-lg p-4">
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex items-center gap-2">
          <Plane size={16} className="text-muted-foreground" />
          <span className="text-muted-foreground font-medium">{flightStatus.flightNumber}</span>
        </div>
        <div className="text-lg font-medium">
          {flightStatus.departure.cityName} to {flightStatus.arrival.cityName}
        </div>
      </div>

      <div className="h-px grow bg-muted-foreground/20" />

      <Row row={flightStatus.arrival} type="departure" />

      <div className="flex flex-row gap-2 items-center">
        {hasValidTimestamps && (
          <>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={12} />
              <span>
          {differenceInHours(
            new Date(flightStatus.arrival.timestamp),
            new Date(flightStatus.departure.timestamp),
          )}{" "}
          hours
              </span>
        </div>
        <div>·</div>
          </>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin size={12} />
          <span>
            {flightStatus.totalDistanceInMiles > 0 
              ? `${flightStatus.totalDistanceInMiles} mi`
              : 'Distance unavailable'
            }
          </span>
        </div>
        <div className="h-px grow bg-muted-foreground/20 ml-2" />
      </div>

      <Row row={flightStatus.departure} type="arrival" />
    </div>
  );
}
