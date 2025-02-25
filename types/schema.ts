export interface Vehicle {
    id: string;
    plate: string;
    make: string;
    model: string;
    engineType: 'Gasoline' | 'Diesel' | 'Hybrid' | 'Electric' | 'Other';
    yearOfMake: number;
    userId: string;
    avgConsumption?: number; // Average L/100km for this vehicle
  }
  
  export interface FuelRecord {
    id: string;
    vehicleId: string;
    date: string;
    currentEstimateKm: number; // Changed to km
    odometer: number;
    avgConsumption: number;
    refillAmount: number;
    estimatedDistanceKm: number; // Changed to km
    pricePerLiter: number;
    totalPrice: number;
    previousOdometer?: number; // For calculating actual consumption
  }
  
  export interface User {
    id: string;
    name: string;
    phone: string;
  }

  export interface AuthResponse {
    token: string;
  }
  