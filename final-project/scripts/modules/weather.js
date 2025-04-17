import { OPENWEATHER_KEY } from './config.js';
import { formatTemperature } from './utilities.js';

export async function fetchWeatherData(lat, lng) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=imperial&appid=${OPENWEATHER_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Weather data not available');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

export async function fetchForecastData(lat, lng) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=imperial&appid=${OPENWEATHER_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Forecast data not available');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return null;
  }
}

export function processForecastData(forecastData) {
  if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
    console.error('Invalid forecast data format:', forecastData);
    return [];
  }
  
  try {
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const today = new Date().getDay();
    
    const dailyForecasts = {};
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayOfWeek = daysOfWeek[date.getDay()];
      
      if (date.getDay() === today && date.getHours() < 12) {
        return;
      }
      
      const hour = date.getHours();
      
      if (!dailyForecasts[dayOfWeek] || Math.abs(hour - 12) < Math.abs(dailyForecasts[dayOfWeek].hour - 12)) {
        dailyForecasts[dayOfWeek] = {
          date: date,
          day: dayOfWeek,
          weather: item.weather[0].main,
          temp: formatTemperature(item.main.temp),
          tempF: item.main.temp,
          icon: item.weather[0].icon,
          hour: hour
        };
      }
    });
    
    const result = Object.values(dailyForecasts).slice(0, 6);
    
    if (result.length === 6 && result[5].day === 'SAT') {
      result[5].day = 'SAT/SUN';
    }
    
    console.log('Processed forecast data:', result);
    return result;
    
  } catch (error) {
    console.error('Error processing forecast data:', error);
    return [];
  }
}

export async function getLocationName(lat, lng) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${OPENWEATHER_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to get location name');
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      const location = data[0];
      return {
        name: location.name,
        country: location.country
      };
    }
    
    return { name: 'Current Location', country: '' };
  } catch (error) {
    console.error('Error getting location name:', error);
    return { name: 'Current Location', country: '' };
  }
}