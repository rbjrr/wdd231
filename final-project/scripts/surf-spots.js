import { setupMobileNavigation } from './modules/ui.js';
import { createModalContainer, showSpotDetails } from './modules/modal.js';

function init() {
  try {
    setupMobileNavigation();
    
    createModalContainer();
    
    fetchSurfSpots()
      .then(spotsData => {
        renderSurfSpots(spotsData.surfSpots);
        setupFilterListeners();
      })
      .catch(error => {
        console.error('Error loading surf spots:', error);
        document.querySelector('main').innerHTML = 
          '<div class="error-message">Failed to load surf spots. Please try again later.</div>';
      });
    
  } catch (error) {
    console.error('Error initializing surf spots page:', error);
    document.querySelector('main').innerHTML = 
      '<div class="error-message">Failed to load surf spots. Please try again later.</div>';
  }
}

async function fetchSurfSpots() {
  const response = await fetch('./data/surf-spots.json');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

function renderSurfSpots(spotsData) {
  const container = document.querySelector('main');
  
  let spotsContainer = document.getElementById('surf-spots-container');
  if (!spotsContainer) {
    spotsContainer = document.createElement('div');
    spotsContainer.id = 'surf-spots-container';
    spotsContainer.className = 'spots-grid';
    
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    
    const searchBox = document.createElement('div');
    searchBox.className = 'search-box';
    searchBox.innerHTML = `
      <input type="text" id="spot-search" placeholder="Search spots...">
    `;
    
    const difficultyFilters = document.createElement('div');
    difficultyFilters.className = 'difficulty-filters';
    difficultyFilters.innerHTML = `
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="beginner">Beginner</button>
      <button class="filter-btn" data-filter="intermediate">Intermediate</button>
      <button class="filter-btn" data-filter="advanced">Advanced</button>
      <button class="filter-btn" data-filter="expert">Expert</button>
    `;
    
    filterContainer.appendChild(searchBox);
    filterContainer.appendChild(difficultyFilters);
    
    container.innerHTML = '<h1>Popular Surf Spots</h1>';
    container.appendChild(filterContainer);
    container.appendChild(spotsContainer);
  }
  
  spotsData.forEach(spot => {
    const spotCard = createSpotCard(spot);
    spotsContainer.appendChild(spotCard);
  });
}

function createSpotCard(spot) {
  const spotCardEl = document.createElement('div');
  spotCardEl.className = 'spot-card';
  
  if (spot.difficulty) {
    spotCardEl.dataset.difficulty = spot.difficulty;
  }
  
  const imgEl = document.createElement('div');
  imgEl.className = 'spot-img';
  if (spot.imgUrl) {
    imgEl.style.backgroundImage = `url(images/surf-spots/${spot.imgUrl})`;
  } 
   else {
    imgEl.style.backgroundImage = `url(images/surf-spots/placeholder.jpg)`;
  }
  
  const infoEl = document.createElement('div');
  infoEl.className = 'spot-info';
  
  const nameEl = document.createElement('div');
  nameEl.className = 'spot-name';
  nameEl.textContent = spot.name;
  
  const locationEl = document.createElement('div');
  locationEl.className = 'spot-location';
  
  const locationParts = [];
  if (spot.location.beach) locationParts.push(spot.location.beach);
  if (spot.location.city) locationParts.push(spot.location.city);
  if (spot.location.state) locationParts.push(spot.location.state);
  if (spot.location.country) locationParts.push(spot.location.country);
  
  locationEl.textContent = locationParts.join(', ');
  
  const difficultyEl = document.createElement('div');
  difficultyEl.className = 'spot-difficulty';
  difficultyEl.textContent = `Difficulty: ${spot.difficulty}`;
  
  const waveTypeEl = document.createElement('div');
  waveTypeEl.className = 'spot-wave-type';
  waveTypeEl.textContent = `Wave Type: ${spot.waveType}`;
  
  const seasonEl = document.createElement('div');
  seasonEl.className = 'spot-season';
  seasonEl.textContent = `Best Season: ${spot.bestSeason}`;
  
  const waveHeightEl = document.createElement('div');
  waveHeightEl.className = 'spot-wave-height';
  waveHeightEl.textContent = `Avg. Wave Height: ${spot.avgWaveHeight}`;
  
  const detailsBtn = document.createElement('button');
  detailsBtn.className = 'view-details-btn';
  detailsBtn.textContent = 'View Details';
  detailsBtn.addEventListener('click', () => {
    showSpotDetails(spot);
  });
  
  infoEl.appendChild(nameEl);
  infoEl.appendChild(locationEl);
  infoEl.appendChild(difficultyEl);
  infoEl.appendChild(waveTypeEl);
  infoEl.appendChild(seasonEl);
  infoEl.appendChild(waveHeightEl);
  infoEl.appendChild(detailsBtn);
  
  spotCardEl.appendChild(imgEl);
  spotCardEl.appendChild(infoEl);
  
  return spotCardEl;
}

function setupFilterListeners() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  if (filterButtons.length === 0) return;
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      button.classList.add('active');
      
      applyFilter(filter);
    });
  });

  const searchInput = document.getElementById('spot-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      filterBySearchTerm(searchTerm);
    });
  }
}

function applyFilter(filter) {
  const spots = document.querySelectorAll('.spot-card');
  
  spots.forEach(spot => {
    if (filter === 'all') {
      spot.style.display = 'flex';
    } else {
      const difficulty = spot.dataset.difficulty?.toLowerCase() || '';
      spot.style.display = difficulty.includes(filter.toLowerCase()) ? 'flex' : 'none';
    }
  });
}

function filterBySearchTerm(searchTerm) {
  const spots = document.querySelectorAll('.spot-card');
  
  spots.forEach(spot => {
    const spotName = spot.querySelector('.spot-name')?.textContent.toLowerCase() || '';
    const spotLocation = spot.querySelector('.spot-location')?.textContent.toLowerCase() || '';
    
    if (spotName.includes(searchTerm) || spotLocation.includes(searchTerm) || searchTerm === '') {
      spot.style.display = 'flex';
    } else {
      spot.style.display = 'none';
    }
  });
}

document.addEventListener('DOMContentLoaded', init);