const axios = require('axios');

// Mock weather data generator
const generateMockWeather = (city, date) => {
  const conditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Drizzle'];
  const month = new Date(date).getMonth();
  
  // Bangladesh weather patterns
  // Monsoon: June-September (more rain)
  // Winter: November-February (cooler, dry)
  // Summer: March-May (hot, humid)
  
  let baseTemp, rainChanceFactor;
  
  if (month >= 5 && month <= 8) {
    // Monsoon season
    baseTemp = 28;
    rainChanceFactor = 0.6;
  } else if (month >= 10 || month <= 1) {
    // Winter
    baseTemp = 20;
    rainChanceFactor = 0.1;
  } else {
    // Summer
    baseTemp = 32;
    rainChanceFactor = 0.2;
  }
  
  const temperature = baseTemp + (Math.random() * 6 - 3); // ±3 degrees
  const humidity = 60 + Math.random() * 30; // 60-90%
  const windSpeed = 5 + Math.random() * 15; // 5-20 km/h
  const rainChance = Math.random() < rainChanceFactor ? Math.random() * 100 : Math.random() * 30;
  
  let condition;
  if (rainChance > 70) {
    condition = 'Rainy';
  } else if (rainChance > 40) {
    condition = 'Cloudy';
  } else if (rainChance > 20) {
    condition = 'Partly Cloudy';
  } else {
    condition = 'Clear';
  }
  
  const isSuitableForPlay = rainChance < 60 && windSpeed < 25;
  
  const alerts = [];
  if (rainChance > 70) {
    alerts.push({
      type: 'rain',
      message: 'High chance of rain. Consider rescheduling.',
      severity: 'high'
    });
  }
  if (temperature > 35) {
    alerts.push({
      type: 'heat',
      message: 'Very hot weather. Stay hydrated.',
      severity: 'medium'
    });
  }
  
  return {
    location: {
      city: city,
      coordinates: {
        latitude: 23.8103 + (Math.random() * 0.1 - 0.05),
        longitude: 90.4125 + (Math.random() * 0.1 - 0.05)
      }
    },
    condition,
    temperature: Math.round(temperature * 10) / 10,
    feelsLike: Math.round((temperature + 2) * 10) / 10,
    humidity: Math.round(humidity),
    windSpeed: Math.round(windSpeed * 10) / 10,
    rainChance: Math.round(rainChance),
    visibility: rainChance > 60 ? 5 + Math.random() * 3 : 8 + Math.random() * 2,
    uvIndex: Math.floor(Math.random() * 11),
    isSuitableForPlay,
    alerts,
    source: 'mock'
  };
};

// Get weather from real API
const getRealWeather = async (city, date) => {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    const rainChance = data.rain ? (data.rain['1h'] || 0) * 10 : 0;
    const condition = data.weather[0].main;
    const isSuitableForPlay = !['Rain', 'Thunderstorm', 'Snow'].includes(condition);
    
    return {
      location: {
        city: data.name,
        coordinates: {
          latitude: data.coord.lat,
          longitude: data.coord.lon
        }
      },
      condition: data.weather[0].main,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed * 3.6, // Convert m/s to km/h
      rainChance: Math.min(rainChance, 100),
      visibility: (data.visibility || 10000) / 1000, // Convert to km
      uvIndex: 5, // OpenWeatherMap free tier doesn't provide UV
      isSuitableForPlay,
      alerts: isSuitableForPlay ? [] : [{
        type: 'rain',
        message: 'Weather conditions not suitable for play',
        severity: 'high'
      }],
      source: 'api'
    };
  } catch (error) {
    console.error('Weather API Error:', error.message);
    // Fallback to mock if API fails
    return generateMockWeather(city, date);
  }
};

// Main function to get weather
const getWeather = async (city, date = new Date()) => {
  const useMock = process.env.USE_MOCK_WEATHER === 'true';
  
  if (useMock) {
    return generateMockWeather(city, date);
  } else {
    return await getRealWeather(city, date);
  }
};

// Get 5-day forecast
const getForecast = async (city) => {
  const useMock = process.env.USE_MOCK_WEATHER === 'true';
  
  if (useMock) {
    const forecast = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        date,
        ...generateMockWeather(city, date)
      });
    }
    return forecast;
  } else {
    try {
      const apiKey = process.env.WEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
      
      const response = await axios.get(url);
      const dailyForecasts = response.data.list.filter((item, index) => index % 8 === 0).slice(0, 5);
      
      return dailyForecasts.map(item => ({
        date: new Date(item.dt * 1000),
        location: {
          city: response.data.city.name,
          coordinates: {
            latitude: response.data.city.coord.lat,
            longitude: response.data.city.coord.lon
          }
        },
        condition: item.weather[0].main,
        temperature: item.main.temp,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed * 3.6,
        rainChance: item.pop * 100,
        source: 'api'
      }));
    } catch (error) {
      console.error('Forecast API Error:', error.message);
      // Fallback to mock
      const forecast = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        forecast.push({
          date,
          ...generateMockWeather(city, date)
        });
      }
      return forecast;
    }
  }
};

module.exports = {
  getWeather,
  getForecast,
  generateMockWeather
};