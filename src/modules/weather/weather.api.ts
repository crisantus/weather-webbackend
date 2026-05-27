import { env } from "../../config/env.js";
import { AppError } from "../../middlewares/error.middleware.js";

// Shape of the raw response we use from OpenWeather.
type OpenWeatherResponse = {
  name: string;
  sys: { country?: string };
  weather: Array<{ main: string; description: string }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: { speed: number };
  coord: { lat: number; lon: number };
  dt: number;
};

// Clean weather shape returned by our own backend to the frontend.
export type WeatherResult = {
  locationName: string;
  country?: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  feelsLike: number;
  latitude: number;
  longitude: number;
  checkedAt: string;
};

// Convert OpenWeather's response into the simpler WeatherResult shape.
const formatWeather = (data: OpenWeatherResponse): WeatherResult => {
  const weather = data.weather[0];

  return {
    locationName: data.name,
    country: data.sys.country,
    temperature: data.main.temp,
    condition: weather?.description ?? weather?.main ?? "Unknown",
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    pressure: data.main.pressure,
    feelsLike: data.main.feels_like,
    latitude: data.coord.lat,
    longitude: data.coord.lon,
    checkedAt: new Date(data.dt * 1000).toISOString()
  };
};

export const fetchWeatherByCity = async (city: string) => {
  // Build the OpenWeather URL with query parameters.
  const url = new URL(`${env.OPENWEATHER_BASE_URL}/weather`);
  url.searchParams.set("q", city);
  url.searchParams.set("appid", env.OPENWEATHER_API_KEY);
  url.searchParams.set("units", "metric");

  const response = await fetch(url);

  // 404 means OpenWeather could not find that city.
  if (response.status === 404) {
    throw new AppError("Weather location not found", 404);
  }

  // Other failed responses are treated as upstream API errors.
  if (!response.ok) {
    throw new AppError("Unable to fetch current weather", 502);
  }

  return formatWeather((await response.json()) as OpenWeatherResponse);
};

export const fetchWeatherByCoordinates = async (latitude: number, longitude: number) => {
  // Use latitude/longitude when a saved location has coordinates.
  const url = new URL(`${env.OPENWEATHER_BASE_URL}/weather`);
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("appid", env.OPENWEATHER_API_KEY);
  url.searchParams.set("units", "metric");

  const response = await fetch(url);

  // Non-OK response means the weather provider failed or rejected the request.
  if (!response.ok) {
    throw new AppError("Unable to fetch current weather", 502);
  }

  return formatWeather((await response.json()) as OpenWeatherResponse);
};
