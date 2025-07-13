// Common airline codes and their corresponding names
const AIRLINE_CODES: Record<string, { name: string; country: string }> = {
  // Major US airlines
  'AA': { name: 'American Airlines', country: 'United States' },
  'DL': { name: 'Delta Air Lines', country: 'United States' },
  'UA': { name: 'United Airlines', country: 'United States' },
  'WN': { name: 'Southwest Airlines', country: 'United States' },
  'AS': { name: 'Alaska Airlines', country: 'United States' },
  'B6': { name: 'JetBlue Airways', country: 'United States' },
  'NK': { name: 'Spirit Airlines', country: 'United States' },
  'F9': { name: 'Frontier Airlines', country: 'United States' },
  'HA': { name: 'Hawaiian Airlines', country: 'United States' },
  'AC': { name: 'Air Canada', country: 'Canada' },
  'WS': { name: 'WestJet', country: 'Canada' },

  // Major European airlines
  'BA': { name: 'British Airways', country: 'United Kingdom' },
  'LH': { name: 'Lufthansa', country: 'Germany' },
  'AF': { name: 'Air France', country: 'France' },
  'KL': { name: 'KLM Royal Dutch Airlines', country: 'Netherlands' },
  'IB': { name: 'Iberia', country: 'Spain' },
  'AZ': { name: 'ITA Airways', country: 'Italy' },
  'LX': { name: 'Swiss International Air Lines', country: 'Switzerland' },
  'OS': { name: 'Austrian Airlines', country: 'Austria' },
  'SK': { name: 'SAS Scandinavian Airlines', country: 'Sweden' },
  'AY': { name: 'Finnair', country: 'Finland' },
  'DY': { name: 'Norwegian Air Shuttle', country: 'Norway' },
  'TP': { name: 'TAP Air Portugal', country: 'Portugal' },
  'SN': { name: 'Brussels Airlines', country: 'Belgium' },
  'EI': { name: 'Aer Lingus', country: 'Ireland' },
  'LO': { name: 'LOT Polish Airlines', country: 'Poland' },
  'OK': { name: 'Czech Airlines', country: 'Czech Republic' },
  'MA': { name: 'Malév Hungarian Airlines', country: 'Hungary' },
  'A3': { name: 'Aegean Airlines', country: 'Greece' },
  'TK': { name: 'Turkish Airlines', country: 'Turkey' },

  // Major Asian airlines
  'NH': { name: 'All Nippon Airways', country: 'Japan' },
  'JL': { name: 'Japan Airlines', country: 'Japan' },
  'KE': { name: 'Korean Air', country: 'South Korea' },
  'OZ': { name: 'Asiana Airlines', country: 'South Korea' },
  'CA': { name: 'Air China', country: 'China' },
  'MU': { name: 'China Eastern Airlines', country: 'China' },
  'CZ': { name: 'China Southern Airlines', country: 'China' },
  'CX': { name: 'Cathay Pacific', country: 'Hong Kong' },
  'SQ': { name: 'Singapore Airlines', country: 'Singapore' },
  'TG': { name: 'Thai Airways International', country: 'Thailand' },
  'AI': { name: 'Air India', country: 'India' },
  '6E': { name: 'IndiGo', country: 'India' },
  '9W': { name: 'Jet Airways', country: 'India' },
  'MH': { name: 'Malaysia Airlines', country: 'Malaysia' },
  'GA': { name: 'Garuda Indonesia', country: 'Indonesia' },
  'PR': { name: 'Philippine Airlines', country: 'Philippines' },
  'VN': { name: 'Vietnam Airlines', country: 'Vietnam' },
  'VJ': { name: 'VietJet Air', country: 'Vietnam' },
  'QR': { name: 'Qatar Airways', country: 'Qatar' },
  'EK': { name: 'Emirates', country: 'United Arab Emirates' },
  'EY': { name: 'Etihad Airways', country: 'United Arab Emirates' },
  'SV': { name: 'Saudi Arabian Airlines', country: 'Saudi Arabia' },
  'RJ': { name: 'Royal Jordanian', country: 'Jordan' },
  'LY': { name: 'El Al Israel Airlines', country: 'Israel' },
  'MS': { name: 'EgyptAir', country: 'Egypt' },

  // Major Oceanian airlines
  'QF': { name: 'Qantas', country: 'Australia' },
  'VA': { name: 'Virgin Australia', country: 'Australia' },
  'NZ': { name: 'Air New Zealand', country: 'New Zealand' },
  'FJ': { name: 'Fiji Airways', country: 'Fiji' },
  'TN': { name: 'Air Tahiti Nui', country: 'French Polynesia' },

  // Major African airlines
  'SA': { name: 'South African Airways', country: 'South Africa' },
  'KQ': { name: 'Kenya Airways', country: 'Kenya' },
  'ET': { name: 'Ethiopian Airlines', country: 'Ethiopia' },
  'AT': { name: 'Royal Air Maroc', country: 'Morocco' },
  'TU': { name: 'Tunisair', country: 'Tunisia' },
  'AH': { name: 'Air Algérie', country: 'Algeria' },
  'TC': { name: 'Air Tanzania', country: 'Tanzania' },

  // Major Latin American airlines
  'LA': { name: 'LATAM Airlines', country: 'Chile' },
  'AV': { name: 'Avianca', country: 'Colombia' },
  'CM': { name: 'Copa Airlines', country: 'Panama' },
  'AM': { name: 'Aeroméxico', country: 'Mexico' },
  'AR': { name: 'Aerolíneas Argentinas', country: 'Argentina' },
  'JJ': { name: 'LATAM Brasil', country: 'Brazil' },
  'AD': { name: 'Azul Brazilian Airlines', country: 'Brazil' },
  'G3': { name: 'Gol Transportes Aéreos', country: 'Brazil' },
};

export function getAirlineInfo(code: string): { name: string; country: string } | null {
  return AIRLINE_CODES[code.toUpperCase()] || null;
}

export function getAirlineName(code: string): string | null {
  const info = getAirlineInfo(code);
  return info ? info.name : null;
}

export function getAirlineCountry(code: string): string | null {
  const info = getAirlineInfo(code);
  return info ? info.country : null;
}

export function formatAirlineDisplay(code: string): string {
  const info = getAirlineInfo(code);
  if (!info) {
    return code;
  }
  return `${info.name} (${code})`;
}

export function findAirlineCodes(airlineName: string): string[] {
  const normalizedName = airlineName.toLowerCase().trim();
  const matches: string[] = [];
  
  Object.entries(AIRLINE_CODES).forEach(([code, info]) => {
    if (info.name.toLowerCase().includes(normalizedName) || 
        normalizedName.includes(info.name.toLowerCase())) {
      matches.push(code);
    }
  });
  
  return matches;
}

// Common airline names that users might type
export const COMMON_AIRLINES = [
  'American Airlines', 'Delta', 'United', 'Southwest', 'British Airways',
  'Lufthansa', 'Air France', 'KLM', 'Emirates', 'Qatar Airways',
  'Singapore Airlines', 'Cathay Pacific', 'Qantas', 'Air Canada'
]; 