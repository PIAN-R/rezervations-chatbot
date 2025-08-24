import React, { useMemo, useState } from "react";
import { DayPicker, DayModifiers, DayContentProps, DateRange } from "react-day-picker";
import { format, isSameDay, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import "react-day-picker/dist/style.css";
import { useLanguage } from "./language-provider";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Mock data type
export interface CalendarDay {
  date: string; // ISO date
  price: number | null; // null = unavailable
  currency: string;
  available: boolean;
}

interface CalendarProps {
  mode: "oneway" | "roundtrip";
  availableDates: CalendarDay[];
  selected: Date | [Date, Date] | null;
  onSelect: (date: Date | [Date, Date] | null) => void;
  currency: string;
  onCurrencyChange?: (currency: string) => void;
  currencies: string[];
}

// Utility functions for date comparison
function isSameDayCustom(a: Date, b: Date) {
  return isSameDay(a, b);
}

function isDayInRange(day: Date, range: { from: Date; to?: Date }) {
  if (!range.from) return false;
  if (!range.to) return isSameDay(day, range.from);
  return isWithinInterval(day, { start: startOfDay(range.from), end: endOfDay(range.to) });
}

export const Calendar: React.FC<CalendarProps> = ({
  mode,
  availableDates,
  selected,
  onSelect,
  currency,
  onCurrencyChange,
  currencies,
}) => {
  const { t, lang } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isSelecting, setIsSelecting] = useState(false);

  // Map ISO date to CalendarDay for quick lookup
  const dayMap = useMemo(() => {
    const map: Record<string, CalendarDay> = {};
    availableDates.forEach((d) => {
      map[d.date] = d;
    });
    return map;
  }, [availableDates]);

  // Format price with currency
  function formatPrice(price: number | null, currency: string) {
    if (price == null) return t("soldOut");
    
    // Map currency codes to symbols
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'RON': 'lei',
      'BGN': 'лв',
      'HRK': 'kn',
      'RUB': '₽',
      'TRY': '₺',
      'CNY': '¥',
      'INR': '₹',
      'BRL': 'R$',
      'MXN': '$',
      'ARS': '$',
      'CLP': '$',
      'COP': '$',
      'PEN': 'S/',
      'UYU': '$',
      'VEF': 'Bs',
      'ZAR': 'R',
      'EGP': 'E£',
      'NGN': '₦',
      'KES': 'KSh',
      'GHS': 'GH₵',
      'UGX': 'USh',
      'TZS': 'TSh',
      'ZMW': 'ZK',
      'MAD': 'MAD',
      'TND': 'DT',
      'DZD': 'د.ج',
      'LYD': 'ل.د',
      'SDG': 'ج.س',
      'ETB': 'Br',
      'SOS': 'S',
      'DJF': 'Fdj',
      'KMF': 'CF',
      'MUR': '₨',
      'SCR': '₨',
      'SZL': 'L',
      'LSL': 'L',
      'NAD': 'N$',
      'BWP': 'P',
      'MWK': 'MK',
      'MZN': 'MT',
      'STD': 'Db',
      'CVE': '$',
      'GMD': 'D',
      'GNF': 'FG',
      'LRD': 'L$',
      'SLL': 'Le',
      'XOF': 'CFA',
      'XAF': 'FCFA',
      'XPF': 'CFP',
      'KHR': '៛',
      'LAK': '₭',
      'MMK': 'K',
      'THB': '฿',
      'VND': '₫',
      'IDR': 'Rp',
      'MYR': 'RM',
      'SGD': 'S$',
      'PHP': '₱',
      'BDT': '৳',
      'LKR': 'Rs',
      'NPR': '₨',
      'PKR': '₨',
      'AFN': '؋',
      'IRR': '﷼',
      'IQD': 'ع.د',
      'JOD': 'د.ا',
      'KWD': 'د.ك',
      'LBP': 'ل.ل',
      'OMR': 'ر.ع',
      'QAR': 'ر.ق',
      'SAR': 'ر.س',
      'SYP': 'ل.س',
      'AED': 'د.إ',
      'YER': '﷼',
      'BHD': '.د.ب',
      'KZT': '₸',
      'UZS': 'so\'m',
      'TJS': 'ЅM',
      'TMT': 'T',
      'GEL': '₾',
      'AMD': '֏',
      'AZN': '₼',
      'BYN': 'Br',
      'MDL': 'L',
      'UAH': '₴',
      'RSD': 'дин.',
      'BAM': 'KM',
      'MKD': 'ден',
      'ALL': 'L',
      'MNT': '₮',
      'KGS': 'с'
    };
    
    const symbol = currencySymbols[currency] || currency;
    
    return `${symbol}${price}`;
  }

  // Convert selected to DayPicker format
  let dayPickerSelected: Date | DateRange | undefined = undefined;
  if (selected) {
    if (Array.isArray(selected)) {
      if (selected.length === 2 && selected[0]) {
        dayPickerSelected = { from: selected[0], to: selected[1] || undefined };
      } else if (selected[0]) {
        dayPickerSelected = { from: selected[0] };
      }
    } else {
      dayPickerSelected = selected;
    }
  }

  // Handle selection change
  function handleSelect(date: Date | DateRange | undefined) {
    console.log("handleSelect called with:", date);
    console.log("Mode:", mode);
    console.log("Current selected:", selected);
    
    if (isSelecting) return; // Prevent multiple rapid selections
    setIsSelecting(true);
    
    if (mode === "roundtrip") {
      if (date && typeof date === "object" && "from" in date) {
        if (date.from && date.to) {
          console.log("Roundtrip: from and to selected");
          onSelect([date.from, date.to]);
        } else if (date.from) {
          console.log("Roundtrip: only from selected");
          // Send the departure date even if return date is not selected yet
          onSelect([date.from, date.from]);
        } else {
          console.log("Roundtrip: no dates selected");
          onSelect(null);
        }
      } else {
        console.log("Roundtrip: invalid date object");
        onSelect(null);
      }
    } else {
      if (date instanceof Date) {
        console.log("Oneway: date selected");
        onSelect(date);
      } else {
        console.log("Oneway: no date selected");
        onSelect(null);
      }
    }
    
    // Reset selection flag after a short delay
    setTimeout(() => setIsSelecting(false), 100);
  }

  // Disable days not available
  function isDayDisabled(day: Date): boolean {
    const iso = format(day, "yyyy-MM-dd");
    return !dayMap[iso] || !dayMap[iso].available;
  }

  // Custom day content component
  function CustomDayContent(props: DayContentProps): React.ReactElement {
    const { date, displayMonth } = props;
    const iso = format(date, "yyyy-MM-dd");
    const info = dayMap[iso];
    const isCurrentMonth = date.getMonth() === displayMonth.getMonth();
    
    // If not current month, just show the date
    if (!isCurrentMonth) {
      return (
        <div className="flex items-center justify-center h-full pt-1">
          <span className="text-xs text-gray-500">{date.getDate()}</span>
        </div>
      );
    }

    // If no info available, show as disabled
    if (!info) {
      return (
        <div className="flex items-center justify-center h-full pt-1">
          <span className="text-xs text-gray-500">{date.getDate()}</span>
        </div>
      );
    }

    // If not available, show as sold out
    if (!info.available) {
      return (
        <div className="flex flex-col items-center justify-start h-full pt-2 space-y-1">
          <span className="text-sm font-semibold text-gray-400">{date.getDate()}</span>
          <span className="text-[8px] font-medium text-red-400 bg-red-900/30 px-1 py-0.5 rounded-full">
            {t("soldOut")}
          </span>
        </div>
      );
    }

    // If available but no price, show as sold out
    if (info.price == null) {
      return (
        <div className="flex flex-col items-center justify-start h-full pt-2 space-y-1">
          <span className="text-sm font-semibold text-gray-400">{date.getDate()}</span>
          <span className="text-[8px] font-medium text-red-400 bg-red-900/30 px-1 py-0.5 rounded-full">
            {t("soldOut")}
          </span>
        </div>
      );
    }

    // Show available date with price
    return (
      <div className="flex flex-col items-center justify-start h-full pt-2 space-y-1">
        <span className="text-sm font-bold text-white">{date.getDate()}</span>
        <div className="text-[8px] font-semibold text-emerald-400 bg-emerald-900/40 px-1 py-0.5 rounded-md border border-emerald-700/50 min-w-[2rem] text-center leading-tight">
          {formatPrice(info.price, currency)}
        </div>
      </div>
    );
  }

  // Navigation handlers
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">{t("selectDates")}</h2>
        <select
          value={currency}
          onChange={(e) => onCurrencyChange?.(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {currencies.map((cur) => (
            <option key={cur} value={cur}>{cur}</option>
          ))}
        </select>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h3 className="text-lg font-semibold text-white">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-gray-800 rounded-xl p-4">
        {mode === "oneway" ? (
          <DayPicker
            mode="single"
            selected={dayPickerSelected as Date | undefined}
            onSelect={(date) => {
              console.log("Single mode onSelect called with:", date);
              handleSelect(date);
            }}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            components={{ DayContent: CustomDayContent }}
            className="w-full"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium text-white",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem] uppercase",
              row: "flex w-full mt-2",
              cell: "h-14 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-14 w-9 p-0 font-normal aria-selected:opacity-100",
              day_range_end: "day-range-end",
              day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
              day_today: "bg-blue-600 text-white",
              day_outside: "day-outside text-gray-500 opacity-50 aria-selected:bg-accent/50 aria-selected:text-gray-500 aria-selected:opacity-30",
              day_disabled: "text-gray-500 opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
            modifiers={{
              selected: (day: Date) => {
                return selected instanceof Date && isSameDayCustom(day, selected);
              },
            }}
          />
        ) : (
          <DayPicker
            mode="range"
            selected={dayPickerSelected as DateRange | undefined}
            onSelect={(date) => {
              console.log("Range mode onSelect called with:", date);
              handleSelect(date);
            }}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            components={{ DayContent: CustomDayContent }}
            className="w-full"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium text-white",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem] uppercase",
              row: "flex w-full mt-2",
              cell: "h-14 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-14 w-9 p-0 font-normal aria-selected:opacity-100",
              day_range_end: "day-range-end",
              day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
              day_today: "bg-blue-600 text-white",
              day_outside: "day-outside text-gray-500 opacity-50 aria-selected:bg-accent/50 aria-selected:text-gray-500 aria-selected:opacity-30",
              day_disabled: "text-gray-500 opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
            modifiers={{
              selected: (day: Date) => {
                if (selected && Array.isArray(selected) && selected[0]) {
                  return isDayInRange(day, { from: selected[0], to: selected[1] });
                }
                return false;
              },
            }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 text-sm text-gray-400 text-center">
        <span className="text-red-400 font-semibold">{t("soldOut")}</span> = {t("noAvailability")}
      </div>
    </div>
  );
}; 