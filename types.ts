
export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  high: number;
  low: number;
  description: string;
  timestamp: string;
  aiInsights: string;
  sources: Array<{ title: string; uri: string }>;
}

export enum Unit {
  CELSIUS = 'C',
  FAHRENHEIT = 'F'
}

export type WeatherTheme = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'night' | 'default';

export interface SearchHistoryItem {
  city: string;
  temp: number;
  condition: string;
}
