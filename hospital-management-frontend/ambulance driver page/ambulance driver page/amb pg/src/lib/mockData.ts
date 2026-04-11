import { RideRequest } from '../types';

export const MOCK_REQUESTS: RideRequest[] = [
  {
    id: '1',
    patient: {
      name: 'John Doe',
      age: 45,
      condition: 'Chest Pain - Suspected Cardiac Arrest',
      contact: '+1 234 567 8900'
    },
    pickup: {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Broadway, New York, NY'
    },
    emergencyType: 'Critical',
    distance: '2.4 km',
    eta: '6 mins',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    patient: {
      name: 'Jane Smith',
      age: 28,
      condition: 'Severe Allergic Reaction',
      contact: '+1 234 567 8901'
    },
    pickup: {
      lat: 40.7306,
      lng: -73.9352,
      address: '456 Queens Blvd, Queens, NY'
    },
    emergencyType: 'Moderate',
    distance: '4.1 km',
    eta: '12 mins',
    timestamp: new Date().toISOString()
  }
];
