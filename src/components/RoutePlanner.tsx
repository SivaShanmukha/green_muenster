import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { MapPin, Navigation, Car, Bus, Train, Bike, FootprintsIcon, Zap, ArrowRight, AlertTriangle, Info } from 'lucide-react';
import type { TransportMode, RouteOption } from '../types';
import { calculateEmissions, getWeather } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { WeatherCard } from './WeatherCard';
import { getWeatherRecommendations, shouldRecommendPublicTransport } from '../utils/weatherRecommendations';

interface RoutePlannerProps {
  onSelectRoute: (route: RouteOption, from: string, to: string) => void;
}

const TRANSPORT_MODES: { mode: TransportMode; label: string; icon: any }[] = [
  { mode: 'walk', label: 'Walk', icon: FootprintsIcon },
  { mode: 'bike', label: 'Bike', icon: Bike },
  { mode: 'ebike', label: 'E-Bike', icon: Zap },
  { mode: 'bus', label: 'Bus', icon: Bus },
  { mode: 'train', label: 'Train', icon: Train },
  { mode: 'car', label: 'Car', icon: Car },
];

export function RoutePlanner({ onSelectRoute }: RoutePlannerProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Fetch weather on component mount
  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async (city?: string) => {
    setLoadingWeather(true);
    try {
      // Use 'from' location if available, otherwise default to Münster
      const weatherData = await getWeather(city || from || undefined);
      setWeather(weatherData);
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Don't show error toast, just fail silently
    } finally {
      setLoadingWeather(false);
    }
  };

  const calculateRoutes = async () => {
    if (!from || !to) {
      toast.error('Please enter both origin and destination');
      return;
    }

    setCalculating(true);
    try {
      // Fetch weather data alongside route calculation
      if (!weather) {
        fetchWeather(from);
      }

      // Simulate distance calculation (in a real app, this would use a routing API)
      const distance = Math.random() * 15 + 2; // 2-17 km
      
      const routePromises = TRANSPORT_MODES.map(async ({ mode }) => {
        const emissions = await calculateEmissions(distance, mode);
        
        // Estimate duration based on mode (simplified)
        const speeds = { walk: 5, bike: 15, ebike: 20, bus: 25, train: 40, car: 35 }; // km/h
        const duration = (distance / speeds[mode]) * 60; // minutes

        return {
          mode,
          distance,
          duration,
          co2Grams: emissions.co2Grams,
          co2Saved: emissions.savedGrams,
          recommended: mode === 'bike' || mode === 'ebike' || mode === 'train'
        };
      });

      const calculatedRoutes = await Promise.all(routePromises);
      
      // Sort by CO2 emissions (lowest first)
      calculatedRoutes.sort((a, b) => a.co2Grams - b.co2Grams);
      
      setRoutes(calculatedRoutes);
    } catch (error) {
      console.error('Error calculating routes:', error);
      toast.error('Failed to calculate routes');
    } finally {
      setCalculating(false);
    }
  };

  const getEmissionColor = (co2Grams: number) => {
    if (co2Grams === 0) return 'bg-green-100 text-green-700';
    if (co2Grams < 500) return 'bg-yellow-100 text-yellow-700';
    if (co2Grams < 1000) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const getIcon = (mode: TransportMode) => {
    const transport = TRANSPORT_MODES.find(t => t.mode === mode);
    const Icon = transport?.icon || MapPin;
    return Icon;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl mb-2">Plan Your Journey</h1>
        <p className="text-green-100">Find the most sustainable route</p>
      </div>

      {/* Weather Card */}
      <WeatherCard weather={weather} loading={loadingWeather} />

      {/* Route Input */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              From
            </Label>
            <Input
              id="from"
              placeholder="Enter starting location"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="to" className="flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              To
            </Label>
            <Input
              id="to"
              placeholder="Enter destination"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <Button 
            onClick={calculateRoutes} 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={calculating}
          >
            {calculating ? 'Calculating...' : 'Find Routes'}
          </Button>
        </CardContent>
      </Card>

      {/* Route Options */}
      {routes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg px-1">Route Options</h2>
          {routes.map((route, index) => {
            const Icon = getIcon(route.mode);
            const emissionColor = getEmissionColor(route.co2Grams);
            const recommendations = getWeatherRecommendations(weather, route.mode);
            
            return (
              <Card 
                key={route.mode}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  route.recommended ? 'border-green-500 border-2' : ''
                }`}
                onClick={() => onSelectRoute(route, from, to)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="capitalize">{route.mode}</p>
                        <p className="text-sm text-gray-600">
                          {route.distance.toFixed(1)} km • {Math.round(route.duration)} min
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-sm ${emissionColor}`}>
                      {route.co2Grams === 0 ? '0g CO₂' : `${(route.co2Grams / 1000).toFixed(2)} kg CO₂`}
                    </div>
                    {route.co2Saved > 0 && (
                      <div className="text-sm text-green-600">
                        Save {(route.co2Saved / 1000).toFixed(2)} kg CO₂
                      </div>
                    )}
                  </div>

                  {route.recommended && (
                    <div className="mt-3 bg-green-50 px-3 py-2 rounded text-sm text-green-700">
                      ⭐ Recommended sustainable option
                    </div>
                  )}

                  {/* Weather Recommendations */}
                  {recommendations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {recommendations.map((rec, idx) => (
                        <div 
                          key={idx}
                          className={`px-3 py-2 rounded text-sm flex items-start gap-2 ${
                            rec.severity === 'alert' 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : rec.severity === 'warning'
                              ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {rec.severity === 'alert' && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                          {rec.severity === 'info' && <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                          <span>{rec.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {routes.length === 0 && !calculating && (
        <div className="text-center py-12 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Enter your journey details to see route options</p>
        </div>
      )}
    </div>
  );
}