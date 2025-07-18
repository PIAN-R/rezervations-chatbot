import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import {
  generateReservationPrice,
  generateSampleFlightSearchResults,
  generateSampleFlightStatus,
  generateSampleSeatSelection,
  generateSampleHotelSearchResults,
  generateSampleHotelRoomSelection,
  generateSampleHotelReservation,
  generateSampleHotelPaymentAuthorization,
  generateSampleHotelPaymentVerification,
} from "@/ai/actions";
import { auth } from "@/app/(auth)/auth";
import {
  createReservation,
  deleteChatById,
  getChatById,
  getReservationById,
  saveChat,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: geminiProModel,
    system: `
        - you help users book flights and hotels!
        - keep your responses limited to a sentence.
        - DO NOT output lists.
        - after every tool call, pretend you're showing the result to the user and keep your response limited to a phrase.
        - today's date is ${new Date().toLocaleDateString()}.
        - ask follow up questions to nudge user into the optimal flow
        - ask for any details you don't know, like name of passenger or hotel guest, etc.
        - C and D are aisle seats, A and F are window seats, B and E are middle seats
        - assume the most popular airports for the origin and destination
        - IMPORTANT: When a user selects a flight with a specific price (e.g., "book the United Airlines flight for $1200"), 
          extract that price and pass it as selectedFlightPrice to createReservation to ensure price consistency
        - IMPORTANT: When a user selects a seat with a specific price (e.g., "seat 1A in Economy Class for $50"), 
          extract that price and pass it as selectedSeatPrice to createReservation, and sum it with selectedFlightPrice for the total
        - here's the optimal flight booking flow:
          - search for flights
          - choose flight (extract and remember the selected flight's price)
          - select seats (extract and remember the selected seat's price)
          - create reservation (use the sum of selected flight and seat price for consistency)
          - authorize payment (requires user consent, wait for user to finish payment and let you know when done)
          - display boarding pass (DO NOT display boarding pass without verifying payment)
        - here's the optimal hotel booking flow:
          - search for hotels (city, check-in/check-out, guests)
          - choose hotel
          - select room (extract and remember the selected room's price)
          - create hotel reservation (pass all details and total price)
          - authorize hotel payment (requires user consent, wait for user to finish payment and let you know when done)
          - verify hotel payment (ALWAYS call verifyHotelPayment after payment authorization)
          - IMPORTANT: ONLY call displayHotelBookingConfirmation after verifyHotelPayment returns hasCompletedPayment: true
          - display hotel booking confirmation (DO NOT display confirmation without verifying payment)
      `,
    messages: coreMessages,
    tools: {
      getWeather: {
        description: "Get the current weather at a location",
        parameters: z.object({
          latitude: z.number().describe("Latitude coordinate"),
          longitude: z.number().describe("Longitude coordinate"),
        }),
        execute: async ({ latitude, longitude }) => {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
          );

          const weatherData = await response.json();
          return weatherData;
        },
      },
      displayFlightStatus: {
        description: "Display the status of a flight",
        parameters: z.object({
          flightNumber: z.string().describe("Flight number"),
          date: z.string().describe("Date of the flight"),
        }),
        execute: async ({ flightNumber, date }) => {
          const flightStatus = await generateSampleFlightStatus({
            flightNumber,
            date,
          });

          return flightStatus;
        },
      },
      searchFlights: {
        description: "Search for flights based on the given parameters",
        parameters: z.object({
          origin: z.string().describe("Origin airport or city"),
          destination: z.string().describe("Destination airport or city"),
        }),
        execute: async ({ origin, destination }) => {
          const results = await generateSampleFlightSearchResults({
            origin,
            destination,
          });

          return results;
        },
      },
      selectSeats: {
        description: "Select seats for a flight",
        parameters: z.object({
          flightNumber: z.string().describe("Flight number"),
        }),
        execute: async ({ flightNumber }) => {
          const seats = await generateSampleSeatSelection({ flightNumber });
          return seats;
        },
      },
      createReservation: {
        description: "Display pending reservation details",
        parameters: z.object({
          seats: z.string().array().describe("Array of selected seat numbers"),
          flightNumber: z.string().describe("Flight number"),
          departure: z.object({
            cityName: z.string().describe("Name of the departure city"),
            airportCode: z.string().describe("Code of the departure airport"),
            timestamp: z.string().describe("ISO 8601 date of departure"),
            gate: z.string().describe("Departure gate"),
            terminal: z.string().describe("Departure terminal"),
          }),
          arrival: z.object({
            cityName: z.string().describe("Name of the arrival city"),
            airportCode: z.string().describe("Code of the arrival airport"),
            timestamp: z.string().describe("ISO 8601 date of arrival"),
            gate: z.string().describe("Arrival gate"),
            terminal: z.string().describe("Arrival terminal"),
          }),
          passengerName: z.string().describe("Name of the passenger"),
          selectedFlightPrice: z.number().optional().describe("Price of the selected flight for consistency"),
          selectedSeatPrice: z.number().optional().describe("Price of the selected seat for consistency"),
        }),
        execute: async (props) => {
          // Sum flight and seat price for total
          let totalPriceInUSD = 0;
          if (props.selectedFlightPrice !== undefined && props.selectedSeatPrice !== undefined) {
            totalPriceInUSD = props.selectedFlightPrice + props.selectedSeatPrice;
          } else if (props.selectedFlightPrice !== undefined) {
            totalPriceInUSD = props.selectedFlightPrice;
          }
          const session = await auth();

          const id = generateUUID();

          if (session && session.user && session.user.id) {
            await createReservation({
              id,
              userId: session.user.id,
              details: { ...props, totalPriceInUSD },
            });

            return { id, ...props, totalPriceInUSD };
          } else {
            return {
              error: "User is not signed in to perform this action!",
            };
          }
        },
      },
      authorizePayment: {
        description:
          "User will enter credentials to authorize payment, wait for user to repond when they are done",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
        }),
        execute: async ({ reservationId }) => {
          return { reservationId };
        },
      },
      verifyPayment: {
        description: "Verify payment status",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
        }),
        execute: async ({ reservationId }) => {
          const reservation = await getReservationById({ id: reservationId });

          if (reservation.hasCompletedPayment) {
            return { hasCompletedPayment: true };
          } else {
            return { hasCompletedPayment: false };
          }
        },
      },
      displayBoardingPass: {
        description: "Display a boarding pass",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
          passengerName: z
            .string()
            .describe("Name of the passenger, in title case"),
          flightNumber: z.string().describe("Flight number"),
          seat: z.string().describe("Seat number"),
          departure: z.object({
            cityName: z.string().describe("Name of the departure city"),
            airportCode: z.string().describe("Code of the departure airport"),
            airportName: z.string().describe("Name of the departure airport"),
            timestamp: z.string().describe("ISO 8601 date of departure"),
            terminal: z.string().describe("Departure terminal"),
            gate: z.string().describe("Departure gate"),
          }),
          arrival: z.object({
            cityName: z.string().describe("Name of the arrival city"),
            airportCode: z.string().describe("Code of the arrival airport"),
            airportName: z.string().describe("Name of the arrival airport"),
            timestamp: z.string().describe("ISO 8601 date of arrival"),
            terminal: z.string().describe("Arrival terminal"),
            gate: z.string().describe("Arrival gate"),
          }),
        }),
        execute: async (boardingPass) => {
          return boardingPass;
        },
      },
      searchHotels: {
        description: "Search for hotels in a city for given dates",
        parameters: z.object({
          city: z.string().describe("City name for the hotel search"),
          checkInDate: z.string().describe("Check-in date (YYYY-MM-DD)"),
          checkOutDate: z.string().describe("Check-out date (YYYY-MM-DD)"),
          adults: z.number().optional().describe("Number of adults"),
          roomQuantity: z.number().optional().describe("Number of rooms"),
        }),
        execute: async ({ city, checkInDate, checkOutDate, adults, roomQuantity }) => {
          return await generateSampleHotelSearchResults({ city, checkInDate, checkOutDate, adults, roomQuantity });
        },
      },
      selectHotelRoom: {
        description: "Select a room for a hotel",
        parameters: z.object({
          hotelId: z.string().describe("Hotel ID"),
        }),
        execute: async ({ hotelId }) => {
          return await generateSampleHotelRoomSelection({ hotelId });
        },
      },
      createHotelReservation: {
        description: "Create a hotel reservation",
        parameters: z.object({
          hotelId: z.string().describe("Hotel ID"),
          roomId: z.string().describe("Room ID"),
          guestName: z.string().describe("Guest name"),
          checkInDate: z.string().describe("Check-in date (YYYY-MM-DD)"),
          checkOutDate: z.string().describe("Check-out date (YYYY-MM-DD)"),
          totalPrice: z.number().describe("Total price for the stay"),
        }),
        execute: async ({ hotelId, roomId, guestName, checkInDate, checkOutDate, totalPrice }) => {
          return await generateSampleHotelReservation({ hotelId, roomId, guestName, checkInDate, checkOutDate, totalPrice });
        },
      },
      authorizeHotelPayment: {
        description: "Authorize payment for a hotel reservation",
        parameters: z.object({
          reservationId: z.string().describe("Hotel reservation ID"),
        }),
        execute: async ({ reservationId }) => {
          return await generateSampleHotelPaymentAuthorization({ reservationId });
        },
      },
      verifyHotelPayment: {
        description: "Verify payment status for a hotel reservation",
        parameters: z.object({
          reservationId: z.string().describe("Hotel reservation ID"),
        }),
        execute: async ({ reservationId }) => {
          return await generateSampleHotelPaymentVerification({ reservationId });
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
