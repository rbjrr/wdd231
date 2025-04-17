export function getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }
  
  export async function getCityCoordinates(cityName) {
    try {
      if (!cityName || cityName.trim() === '') {
        throw new Error('City name is required');
      }
      
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=98e597a751f6f73736a3f445f8e52ec6`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error(`Location not found: ${cityName}`);
      }
      
      return {
        lat: data[0].lat,
        lng: data[0].lon,
        name: data[0].name,
        country: data[0].country
      };
    } catch (error) {
      console.error('Error getting city coordinates:', error);
      throw error;
    }
  }