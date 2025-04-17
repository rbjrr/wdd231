import { DEFAULT_LOCATION, setUseMetric } from './modules/config.js';
import { SAMPLE_SPOTS_DATA, SAMPLE_EVENTS_DATA } from './modules/data.js';
import { fetchWeatherData, fetchForecastData, processForecastData, getLocationName } from './modules/weather.js';
import { fetchMarineData, createMockMarineData } from './modules/marine.js';
import { getUserLocation, getCityCoordinates } from './modules/location.js';
import { 
  updateUI, 
  updateForecastUI, 
  populateSpots, 
  populateEvents, 
  setupMobileNavigation,
  updateTemperatureDisplays
} from './modules/ui.js';

async function fetchSurfSpotsData() {
  try {
    const response = await fetch('./data/surf-spots.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.surfSpots;
  } catch (error) {
    console.error('Error fetching surf spots data:', error);
    return [];
  }
}

function getRandomSurfSpots(spotsData, count = 3) {
  const spots = [...spotsData];
  
  for (let i = spots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [spots[i], spots[j]] = [spots[j], spots[i]];
  }
  
  return spots.slice(0, Math.min(count, spots.length));
}

function formatSpotsForUI(spotsData) {
  return spotsData.map(spot => ({
    name: spot.name,
    image: `images/surf-spots/${spot.imgUrl}`,
    conditions: `${spot.difficulty} • ${spot.waveType} • Avg: ${spot.avgWaveHeight}`,
    link: `surf-spots.html#${spot.id}`,
    location: spot.location,
    difficulty: spot.difficulty,
    waveType: spot.waveType,
    bestSeason: spot.bestSeason,
    description: spot.description,
    avgWaveHeight: spot.avgWaveHeight,
    maxWaveHeight: spot.maxWaveHeight,
    surfConsistency: spot.surfConsistency,
    crowdLevel: spot.crowdLevel
  }));
}

async function loadLocationWeather(lat, lng, isUserInitiated = false) {
  try {
    document.querySelectorAll('.loading-indicator').forEach(el => {
      el.textContent = 'Loading data for your location...';
      el.style.display = 'block';
    });
         
    const locationInfo = await getLocationName(lat, lng);
    
    updateLocationDisplay(locationInfo.name, locationInfo.country);
    
    const [weatherData, marineData, forecastData] = await Promise.all([
      fetchWeatherData(lat, lng),
      fetchMarineData(lat, lng),
      fetchForecastData(lat, lng)
    ]);
    
    console.log('Marine data from WeatherAPI:', marineData);
    
    const processedForecastData = processForecastData(forecastData);
    
    updateUI(weatherData, marineData);
    updateForecastUI(processedForecastData);
    
    return true;
  } catch (error) {
    console.error('Error loading location weather:', error);
    
    try {
      console.warn('Trying fallback to mock marine data');
      const weatherData = await fetchWeatherData(lat, lng);
      const mockMarineData = createMockMarineData();
      const forecastData = await fetchForecastData(lat, lng);
      const processedForecastData = processForecastData(forecastData);
      
      updateUI(weatherData, mockMarineData);
      updateForecastUI(processedForecastData);
      return true;
    } catch (fallbackError) {
      console.error('Even fallback failed:', fallbackError);
      if (isUserInitiated) {
        alert('Unable to get weather for your location. Please try again or search for a specific location.');
      }
      return false;
    }
  } 
}

function updateLocationDisplay(locationName, countryName = '') {
  let displayText = `Weather for: ${locationName}`;
  if (countryName) {
    displayText += `, ${countryName}`;
  }
  
  let locationDisplay = document.querySelector('.current-location-display');
  
  if (!locationDisplay) {
    locationDisplay = document.createElement('div');
    locationDisplay.className = 'current-location-display';
    
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
      searchBox.insertAdjacentElement('afterend', locationDisplay);
    }
  }
  
  locationDisplay.textContent = displayText;
}

async function tryUseUserLocation(isUserInitiated = false) {
  try {
    const coords = await getUserLocation();
    console.log('Got user location:', coords);
    
    const success = await loadLocationWeather(coords.lat, coords.lng, isUserInitiated);
    return success;
  } catch (error) {
    console.warn('Could not use geolocation, falling back to default location:', error);
    if (isUserInitiated) {
      alert('Could not access your location. Please make sure you\'ve granted location permission or try searching for a location instead.');
    }
    return false;
  }
}

async function loadDefaultLocationData() {
  console.log('Using default location data');
  
  try {
    updateLocationDisplay(DEFAULT_LOCATION.name);
    
    return await loadLocationWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
  } catch (error) {
    console.error('Error loading default location data:', error);
    handleLoadingError();
    return false;
  }
}

function setupEventListeners() {
  const searchBox = document.querySelector('.search-box input');
  const searchButton = document.querySelector('.search-box button');
  
 
  async function handleSearch() {
    const searchQuery = searchBox.value.trim();
    if (searchQuery) {
      try {
        
        const loadingEl = document.createElement('div');
        loadingEl.className = 'search-loading';
        loadingEl.textContent = `Searching for "${searchQuery}"...`;
        document.querySelector('.search-box').insertAdjacentElement('afterend', loadingEl);
        
        
        const locationData = await getCityCoordinates(searchQuery);
        console.log('Found coordinates for search:', locationData);
        
        
        document.querySelector('.search-loading')?.remove();
        await loadLocationWeather(locationData.lat, locationData.lng, true);
        searchBox.value = '';
      } catch (error) {
        console.error('Error searching for location:', error);
        document.querySelector('.search-loading')?.remove();
        alert(`Could not find location "${searchQuery}". Please try a different city or check spelling.`);
      }
    }
  }
  
  if (searchButton && searchBox) {
    searchButton.addEventListener('click', handleSearch);
    searchBox.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSearch();
      }
    });
  }

  const tempUnitSwitch = document.getElementById('temp-unit-switch');
  if (tempUnitSwitch) {
    tempUnitSwitch.addEventListener('change', function() {
      setUseMetric(this.checked);
      updateTemperatureDisplays();
    });
  }
  
  const locationBtn = document.getElementById('get-location-btn');
  if (locationBtn) {
    locationBtn.addEventListener('click', () => tryUseUserLocation(true));
  }
}

function handleLoadingError() {
  if (!document.querySelector('.global-error')) {
    document.body.innerHTML += `
      <div class="global-error">
        <h3>Sorry, we're having trouble loading data</h3>
        <p>Please try refreshing the page. If the problem persists, check your internet connection.</p>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    setupMobileNavigation();
    
    setupEventListeners();
    
    const userLocationSuccess = await tryUseUserLocation();
    
    if (!userLocationSuccess) {
      await loadDefaultLocationData();
    }
    
    const surfSpotsData = await fetchSurfSpotsData();
    
    if (surfSpotsData.length > 0) {
      const randomSpots = getRandomSurfSpots(surfSpotsData, 3);
      
      const formattedSpots = formatSpotsForUI(randomSpots);
      populateSpots(formattedSpots);
    } else {
      populateSpots(SAMPLE_SPOTS_DATA);
    }
    
    populateEvents(SAMPLE_EVENTS_DATA);
  } catch (error) {
    console.error('Error initializing app:', error);
    handleLoadingError();
  }
}); 