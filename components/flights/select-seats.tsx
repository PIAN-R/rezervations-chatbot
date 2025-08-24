"use client";

import { useChat } from "ai/react";
import { useState } from "react";
import cx from "classnames";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../custom/language-provider";

interface Seat {
  seatNumber: string;
  priceInUSD: number;
  isAvailable: boolean;
  class?: string; // Add class information
}

interface SeatClass {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverColor: string;
}

const SEAT_CLASSES: SeatClass[] = [
  {
    name: "First Class",
    color: "text-purple-100",
    bgColor: "bg-purple-600",
    borderColor: "border-purple-700",
    hoverColor: "hover:bg-purple-500",
  },
  {
    name: "Business Class",
    color: "text-blue-100",
    bgColor: "bg-blue-600",
    borderColor: "border-blue-700",
    hoverColor: "hover:bg-blue-500",
  },
  {
    name: "Economy Class",
    color: "text-green-100",
    bgColor: "bg-green-600",
    borderColor: "border-green-700",
    hoverColor: "hover:bg-green-500",
  },
];

const SAMPLE: { seats: Seat[][] } = {
  seats: [
    // First Class (rows 1-2)
    [
      { seatNumber: "1A", priceInUSD: 150, isAvailable: true, class: "First Class" },
      { seatNumber: "1B", priceInUSD: 150, isAvailable: false, class: "First Class" },
      { seatNumber: "1C", priceInUSD: 150, isAvailable: true, class: "First Class" },
      { seatNumber: "1D", priceInUSD: 150, isAvailable: true, class: "First Class" },
      { seatNumber: "1E", priceInUSD: 150, isAvailable: false, class: "First Class" },
      { seatNumber: "1F", priceInUSD: 150, isAvailable: true, class: "First Class" },
    ],
    [
      { seatNumber: "2A", priceInUSD: 150, isAvailable: true, class: "First Class" },
      { seatNumber: "2B", priceInUSD: 150, isAvailable: true, class: "First Class" },
      { seatNumber: "2C", priceInUSD: 150, isAvailable: false, class: "First Class" },
      { seatNumber: "2D", priceInUSD: 150, isAvailable: true, class: "First Class" },
      { seatNumber: "2E", priceInUSD: 150, isAvailable: true, class: "First Class" },
      { seatNumber: "2F", priceInUSD: 150, isAvailable: false, class: "First Class" },
    ],
    // Business Class (rows 3-5)
    [
      { seatNumber: "3A", priceInUSD: 100, isAvailable: true, class: "Business Class" },
      { seatNumber: "3B", priceInUSD: 100, isAvailable: false, class: "Business Class" },
      { seatNumber: "3C", priceInUSD: 100, isAvailable: true, class: "Business Class" },
      { seatNumber: "3D", priceInUSD: 100, isAvailable: true, class: "Business Class" },
      { seatNumber: "3E", priceInUSD: 100, isAvailable: false, class: "Business Class" },
      { seatNumber: "3F", priceInUSD: 100, isAvailable: true, class: "Business Class" },
    ],
    [
      { seatNumber: "4A", priceInUSD: 100, isAvailable: true, class: "Business Class" },
      { seatNumber: "4B", priceInUSD: 100, isAvailable: true, class: "Business Class" },
      { seatNumber: "4C", priceInUSD: 100, isAvailable: false, class: "Business Class" },
      { seatNumber: "4D", priceInUSD: 100, isAvailable: true, class: "Business Class" },
      { seatNumber: "4E", priceInUSD: 100, isAvailable: true, class: "Business Class" },
      { seatNumber: "4F", priceInUSD: 100, isAvailable: false, class: "Business Class" },
    ],
    [
      { seatNumber: "5A", priceInUSD: 100, isAvailable: false, class: "Business Class" },
      { seatNumber: "5B", priceInUSD: 100, isAvailable: true, class: "Business Class" },
      { seatNumber: "5C", priceInUSD: 100, isAvailable: true, class: "Business Class" },
      { seatNumber: "5D", priceInUSD: 100, isAvailable: false, class: "Business Class" },
      { seatNumber: "5E", priceInUSD: 100, isAvailable: true, class: "Business Class" },
      { seatNumber: "5F", priceInUSD: 100, isAvailable: true, class: "Business Class" },
    ],
    // Economy Class (rows 6-10)
    [
      { seatNumber: "6A", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "6B", priceInUSD: 50, isAvailable: false, class: "Economy Class" },
      { seatNumber: "6C", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "6D", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "6E", priceInUSD: 50, isAvailable: false, class: "Economy Class" },
      { seatNumber: "6F", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
    ],
    [
      { seatNumber: "7A", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "7B", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "7C", priceInUSD: 50, isAvailable: false, class: "Economy Class" },
      { seatNumber: "7D", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "7E", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "7F", priceInUSD: 50, isAvailable: false, class: "Economy Class" },
    ],
    [
      { seatNumber: "8A", priceInUSD: 50, isAvailable: false, class: "Economy Class" },
      { seatNumber: "8B", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "8C", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "8D", priceInUSD: 50, isAvailable: false, class: "Economy Class" },
      { seatNumber: "8E", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "8F", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
    ],
    [
      { seatNumber: "9A", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "9B", priceInUSD: 50, isAvailable: false, class: "Economy Class" },
      { seatNumber: "9C", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "9D", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "9E", priceInUSD: 50, isAvailable: false, class: "Economy Class" },
      { seatNumber: "9F", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
    ],
    [
      { seatNumber: "10A", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "10B", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "10C", priceInUSD: 50, isAvailable: false, class: "Economy Class" },
      { seatNumber: "10D", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "10E", priceInUSD: 50, isAvailable: true, class: "Economy Class" },
      { seatNumber: "10F", priceInUSD: 50, isAvailable: false, class: "Economy Class" },
    ],
  ],
};

export function SelectSeats({
  chatId,
  availability = SAMPLE,
}: {
  chatId: string;
  availability?: typeof SAMPLE;
}) {
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  });
  const { t } = useLanguage();

  const [selectedClass, setSelectedClass] = useState<string>("Economy Class");

  // Check if we have real data or fallback data
  const hasRealData = availability !== SAMPLE;
  
  // Helper to flatten Seat[][] to Seat[]
  function flattenSeats(seats: unknown): Seat[] {
    if (Array.isArray(seats) && Array.isArray(seats[0])) {
      // 2D array
      return (seats as Seat[][]).reduce((acc, curr) => acc.concat(curr), []);
    } else if (Array.isArray(seats)) {
      // Flat array
      return seats as Seat[];
    }
    return [];
  }

  let allSeats: Seat[] = flattenSeats(availability.seats);
  const hasSeats = allSeats.length > 0;
  const isValidSeatData = hasSeats && allSeats.every(seat =>
    seat && typeof seat === 'object' &&
    'seatNumber' in seat &&
    'priceInUSD' in seat &&
    'isAvailable' in seat
  );

  if (!hasRealData) {
  return (
      <div className="flex flex-col gap-2 bg-muted rounded-lg p-4">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">{t('sampleSeatMap')}</span>
          </div>
        <p className="text-xs text-muted-foreground">
          {t('realSeatDataUnavailable')}
        </p>
          </div>
    );
  }

  if (!hasSeats || !isValidSeatData) {
    return (
      <div className="flex flex-col gap-2 bg-muted rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">{t('invalidSeatData')}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('seatDataInvalid')}
        </p>
      </div>
    );
  }

  // Group all seats by class and then by row number
  const seatLetters = ["A", "B", "C", "D", "E", "F"];
  const classesByName: Record<string, Record<string, Record<string, Seat>>> = {};
  allSeats.forEach((seat) => {
    const className = seat.class || "Economy Class";
    if (!classesByName[className]) classesByName[className] = {};
    const match = seat.seatNumber.match(/^(\d+)([A-F])$/);
    if (match) {
      const rowNum = match[1];
      const col = match[2];
      if (!classesByName[className][rowNum]) classesByName[className][rowNum] = {};
      classesByName[className][rowNum][col] = seat;
    }
  });
  const sortedClassNames = Object.keys(classesByName).sort((a, b) => {
    // Sort by typical class order: First, Business, Economy
    const order = ["First Class", "Business Class", "Economy Class"];
    return order.indexOf(a) - order.indexOf(b);
  });

  const getClassInfo = (className: string) => {
    return SEAT_CLASSES.find(cls => cls.name === className) || SEAT_CLASSES[2]; // Default to Economy
  };

  return (
    <div className="flex flex-col gap-4 bg-muted rounded-lg p-4">
      {/* All Classes and Rows */}
      {sortedClassNames.map((className) => {
        const classRows = classesByName[className];
        const sortedRowNumbers = Object.keys(classRows).sort((a, b) => Number(a) - Number(b));
        const classInfo = getClassInfo(className);
        return (
          <div key={className} className="mb-6">
            <h3 className={`text-sm font-semibold mb-2 ${classInfo.bgColor} ${classInfo.color} px-2 py-1 rounded-md w-fit`}>{className}</h3>
            <div className="flex flex-col gap-2 scale-90 origin-top">
              {/* Seat Column Headers */}
              <div className="grid grid-cols-8 w-full text-muted-foreground text-xs mb-2">
                <div className="text-center"></div>
                {seatLetters.map((letter) => (
                  <div key={letter} className="text-center">{letter}</div>
                ))}
                  </div>
              {/* Seat Rows */}
              {sortedRowNumbers.map((rowNum) => (
                <div key={rowNum} className="grid grid-cols-8 gap-2 items-center">
                  {/* Row number */}
                  <div className="text-center text-muted-foreground font-semibold">{rowNum}</div>
                  {/* Seats A-F */}
                  {seatLetters.map((letter) => {
                    const seat = classRows[rowNum][letter];
                    if (seat) {
                      return (
                        <div key={letter} className="flex flex-col items-center">
                          <div
                  onClick={() => {
                              if (seat.isAvailable) {
                    append({
                      role: "user",
                                  content: t('chooseSeat', {seat: seat.seatNumber, class: className, price: `$${seat.priceInUSD}`}),
                    });
                              }
                  }}
                  className={cx(
                              "cursor-pointer group relative size-8 sm:size-10 flex-shrink-0 flex rounded-sm flex-row items-center justify-center border-2 transition-all",
                    {
                                [`${classInfo.bgColor} ${classInfo.borderColor} ${classInfo.hoverColor} ${classInfo.color}`]: seat.isAvailable,
                                "bg-gray-500 border-gray-600 cursor-not-allowed text-gray-300": !seat.isAvailable,
                    },
                  )}
                >
                            <div className="text-xs font-medium">
                              {seat.isAvailable ? `$${seat.priceInUSD}` : "X"}
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // Render empty/disabled cell if seat is missing
                      return (
                        <div key={letter} className="flex flex-col items-center">
                          <div className="size-8 sm:size-10 flex-shrink-0 flex rounded-sm flex-row items-center justify-center border-2 bg-gray-200 border-gray-300 text-gray-300 cursor-not-allowed" />
                        </div>
                      );
                    }
                  })}
                </div>
            ))}
            </div>
          </div>
        );
      })}
      {/* Legend */}
      <div className="flex flex-row gap-4 justify-center pt-2">
        <div className="flex flex-row items-center gap-2">
          <div className={`size-4 bg-green-600 rounded-sm border border-green-700`} />
          <div className="text-xs text-muted-foreground font-medium">
            {t('available')}
          </div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="size-4 bg-gray-500 border border-gray-600 rounded-sm" />
          <div className="text-xs text-muted-foreground font-medium">
            {t('unavailable')}
          </div>
        </div>
      </div>
    </div>
  );
}
