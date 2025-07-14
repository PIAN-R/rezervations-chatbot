import React from "react";

export interface HotelBookingConfirmationProps {
  reservationId: string;
  hotelName: string;
  roomType: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  onBackToHome: () => void;
}

export function BookingConfirmation({
  reservationId,
  hotelName,
  roomType,
  guestName,
  checkInDate,
  checkOutDate,
  onBackToHome,
}: HotelBookingConfirmationProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-6 max-w-md mx-auto flex flex-col gap-4 items-center">
      <div className="flex flex-row items-center gap-2 mb-2">
        <span className="bg-emerald-600 text-white rounded-full p-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
        <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Booking Confirmed!</span>
      </div>
      <div className="flex flex-col gap-1 text-sm w-full">
        <div><span className="font-medium">Hotel:</span> {hotelName}</div>
        <div><span className="font-medium">Room:</span> {roomType}</div>
        <div><span className="font-medium">Guest:</span> {guestName}</div>
        <div><span className="font-medium">Check-in:</span> {checkInDate}</div>
        <div><span className="font-medium">Check-out:</span> {checkOutDate}</div>
        <div><span className="font-medium">Reservation ID:</span> <span className="text-xs text-zinc-500">{reservationId}</span></div>
      </div>
      <button
        className="mt-4 px-4 py-2 rounded bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
        onClick={onBackToHome}
      >
        Back to Home
      </button>
    </div>
  );
} 