import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Leaf, TrendingDown, Award, MapPin, Calendar, Car, Bus, Train, Bike, FootprintsIcon, Zap, ArrowRight, History } from 'lucide-react';
import type { UserProfile, Journey, TransportMode } from '../types';
import { getProfile, getJourneys } from '../utils/api';
import { getBadgesWithStatus } from '../utils/badges';
import { SustainabilityTips } from './SustainabilityTips';

interface DashboardProps {
  onStartJourney: () => void;
  onViewHistory?: () => void;
}

export function Dashboard({ onStartJourney, onViewHistory }: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentJourneys, setRecentJourneys] = useState<Journey[]>([]);
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
      setRecentJourneys(journeysData.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransportIcon = (mode: TransportMode) => {
    const icons = {
      walk: FootprintsIcon,
      bike: Bike,
      ebike: Zap,
      bus: Bus,
      train: Train,
      car: Car,
    };
    return icons[mode] || MapPin;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your eco-stats...</p>
        </div>
      </div>
    );
  }

  const badges = getBadgesWithStatus(profile?.badges || []);
  const earnedBadges = badges.filter(b => b.earned);
  const nextBadge = badges.find(b => !b.earned);

  const thisWeekCO2 = recentJourneys
    .filter(j => {
      const journeyDate = new Date(j.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return journeyDate >= weekAgo;
    })
    .reduce((sum, j) => sum + (j.co2Saved || 0), 0);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl mb-2">Welcome back, {profile?.name}! 👋</h1>
        <p className="text-green-100">Keep up your amazing eco-friendly travel habits</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total CO₂ Saved</p>
                <p className="text-2xl">{((profile?.totalCO2Saved || 0) / 1000).toFixed(2)} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Journeys</p>
                <p className="text-2xl">{profile?.journeyCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">CO₂ Saved</span>
              <span>{(thisWeekCO2 / 1000).toFixed(2)} kg</span>
            </div>
            <Progress value={Math.min((thisWeekCO2 / 5000) * 100, 100)} className="h-2" />
            <p className="text-xs text-gray-500">Goal: 5 kg per week</p>
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
          <div className="grid grid-cols-5 gap-3 mb-4">
            {badges.slice(0, 5).map(badge => (
              <div
                key={badge.id}
                className={`text-center ${badge.earned ? '' : 'opacity-30'}`}
                title={badge.description}
              >
                <div className="text-3xl mb-1">{badge.icon}</div>
                <p className="text-xs truncate">{badge.name}</p>
              </div>
            ))}
          </div>
          {nextBadge && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm">
                <span className="text-green-600">Next badge:</span> {nextBadge.name}
              </p>
              <p className="text-xs text-gray-600 mt-1">{nextBadge.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Journeys */}
      {recentJourneys.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Recent Journeys
              </CardTitle>
              {onViewHistory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewHistory}
                  className="text-green-600 hover:text-green-700"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentJourneys.map(journey => {
                const Icon = getTransportIcon(journey.mode);
                return (
                  <div key={journey.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{journey.from} → {journey.to}</p>
                      <p className="text-xs text-gray-600 capitalize">{journey.mode} • {journey.distance.toFixed(1)} km</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-green-600">-{(journey.co2Saved / 1000).toFixed(2)} kg</p>
                      <p className="text-xs text-gray-500">CO₂</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sustainability Tips */}
      <SustainabilityTips />

      {/* Quick Action */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t max-w-lg mx-auto">
        <Button 
          onClick={onStartJourney} 
          className="w-full bg-green-600 hover:bg-green-700 h-12"
        >
          <MapPin className="w-5 h-5 mr-2" />
          Plan New Journey
        </Button>
      </div>
    </div>
  );
}