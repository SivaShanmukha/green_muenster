import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { User, Award, Target, TrendingUp, LogOut, Leaf } from 'lucide-react';
import type { UserProfile, Journey } from '../types';
import { getProfile, getJourneys } from '../utils/api';
import { getBadgesWithStatus } from '../utils/badges';
import { getSupabaseClient } from '../utils/supabase/client';

interface ProfileScreenProps {
  onLogout: () => void;
}

export function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, journeysData] = await Promise.all([
        getProfile(),
        getJourneys()
      ]);
      
      setProfile(profileData);
      setJourneys(journeysData);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    
    await supabase.auth.signOut();
    onLogout();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const badges = getBadgesWithStatus(profile?.badges || []);
  const earnedBadges = badges.filter(b => b.earned);

  // Calculate stats
  const thisMonthJourneys = journeys.filter(j => {
    const journeyDate = new Date(j.createdAt);
    const now = new Date();
    return journeyDate.getMonth() === now.getMonth() && journeyDate.getFullYear() === now.getFullYear();
  });

  const thisMonthCO2 = thisMonthJourneys.reduce((sum, j) => sum + (j.co2Saved || 0), 0);

  const modeBreakdown = journeys.reduce((acc, j) => {
    acc[j.mode] = (acc[j.mode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const favoriteMode = Object.entries(modeBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl">{profile?.name}</h1>
            <p className="text-green-100">{profile?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur">
            <p className="text-green-100 text-sm">Total CO₂ Saved</p>
            <p className="text-xl">{((profile?.totalCO2Saved || 0) / 1000).toFixed(2)} kg</p>
          </div>
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur">
            <p className="text-green-100 text-sm">Total Journeys</p>
            <p className="text-xl">{profile?.journeyCount || 0}</p>
          </div>
        </div>
      </div>

      {/* This Month */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            This Month
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Journeys</p>
              <p className="text-2xl">{thisMonthJourneys.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CO₂ Saved</p>
              <p className="text-2xl">{(thisMonthCO2 / 1000).toFixed(2)} kg</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Monthly Goal</span>
              <span>{Math.min(Math.round((thisMonthCO2 / 20000) * 100), 100)}%</span>
            </div>
            <Progress value={Math.min((thisMonthCO2 / 20000) * 100, 100)} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">Goal: 20 kg CO₂ saved per month</p>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Badges ({earnedBadges.length}/{badges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {badges.map(badge => (
              <div
                key={badge.id}
                className={`text-center p-3 rounded-lg ${
                  badge.earned ? 'bg-green-50' : 'bg-gray-50 opacity-40'
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="text-sm">{badge.name}</p>
                <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            Travel Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Favorite Mode</span>
            <span className="capitalize px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              {favoriteMode}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Avg. CO₂ Saved/Journey</span>
            <span className="text-green-600">
              {journeys.length > 0 
                ? ((journeys.reduce((sum, j) => sum + j.co2Saved, 0) / journeys.length) / 1000).toFixed(2)
                : '0.00'} kg
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Total Distance Traveled</span>
            <span>
              {journeys.reduce((sum, j) => sum + j.distance, 0).toFixed(1)} km
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Environmental Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-900 mb-2">
              Your CO₂ savings are equivalent to:
            </p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>🌳 Planting {Math.round((profile?.totalCO2Saved || 0) / 21000)} trees</li>
              <li>💡 Powering a home for {Math.round((profile?.totalCO2Saved || 0) / 2000)} days</li>
              <li>📱 Charging {Math.round((profile?.totalCO2Saved || 0) / 10)} smartphones</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button 
        onClick={handleLogout}
        variant="outline" 
        className="w-full"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}