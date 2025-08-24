"use client";

import { useChat } from "ai/react";
import { differenceInHours, format } from "date-fns";
import { AlertCircle, Plane, Clock, MapPin } from "lucide-react";
import { useLanguage } from "../custom/language-provider";
import { useState } from "react";

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
  tripType = "oneway",
}: {
  chatId: string;
  results?: typeof SAMPLE;
  tripType?: "oneway" | "roundtrip";
}) {
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  });
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Check if we have real data or fallback data
  const hasRealData = results !== SAMPLE && results.flights.length > 0;

  if (!hasRealData) {
    return (
      <div className="rounded-lg bg-muted px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">{t('usingSampleData')}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('realFlightDataUnavailable')}
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

        const isExpanded = expandedId === flight.id;

        return (
          <div
            key={flight.id}
            className="cursor-pointer flex flex-row border-b dark:border-zinc-700 py-3 last-of-type:border-none group hover:bg-muted/50 transition-colors relative"
          >
            <div className="flex flex-col w-full gap-1 justify-between">
              <div className="flex flex-row gap-2 text-base sm:text-base font-medium group-hover:underline items-center">
                <div className="flex items-center gap-1">
                  <Clock size={14} className="text-muted-foreground" />
                  <span>{departureTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Plane size={14} className="text-muted-foreground" />
                  <span>{arrivalTime}</span>
                </div>
                {/* One Way badge */}
                <span className="ml-2 px-2 py-0.5 rounded bg-zinc-800 text-xs text-zinc-100 font-semibold border border-zinc-700">
                  {tripType === "roundtrip" ? t('roundTrip') : t('oneWay')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={12} />
                <span className="hidden sm:inline">{flight.airlines.join(", ")}</span>
                <span className="sm:hidden">{flight.airlines.length} airline{flight.airlines.length > 1 ? 's' : ''}</span>
              </div>
              {/* Stops clickable */}
              <div className="text-xs text-muted-foreground">
                <button
                  type="button"
                  className="underline hover:text-primary focus:outline-none"
                  onClick={() => setExpandedId(isExpanded ? null : flight.id)}
                  tabIndex={0}
                >
                  {flight.numberOfStops === 0 ? t('nonStop') : t('stop', {count: flight.numberOfStops})}
                </button>
              </div>
              {/* Expanded stop details */}
              {isExpanded && (
                <div className="mt-2 p-2 rounded bg-zinc-900 text-xs text-zinc-100 border border-zinc-700">
                  {/* Placeholder for stop details */}
                  {flight.numberOfStops > 0
                    ? t('noStopDetails')
                    : t('noStopsOnThisFlight')}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 items-end">
              <div className="flex flex-row gap-2">
                <div className="text-base sm:text-base text-emerald-600 dark:text-emerald-500 font-medium">
                  {new Intl.NumberFormat(t('currency'), {
                    style: 'currency',
                    currency: flight.currency || 'USD',
                    maximumFractionDigits: 0,
                  }).format(flight.price || flight.priceInUSD)}
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
              {/* Book button (moved here for clarity, optional) */}
              <button
                className="mt-2 px-3 py-1 rounded bg-emerald-700 text-xs text-white font-semibold hover:bg-emerald-800"
                onClick={() => {
                  append({
                    role: "user",
                    content: t('bookFlightFor', {airline: flight.airlines.join(", "), price: `$${flight.priceInUSD.toFixed(0)}`}),
                  });
                }}
              >
                {t('book')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
