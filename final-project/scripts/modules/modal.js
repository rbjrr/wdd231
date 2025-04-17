export function createModalContainer() {
    let modalDialog = document.getElementById('spot-modal-dialog');
    
    if (modalDialog) {
      return modalDialog;
    }
    
    modalDialog = document.createElement('dialog');
    modalDialog.id = 'spot-modal-dialog';
    modalDialog.className = 'modal-dialog';
    modalDialog.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <div id="modal-body"></div>
      </div>
    `;
    
    document.body.appendChild(modalDialog);
    
    const closeBtn = modalDialog.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
      modalDialog.close();
    });
    
    modalDialog.addEventListener('click', (e) => {
      if (e.target === modalDialog) {
        modalDialog.close();
      }
    });
    
    return modalDialog;
  }
  
  export function showSpotDetails(spot) {
    const modalDialog = createModalContainer();
    const modalBody = document.getElementById('modal-body');
    
    let imageUrl = spot.image || `images/surf-spots/${spot.imgUrl}`;
    
    let modalContent = `
      <div class="modal-header">
        <h2>${spot.name}</h2>
      </div>
      <div class="modal-img" style="background-image: url(${imageUrl})"></div>
      <div class="modal-info">
    `;
    
    if (spot.location) {
      modalContent += `
        <div class="info-section">
          <h3>Location</h3>
      `;
      
      const locationParts = [];
      if (spot.location.beach) locationParts.push(spot.location.beach);
      if (spot.location.city) locationParts.push(spot.location.city);
      if (spot.location.state) locationParts.push(spot.location.state);
      if (spot.location.country) locationParts.push(spot.location.country);
      
      if (locationParts.length > 0) {
        modalContent += `<p>${locationParts.join(', ')}</p>`;
      }
      
      if (spot.location.coordinates) {
        modalContent += `
          <p>Coordinates: ${spot.location.coordinates.latitude}, ${spot.location.coordinates.longitude}</p>
        `;
      }
      
      modalContent += `</div>`;
    }
    
    if (spot.waveType || spot.difficulty || spot.avgWaveHeight) {
      modalContent += `
        <div class="info-section">
          <h3>Wave Information</h3>
      `;
      
      if (spot.waveType) modalContent += `<p>Type: ${spot.waveType}</p>`;
      if (spot.difficulty) modalContent += `<p>Difficulty: ${spot.difficulty}</p>`;
      if (spot.avgWaveHeight) modalContent += `<p>Average Wave Height: ${spot.avgWaveHeight}</p>`;
      if (spot.maxWaveHeight) modalContent += `<p>Maximum Wave Height: ${spot.maxWaveHeight}</p>`;
      
      modalContent += `</div>`;
    }
    
    if (spot.bestSeason || spot.surfConsistency || spot.crowdLevel) {
      modalContent += `
        <div class="info-section">
          <h3>Season & Conditions</h3>
      `;
      
      if (spot.bestSeason) modalContent += `<p>Best Season: ${spot.bestSeason}</p>`;
      if (spot.surfConsistency) modalContent += `<p>Surf Consistency: ${spot.surfConsistency}/5</p>`;
      if (spot.crowdLevel) modalContent += `<p>Crowd Level: ${spot.crowdLevel}/5</p>`;
      
      modalContent += `</div>`;
    }
    
    if (spot.description || spot.conditions) {
      modalContent += `
        <div class="info-section">
          <h3>Description</h3>
          <p>${spot.description || spot.conditions}</p>
        </div>
      `;
    }
    
    modalContent += `</div>`;
    
    modalBody.innerHTML = modalContent;
    modalDialog.showModal();
  }