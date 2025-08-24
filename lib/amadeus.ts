import { config } from './config';

interface AmadeusToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  expires_at: number;
}

interface AmadeusFlightOffer {
  id: string;
  itineraries: Array<{
    segments: Array<{
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      operating?: {
        carrierCode: string;
      };
      duration: string;
      id: string;
      numberOfStops: number;
      blacklistedInEU: boolean;
    }>;
  }>;
  price: {
    currency: string;
    total: string;
    base: string;
    fees: Array<{
      amount: string;
      type: string;
    }>;
    grandTotal: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment: Array<{
      segmentId: string;
      cabin: string;
      fareBasis: string;
      brandedFare?: string;
      classOfService: string;
      includedCheckedBags: {
        weight: number;
        weightUnit: string;
      };
    }>;
  }>;
}

interface AmadeusFlightSearchResponse {
  data: AmadeusFlightOffer[];
  dictionaries: {
    locations: Record<string, {
      cityCode: string;
      countryCode: string;
      subType: string;
      name: string;
      iataCode: string;
      address: {
        cityName: string;
        cityCode: string;
        countryName: string;
        countryCode: string;
        regionCode: string;
      };
    }>;
    aircraft: Record<string, string>;
    currencies: Record<string, string>;
    carriers: Record<string, string>;
  };
}

interface AmadeusFlightStatus {
  data: Array<{
    type: string;
    flight: {
      number: string;
      iataCode: string;
      icaoCode: string;
    };
    departure: {
      iataCode: string;
      terminal?: string;
      at: string;
    };
    arrival: {
      iataCode: string;
      terminal?: string;
      at: string;
    };
    status: string;
    aircraft: {
      registration: string;
      icaoCode: string;
      iataCode: string;
    };
    operating?: {
      carrierCode: string;
    };
    duration: string;
    scheduled: {
      departure: string;
      arrival: string;
    };
    actual?: {
      departure: string;
      arrival: string;
    };
    estimated?: {
      departure: string;
      arrival: string;
    };
  }>;
}

class AmadeusClient {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private token: AmadeusToken | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.baseUrl = config.amadeus.baseUrl;
    this.clientId = config.amadeus.clientId;
    this.clientSecret = config.amadeus.clientSecret;
  }

  private async getToken(): Promise<string> {
    const now = Date.now();
    
    if (!this.token || !this.tokenExpiry) {
      // No token or expiry, fetch a new one below
    } else if (this.tokenExpiry > now) {
      return this.token.access_token;
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/security/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Amadeus authentication failed: ${response.statusText}`);
      }

      const tokenData = await response.json();
      this.token = tokenData;
      this.tokenExpiry = now + (tokenData.expires_in * 1000) - 60000; // Expire 1 minute early
      
      return tokenData.access_token;
    } catch (error) {
      console.error('Failed to get Amadeus token:', error);
      throw error;
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    params: Record<string, string> = {},
    retries: number = 5
  ): Promise<T> {
    const token = await this.getToken();
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error('Amadeus API error details:', errorBody);
          if (response.status === 401) {
            // Token might be expired, clear it and retry
            this.token = null;
            this.tokenExpiry = 0;
            if (attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              continue;
            }
          }
          throw new Error(`Amadeus API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
    }

    throw new Error('Max retries exceeded');
  }

  private async makePostRequest<T>(
    endpoint: string,
    body: any,
    retries: number = 5
  ): Promise<T> {
    const token = await this.getToken();
    const url = new URL(`${this.baseUrl}${endpoint}`);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token || ''}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error('Amadeus API error details:', errorBody);
          if (response.status === 401) {
            // Token might be expired, clear it and retry
            this.token = null;
            this.tokenExpiry = 0;
            if (attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              continue;
            }
          }
          throw new Error(`Amadeus API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
    }

    throw new Error('Max retries exceeded');
  }

  async searchFlights(params: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate?: string;
    adults?: number;
    children?: number;
    infants?: number;
    travelClass?: string;
    nonStop?: boolean;
    currencyCode?: string;
    max?: number;
  }): Promise<AmadeusFlightSearchResponse> {
    const searchParams: Record<string, string> = {
      originLocationCode: params.originLocationCode,
      destinationLocationCode: params.destinationLocationCode,
      departureDate: params.departureDate,
      adults: params.adults?.toString() || '1',
      currencyCode: params.currencyCode || 'USD',
      max: params.max?.toString() || '10',
    };

    if (params.returnDate) {
      searchParams.returnDate = params.returnDate;
    }
    if (params.children) {
      searchParams.children = params.children.toString();
    }
    if (params.infants) {
      searchParams.infants = params.infants.toString();
    }
    if (params.travelClass) {
      searchParams.travelClass = params.travelClass;
    }
    if (params.nonStop !== undefined) {
      searchParams.nonStop = params.nonStop.toString();
    }

    return this.makeRequest<AmadeusFlightSearchResponse>('/v2/shopping/flight-offers', searchParams);
  }

  async getFlightStatus(params: {
    flightNumber: string;
    date: string;
  }): Promise<AmadeusFlightStatus> {
    const searchParams: Record<string, string> = {
      flightNumber: params.flightNumber,
      date: params.date,
    };

    return this.makeRequest<AmadeusFlightStatus>('/v2/schedule/flights', searchParams);
  }

  async getFlightPrice(flightOffer: AmadeusFlightOffer): Promise<any> {
    return this.makePostRequest('/v1/shopping/flight-offers/pricing', {
      data: {
        type: 'flight-offers-pricing',
        flightOffers: [flightOffer],
      },
    });
  }

  async searchHotels(params: {
    cityCode: string;
    checkInDate: string;
    checkOutDate: string;
    adults?: number;
    roomQuantity?: number;
    currencyCode?: string;
    max?: number;
  }): Promise<any> {
    const searchParams: Record<string, string> = {
      cityCode: params.cityCode,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: params.adults?.toString() || '1',
      roomQuantity: params.roomQuantity?.toString() || '1',
      currency: params.currencyCode || 'USD',
      // Amadeus test API may not support all params, but these are standard
      // Add max if supported
    };
    if (params.max) {
      searchParams['page[limit]'] = params.max.toString();
    }
    return this.makeRequest<any>('/v3/shopping/hotel-offers', searchParams);
  }
}

// Export singleton instance
export const amadeusClient = new AmadeusClient();

// Export types for use in other files
export type {
  AmadeusFlightOffer,
  AmadeusFlightSearchResponse,
  AmadeusFlightStatus,
}; 