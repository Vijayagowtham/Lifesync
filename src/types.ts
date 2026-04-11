export interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
  contact: string;
  availability: {
    beds: number;
    icu: number;
    doctors: number;
    status: string;
  };
  rating: number;
}

export interface Ambulance {
  id: string;
  driverName: string;
  contact: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'available' | 'busy' | 'en-route';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
