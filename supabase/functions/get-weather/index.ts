import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherResponse {
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city = "Münster", country = "DE" } = await req.json();
    const apiKeyRaw = Deno.env.get('OPENWEATHER_API_KEY') ?? '';
    const apiKey = apiKeyRaw.trim().replace(/^['"]|['"]$/g, '');
    
    if (!apiKey) {
      console.error('OpenWeatherMap API key not configured');
      return new Response(
        JSON.stringify({ error: 'Weather service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log only the length of the API key for debugging (do not log the key itself)
    console.log('OpenWeather API key length (sanitized):', apiKey.length);

    const cityParam = encodeURIComponent(city);
    const countryParam = encodeURIComponent(country);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityParam},${countryParam}&appid=${apiKey}&units=metric`;
    
    console.log('Fetching weather data for:', city, country);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      let providerMessage = '';
      try {
        const errJson = await response.json();
        providerMessage = typeof errJson?.message === 'string' ? errJson.message : JSON.stringify(errJson);
      } catch (_) {
        providerMessage = await response.text();
      }
      console.error('OpenWeatherMap API error:', response.status, providerMessage);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch weather data', provider_status: response.status, provider_message: providerMessage }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: WeatherResponse = await response.json();
    
    // Analyze weather conditions and provide recommendations
    const weather = data.weather[0];
    const temp = data.main.temp;
    const windSpeed = data.wind.speed;
    const isRaining = weather.main.toLowerCase().includes('rain');
    const isCloudy = weather.main.toLowerCase().includes('cloud');
    const isSnowing = weather.main.toLowerCase().includes('snow');
    
    let recommendation = '';
    let transportSuggestion = '';
    let weatherTip = '';
    
    if (isRaining || isSnowing) {
      recommendation = 'Weather Alert';
      transportSuggestion = 'public transport or car';
      weatherTip = isRaining 
        ? '🌧️ Rainy conditions - Public transport or car recommended. If cycling, wear a rainproof jacket!'
        : '❄️ Snowy conditions - Public transport or car recommended for safety.';
    } else if (temp < 5) {
      recommendation = 'Cold Weather';
      transportSuggestion = 'any mode with warm clothing';
      weatherTip = '🥶 Cold weather - Dress warmly! Public transport keeps you warm.';
    } else if (temp > 25) {
      recommendation = 'Hot Weather';
      transportSuggestion = 'cycling with hydration';
      weatherTip = '☀️ Hot weather - Stay hydrated! Cycling recommended with sun protection.';
    } else if (windSpeed > 10) {
      recommendation = 'Windy Conditions';
      transportSuggestion = 'public transport';
      weatherTip = '💨 Windy conditions - Public transport recommended for comfort.';
    } else {
      recommendation = 'Perfect Conditions';
      transportSuggestion = 'cycling or walking';
      weatherTip = '✨ Perfect weather for cycling or walking! Enjoy the eco-friendly journey.';
    }
    
    const result = {
      city: data.name,
      temperature: Math.round(temp),
      feels_like: Math.round(data.main.feels_like),
      condition: weather.main,
      description: weather.description,
      humidity: data.main.humidity,
      wind_speed: Math.round(windSpeed),
      icon: weather.icon,
      recommendation,
      transportSuggestion,
      weatherTip,
      isGoodForCycling: !isRaining && !isSnowing && temp > 5 && temp < 30 && windSpeed < 10,
      isGoodForWalking: !isRaining && !isSnowing && temp > 0 && temp < 30,
    };
    
    console.log('Weather data processed successfully:', result);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in get-weather function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
