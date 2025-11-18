import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Calendar, 
  MapPin, 
  Navigation, 
  TrendingDown, 
  Car, 
  Bus, 
  Train, 
  Bike, 
  FootprintsIcon, 
  Zap,
  Clock,
  BarChart3,
  Filter,
  ArrowRight,
  Download
} from 'lucide-react';
import { getJourneys } from '../utils/api';
import type { Journey, TransportMode } from '../types';
import { toast } from 'sonner@2.0.3';
import { exportJourneysToCSV } from '../utils/exportJourneys';

export function JourneyHistory() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<TransportMode | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      const data = await getJourneys();
      setJourneys(data);
    } catch (error) {
      console.error('Error fetching journeys:', error);
      toast.error('Failed to load journey history');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (mode: TransportMode) => {
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

  const getModeColor = (mode: TransportMode) => {
    const colors = {
      walk: 'bg-green-100 text-green-700',
      bike: 'bg-green-100 text-green-700',
      ebike: 'bg-blue-100 text-blue-700',
      bus: 'bg-yellow-100 text-yellow-700',
      train: 'bg-purple-100 text-purple-700',
      car: 'bg-red-100 text-red-700',
    };
    return colors[mode] || 'bg-gray-100 text-gray-700';
  };

  const filterJourneysByTime = (journeys: Journey[]) => {
    if (timeFilter === 'all') return journeys;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeFilter === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeFilter === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    }
    
    return journeys.filter(j => new Date(j.createdAt) >= cutoffDate);
  };

  const filterJourneysByMode = (journeys: Journey[]) => {
    if (filterMode === 'all') return journeys;
    return journeys.filter(j => j.mode === filterMode);
  };

  const filteredJourneys = filterJourneysByMode(filterJourneysByTime(journeys));

  // Calculate statistics
  const stats = {
    totalJourneys: filteredJourneys.length,
    totalDistance: filteredJourneys.reduce((sum, j) => sum + j.distance, 0),
    totalCO2Saved: filteredJourneys.reduce((sum, j) => sum + (j.co2Saved || 0), 0),
    totalCO2Emitted: filteredJourneys.reduce((sum, j) => sum + j.co2Grams, 0),
    byMode: {} as Record<TransportMode, number>,
  };

  filteredJourneys.forEach(j => {
    stats.byMode[j.mode] = (stats.byMode[j.mode] || 0) + 1;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-24">
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl mb-2">Journey History</h1>
          <p className="text-green-100">Loading your travel records...</p>
        </div>
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl mb-2">Journey History</h1>
        <p className="text-green-100">Track your travel patterns and environmental impact</p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Journeys</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Journey List */}
        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm mb-2">Time Period</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={timeFilter === 'week' ? 'default' : 'outline'}
                      onClick={() => setTimeFilter('week')}
                      className={timeFilter === 'week' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      Week
                    </Button>
                    <Button
                      size="sm"
                      variant={timeFilter === 'month' ? 'default' : 'outline'}
                      onClick={() => setTimeFilter('month')}
                      className={timeFilter === 'month' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      Month
                    </Button>
                    <Button
                      size="sm"
                      variant={timeFilter === 'all' ? 'default' : 'outline'}
                      onClick={() => setTimeFilter('all')}
                      className={timeFilter === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      All Time
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-2">Transport Mode</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={filterMode === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilterMode('all')}
                      className={filterMode === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      All
                    </Button>
                    {['walk', 'bike', 'ebike', 'bus', 'train', 'car'].map((mode) => {
                      const Icon = getIcon(mode as TransportMode);
                      return (
                        <Button
                          key={mode}
                          size="sm"
                          variant={filterMode === mode ? 'default' : 'outline'}
                          onClick={() => setFilterMode(mode as TransportMode)}
                          className={filterMode === mode ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          <Icon className="w-4 h-4" />
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Journey Cards */}
          {filteredJourneys.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 mb-1">No journeys found</p>
                <p className="text-sm text-gray-500">Start tracking your sustainable travel!</p>
              </CardContent>
            </Card>
          ) : (
            filteredJourneys.map((journey) => {
              const Icon = getIcon(journey.mode);
              const modeColor = getModeColor(journey.mode);

              return (
                <Card key={journey.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${modeColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-600">{formatDate(journey.createdAt)}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-600">{formatTime(journey.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mb-2">
                            <span className="truncate">{journey.from}</span>
                            <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{journey.to}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{journey.distance.toFixed(1)} km</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{Math.round(journey.duration)} min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-sm">
                        <span className="text-gray-600">CO₂: </span>
                        <span className={journey.co2Grams === 0 ? 'text-green-600' : 'text-gray-900'}>
                          {journey.co2Grams === 0 ? '0g' : `${(journey.co2Grams / 1000).toFixed(2)} kg`}
                        </span>
                      </div>
                      {journey.co2Saved > 0 && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <TrendingDown className="w-4 h-4" />
                          <span>Saved {(journey.co2Saved / 1000).toFixed(2)} kg</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl mb-1">{stats.totalJourneys}</p>
                  <p className="text-sm text-gray-600">Total Journeys</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl mb-1">{stats.totalDistance.toFixed(0)}</p>
                  <p className="text-sm text-gray-600">Kilometers Traveled</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl text-green-600 mb-1">{(stats.totalCO2Saved / 1000).toFixed(1)}</p>
                  <p className="text-sm text-gray-600">kg CO₂ Saved</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl mb-1">{(stats.totalCO2Emitted / 1000).toFixed(1)}</p>
                  <p className="text-sm text-gray-600">kg CO₂ Emitted</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mode Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Transport Mode Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byMode)
                  .sort(([, a], [, b]) => b - a)
                  .map(([mode, count]) => {
                    const Icon = getIcon(mode as TransportMode);
                    const percentage = ((count / stats.totalJourneys) * 100).toFixed(0);
                    
                    return (
                      <div key={mode} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span className="capitalize">{mode}</span>
                          </div>
                          <span className="text-gray-600">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Environmental Impact */}
          <Card>
            <CardHeader>
              <CardTitle>Environmental Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total CO₂ Saved</p>
                    <p className="text-2xl text-green-600">{(stats.totalCO2Saved / 1000).toFixed(2)} kg</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-green-600" />
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>That's equivalent to:</p>
                  <ul className="space-y-1 ml-4">
                    <li>🌳 {(stats.totalCO2Saved / 21000).toFixed(1)} trees planted</li>
                    <li>🚗 {(stats.totalCO2Saved / 120).toFixed(0)} km not driven by car</li>
                    <li>💡 {(stats.totalCO2Saved / 0.5).toFixed(0)} hours of LED light usage saved</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel Patterns */}
          {filteredJourneys.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Travel Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Journey Distance</span>
                    <span>{(stats.totalDistance / stats.totalJourneys).toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average CO₂ Saved per Journey</span>
                    <span className="text-green-600">
                      {(stats.totalCO2Saved / stats.totalJourneys / 1000).toFixed(2)} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Most Used Transport</span>
                    <span className="capitalize">
                      {Object.entries(stats.byMode).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Export Button */}
      <div className="mt-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => exportJourneysToCSV(filteredJourneys)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Journeys
        </Button>
      </div>
    </div>
  );
}