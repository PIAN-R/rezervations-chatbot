"use client";

import { useChat } from "ai/react";
import { differenceInHours, format } from "date-fns";
import { AlertCircle, Plane, Clock, MapPin } from "lucide-react";

const SAMPLE = {
  flights: [
    {
      id: "result_1",
      departure: {
        cityName: "San Francisco",
        airportCode: "SFO",
        timestamp: "2024-05-19T18:00:00Z",
      },
      arrival: {
        cityName: "Rome",
        airportCode: "FCO",
        timestamp: "2024-05-20T14:30:00Z",
      },
      airlines: ["United Airlines", "Lufthansa"],
      priceInUSD: 1200.5,
      numberOfStops: 1,
    },
    {
      id: "result_2",
      departure: {
        cityName: "San Francisco",
        airportCode: "SFO",
        timestamp: "2024-05-19T17:30:00Z",
      },
      arrival: {
        cityName: "Rome",
        airportCode: "FCO",
        timestamp: "2024-05-20T15:00:00Z",
      },
      airlines: ["British Airways"],
      priceInUSD: 1350,
      numberOfStops: 0,
    },
    {
      id: "result_3",
      departure: {
        cityName: "San Francisco",
        airportCode: "SFO",
        timestamp: "2024-05-19T19:15:00Z",
      },
      arrival: {
        cityName: "Rome",
        airportCode: "FCO",
        timestamp: "2024-05-20T16:45:00Z",
      },
      airlines: ["Delta Air Lines", "Air France"],
      priceInUSD: 1150.75,
      numberOfStops: 1,
    },
    {
      id: "result_4",
      departure: {
        cityName: "San Francisco",
        airportCode: "SFO",
        timestamp: "2024-05-19T16:30:00Z",
      },
      arrival: {
        cityName: "Rome",
        airportCode: "FCO",
        timestamp: "2024-05-20T13:50:00Z",
      },
      airlines: ["American Airlines", "Iberia"],
      totalDurationInMinutes: 740,
      priceInUSD: 1250.25,
      numberOfStops: 1,
    },
  ],
};

export function ListFlights({
  chatId,
  results = SAMPLE,
}: {
  chatId: string;
  results?: typeof SAMPLE;
}) {
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  });

  // Check if we have real data or fallback data
  const hasRealData = results !== SAMPLE && results.flights.length > 0;

  if (!hasRealData) {
    return (
      <div className="rounded-lg bg-muted px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">Using sample data</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Real flight data is temporarily unavailable. Showing sample flights for demonstration.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-muted px-4 py-1.5 flex flex-col">
      {results.flights.map((flight) => {
        const departureTime = flight.departure.timestamp && !isNaN(new Date(flight.departure.timestamp).getTime())
          ? format(new Date(flight.departure.timestamp), "h:mm a")
          : "-";
        
        const arrivalTime = flight.arrival.timestamp && !isNaN(new Date(flight.arrival.timestamp).getTime())
          ? format(new Date(flight.arrival.timestamp), "h:mm a")
          : "-";
        
        const duration = flight.departure.timestamp && flight.arrival.timestamp
          ? differenceInHours(
              new Date(flight.arrival.timestamp),
              new Date(flight.departure.timestamp),
            )
          : 0;

        return (
          <div
            key={flight.id}
            className="cursor-pointer flex flex-row border-b dark:border-zinc-700 py-3 last-of-type:border-none group hover:bg-muted/50 transition-colors"
            onClick={() => {
              // Pass the selected flight's details including price for consistency
              append({
                role: "user",
                content: `I would like to book the ${flight.airlines.join(", ")} flight for $${flight.priceInUSD.toFixed(0)}!`,
              });
            }}
          >
            <div className="flex flex-col w-full gap-1 justify-between">
              <div className="flex flex-row gap-2 text-base sm:text-base font-medium group-hover:underline">
                <div className="flex items-center gap-1">
                  <Clock size={14} className="text-muted-foreground" />
                  <span>{departureTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Plane size={14} className="text-muted-foreground" />
                  <span>{arrivalTime}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={12} />
                <span className="hidden sm:inline">{flight.airlines.join(", ")}</span>
                <span className="sm:hidden">{flight.airlines.length} airline{flight.airlines.length > 1 ? 's' : ''}</span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {flight.numberOfStops === 0 ? 'Non-stop' : `${flight.numberOfStops} stop${flight.numberOfStops > 1 ? 's' : ''}`}
              </div>
            </div>

            <div className="flex flex-col gap-1 items-end">
              <div className="flex flex-row gap-2">
                <div className="text-base sm:text-base text-emerald-600 dark:text-emerald-500 font-medium">
                  ${flight.priceInUSD.toFixed(0)}
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {duration > 0 ? `${duration}h` : ''}
              </div>
              
              <div className="text-xs text-muted-foreground flex flex-row items-center gap-1">
                <span>{flight.departure.airportCode}</span>
                <Plane size={10} />
                <span>{flight.arrival.airportCode}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
