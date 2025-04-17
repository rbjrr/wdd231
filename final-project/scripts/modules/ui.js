import { formatTemperature } from './utilities.js';
import { getWindDirection } from './utilities.js';
import { useMetric, setUseMetric } from './config.js';
import { getTideStatus } from './marine.js';
import { createModalContainer, showSpotDetails } from './modal.js';

const waveHeightValue = document.getElementById('wave-height-value');
const windValue = document.getElementById('wind-value');
const windDetails = document.getElementById('wind-details');
const tideValue = document.getElementById('tide-value');
const tideDetails = document.getElementById('tide-details');
const weatherIconContainer = document.getElementById('weather-icon');
const weatherValue = document.getElementById('weather-value');
const forecastContainer = document.getElementById('forecast-container');
const spotsContainer = document.getElementById('spots-container');
const eventsContainer = document.getElementById('events-container');

export function updateTemperatureDisplays() {
  const forecastTemps = document.querySelectorAll('.forecast-temp');
  forecastTemps.forEach(element => {
    const tempText = element.getAttribute('data-temp-f');
    if (tempText) {
      element.textContent = formatTemperature(parseFloat(tempText));
    }
  });
  
  const currentTemp = document.querySelector('#weather-value[data-temp-f]');
  if (currentTemp) {
    currentTemp.textContent = formatTemperature(parseFloat(currentTemp.getAttribute('data-temp-f')));
  }
}

export function updateUI(weatherData, marineData) {
  if (weatherData) {
    const weatherCondition = weatherData.weather[0].main;
    const iconCode = weatherData.weather[0].icon;
    weatherValue.textContent = weatherCondition;
    
    if (weatherData.main && weatherData.main.temp) {
      weatherValue.setAttribute('data-temp-f', weatherData.main.temp);
      weatherValue.textContent = formatTemperature(weatherData.main.temp);
    }
    
    weatherIconContainer.innerHTML = '';
    const weatherImg = document.createElement('img');
    weatherImg.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherImg.alt = weatherCondition;
    weatherIconContainer.appendChild(weatherImg);
  }
  
  updateMarineUI(marineData);
}

function updateMarineUI(marineData) {
  if (!marineData) return;
  
  // Update tide information
  const tideInfo = getTideStatus(marineData.tide);
  tideValue.textContent = tideInfo.status;
  tideDetails.textContent = tideInfo.nextTime;
  
  // Update wind and swell data from WeatherAPI
  if (marineData.marine && marineData.marine.hours && marineData.marine.hours.length > 0) {
    const currentData = marineData.marine.hours[0];
    
    // Update wave height card with swell data
    if (waveHeightValue) {
      if (currentData.swellHeight) {
        const swellInfo = `${currentData.swellHeight} ft`;
        const swellDetails = document.createElement('div');
        swellDetails.className = 'condition-details';
        swellDetails.textContent = `${currentData.swellDirection || 'Unknown'} • ${currentData.swellPeriod || 'N/A'}s`;
        
        waveHeightValue.textContent = swellInfo;
        
        // Get the parent of waveHeightValue to add details
        const waveCard = document.getElementById('wave-height-card');
        if (waveCard) {
          // Look for existing details to replace, otherwise append
          const existingDetails = waveCard.querySelector('.condition-details');
          if (existingDetails) {
            existingDetails.textContent = swellDetails.textContent;
          } else {
            waveCard.appendChild(swellDetails);
          }
        }
      } else {
        waveHeightValue.textContent = "No swell data";
      }
    }
    
    if (currentData.windSpeed && currentData.windDirection) {
      const windSpeedMph = (currentData.windSpeed * 2.237).toFixed(1); // Convert m/s to mph
      windValue.textContent = useMetric ? `${currentData.windSpeed.toFixed(1)} m/s` : `${windSpeedMph} mph`;
      
      windDetails.textContent = getWindDirection(currentData.windDirection);
    } else {
      windValue.textContent = "Data unavailable";
      windDetails.textContent = "Direction unavailable";
    }
  }
}

export function updateForecastUI(forecastData) {
  try {
    if (!forecastData || forecastData.length === 0) {
      forecastContainer.innerHTML = '<div class="error-message">Unable to load forecast data. Please try again later.</div>';
      return;
    }
    
    forecastContainer.innerHTML = '';
    
    forecastData.forEach(day => {
      const forecastDayEl = createForecastDayElement(day);
      forecastContainer.appendChild(forecastDayEl);
    });
  } catch (error) {
    console.error('Error updating forecast UI:', error);
    forecastContainer.innerHTML = '<div class="error-message">An error occurred while loading forecast data.</div>';
  }
}

function createForecastDayElement(day) {
  const forecastDayEl = document.createElement('div');
  forecastDayEl.className = 'forecast-day';
  
  const dayEl = document.createElement('div');
  dayEl.className = 'day';
  dayEl.textContent = day.day;
  
  const iconEl = document.createElement('div');
  iconEl.className = 'forecast-icon';
  if (day.icon) {
    const img = document.createElement('img');
    img.src = `https://openweathermap.org/img/wn/${day.icon}.png`;
    img.alt = day.weather;
    iconEl.appendChild(img);
  } else {
    iconEl.textContent = '🌤️';
  }
  
  const weatherEl = document.createElement('div');
  weatherEl.className = 'forecast-weather';
  weatherEl.textContent = day.weather;
  
  const tempEl = document.createElement('div');
  tempEl.className = 'forecast-temp';
  tempEl.textContent = day.temp;
  if (day.tempF) {
    tempEl.setAttribute('data-temp-f', day.tempF);
  }
  
  forecastDayEl.appendChild(dayEl);
  forecastDayEl.appendChild(iconEl);
  forecastDayEl.appendChild(weatherEl);
  forecastDayEl.appendChild(tempEl);
  
  return forecastDayEl;
}

export function populateSpots(spotsData) {
  if (!spotsContainer) return;
  
  spotsContainer.innerHTML = '';
  
  createModalContainer();
  
  spotsData.forEach(spot => {
    const spotCardEl = document.createElement('div');
    spotCardEl.className = 'spot-card';
    
    const imgEl = document.createElement('div');
    imgEl.className = 'spot-img';
    if (spot.image) {
      imgEl.style.backgroundImage = `url(${spot.image})`;
    }
    
    const infoEl = document.createElement('div');
    infoEl.className = 'spot-info';
    
    const nameEl = document.createElement('div');
    nameEl.className = 'spot-name';
    nameEl.textContent = spot.name;
    
    const conditionsEl = document.createElement('div');
    conditionsEl.className = 'spot-conditions';
    conditionsEl.textContent = spot.conditions;
    
    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'view-details-btn';
    detailsBtn.textContent = 'View Details';
    detailsBtn.addEventListener('click', () => {
      showSpotDetails(spot);
    });
    
    infoEl.appendChild(nameEl);
    infoEl.appendChild(conditionsEl);
    infoEl.appendChild(detailsBtn);
    
    spotCardEl.appendChild(imgEl);
    spotCardEl.appendChild(infoEl);
    
    spotsContainer.appendChild(spotCardEl);
  });
}

export function populateEvents(eventsData) {
  eventsContainer.innerHTML = '';
  
  eventsData.forEach(event => {
    const eventCardEl = document.createElement('div');
    eventCardEl.className = 'event-card';
    
    const eventText = document.createElement('p');
    eventText.textContent = `${event.name} • ${event.location} • ${event.dates}`;
    
    eventCardEl.appendChild(eventText);
    eventsContainer.appendChild(eventCardEl);
  });
}

export function setupMobileNavigation() {
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  const navLinks = document.querySelector('.nav-links');
  
  if (hamburgerMenu && navLinks) {
    hamburgerMenu.addEventListener('click', () => {
      hamburgerMenu.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
    
    const navItems = navLinks.querySelectorAll('a');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        hamburgerMenu.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}