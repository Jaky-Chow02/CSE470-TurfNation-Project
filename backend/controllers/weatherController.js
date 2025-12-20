const Weather = require('../models/Weather');
const { getWeather, getForecast } = require('../utils/weatherService');

// @desc    Get current weather
// @route   GET /api/weather/current
// @access  Public
exports.getCurrentWeather = async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a city'
      });
    }

    const weatherData = await getWeather(city);

    // Save to database
    const weather = await Weather.create({
      location: weatherData.location,
      date: new Date(),
      condition: weatherData.condition,
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      windSpeed: weatherData.windSpeed,
      rainChance: weatherData.rainChance,
      visibility: weatherData.visibility,
      uvIndex: weatherData.uvIndex,
      isSuitableForPlay: weatherData.isSuitableForPlay,
      alerts: weatherData.alerts,
      source: weatherData.source
    });

    res.status(200).json({
      success: true,
      data: weather
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weather forecast
// @route   GET /api/weather/forecast
// @access  Public
exports.getWeatherForecast = async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a city'
      });
    }

    const forecast = await getForecast(city);

    res.status(200).json({
      success: true,
      data: forecast
    });
  } catch (error) {
    next(error);
  }
};