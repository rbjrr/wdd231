document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    const clearButton = document.getElementById('clear-btn');
    const profileMessage = document.getElementById('profile-message');
    const profileDisplay = document.getElementById('profile-display');
    const savedProfileCard = document.getElementById('saved-profile-card');
    
    loadProfileData();
    
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const profileData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            experience: document.getElementById('experience').value,
            homeSpot: document.getElementById('home-spot').value,
            boardType: document.getElementById('board-type').value,
            bio: document.getElementById('bio').value,
            waveSize: getSelectedCheckboxValues('wave-size'),
            notifications: getSelectedCheckboxValues('notifications'),
            lastUpdated: new Date().toLocaleString()
        };
        
        try {
            localStorage.setItem('surfBuddyProfile', JSON.stringify(profileData));
            
            showMessage('Profile saved successfully!', 'success');
            
            displayProfileData(profileData);
        } catch (error) {
            showMessage('Error saving profile: ' + error.message, 'error');
        }
    });
    
    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your profile data?')) {
            try {
                localStorage.removeItem('surfBuddyProfile');
                profileForm.reset();
                savedProfileCard.classList.remove('visible');
                showMessage('Profile data cleared successfully!', 'success');
            } catch (error) {
                showMessage('Error clearing profile data: ' + error.message, 'error');
            }
        }
    });
    
    function getSelectedCheckboxValues(name) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }
    
    function showMessage(text, type) {
        profileMessage.textContent = text;
        profileMessage.className = 'profile-message ' + type;
        
        setTimeout(() => {
            profileMessage.style.display = 'none';
        }, 3000);
    }
    
    function loadProfileData() {
        const storedProfile = localStorage.getItem('surfBuddyProfile');
        
        if (storedProfile) {
            try {
                const profileData = JSON.parse(storedProfile);
                
                document.getElementById('name').value = profileData.name || '';
                document.getElementById('email').value = profileData.email || '';
                document.getElementById('experience').value = profileData.experience || '';
                document.getElementById('home-spot').value = profileData.homeSpot || '';
                document.getElementById('board-type').value = profileData.boardType || '';
                document.getElementById('bio').value = profileData.bio || '';
                
                if (profileData.waveSize && Array.isArray(profileData.waveSize)) {
                    profileData.waveSize.forEach(size => {
                        const checkbox = document.querySelector(`input[name="wave-size"][value="${size}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
                
                if (profileData.notifications && Array.isArray(profileData.notifications)) {
                    profileData.notifications.forEach(notification => {
                        const checkbox = document.querySelector(`input[name="notifications"][value="${notification}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
                
                displayProfileData(profileData);
            } catch (error) {
                console.error('Error loading profile data:', error);
            }
        }
    }
    
    function displayProfileData(profileData) {
        savedProfileCard.classList.add('visible');
        
        const waveSizes = profileData.waveSize ? formatWaveSizes(profileData.waveSize) : 'None selected';
        
        const notifications = profileData.notifications ? formatNotifications(profileData.notifications) : 'None selected';
        
        let html = `
            <div class="profile-detail"><strong>Name:</strong> ${profileData.name}</div>
            <div class="profile-detail"><strong>Email:</strong> ${profileData.email}</div>
            <div class="profile-detail"><strong>Experience Level:</strong> ${formatExperience(profileData.experience)}</div>
            <div class="profile-detail"><strong>Home Spot:</strong> ${profileData.homeSpot || 'Not specified'}</div>
            <div class="profile-detail"><strong>Preferred Wave Sizes:</strong> ${waveSizes}</div>
            <div class="profile-detail"><strong>Board Type:</strong> ${formatBoardType(profileData.boardType)}</div>
            <div class="profile-detail"><strong>Notifications:</strong> ${notifications}</div>
        `;
        
        if (profileData.bio) {
            html += `<div class="profile-detail"><strong>About Me:</strong><br>${profileData.bio}</div>`;
        }
        
        html += `<div class="profile-detail"><strong>Last Updated:</strong> ${profileData.lastUpdated}</div>`;
        
        profileDisplay.innerHTML = html;
    }
    
    function formatExperience(experience) {
        if (!experience) return 'Not specified';
        
        const experienceMap = {
            'beginner': 'Beginner',
            'intermediate': 'Intermediate',
            'advanced': 'Advanced',
            'pro': 'Professional'
        };
        
        return experienceMap[experience] || experience;
    }
    
    function formatBoardType(boardType) {
        if (!boardType) return 'Not specified';
        
        const boardMap = {
            'shortboard': 'Shortboard',
            'longboard': 'Longboard',
            'fish': 'Fish',
            'funboard': 'Funboard',
            'gun': 'Gun'
        };
        
        return boardMap[boardType] || boardType;
    }
    
    function formatWaveSizes(sizes) {
        if (!sizes || sizes.length === 0) return 'None selected';
        
        const sizeMap = {
            'small': 'Small (1-3 ft)',
            'medium': 'Medium (3-5 ft)',
            'large': 'Large (5-8 ft)',
            'xl': 'Extra Large (8+ ft)'
        };
        
        return sizes.map(size => sizeMap[size] || size).join(', ');
    }
    
    function formatNotifications(notifications) {
        if (!notifications || notifications.length === 0) return 'None selected';
        
        const notificationMap = {
            'wave-alerts': 'Wave Alerts',
            'weather-updates': 'Weather Updates',
            'events': 'Surf Events'
        };
        
        return notifications.map(notification => notificationMap[notification] || notification).join(', ');
    }
});