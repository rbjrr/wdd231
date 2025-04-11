document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("lastModified").textContent = document.lastModified;
document.addEventListener("DOMContentLoaded", () => {
    const hamburgerButton = document.getElementById("mobileMenu");
    const mainNav = document.getElementById("navigation");
    const weatherContainer = document.getElementById("weatherNow");
    const weatherForecast = document.getElementById("weatherForecast");
    const membersContainer = document.getElementById("memberCards");
    const LATITUDE = 16.7666;
    const LONGITUDE = -3.0026;
    const API_BASE_URL = "https://api.openweathermap.org/data/2.5";

    async function fetchWeatherData(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}?lat=${LATITUDE}&lon=${LONGITUDE}&units=metric&appid=98e597a751f6f73736a3f445f8e52ec6`);
            
            if (!response.ok) {
                throw new Error(`Weather data not available for ${endpoint}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint} data:`, error);
            return null;
        }
    }
    
    function getWeatherIcon(weatherCode) {
        if (weatherCode >= 200 && weatherCode < 300) return "thunderstorm.svg";
        if (weatherCode >= 300 && weatherCode < 400) return "drizzle.svg";
        if (weatherCode >= 500 && weatherCode < 600) return "rain.svg";
        if (weatherCode >= 600 && weatherCode < 700) return "snow.svg";
        if (weatherCode >= 700 && weatherCode < 800) return "fog.svg";
        if (weatherCode === 800) return "sunny.svg";
        if (weatherCode > 800) return "cloudy.svg";
        return "sunny.svg";
    }
    
    function formatTime(timestamp) {
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        return new Date(timestamp * 1000).toLocaleTimeString('en-US', options);
    }

    async function getWeatherData() {
        const data = await fetchWeatherData("weather");
        if (data) displayWeather(data);
        else weatherContainer.innerHTML = "<p>Weather information unavailable</p>";
    }

    async function getWeatherForecast() {
        const data = await fetchWeatherData("forecast");
        if (data) displayWeatherForecast(data);
        else weatherForecast.innerHTML = "<p>Weather forecast information unavailable</p>";
    }

    function displayWeather(data) {
        const weatherCode = data.weather[0].id;
        const temperature = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const humidity = data.main.humidity;
        const windSpeed = Math.round(data.wind.speed);
        const highTemp = Math.round(data.main.temp_max);
        const lowTemp = Math.round(data.main.temp_min);
        const sunriseTime = formatTime(data.sys.sunrise);
        const sunsetTime = formatTime(data.sys.sunset);
        const svgFileName = getWeatherIcon(weatherCode);

        weatherContainer.innerHTML = `
        <div class="weather-info">
            <div class="weather-icon">
                <img src="images/weather/${svgFileName}" alt="${description}" width="200" height="200">
            </div>
            <div class="weather-data">
                <p class="temp">${temperature}°C</p>
                <p class="description">${description}</p>
            </div>
            <div class="weather-details">
                <p>Humidity: ${humidity}%</p>
                <p>Wind: ${windSpeed} m/s</p>
                <p>High: ${highTemp}°C</p>
                <p>Low: ${lowTemp}°C</p>
                <p>Sunrise: ${sunriseTime}</p>
                <p>Sunset: ${sunsetTime}</p>
            </div>
        </div>
    `;
    }

    function displayWeatherForecast(data) {
        const forecastList = data.list.filter((item, index) => index % 8 === 0).slice(0, 3);
        let forecastHTML = '';

        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });
            const temp = Math.round(item.main.temp);
            const description = item.weather[0].description;
            const weatherCode = item.weather[0].id;
            const svgFileName = getWeatherIcon(weatherCode);

            forecastHTML += `
                <div class="forecast-item">
                    <div class="weather-icon">
                        <img src="images/weather/${svgFileName}" alt="${description}" width="100" height="100">
                    </div>
                    <p>${day}: ${temp}°C</p>
                    <p>${description}</p>
                </div>
            `;
        });

        weatherForecast.innerHTML = forecastHTML;
    }


    async function fetchMembers() {
        try {
            const response = await fetch("data/members.json");
            const members = await response.json();
            displayMembers(members);
        } catch (error) {
            console.error("Error fetching json members:", error);
        }
    }

    function displayMembers(members) {
        membersContainer.innerHTML = "";
        const filteredMembers = members.filter(member => member.membership === 2 || member.membership === 3);
        const membersPool = [...filteredMembers];
        const randomMembers = [];
        const count = Math.min(3, membersPool.length);
        
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * membersPool.length);
            randomMembers.push(membersPool.splice(randomIndex, 1)[0]);
        }
        randomMembers.forEach(member => {
            const card = document.createElement("div");
            card.classList.add("member-card");
            card.innerHTML = `
                <h3>Membership Level: ${member.membership === 2 ? 'Silver' : 'Gold'}</h3>
                <h3>${member.name}</h3>
                <h4>${member.businessTag}</h4>
                <div class="member-information">
                    <div>
                        <img src="images/${member.image}" alt="${member.name}">
                    </div>
                    <div>
                        <p><span>Address:</span> ${member.address}</p>
                        <p><span>Phone:</span> ${member.phone}</p>
                        <p><span>Email:</span> ${member.email}</p>
                        <a href="${member.website}" target="_blank">Visit Website</a>
                    </div>
                </div>
            `;
            membersContainer.appendChild(card);
        });
    }

    fetchMembers();
    getWeatherData();
    getWeatherForecast();

    hamburgerButton.addEventListener("click", () => {
        mainNav.classList.toggle("active");
        if (mainNav.classList.contains("active")) {
            mobileMenu.innerHTML = "x";
        } else {
            mobileMenu.innerHTML ="≡";
        }
    });
});