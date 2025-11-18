import { projectId, publicAnonKey } from './supabase/info';
import type { UserProfile, Journey, EmissionCalculation, RouteOption } from '../types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-ec1b5db9`;

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`
  };
}

export async function signup(email: string, password: string, name: string) {
  const response = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
    body: JSON.stringify({ email, password, name })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }
  
  return response.json();
}

export async function getProfile(): Promise<UserProfile> {
  const response = await fetch(`${API_BASE}/profile`, {
    headers: getHeaders()
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch profile');
  }
  
  return response.json();
}

export async function updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const response = await fetch(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }
  
  return response.json();
}

export async function saveJourney(journeyData: Omit<Journey, 'id' | 'userId' | 'createdAt'>): Promise<Journey> {
  const response = await fetch(`${API_BASE}/journeys`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(journeyData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save journey');
  }
  
  return response.json();
}

export async function getJourneys(): Promise<Journey[]> {
  const response = await fetch(`${API_BASE}/journeys`, {
    headers: getHeaders()
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch journeys');
  }
  
  return response.json();
}

export async function getLeaderboard(): Promise<UserProfile[]> {
  const response = await fetch(`${API_BASE}/leaderboard`, {
    headers: getHeaders()
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch leaderboard');
  }
  
  return response.json();
}

export async function calculateEmissions(distance: number, mode: string): Promise<EmissionCalculation> {
  const response = await fetch(`${API_BASE}/calculate-emissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
    body: JSON.stringify({ distance, mode })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to calculate emissions');
  }
  
  return response.json();
}

export async function getWeather(city?: string, lat?: number, lon?: number) {
  let url = `${API_BASE}/weather`;
  const params = new URLSearchParams();
  
  if (lat && lon) {
    params.append('lat', lat.toString());
    params.append('lon', lon.toString());
  } else if (city) {
    params.append('city', city);
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${publicAnonKey}` }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch weather');
  }
  
  return response.json();
}