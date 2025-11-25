import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WeatherData {
  city: string;
  temperature: number;
  feels_like: number;
  condition: string;
  description: string;
  humidity: number;
  wind_speed: number;
  icon: string;
  recommendation: string;
  transportSuggestion: string;
  weatherTip: string;
  isGoodForCycling: boolean;
  isGoodForWalking: boolean;
}

export const useWeather = (city: string = "Münster", country: string = "DE") => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: functionError } = await supabase.functions.invoke('get-weather', {
        body: { city, country }
      });

      if (functionError) {
        throw functionError;
      }

      setWeather(data);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [city, country]);

  return { weather, loading, error, refetch: fetchWeather };
};
