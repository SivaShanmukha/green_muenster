export interface UserProfile {
  id: string;
  name: string;
  email: string;
  totalCO2Saved: number;
  journeyCount: number;
  badges: string[];
  goals: Goal[];
  createdAt: string;
}

export interface Journey {
  id: string;
  userId: string;
  from: string;
  to: string;
  distance: number;
  mode: TransportMode;
  co2Grams: number;
  co2Saved: number;
  duration: number;
  createdAt: string;
}

export type TransportMode = 'car' | 'bus' | 'train' | 'bike' | 'walk' | 'ebike';

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: 'kg' | 'journeys';
  createdAt: string;
  completed: boolean;
}

export interface EmissionCalculation {
  mode: TransportMode;
  distance: number;
  co2Grams: number;
  co2Kg: number;
  savedGrams: number;
  savedKg: number;
}

export interface RouteOption {
  mode: TransportMode;
  distance: number;
  duration: number;
  co2Grams: number;
  co2Saved: number;
  recommended: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}
