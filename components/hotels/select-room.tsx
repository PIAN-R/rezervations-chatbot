import React from "react";

export interface HotelRoom {
  id: string;
  type: string;
  pricePerNight: number;
  amenities: string[];
  refundable: boolean;
  imageUrl?: string;
}

export function SelectRoom({ rooms, onSelect }: {
  rooms: HotelRoom[];
  onSelect: (roomId: string) => void;
}) {
  if (!rooms || rooms.length === 0) {
    return (
      <div className="rounded-lg bg-muted px-4 py-3 flex flex-col gap-2 text-center text-muted-foreground">
        No rooms available for this hotel.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="flex flex-row bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Image placeholder */}
          <div className="w-28 h-28 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
            {room.imageUrl ? (
              <img src={room.imageUrl} alt={room.type} className="object-cover w-full h-full" />
            ) : (
              <span className="text-zinc-400 text-xs">No Image</span>
            )}
          </div>
          {/* Room Info */}
          <div className="flex-1 flex flex-col p-4 gap-2">
            <div className="flex flex-row items-center gap-2">
              <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{room.type}</span>
              <span className="ml-auto bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded">${room.pricePerNight}/night</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {room.amenities.map((a) => (
                <span key={a} className="bg-zinc-100 dark:bg-zinc-800 text-xs px-2 py-0.5 rounded-full text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">{a}</span>
              ))}
            </div>
            <div className="flex flex-row items-center gap-2 mt-1">
              <span className={`text-xs font-medium ${room.refundable ? 'text-emerald-600' : 'text-red-500'}`}>{room.refundable ? 'Refundable' : 'Non-refundable'}</span>
              <button
                className="ml-auto px-4 py-1.5 rounded bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                onClick={() => onSelect(room.id)}
              >
                Select Room
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 