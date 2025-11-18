import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { CheckCircle, Navigation, TrendingDown, Clock } from 'lucide-react';
import type { RouteOption } from '../types';
import { saveJourney, getWeather } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { WeatherCard } from './WeatherCard';

interface JourneyTrackerProps {
  route: RouteOption;
  from: string;
  to: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function JourneyTracker({ route, from, to, onComplete, onCancel }: JourneyTrackerProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    // Fetch weather data for the journey
    const fetchWeatherData = async () => {
      try {
        const weatherData = await getWeather(from || undefined);
        setWeather(weatherData);
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    fetchWeatherData();
  }, [from]);

  useEffect(() => {
    // Simulate journey progress (faster for demo purposes)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          return 100;
        }
        return prev + 2; // Progress 2% every second (completes in ~50 seconds)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [route.duration]);

  const handleCompleteJourney = async () => {
    setSaving(true);
    try {
      await saveJourney({
        from,
        to,
        distance: route.distance,
        mode: route.mode,
        co2Grams: route.co2Grams,
        co2Saved: route.co2Saved,
        duration: route.duration
      });

      toast.success(`Journey saved! You saved ${(route.co2Saved / 1000).toFixed(2)} kg CO₂`);
      onComplete();
    } catch (error) {
      console.error('Error saving journey:', error);
      toast.error('Failed to save journey');
    } finally {
      setSaving(false);
    }
  };

  const handleSkipToComplete = () => {
    setProgress(100);
    setIsComplete(true);
  };

  const getProgressColor = () => {
    const emissionLevel = route.co2Grams / route.distance; // grams per km
    if (emissionLevel === 0) return 'bg-green-600';
    if (emissionLevel < 40) return 'bg-yellow-500';
    if (emissionLevel < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className={`${getProgressColor()} text-white p-6 rounded-lg shadow-lg transition-colors`}>
        <h1 className="text-2xl mb-2">Journey in Progress</h1>
        <p className="text-white/90">{from} → {to}</p>
      </div>

      {/* Journey Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Mode</p>
              <p className="capitalize">{route.mode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Distance</p>
              <p>{route.distance.toFixed(1)} km</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p>{Math.round(route.duration)} min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-gray-600" />
              <span>Progress</span>
            </div>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          
          {isComplete && (
            <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-green-900">Journey Complete!</p>
                <p className="text-sm text-green-700">Great job on your sustainable travel</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environmental Impact */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-green-600" />
            Environmental Impact
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">CO₂ Emissions</span>
              <span className={route.co2Grams === 0 ? 'text-green-600' : ''}>
                {route.co2Grams === 0 ? '0g' : `${(route.co2Grams / 1000).toFixed(2)} kg`}
              </span>
            </div>
            
            {route.co2Saved > 0 && (
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-700">CO₂ Saved vs. Car</span>
                <span className="text-green-600">{(route.co2Saved / 1000).toFixed(2)} kg</span>
              </div>
            )}
          </div>

          {route.co2Saved > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-900">
                💡 Your choice saved enough CO₂ to offset {Math.round(route.co2Saved / 100)} smartphone charges!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Motivational Tips */}
      {!isComplete && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-3">💚 Sustainability Tip</h3>
            <p className="text-sm text-gray-700">
              {route.mode === 'bike' || route.mode === 'walk' 
                ? 'Active transport not only reduces emissions but also improves your health and wellbeing!'
                : route.mode === 'bus' || route.mode === 'train'
                ? 'Public transport is one of the most efficient ways to reduce per-person emissions in urban areas.'
                : 'Consider carpooling to further reduce your carbon footprint when driving.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Weather Card */}
      {weather && (
        <Card>
          <CardContent className="pt-6">
            <WeatherCard weather={weather} />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t max-w-lg mx-auto space-y-2">
        {isComplete ? (
          <Button 
            onClick={handleCompleteJourney}
            className="w-full bg-green-600 hover:bg-green-700 h-12"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Journey & Earn Points'}
          </Button>
        ) : (
          <>
            <Button 
              onClick={handleSkipToComplete}
              className="w-full bg-green-600 hover:bg-green-700 h-12"
            >
              Complete Journey Now (Demo)
            </Button>
            <Button 
              onClick={onCancel}
              variant="outline"
              className="w-full h-10"
            >
              Cancel Journey
            </Button>
          </>
        )}
      </div>
    </div>
  );
}