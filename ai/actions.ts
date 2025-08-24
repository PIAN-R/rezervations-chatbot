import { generateObject } from "ai";
import { z } from "zod";

import { geminiProModel } from ".";
import { amadeusClient } from "@/lib/amadeus";
import { findAirportCodes, getCityName, getAirportName } from "@/lib/airport-codes";
import { getAirlineName } from "@/lib/airline-codes";

export async function generateSampleFlightStatus({
  flightNumber,
  date,
}: {
  flightNumber: string;
  date: string;
}) {
  try {
    // Extract airline code from flight number (first 2 characters)
    const airlineCode = flightNumber.substring(0, 2).toUpperCase();
    
    // Search for flight status using Amadeus API
    const amadeusResponse = await amadeusClient.getFlightStatus({
      flightNumber: flightNumber,
      date: date,
    });

    if (amadeusResponse.data.length === 0) {
      throw new Error('No flight status found');
    }

    const flightData = amadeusResponse.data[0];
    
    // Transform Amadeus data to match our expected format
    const flightStatus = {
      flightNumber: flightData.flight.number,
      departure: {
        cityName: getCityName(flightData.departure.iataCode) || flightData.departure.iataCode,
        airportCode: flightData.departure.iataCode,
        airportName: getAirportName(flightData.departure.iataCode) || flightData.departure.iataCode,
        timestamp: flightData.departure.at,
        terminal: flightData.departure.terminal || 'TBD',
        gate: 'TBD', // Amadeus doesn't provide gate info in this endpoint
      },
      arrival: {
        cityName: getCityName(flightData.arrival.iataCode) || flightData.arrival.iataCode,
        airportCode: flightData.arrival.iataCode,
        airportName: getAirportName(flightData.arrival.iataCode) || flightData.arrival.iataCode,
        timestamp: flightData.arrival.at,
        terminal: flightData.arrival.terminal || 'TBD',
        gate: 'TBD', // Amadeus doesn't provide gate info in this endpoint
      },
      totalDistanceInMiles: 0, // Amadeus doesn't provide distance in this endpoint
    };

    return flightStatus;

  } catch (error) {
    console.error('Amadeus API error, falling back to mock data:', error);
    
    // Fallback to AI-generated mock data
    const { object: flightStatus } = await generateObject({
      model: geminiProModel,
      prompt: `Flight status for flight number ${flightNumber} on ${date}`,
      schema: z.object({
        flightNumber: z.string().describe("Flight number, e.g., BA123, AA31"),
        departure: z.object({
          cityName: z.string().describe("Name of the departure city"),
          airportCode: z.string().describe("IATA code of the departure airport"),
          airportName: z.string().describe("Full name of the departure airport"),
          timestamp: z.string().describe("ISO 8601 departure date and time"),
          terminal: z.string().describe("Departure terminal"),
          gate: z.string().describe("Departure gate"),
        }),
        arrival: z.object({
          cityName: z.string().describe("Name of the arrival city"),
          airportCode: z.string().describe("IATA code of the arrival airport"),
          airportName: z.string().describe("Full name of the arrival airport"),
          timestamp: z.string().describe("ISO 8601 arrival date and time"),
          terminal: z.string().describe("Arrival terminal"),
          gate: z.string().describe("Arrival gate"),
        }),
        totalDistanceInMiles: z
          .number()
          .describe("Total flight distance in miles"),
      }),
    });

    return flightStatus;
  }
}

export async function generateSampleFlightSearchResults({
  origin,
  destination,
  currency = "USD",
  mode = "oneway", // Add this
}: {
  origin: string;
  destination: string;
  currency?: string;
  mode?: "oneway" | "roundtrip";
}) {
  try {
    // Try to find airport codes for the given origin and destination
    const originCodes = findAirportCodes(origin);
    const destinationCodes = findAirportCodes(destination);
    
    if (originCodes.length === 0 || destinationCodes.length === 0) {
      throw new Error('Could not find airport codes for the specified cities');
    }

    // Use the first found codes for each city
    const originCode = originCodes[0];
    const destinationCode = destinationCodes[0];

    // Get tomorrow's date for the search
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const departureDate = tomorrow.toISOString().split('T')[0];

    // Search for flights using Amadeus API
    const amadeusResponse = await amadeusClient.searchFlights({
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate: departureDate,
      adults: 1,
      currencyCode: 'USD',
      max: 10,
    });

    // Transform Amadeus data to match our expected format
    const flights = amadeusResponse.data.slice(0, 4).map((offer) => {
      const firstItinerary = offer.itineraries[0];
      const firstSegment = firstItinerary.segments[0];
      const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1];

      // Get airline names from codes
      const airlines = offer.validatingAirlineCodes.map(code => 
        getAirlineName(code) || code
      );

      return {
        id: offer.id,
        departure: {
          cityName: getCityName(firstSegment.departure.iataCode) || firstSegment.departure.iataCode,
          airportCode: firstSegment.departure.iataCode,
          timestamp: firstSegment.departure.at,
        },
        arrival: {
          cityName: getCityName(lastSegment.arrival.iataCode) || lastSegment.arrival.iataCode,
          airportCode: lastSegment.arrival.iataCode,
          timestamp: lastSegment.arrival.at,
        },
        airlines: airlines,
        priceInUSD: parseFloat(offer.price.total),
        numberOfStops: firstItinerary.segments.length - 1,
      };
    });

    // For now, just return as is (real API always returns in requested currency)
    return { flights, mode };

  } catch (error) {
    console.error('Amadeus API error, falling back to mock data:', error);
    
    // Fallback to AI-generated mock data
    const { object: flightSearchResults } = await generateObject({
      model: geminiProModel,
      prompt: `Generate search results for flights from ${origin} to ${destination}, limit to 4 results, prices in ${currency}`,
      output: "array",
      schema: z.object({
        id: z.string().describe("Unique identifier for the flight, like BA123, AA31, etc."),
        departure: z.object({
          cityName: z.string().describe("Name of the departure city"),
          airportCode: z.string().describe("IATA code of the departure airport"),
          timestamp: z.string().describe("ISO 8601 departure date and time"),
        }),
        arrival: z.object({
          cityName: z.string().describe("Name of the arrival city"),
          airportCode: z.string().describe("IATA code of the arrival airport"),
          timestamp: z.string().describe("ISO 8601 arrival date and time"),
        }),
        airlines: z.array(z.string().describe("Airline names, e.g., American Airlines, Emirates")),
        price: z.number().describe(`Flight price in ${currency}`),
        numberOfStops: z.number().describe("Number of stops during the flight"),
        currency: z.string().describe("Currency code for the price"),
      }),
    });
    // Map to expected frontend format
    const flights = flightSearchResults.map((f: any) => ({
      ...f,
      priceInUSD: f.price, // For now, use price as priceInUSD for compatibility
      currency: currency,
    }));
    return { flights, mode: "oneway" }; // Ensure mode is set to oneway for fallback
  }
}

export async function generateSampleSeatSelection({
  flightNumber,
}: {
  flightNumber: string;
}) {
  try {
    // Always generate a full set of rows for all classes for demo/testing
    const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const allSeats: any[] = [];
    // First Class (rows 1-2)
    for (let row = 1; row <= 2; row++) {
      for (let seat = 0; seat < 6; seat++) {
        const seatNumber = `${row}${seatLetters[seat]}`;
        const isWindow = seat === 0 || seat === 5;
        const isAisle = seat === 2 || seat === 3;
        const isMiddle = seat === 1 || seat === 4;
        let price = 150;
        if (isWindow) price = 180;
        else if (isAisle) price = 160;
        else if (isMiddle) price = 140;
        const isAvailable = Math.random() > 0.2;
        allSeats.push({
          seatNumber,
          priceInUSD: price,
          isAvailable,
          class: "First Class",
        });
      }
    }
    // Business Class (rows 3-5)
    for (let row = 3; row <= 5; row++) {
      for (let seat = 0; seat < 6; seat++) {
        const seatNumber = `${row}${seatLetters[seat]}`;
        const isWindow = seat === 0 || seat === 5;
        const isAisle = seat === 2 || seat === 3;
        const isMiddle = seat === 1 || seat === 4;
        let price = 100;
        if (isWindow) price = 120;
        else if (isAisle) price = 110;
        else if (isMiddle) price = 90;
        const isAvailable = Math.random() > 0.3;
        allSeats.push({
          seatNumber,
          priceInUSD: price,
          isAvailable,
          class: "Business Class",
        });
      }
    }
    // Economy Class (rows 6-10)
    for (let row = 6; row <= 10; row++) {
      for (let seat = 0; seat < 6; seat++) {
        const seatNumber = `${row}${seatLetters[seat]}`;
        const isWindow = seat === 0 || seat === 5;
        const isAisle = seat === 2 || seat === 3;
        const isMiddle = seat === 1 || seat === 4;
        let price = 45;
        if (isWindow) price = 60;
        else if (isAisle) price = 50;
        else if (isMiddle) price = 35;
        const isAvailable = Math.random() > 0.4;
        allSeats.push({
          seatNumber,
          priceInUSD: price,
          isAvailable,
          class: "Economy Class",
        });
      }
    }
    // Transform flat array to 2D array for component compatibility (not used by new UI, but kept for compatibility)
    const seatRows: any[][] = [];
    for (let i = 0; i < allSeats.length; i += 6) {
      seatRows.push(allSeats.slice(i, i + 6));
    }
    return { seats: seatRows.flat() };
  } catch (error) {
    // fallback: same as above
    const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const allSeats: any[] = [];
    for (let row = 1; row <= 10; row++) {
      let className = "Economy Class";
      if (row <= 2) className = "First Class";
      else if (row <= 5) className = "Business Class";
      for (let seat = 0; seat < 6; seat++) {
        const seatNumber = `${row}${seatLetters[seat]}`;
        const isAvailable = Math.random() > 0.3;
        allSeats.push({
          seatNumber,
          priceInUSD: 50,
          isAvailable,
          class: className,
        });
      }
    }
    return { seats: allSeats };
  }
}

export async function generateReservationPrice(props: {
  seats: string[];
  flightNumber: string;
  departure: {
    cityName: string;
    airportCode: string;
    timestamp: string;
    gate: string;
    terminal: string;
  };
  arrival: {
    cityName: string;
    airportCode: string;
    timestamp: string;
    gate: string;
    terminal: string;
  };
  passengerName: string;
  selectedFlightPrice?: number;
  selectedSeatPrice?: number;
}) {
  // If we have both selected flight and seat price, sum them for the total
  if (props.selectedFlightPrice !== undefined && props.selectedSeatPrice !== undefined) {
    return { totalPriceInUSD: props.selectedFlightPrice + props.selectedSeatPrice };
  }
  // If only flight price is available, use it
  if (props.selectedFlightPrice !== undefined) {
    return { totalPriceInUSD: props.selectedFlightPrice };
  }

  // Fallback to AI-generated price if no selected price is provided
  const { object: reservation } = await generateObject({
    model: geminiProModel,
    prompt: `Generate price for the following reservation \n\n ${JSON.stringify(props, null, 2)}`,
    schema: z.object({
      totalPriceInUSD: z
        .number()
        .describe("Total reservation price in US dollars"),
    }),
  });

  return reservation;
}

// --- Hotel Booking: Mock Data and Sample Search Function ---

export async function generateSampleHotelSearchResults({
  city,
  checkInDate,
  checkOutDate,
  adults = 1,
  roomQuantity = 1,
}: {
  city: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  roomQuantity?: number;
}) {
  // For now, return mock data. Later, call amadeusClient.searchHotels if desired.
  const hotels = [
    {
      id: 'hotel_1',
      name: 'The Grand London Hotel',
      address: '123 London St, London, UK',
      pricePerNight: 220,
      totalNights: 3,
      totalPrice: 660,
      rating: 4.7,
      amenities: ['Free WiFi', 'Breakfast included', 'Gym', 'Bar'],
      roomType: 'Deluxe King Room',
      imageUrl: '',
    },
    {
      id: 'hotel_2',
      name: 'City Center Inn',
      address: '456 Central Ave, London, UK',
      pricePerNight: 150,
      totalNights: 3,
      totalPrice: 450,
      rating: 4.2,
      amenities: ['Free WiFi', 'Breakfast included'],
      roomType: 'Standard Double Room',
      imageUrl: '',
    },
    {
      id: 'hotel_3',
      name: 'Budget Stay London',
      address: '789 Budget Rd, London, UK',
      pricePerNight: 90,
      totalNights: 3,
      totalPrice: 270,
      rating: 3.8,
      amenities: ['Free WiFi'],
      roomType: 'Single Room',
      imageUrl: '',
    },
  ];
  return { hotels };
}

// --- Hotel Booking: Mock Data and Sample Room Selection, Reservation, and Payment ---

export async function generateSampleHotelRoomSelection({ hotelId }: { hotelId: string }) {
  // For now, return mock room options for the selected hotel
  const rooms = [
    {
      id: 'room_1',
      type: 'Deluxe King Room',
      pricePerNight: 220,
      amenities: ['Free WiFi', 'Breakfast included', 'Gym', 'Bar'],
      refundable: true,
      imageUrl: '',
    },
    {
      id: 'room_2',
      type: 'Standard Double Room',
      pricePerNight: 150,
      amenities: ['Free WiFi', 'Breakfast included'],
      refundable: false,
      imageUrl: '',
    },
    {
      id: 'room_3',
      type: 'Single Room',
      pricePerNight: 90,
      amenities: ['Free WiFi'],
      refundable: false,
      imageUrl: '',
    },
  ];
  return { rooms };
}

export async function generateSampleHotelReservation({
  hotelId,
  roomId,
  guestName,
  checkInDate,
  checkOutDate,
  totalPrice,
}: {
  hotelId: string;
  roomId: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
}) {
  // Return a mock reservation object
  return {
    reservationId: 'hotel_res_123',
    hotelId,
    roomId,
    guestName,
    checkInDate,
    checkOutDate,
    totalPrice,
    hasCompletedPayment: false,
  };
}

export async function generateSampleHotelPaymentAuthorization({ reservationId }: { reservationId: string }) {
  // Simulate payment authorization
  return { reservationId };
}

export async function generateSampleHotelPaymentVerification({ reservationId }: { reservationId: string }) {
  // Simulate payment verification (always successful for mock)
  return { hasCompletedPayment: true };
}
