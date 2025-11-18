import type { TransportMode } from '../types';

interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  city: string;
}

interface WeatherRecommendation {
  message: string;
  severity: 'info' | 'warning' | 'alert';
  icon: string;
}

export function getWeatherRecommendations(
  weather: WeatherData | null,
  mode: TransportMode
): WeatherRecommendation[] {
  if (!weather) return [];

  const recommendations: WeatherRecommendation[] = [];
  const { condition, temp, feelsLike, windSpeed } = weather;

  // Rain/Snow recommendations
  if (condition === 'rain' || condition === 'drizzle') {
    if (mode === 'bike' || mode === 'ebike') {
      recommendations.push({
        message: '🧥 Consider wearing a weatherproof jacket for cycling in the rain',
        severity: 'warning',
        icon: '🚴‍♂️'
      });
    }
    if (mode === 'walk') {
      recommendations.push({
        message: '☔ Bring an umbrella and wear a warm jacket',
        severity: 'warning',
        icon: '🚶‍♂️'
      });
    }
  }

  if (condition === 'snow') {
    if (mode === 'bike' || mode === 'ebike') {
      recommendations.push({
        message: '⚠️ Cycling in snow can be dangerous. Consider public transport instead',
        severity: 'alert',
        icon: '❄️'
      });
    }
    if (mode === 'walk') {
      recommendations.push({
        message: '🧥 Wear warm, waterproof clothing and be careful of icy surfaces',
        severity: 'alert',
        icon: '🚶‍♂️'
      });
    }
    if (mode === 'bus' || mode === 'train') {
      recommendations.push({
        message: '✅ Public transport is a safer option in snowy conditions',
        severity: 'info',
        icon: '🚌'
      });
    }
  }

  // Severe weather - strong recommendation for public transport
  const isSevereWeather = 
    (condition === 'thunderstorm') ||
    (condition === 'snow') ||
    (condition === 'rain' && windSpeed > 30);

  if (isSevereWeather && (mode === 'bike' || mode === 'ebike' || mode === 'walk')) {
    recommendations.push({
      message: '🚌 Weather conditions are deteriorating. We strongly recommend using public transport',
      severity: 'alert',
      icon: '⚠️'
    });
  }

  // Temperature recommendations
  if (temp < 5 && (mode === 'bike' || mode === 'ebike' || mode === 'walk')) {
    recommendations.push({
      message: '🧊 It\'s cold outside! Dress warmly with gloves and a hat',
      severity: 'info',
      icon: '❄️'
    });
  }

  if (temp > 30 && (mode === 'bike' || mode === 'ebike' || mode === 'walk')) {
    recommendations.push({
      message: '☀️ It\'s very hot! Stay hydrated and consider sun protection',
      severity: 'info',
      icon: '💧'
    });
  }

  // Wind recommendations
  if (windSpeed > 40 && (mode === 'bike' || mode === 'ebike')) {
    recommendations.push({
      message: '💨 Strong winds may make cycling difficult. Consider alternative transport',
      severity: 'warning',
      icon: '🌬️'
    });
  }

  // Good weather encouragement
  if (condition === 'clear' && temp >= 15 && temp <= 25 && (mode === 'bike' || mode === 'walk')) {
    recommendations.push({
      message: '✨ Perfect weather for outdoor travel! Enjoy your journey',
      severity: 'info',
      icon: '🌟'
    });
  }

  return recommendations;
}

export function shouldRecommendPublicTransport(weather: WeatherData | null): boolean {
  if (!weather) return false;

  const { condition, windSpeed } = weather;

  // Recommend public transport for severe weather
  return (
    condition === 'thunderstorm' ||
    condition === 'snow' ||
    (condition === 'rain' && windSpeed > 30) ||
    windSpeed > 50
  );
}
