import { useMetric } from './config.js';

export function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5/9;
}

export function formatTemperature(tempF) {
  if (typeof tempF === 'string') {
    tempF = parseFloat(tempF.replace(/[^\d.-]/g, ''));
  }
  
  if (useMetric) {
    const tempC = fahrenheitToCelsius(tempF);
    return `${Math.round(tempC)}°C`;
  } else {
    return `${Math.round(tempF)}°F`;
  }
}

export function metersToFeet(meters) {
  return (meters * 3.28084).toFixed(1);
}

export function getWindDirection(degrees, beachOrientation = 270) {
  const difference = Math.abs(degrees - beachOrientation);
  if (difference <= 90 || difference >= 270) {
    return 'Offshore';
  } else {
    return 'Onshore';
  }
}