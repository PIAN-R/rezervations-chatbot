"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useState } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import { AuthorizePayment } from "../flights/authorize-payment";
import { DisplayBoardingPass } from "../flights/boarding-pass";
import { CreateReservation } from "../flights/create-reservation";
import { FlightStatus } from "../flights/flight-status";
import { ListFlights } from "../flights/list-flights";
import { SelectSeats } from "../flights/select-seats";
import { VerifyPayment } from "../flights/verify-payment";
import { ListHotels } from "../hotels/list-hotels";
import { SelectRoom } from "../hotels/select-room";
import { ReservationSummary } from "../hotels/reservation-summary";
import { BookingConfirmation } from "../hotels/booking-confirmation";
import { Calendar } from "./calendar";
import type { Message as AIMessage } from "ai";
import { useLanguage } from "./language-provider";

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
  append,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
  append: (
    message: { role: string; content: string },
    chatRequestOptions?: any
  ) => Promise<string | null | undefined>;
}) => {
  // Track selected currency for optimistic UI updates
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const { t, lang, translations } = useLanguage();

  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20 mb-4`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === "string" && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;
                console.log("TOOL INVOCATION:", toolName, result);
                // For selectDates, allow optimistic currency switching
                if (toolName === "selectDates") {
                  const currency = selectedCurrency || result.currency || "USD";
                  console.log("Calendar currency debug:", { selectedCurrency, resultCurrency: result.currency, finalCurrency: currency });
                  return (
                    <Calendar
                      mode={result.mode || "oneway"}
                      availableDates={result.availableDates || []}
                      selected={result.selected || null}
                      onSelect={(dateOrRange) => {
                        let dateString = "";
                        let messageContent = "";
                        
                        console.log("Calendar onSelect called with:", dateOrRange);
                        console.log("Translation function available:", !!t);
                        console.log("Current language:", lang);
                        console.log("Translation key test:", t("departureDateSelected", { date: "test", currency: "USD" }));
                        console.log("Available translation keys:", Object.keys(translations || {}).slice(0, 10));
                        
                        // Handle different date selection modes
                        if (result.mode === "roundtrip" && Array.isArray(dateOrRange)) {
                          const [from, to] = dateOrRange;
                          if (from && to && to !== from) {
                            // Both dates selected (different dates)
                            dateString = `${from.toISOString().slice(0, 10)} to ${to.toISOString().slice(0, 10)}`;
                            messageContent = t("dateSelected", { 
                              date: dateString, 
                              currency: currency 
                            });
                            console.log("Roundtrip both dates message:", messageContent);
                          } else if (from) {
                            // Only departure date selected (to is undefined or same as from)
                            dateString = from.toISOString().slice(0, 10);
                            messageContent = t("departureDateSelected", { 
                              date: dateString, 
                              currency: currency 
                            });
                            console.log("Roundtrip departure only message:", messageContent);
                          } else {
                            messageContent = t("noDateSelected");
                            console.log("No date selected message:", messageContent);
                          }
                        } else if (dateOrRange instanceof Date) {
                          dateString = dateOrRange.toISOString().slice(0, 10);
                          messageContent = t("dateSelected", { 
                            date: dateString, 
                            currency: currency 
                          });
                          console.log("Single date message:", messageContent);
                        } else {
                          messageContent = t("noDateSelected");
                          console.log("No date selected message:", messageContent);
                        }
                        
                        console.log("Final message content:", messageContent);
                        
                        append({
                          role: "user",
                          content: messageContent
                        });
                      }}
                      currency={currency}
                      onCurrencyChange={(cur) => {
                        setSelectedCurrency(cur); // Optimistically update UI
                        // Send a clear message to the AI about currency change
                        append({ 
                          role: "user", 
                          content: `I want to change the currency to ${cur}. Please update all prices and continue in ${cur}.` 
                        });
                      }}
                      currencies={result.currencies || ["EUR", "USD", "GBP"]}
                    />
                  );
                } else if (toolName === "searchFlights") {
                  // Pass mode/tripType from previous selectDates or result if available
                  const tripType = result.mode || result.tripType || "oneway";
                  return (
                    <ListFlights chatId={chatId} results={result} tripType={tripType} />
                  );
                }

                return (
                  <div key={toolCallId}>
                    {toolName === "getWeather" ? (
                      <Weather weatherAtLocation={result} />
                    ) : toolName === "displayFlightStatus" ? (
                      <FlightStatus flightStatus={result} />
                    ) : toolName === "searchFlights" ? (
                      <ListFlights chatId={chatId} results={result} />
                    ) : toolName === "selectSeats" ? (
                      <SelectSeats chatId={chatId} availability={result} />
                    ) : toolName === "createReservation" ? (
                      Object.keys(result).includes("error") ? null : (
                        <CreateReservation reservation={result} />
                      )
                    ) : toolName === "authorizePayment" ? (
                      <AuthorizePayment intent={result} />
                    ) : toolName === "displayBoardingPass" ? (
                      <DisplayBoardingPass boardingPass={result} />
                    ) : toolName === "verifyPayment" ? (
                      <VerifyPayment result={result} />
                    ) : toolName === "searchHotels" ? (
                      <ListHotels hotels={result.hotels} onSelect={(hotelId) => {
                        const hotel = result.hotels.find((h: any) => h.id === hotelId);
                        if (hotel) append({ role: "user", content: `Select ${hotel.name}` });
                      }} />
                    ) : toolName === "selectHotelRoom" ? (
                      <SelectRoom rooms={result.rooms} onSelect={(roomId) => {
                        const room = result.rooms.find((r: any) => r.id === roomId);
                        if (room) append({ role: "user", content: `Book ${room.type}` });
                      }} />
                    ) : toolName === "createHotelReservation" ? (
                      <ReservationSummary reservation={result} onAuthorizePayment={() => {}} />
                    ) : toolName === "authorizeHotelPayment" ? (
                      <ReservationSummary reservation={result} onAuthorizePayment={() => {}} />
                    ) : toolName === "verifyHotelPayment" ? (
                      <ReservationSummary reservation={result} onAuthorizePayment={() => {}} />
                    ) : toolName === "displayHotelBookingConfirmation" ? (
                      <BookingConfirmation {...result} onBackToHome={() => {}} />
                    ) : (
                      <div>{JSON.stringify(result, null, 2)}</div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    {toolName === "getWeather" ? (
                      <Weather />
                    ) : toolName === "displayFlightStatus" ? (
                      <FlightStatus />
                    ) : toolName === "searchFlights" ? (
                      <ListFlights chatId={chatId} />
                    ) : toolName === "selectSeats" ? (
                      <SelectSeats chatId={chatId} />
                    ) : toolName === "createReservation" ? (
                      <CreateReservation />
                    ) : toolName === "authorizePayment" ? (
                      <AuthorizePayment />
                    ) : toolName === "displayBoardingPass" ? (
                      <DisplayBoardingPass />
                    ) : null}
                  </div>
                );
              }
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
