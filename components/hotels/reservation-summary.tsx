import React from "react";

export interface HotelReservation {
  reservationId: string;
  hotelName: string;
  roomType: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  hasCompletedPayment: boolean;
}

export function ReservationSummary({
  reservation,
  onAuthorizePayment,
}: {
  reservation: HotelReservation;
  onAuthorizePayment: () => void;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-6 max-w-md mx-auto flex flex-col gap-4">
      <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Hotel Reservation Summary</div>
      <div className="flex flex-col gap-1 text-sm">
        <div><span className="font-medium">Hotel:</span> {reservation.hotelName}</div>
        <div><span className="font-medium">Room:</span> {reservation.roomType}</div>
        <div><span className="font-medium">Guest:</span> {reservation.guestName}</div>
        <div><span className="font-medium">Check-in:</span> {reservation.checkInDate}</div>
        <div><span className="font-medium">Check-out:</span> {reservation.checkOutDate}</div>
        <div><span className="font-medium">Total Price:</span> <span className="text-emerald-600 font-semibold">${reservation.totalPrice}</span></div>
      </div>
      <div className="flex flex-row items-center gap-2 mt-2">
        {reservation.hasCompletedPayment ? (
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded text-xs font-semibold">Payment Verified</span>
        ) : (
          <>
            <button
              className="px-4 py-1.5 rounded bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
              onClick={onAuthorizePayment}
            >
              Authorize Payment
            </button>
          </>
        )}
      </div>
    </div>
  );
} 