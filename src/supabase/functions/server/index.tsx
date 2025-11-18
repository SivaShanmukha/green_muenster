import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Signup route
app.post('/make-server-ec1b5db9/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user profile
    await kv.set(`user:${data.user.id}:profile`, {
      id: data.user.id,
      name,
      email,
      totalCO2Saved: 0,
      journeyCount: 0,
      badges: [],
      goals: [],
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get user profile
app.get('/make-server-ec1b5db9/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}:profile`);
    
    if (!profile) {
      // Initialize profile if it doesn't exist
      const newProfile = {
        id: user.id,
        name: user.user_metadata?.name || 'User',
        email: user.email,
        totalCO2Saved: 0,
        journeyCount: 0,
        badges: [],
        goals: [],
        createdAt: new Date().toISOString()
      };
      await kv.set(`user:${user.id}:profile`, newProfile);
      return c.json(newProfile);
    }

    return c.json(profile);
  } catch (error) {
    console.log('Profile fetch error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update user profile
app.put('/make-server-ec1b5db9/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();
    const profile = await kv.get(`user:${user.id}:profile`);
    
    const updatedProfile = { ...profile, ...updates };
    await kv.set(`user:${user.id}:profile`, updatedProfile);

    return c.json(updatedProfile);
  } catch (error) {
    console.log('Profile update error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Save a journey
app.post('/make-server-ec1b5db9/journeys', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const journeyData = await c.req.json();
    const journeyId = `journey:${user.id}:${Date.now()}`;
    
    const journey = {
      ...journeyData,
      id: journeyId,
      userId: user.id,
      createdAt: new Date().toISOString()
    };

    await kv.set(journeyId, journey);

    // Update user profile stats
    const profile = await kv.get(`user:${user.id}:profile`);
    if (profile) {
      profile.totalCO2Saved = (profile.totalCO2Saved || 0) + (journeyData.co2Saved || 0);
      profile.journeyCount = (profile.journeyCount || 0) + 1;
      
      // Award badges based on milestones
      const badges = profile.badges || [];
      if (profile.journeyCount === 1 && !badges.includes('first_journey')) {
        badges.push('first_journey');
      }
      if (profile.totalCO2Saved >= 1000 && !badges.includes('co2_saver_1kg')) {
        badges.push('co2_saver_1kg');
      }
      if (profile.totalCO2Saved >= 5000 && !badges.includes('co2_saver_5kg')) {
        badges.push('co2_saver_5kg');
      }
      if (profile.journeyCount >= 10 && !badges.includes('frequent_traveler')) {
        badges.push('frequent_traveler');
      }
      if (profile.journeyCount >= 50 && !badges.includes('eco_warrior')) {
        badges.push('eco_warrior');
      }
      
      profile.badges = badges;
      await kv.set(`user:${user.id}:profile`, profile);
    }

    return c.json(journey);
  } catch (error) {
    console.log('Journey save error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get user's journeys
app.get('/make-server-ec1b5db9/journeys', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const journeys = await kv.getByPrefix(`journey:${user.id}:`);
    
    // Sort by createdAt descending
    journeys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json(journeys);
  } catch (error) {
    console.log('Journeys fetch error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get leaderboard
app.get('/make-server-ec1b5db9/leaderboard', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profiles = await kv.getByPrefix('user:');
    
    // Filter to only profiles (not individual journey data)
    const userProfiles = profiles.filter(p => p.id && p.totalCO2Saved !== undefined);
    
    // Sort by totalCO2Saved descending
    userProfiles.sort((a, b) => (b.totalCO2Saved || 0) - (a.totalCO2Saved || 0));

    return c.json(userProfiles.slice(0, 20)); // Top 20
  } catch (error) {
    console.log('Leaderboard fetch error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Calculate CO2 emissions for a route
app.post('/make-server-ec1b5db9/calculate-emissions', async (c) => {
  try {
    const { distance, mode } = await c.req.json(); // distance in km
    
    // CO2 emissions in grams per km
    const emissionFactors: Record<string, number> = {
      car: 120,      // Average petrol car
      bus: 50,       // Public bus
      train: 35,     // Electric train
      bike: 0,       // Zero emissions
      walk: 0,       // Zero emissions
      ebike: 5       // Electric bike (battery production)
    };

    const co2Grams = distance * (emissionFactors[mode] || 0);
    
    // Calculate savings compared to car
    const carEmissions = distance * emissionFactors.car;
    const savedGrams = carEmissions - co2Grams;

    return c.json({
      mode,
      distance,
      co2Grams,
      co2Kg: co2Grams / 1000,
      savedGrams: savedGrams > 0 ? savedGrams : 0,
      savedKg: savedGrams > 0 ? savedGrams / 1000 : 0
    });
  } catch (error) {
    console.log('CO2 calculation error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get weather data
app.get('/make-server-ec1b5db9/weather', async (c) => {
  try {
    const lat = c.req.query('lat');
    const lon = c.req.query('lon');
    const city = c.req.query('city');
    
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    if (!apiKey) {
      console.log('Weather API error: OPENWEATHER_API_KEY not configured');
      return c.json({ error: 'Weather API key not configured' }, 500);
    }

    let weatherUrl;
    if (lat && lon) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else if (city) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    } else {
      // Default to Münster, Germany
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=Münster,DE&appid=${apiKey}&units=metric`;
    }

    const response = await fetch(weatherUrl);
    
    if (!response.ok) {
      console.log(`Weather API error: ${response.status} - ${response.statusText}`);
      return c.json({ error: 'Failed to fetch weather data' }, response.status);
    }

    const data = await response.json();
    
    // Extract relevant weather information
    const weather = {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].main.toLowerCase(),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      city: data.name
    };

    return c.json(weather);
  } catch (error) {
    console.log('Weather fetch exception:', error);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);