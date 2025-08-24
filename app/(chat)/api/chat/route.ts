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
        - if the user asks for a flight today, skip any date selection and call searchFlights with departureDate set to the current date
        - CRITICAL: Always respond in the same language the user is using. If they speak Romanian, respond in Romanian. If they speak English, respond in English. If they speak Russian, respond in Russian.
        - C and D are aisle seats, A and F are window seats, B and E are middle seats
        - assume the most popular airports for the origin and destination
        - IMPORTANT: When a user selects a flight with a specific price (e.g., "book the United Airlines flight for $1200"), 
          extract that price and pass it as selectedFlightPrice to createReservation to ensure price consistency
        - IMPORTANT: When a user selects a seat with a specific price (e.g., "seat 1A in Economy Class for $50"), 
          extract that price and pass it as selectedSeatPrice to createReservation, and sum it with selectedFlightPrice for the total
        - FLIGHT & HOTEL BOOKING FLOW UPDATE: 
          - FIRST: Always ask the user to confirm their trip type BEFORE showing any calendar:
            * For flights: Ask "Would you like a one-way or round-trip flight?" (in the user's language)
            * For hotels: Ask "Would you like to check-in and check-out on specific dates?" (in the user's language)
          - SECOND: Wait for user confirmation of trip type
          - THIRD: Use the selectDates tool to show a calendar for date selection
          - FOURTH: Wait for user to select dates before proceeding to searchFlights or searchHotels
          - IMPORTANT: Never skip the trip type confirmation step - this is mandatory for all languages
          - LANGUAGE EXAMPLES:
            * English: "Would you like a one-way or round-trip flight?"
            * Romanian: "Te rog să confirmi tipul de zbor: dus-întors sau doar dus?"
            * Russian: "Пожалуйста, подтвердите тип полета: в одну сторону или туда-обратно?"
        - CRITICAL CURRENCY HANDLING: Always use the user's selected currency for all price displays and tool calls. If the user changes the currency:
          * IMMEDIATELY call selectDates again with the new currency to refresh the calendar
          * Update all subsequent tool calls to use the new currency
          * Never mix currencies in the same conversation
          * When user says "change currency to X", call selectDates with currency: X
        - here's the optimal flight booking flow:
          - STEP 1: Ask user to confirm trip type (one-way vs round-trip) in their language
          - STEP 2: selectDates (calendar step for date selection) - IMPORTANT: Pass the correct mode parameter:
            * For one-way: mode: "oneway" (shows single date selection)
            * For round-trip: mode: "roundtrip" (shows departure and return date selection)
          - DATE AVAILABILITY: When user selects a date from the calendar, that date IS available. Never tell the user a selected date is unavailable.
          - CALENDAR INTERACTION: The calendar shows available dates with prices. If a date has a price, it's available. If it shows "Sold out", it's unavailable.
          - CALENDAR MODE: The calendar will automatically display in the correct mode based on the mode parameter you pass
          - CALENDAR LANGUAGE: The calendar will automatically display text in the user's language (Romanian, English, or Russian)
          - STEP 3: search for flights - IMPORTANT: Pass the same mode parameter from step 1:
            * If user selected one-way: mode: "oneway"
            * If user selected round-trip: mode: "roundtrip"
          - STEP 4: choose flight (extract and remember the selected flight's price)
          - STEP 5: select seats (extract and remember the selected seat's price)
          - STEP 6: create reservation (use the sum of selected flight and seat price for consistency)
          - STEP 7: authorize payment (requires user consent, wait for user to finish payment and let you know when done)
          - STEP 8: verify payment (ALWAYS call verifyPayment after payment authorization)
          - STEP 9: display boarding pass (ONLY after user confirms payment is complete with "done" or equivalent in their language)
            * English: "done", "finished", "complete"
            * Romanian: "gata", "terminat", "complet"
            * Russian: "готово", "завершено", "закончено"
        - here's the optimal hotel booking flow:
          - selectDates (calendar step for check-in/check-out selection)
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
          currency: z.string().default("USD"),
          mode: z.enum(["oneway", "roundtrip"]).default("oneway"), // Add this
        }),
        execute: async ({ origin, destination, currency, mode }) => {
          const results = await generateSampleFlightSearchResults({
            origin,
            destination,
            currency,
            mode, // Pass mode to the mock generator
          });
          // Attach mode to the result so the frontend can use it
          return { ...results, mode };
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
      selectDates: {
        description: "Show a calendar for the user to select travel dates, with prices and availability.",
        parameters: z.object({
          mode: z.enum(["oneway", "roundtrip"]).default("oneway"),
          context: z.enum(["flight", "hotel"]).default("flight"),
          origin: z.string().optional(),
          destination: z.string().optional(),
          city: z.string().optional(),
          currency: z.string().default("USD"),
        }),
        execute: async ({ mode, context, currency }) => {
          // Generate mock availableDates for the next 30 days
          const today = new Date();
          const availableDates = Array.from({ length: 30 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const iso = date.toISOString().slice(0, 10);
            // Randomly mark some days as sold out
            const available = Math.random() > 0.15;
            // Random price between 70 and 300, or null if sold out
            const price = available ? Math.floor(Math.random() * 230) + 70 : null;
            return {
              date: iso,
              price,
              currency,
              available,
            };
          });
          return {
            mode,
            availableDates,
            selected: null,
            currency,
            currencies: ["EUR", "USD", "GBP"],
          };
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
