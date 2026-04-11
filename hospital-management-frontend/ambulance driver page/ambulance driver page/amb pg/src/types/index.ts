export type EmergencyType = 'Critical' | 'Moderate' | 'Minor';

export interface Patient {
  name: string;
  age: number;
  condition: string;
  contact: string;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface RideRequest {
  id: string;
  patient: Patient;
  pickup: Location;
  emergencyType: EmergencyType;
  distance: string;
  eta: string;
  timestamp: string;
}

export interface Driver {
  id: string;
  name: string;
  isOnline: boolean;
  currentLocation: Location;
}
