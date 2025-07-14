import React from "react";

export interface Hotel {
  id: string;
  name: string;
  address: string;
  pricePerNight: number;
  totalNights: number;
  totalPrice: number;
  rating: number;
  amenities: string[];
  roomType: string;
  imageUrl?: string;
}

export function ListHotels({ hotels, onSelect }: {
  hotels: Hotel[];
  onSelect: (hotelId: string) => void;
}) {
  if (!hotels || hotels.length === 0) {
    return (
      <div className="rounded-lg bg-muted px-4 py-3 flex flex-col gap-2 text-center text-muted-foreground">
        No hotels found for your search.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {hotels.map((hotel) => (
        <div
          key={hotel.id}
          className="flex flex-row bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Image placeholder */}
          <div className="w-32 h-32 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
            {hotel.imageUrl ? (
              <img src={hotel.imageUrl} alt={hotel.name} className="object-cover w-full h-full" />
            ) : (
              <span className="text-zinc-400 text-xs">No Image</span>
            )}
          </div>
          {/* Hotel Info */}
          <div className="flex-1 flex flex-col p-4 gap-2">
            <div className="flex flex-row items-center gap-2">
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{hotel.name}</span>
              <span className="ml-auto bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded">${hotel.pricePerNight}/night</span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">{hotel.address}</div>
            <div className="flex flex-row items-center gap-2 text-sm">
              <span className="text-yellow-500 font-semibold">★ {hotel.rating}</span>
              <span className="text-xs text-zinc-400">{hotel.roomType}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {hotel.amenities.map((a) => (
                <span key={a} className="bg-zinc-100 dark:bg-zinc-800 text-xs px-2 py-0.5 rounded-full text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">{a}</span>
              ))}
            </div>
            <div className="flex flex-row items-center gap-2 mt-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Total: ${hotel.totalPrice}</span>
              <button
                className="ml-auto px-4 py-1.5 rounded bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                onClick={() => onSelect(hotel.id)}
              >
                Select
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 