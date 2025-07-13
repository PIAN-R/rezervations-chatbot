// Common airport codes and their corresponding city names
const AIRPORT_CODES: Record<string, { city: string; airport: string; country: string }> = {
  // Major US airports
  'JFK': { city: 'New York', airport: 'John F. Kennedy International Airport', country: 'United States' },
  'LAX': { city: 'Los Angeles', airport: 'Los Angeles International Airport', country: 'United States' },
  'ORD': { city: 'Chicago', airport: 'O\'Hare International Airport', country: 'United States' },
  'DFW': { city: 'Dallas', airport: 'Dallas/Fort Worth International Airport', country: 'United States' },
  'ATL': { city: 'Atlanta', airport: 'Hartsfield-Jackson Atlanta International Airport', country: 'United States' },
  'SFO': { city: 'San Francisco', airport: 'San Francisco International Airport', country: 'United States' },
  'MIA': { city: 'Miami', airport: 'Miami International Airport', country: 'United States' },
  'LAS': { city: 'Las Vegas', airport: 'McCarran International Airport', country: 'United States' },
  'DEN': { city: 'Denver', airport: 'Denver International Airport', country: 'United States' },
  'SEA': { city: 'Seattle', airport: 'Seattle-Tacoma International Airport', country: 'United States' },
  'BOS': { city: 'Boston', airport: 'Logan International Airport', country: 'United States' },
  'IAH': { city: 'Houston', airport: 'George Bush Intercontinental Airport', country: 'United States' },
  'MCO': { city: 'Orlando', airport: 'Orlando International Airport', country: 'United States' },
  'PHX': { city: 'Phoenix', airport: 'Phoenix Sky Harbor International Airport', country: 'United States' },
  'CLT': { city: 'Charlotte', airport: 'Charlotte Douglas International Airport', country: 'United States' },
  'EWR': { city: 'Newark', airport: 'Newark Liberty International Airport', country: 'United States' },
  'DTW': { city: 'Detroit', airport: 'Detroit Metropolitan Airport', country: 'United States' },
  'MSP': { city: 'Minneapolis', airport: 'Minneapolis-Saint Paul International Airport', country: 'United States' },
  'FLL': { city: 'Fort Lauderdale', airport: 'Fort Lauderdale-Hollywood International Airport', country: 'United States' },
  'BWI': { city: 'Baltimore', airport: 'Baltimore/Washington International Airport', country: 'United States' },

  // Major European airports
  'LHR': { city: 'London', airport: 'Heathrow Airport', country: 'United Kingdom' },
  'CDG': { city: 'Paris', airport: 'Charles de Gaulle Airport', country: 'France' },
  'AMS': { city: 'Amsterdam', airport: 'Amsterdam Airport Schiphol', country: 'Netherlands' },
  'FRA': { city: 'Frankfurt', airport: 'Frankfurt Airport', country: 'Germany' },
  'MAD': { city: 'Madrid', airport: 'Adolfo Suárez Madrid–Barajas Airport', country: 'Spain' },
  'BCN': { city: 'Barcelona', airport: 'Barcelona–El Prat Airport', country: 'Spain' },
  'FCO': { city: 'Rome', airport: 'Leonardo da Vinci International Airport', country: 'Italy' },
  'MXP': { city: 'Milan', airport: 'Milan Malpensa Airport', country: 'Italy' },
  'ZRH': { city: 'Zurich', airport: 'Zurich Airport', country: 'Switzerland' },
  'VIE': { city: 'Vienna', airport: 'Vienna International Airport', country: 'Austria' },
  'CPH': { city: 'Copenhagen', airport: 'Copenhagen Airport', country: 'Denmark' },
  'ARN': { city: 'Stockholm', airport: 'Stockholm Arlanda Airport', country: 'Sweden' },
  'OSL': { city: 'Oslo', airport: 'Oslo Airport', country: 'Norway' },
  'HEL': { city: 'Helsinki', airport: 'Helsinki Airport', country: 'Finland' },
  'WAW': { city: 'Warsaw', airport: 'Warsaw Chopin Airport', country: 'Poland' },
  'PRG': { city: 'Prague', airport: 'Václav Havel Airport Prague', country: 'Czech Republic' },
  'BUD': { city: 'Budapest', airport: 'Budapest Ferenc Liszt International Airport', country: 'Hungary' },
  'ATH': { city: 'Athens', airport: 'Athens International Airport', country: 'Greece' },
  'DUB': { city: 'Dublin', airport: 'Dublin Airport', country: 'Ireland' },
  'EDI': { city: 'Edinburgh', airport: 'Edinburgh Airport', country: 'United Kingdom' },
  'MAN': { city: 'Manchester', airport: 'Manchester Airport', country: 'United Kingdom' },
  'BRU': { city: 'Brussels', airport: 'Brussels Airport', country: 'Belgium' },
  'LUX': { city: 'Luxembourg', airport: 'Luxembourg Airport', country: 'Luxembourg' },

  // Major Asian airports
  'NRT': { city: 'Tokyo', airport: 'Narita International Airport', country: 'Japan' },
  'HND': { city: 'Tokyo', airport: 'Haneda Airport', country: 'Japan' },
  'ICN': { city: 'Seoul', airport: 'Incheon International Airport', country: 'South Korea' },
  'PEK': { city: 'Beijing', airport: 'Beijing Capital International Airport', country: 'China' },
  'PVG': { city: 'Shanghai', airport: 'Shanghai Pudong International Airport', country: 'China' },
  'HKG': { city: 'Hong Kong', airport: 'Hong Kong International Airport', country: 'Hong Kong' },
  'SIN': { city: 'Singapore', airport: 'Singapore Changi Airport', country: 'Singapore' },
  'BKK': { city: 'Bangkok', airport: 'Suvarnabhumi Airport', country: 'Thailand' },
  'DEL': { city: 'Delhi', airport: 'Indira Gandhi International Airport', country: 'India' },
  'BOM': { city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj International Airport', country: 'India' },
  'BLR': { city: 'Bangalore', airport: 'Kempegowda International Airport', country: 'India' },
  'MAA': { city: 'Chennai', airport: 'Chennai International Airport', country: 'India' },
  'HYD': { city: 'Hyderabad', airport: 'Rajiv Gandhi International Airport', country: 'India' },
  'CCU': { city: 'Kolkata', airport: 'Netaji Subhas Chandra Bose International Airport', country: 'India' },
  'KUL': { city: 'Kuala Lumpur', airport: 'Kuala Lumpur International Airport', country: 'Malaysia' },
  'CGK': { city: 'Jakarta', airport: 'Soekarno–Hatta International Airport', country: 'Indonesia' },
  'MNL': { city: 'Manila', airport: 'Ninoy Aquino International Airport', country: 'Philippines' },
  'HAN': { city: 'Hanoi', airport: 'Noi Bai International Airport', country: 'Vietnam' },
  'SGN': { city: 'Ho Chi Minh City', airport: 'Tan Son Nhat International Airport', country: 'Vietnam' },
  'PNH': { city: 'Phnom Penh', airport: 'Phnom Penh International Airport', country: 'Cambodia' },
  'VTE': { city: 'Vientiane', airport: 'Wattay International Airport', country: 'Laos' },
  'RGN': { city: 'Yangon', airport: 'Yangon International Airport', country: 'Myanmar' },
  'DAC': { city: 'Dhaka', airport: 'Hazrat Shahjalal International Airport', country: 'Bangladesh' },
  'KTM': { city: 'Kathmandu', airport: 'Tribhuvan International Airport', country: 'Nepal' },
  'CMB': { city: 'Colombo', airport: 'Bandaranaike International Airport', country: 'Sri Lanka' },
  'MLE': { city: 'Male', airport: 'Velana International Airport', country: 'Maldives' },

  // Major Middle Eastern airports
  'DXB': { city: 'Dubai', airport: 'Dubai International Airport', country: 'United Arab Emirates' },
  'AUH': { city: 'Abu Dhabi', airport: 'Abu Dhabi International Airport', country: 'United Arab Emirates' },
  'DOH': { city: 'Doha', airport: 'Hamad International Airport', country: 'Qatar' },
  'RUH': { city: 'Riyadh', airport: 'King Khalid International Airport', country: 'Saudi Arabia' },
  'JED': { city: 'Jeddah', airport: 'King Abdulaziz International Airport', country: 'Saudi Arabia' },
  'AMM': { city: 'Amman', airport: 'Queen Alia International Airport', country: 'Jordan' },
  'BEY': { city: 'Beirut', airport: 'Beirut–Rafic Hariri International Airport', country: 'Lebanon' },
  'TLV': { city: 'Tel Aviv', airport: 'Ben Gurion Airport', country: 'Israel' },
  'CAI': { city: 'Cairo', airport: 'Cairo International Airport', country: 'Egypt' },
  'IST': { city: 'Istanbul', airport: 'Istanbul Airport', country: 'Turkey' },

  // Major African airports
  'JNB': { city: 'Johannesburg', airport: 'O. R. Tambo International Airport', country: 'South Africa' },
  'CPT': { city: 'Cape Town', airport: 'Cape Town International Airport', country: 'South Africa' },
  'NBO': { city: 'Nairobi', airport: 'Jomo Kenyatta International Airport', country: 'Kenya' },
  'ADD': { city: 'Addis Ababa', airport: 'Bole International Airport', country: 'Ethiopia' },
  'LAG': { city: 'Lagos', airport: 'Murtala Muhammed International Airport', country: 'Nigeria' },
  'CMN': { city: 'Casablanca', airport: 'Mohammed V International Airport', country: 'Morocco' },
  'TUN': { city: 'Tunis', airport: 'Tunis–Carthage International Airport', country: 'Tunisia' },
  'ALG': { city: 'Algiers', airport: 'Houari Boumediene Airport', country: 'Algeria' },
  'DAR': { city: 'Dar es Salaam', airport: 'Julius Nyerere International Airport', country: 'Tanzania' },

  // Major Oceanian airports
  'SYD': { city: 'Sydney', airport: 'Sydney Airport', country: 'Australia' },
  'MEL': { city: 'Melbourne', airport: 'Melbourne Airport', country: 'Australia' },
  'BNE': { city: 'Brisbane', airport: 'Brisbane Airport', country: 'Australia' },
  'PER': { city: 'Perth', airport: 'Perth Airport', country: 'Australia' },
  'ADL': { city: 'Adelaide', airport: 'Adelaide Airport', country: 'Australia' },
  'AKL': { city: 'Auckland', airport: 'Auckland Airport', country: 'New Zealand' },
  'WLG': { city: 'Wellington', airport: 'Wellington Airport', country: 'New Zealand' },
  'CHC': { city: 'Christchurch', airport: 'Christchurch Airport', country: 'New Zealand' },
  'NAN': { city: 'Nadi', airport: 'Nadi International Airport', country: 'Fiji' },
  'PPT': { city: 'Papeete', airport: 'Faa\'a International Airport', country: 'French Polynesia' },

  // Major Canadian airports
  'YYZ': { city: 'Toronto', airport: 'Toronto Pearson International Airport', country: 'Canada' },
  'YVR': { city: 'Vancouver', airport: 'Vancouver International Airport', country: 'Canada' },
  'YUL': { city: 'Montreal', airport: 'Montréal–Trudeau International Airport', country: 'Canada' },
  'YYC': { city: 'Calgary', airport: 'Calgary International Airport', country: 'Canada' },
  'YOW': { city: 'Ottawa', airport: 'Ottawa Macdonald–Cartier International Airport', country: 'Canada' },
  'YEG': { city: 'Edmonton', airport: 'Edmonton International Airport', country: 'Canada' },
  'YHZ': { city: 'Halifax', airport: 'Halifax Stanfield International Airport', country: 'Canada' },
  'YWG': { city: 'Winnipeg', airport: 'Winnipeg James Armstrong Richardson International Airport', country: 'Canada' },
  'YQB': { city: 'Quebec City', airport: 'Québec City Jean Lesage International Airport', country: 'Canada' },
  'YQT': { city: 'Thunder Bay', airport: 'Thunder Bay International Airport', country: 'Canada' },
};

// Reverse mapping for city names to airport codes
const CITY_TO_AIRPORT: Record<string, string[]> = {};

// Build reverse mapping
Object.entries(AIRPORT_CODES).forEach(([code, info]) => {
  const cityKey = info.city.toLowerCase();
  if (!CITY_TO_AIRPORT[cityKey]) {
    CITY_TO_AIRPORT[cityKey] = [];
  }
  CITY_TO_AIRPORT[cityKey].push(code);
});

export function getAirportInfo(code: string): { city: string; airport: string; country: string } | null {
  return AIRPORT_CODES[code.toUpperCase()] || null;
}

export function getCityName(code: string): string | null {
  const info = getAirportInfo(code);
  return info ? info.city : null;
}

export function getAirportName(code: string): string | null {
  const info = getAirportInfo(code);
  return info ? info.airport : null;
}

export function getCountryName(code: string): string | null {
  const info = getAirportInfo(code);
  return info ? info.country : null;
}

export function findAirportCodes(cityName: string): string[] {
  const normalizedCity = cityName.toLowerCase().trim();
  
  // Direct match
  if (CITY_TO_AIRPORT[normalizedCity]) {
    return CITY_TO_AIRPORT[normalizedCity];
  }
  
  // Partial match
  const matches: string[] = [];
  Object.entries(CITY_TO_AIRPORT).forEach(([city, codes]) => {
    if (city.includes(normalizedCity) || normalizedCity.includes(city)) {
      matches.push(...codes);
    }
  });
  
  return [...new Set(matches)]; // Remove duplicates
}

export function formatAirportDisplay(code: string): string {
  const info = getAirportInfo(code);
  if (!info) {
    return code;
  }
  return `${info.city} (${code})`;
}

export function formatFullAirportDisplay(code: string): string {
  const info = getAirportInfo(code);
  if (!info) {
    return code;
  }
  return `${info.airport} (${code}) - ${info.city}, ${info.country}`;
}

// Common city names that users might type
export const COMMON_CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Dallas', 'Atlanta', 'San Francisco', 'Miami',
  'London', 'Paris', 'Amsterdam', 'Frankfurt', 'Madrid', 'Barcelona', 'Rome', 'Milan',
  'Tokyo', 'Seoul', 'Beijing', 'Shanghai', 'Hong Kong', 'Singapore', 'Bangkok',
  'Dubai', 'Sydney', 'Melbourne', 'Toronto', 'Vancouver', 'Montreal'
]; 