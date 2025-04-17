import { getWindDirection } from './utilities.js';
import { WEATHERAPI_KEY } from './config.js';

const WEATHERAPI_URL = 'https://api.weatherapi.com/v1';

export async function fetchMarineData(lat, lng) {
  console.log(`Fetching marine data for coordinates: ${lat}, ${lng}`);
  
  try {
    const locationParam = `${lat},${lng}`;
    const params = new URLSearchParams({
      key: WEATHERAPI_KEY,
      q: locationParam,
      days: 1,
      aqi: 'no',
      alerts: 'no',
      tide: 'yes' 
    });
    
    const url = `${WEATHERAPI_URL}/marine.json?${params}`;
    console.log('Requesting WeatherAPI URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`WeatherAPI error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('WeatherAPI marine data:', data);
  
    return processWeatherAPIData(data);
  } catch (error) {
    console.error('Error fetching WeatherAPI marine data:', error);
    console.warn('Falling back to mock data');
    return createMockMarineData();
  }
}

function processWeatherAPIData(data) {
  try {
    
    if (!data || !data.forecast || !data.forecast.forecastday || data.forecast.forecastday.length === 0) {
      throw new Error('Invalid WeatherAPI data format');
    }
    
    const currentDay = data.forecast.forecastday[0];
    const currentHour = new Date().getHours();
    const hourData = currentDay.hour[currentHour] || currentDay.hour[0];
    
    const tidePredictions = [];
    if (currentDay.tides && currentDay.tides.length > 0 && currentDay.tides[0].tide) {
      currentDay.tides[0].tide.forEach(tide => {
        tidePredictions.push({
          type: tide.type === 'high' ? 'H' : 'L', 
          t: tide.time,
          v: tide.height.toString()
        });
      });
    } else {
      tidePredictions.push(...generateTidePredictions(data.location.lat, data.location.lon));
    }
    const windSpeed = hourData.wind_kph / 3.6; 
    const windDirection = hourData.wind_degree || 0;
    const swellHeight = hourData.swell_ht_ft || 0;
    const swellDirection = hourData.swell_dir_16_point || hourData.swell_dir || "Unknown";
    const swellPeriod = hourData.swell_period_secs || 0;
    
   
    return {
      tide: {
        predictions: tidePredictions
      },
      marine: {
        hours: [{
          windSpeed: parseFloat(windSpeed),
          windDirection: parseInt(windDirection),
          swellHeight: parseFloat(swellHeight),
          swellDirection: swellDirection,
          swellPeriod: parseFloat(swellPeriod)
        }]
      }
    };
  } catch (error) {
    console.error('Error processing WeatherAPI data:', error);
    throw error;
  }
}

function generateTidePredictions(lat, lng) {
  const now = new Date();
  const tidePredictions = [];
  const locationSeed = (Math.abs(lat * 100) + Math.abs(lng * 100)) % 12;
  const currentHour = now.getHours();
  const hourInCycle = (currentHour + locationSeed) % 12;
  const nextTideIsHigh = hourInCycle < 6;
  const hoursToNextTide = nextTideIsHigh ? 6 - hourInCycle : 12 - hourInCycle;
  const nextTideTime = new Date(now.getTime() + hoursToNextTide * 60 * 60 * 1000);
  tidePredictions.push({
    type: nextTideIsHigh ? 'H' : 'L',
    t: nextTideTime.toISOString(),
    v: nextTideIsHigh ? '3.2' : '0.8'
  });
  
  const secondTideTime = new Date(nextTideTime.getTime() + 6 * 60 * 60 * 1000);
  tidePredictions.push({
    type: nextTideIsHigh ? 'L' : 'H',
    t: secondTideTime.toISOString(),
    v: nextTideIsHigh ? '0.7' : '3.4'
  });
  
  return tidePredictions;
}

export function getTideStatus(tideData) {
  if (!tideData || !tideData.predictions || tideData.predictions.length === 0) {
    return { status: 'Unknown', nextTime: 'Unknown' };
  }
  
  const now = new Date();
  const predictions = tideData.predictions;
  const nextTide = predictions.find(tide => new Date(tide.t) > now);
  
  if (!nextTide) {
    return { status: 'Unknown', nextTime: 'Unknown' };
  }
  
  const isRising = nextTide.type === 'H'; 
  const nextTime = new Date(nextTide.t);
  const formattedTime = nextTime.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
  
  return {
    status: isRising ? 'Rising' : 'Falling',
    nextTime: `Next ${nextTide.type === 'H' ? 'High' : 'Low'}: ${formattedTime}`
  };
}

export function createMockMarineData() {
  return {
    tide: {
      predictions: [
        { type: 'H', t: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), v: '3.2' },
        { type: 'L', t: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(), v: '0.7' }
      ]
    },
    marine: {
      hours: [
        { 
          windSpeed: 4.5,
          windDirection: 280,
          swellHeight: 5.4,
          swellDirection: "SE",
          swellPeriod: 9.9
        }
      ]
    }
  };
}