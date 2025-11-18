import React from 'react';
import { Card, CardContent } from './ui/card';
import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Wind, Droplets } from 'lucide-react';

interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  city: string;
}

interface WeatherCardProps {
  weather: WeatherData | null;
  loading?: boolean;
}

export function WeatherCard({ weather, loading }: WeatherCardProps) {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-blue-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-blue-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return null;
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'rain':
        return <CloudRain className="w-10 h-10 text-blue-500" />;
      case 'snow':
        return <CloudSnow className="w-10 h-10 text-blue-300" />;
      case 'drizzle':
        return <CloudDrizzle className="w-10 h-10 text-blue-400" />;
      case 'clear':
        return <Sun className="w-10 h-10 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="w-10 h-10 text-gray-400" />;
      default:
        return <Cloud className="w-10 h-10 text-gray-400" />;
    }
  };

  const getBackgroundGradient = (condition: string) => {
    switch (condition) {
      case 'rain':
      case 'drizzle':
        return 'from-blue-100 to-blue-200';
      case 'snow':
        return 'from-blue-50 to-slate-100';
      case 'clear':
        return 'from-yellow-50 to-orange-100';
      case 'clouds':
        return 'from-gray-100 to-gray-200';
      default:
        return 'from-blue-50 to-blue-100';
    }
  };

  return (
    <Card className={`bg-gradient-to-br ${getBackgroundGradient(weather.condition)}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{weather.city}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl">{weather.temp}°C</span>
              <span className="text-sm text-gray-600">Feels like {weather.feelsLike}°C</span>
            </div>
            <p className="text-sm text-gray-700 capitalize mt-1">{weather.description}</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            {getWeatherIcon(weather.condition)}
            <div className="flex gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Wind className="w-3 h-3" />
                <span>{weather.windSpeed} km/h</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                <span>{weather.humidity}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
