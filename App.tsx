
import React, { useState, useEffect, useCallback } from 'react';
import { WeatherData, Unit, WeatherTheme, SearchHistoryItem } from './types';
import { fetchWeatherByCity } from './services/geminiService';
import WeatherCard from './components/WeatherCard';
import SearchHistory from './components/SearchHistory';
// Fix: Added Sun to the imports from lucide-react
import { Search, Loader2, ThermometerSun, MapPin, AlertCircle, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<Unit>(Unit.CELSIUS);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [theme, setTheme] = useState<WeatherTheme>('default');

  // Initialize history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('skysense_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
    
    // Initial fetch for a default city or user location
    handleSearch('London');
  }, []);

  const updateHistory = (data: WeatherData) => {
    const newItem: SearchHistoryItem = {
      city: data.city,
      temp: data.temperature,
      condition: data.condition
    };
    const updated = [newItem, ...history.filter(h => h.city !== data.city)].slice(0, 5);
    setHistory(updated);
    localStorage.setItem('skysense_history', JSON.stringify(updated));
  };

  const determineTheme = (condition: string): WeatherTheme => {
    const cond = condition.toLowerCase();
    if (cond.includes('sun') || cond.includes('clear')) return 'sunny';
    if (cond.includes('rain') || cond.includes('drizzle')) return 'rainy';
    if (cond.includes('storm') || cond.includes('thunder')) return 'stormy';
    if (cond.includes('snow')) return 'snowy';
    if (cond.includes('cloud')) return 'cloudy';
    return 'default';
  };

  const handleSearch = async (searchCity: string) => {
    if (!searchCity.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherByCity(searchCity);
      setWeatherData(data);
      setTheme(determineTheme(data.condition));
      updateHistory(data);
    } catch (err) {
      setError("We couldn't find that city or the service is temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getThemeStyles = () => {
    switch (theme) {
      case 'sunny': return 'bg-gradient-to-br from-blue-400 via-sky-500 to-amber-200';
      case 'rainy': return 'bg-gradient-to-br from-slate-700 via-blue-900 to-indigo-950';
      case 'stormy': return 'bg-gradient-to-br from-gray-900 via-purple-950 to-slate-900';
      case 'snowy': return 'bg-gradient-to-br from-blue-50 via-blue-100 to-slate-300 text-slate-900';
      case 'cloudy': return 'bg-gradient-to-br from-slate-500 via-gray-600 to-slate-800';
      default: return 'bg-gradient-to-br from-gray-800 via-slate-900 to-black';
    }
  };

  return (
    <div className={`min-h-screen weather-transition flex flex-col items-center p-4 md:p-8 ${getThemeStyles()} ${theme === 'snowy' ? 'text-slate-800' : 'text-white'}`}>
      
      {/* Header / Navbar */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg transform -rotate-6">
            <ThermometerSun className="text-blue-600" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">SkySense<span className="text-blue-400">AI</span></h2>
            <p className="text-xs uppercase tracking-widest opacity-60">Weather Intelligence</p>
          </div>
        </div>

        {/* Search Input Container */}
        <div className="relative w-full max-w-md group">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(city); }} className="relative">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search city..."
              className={`w-full glass py-4 px-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400/50 transition-all placeholder:text-white/40 ${theme === 'snowy' ? 'placeholder:text-slate-500 text-slate-800 border-slate-300' : ''}`}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={20} />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 p-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} className="text-white" />}
            </button>
          </form>
        </div>

        {/* Unit Toggle */}
        <div className="flex bg-white/10 p-1 rounded-xl glass border-white/10">
          <button 
            onClick={() => setUnit(Unit.CELSIUS)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${unit === Unit.CELSIUS ? 'bg-white text-blue-600 shadow-md' : 'opacity-60 hover:opacity-100'}`}
          >
            °C
          </button>
          <button 
            onClick={() => setUnit(Unit.FAHRENHEIT)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${unit === Unit.FAHRENHEIT ? 'bg-white text-blue-600 shadow-md' : 'opacity-60 hover:opacity-100'}`}
          >
            °F
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex flex-col items-center flex-grow">
        {error && (
          <div className="mb-8 w-full max-w-4xl animate-bounce">
            <div className="bg-red-500/20 border border-red-500/50 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3 text-red-200">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {loading && !weatherData && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ThermometerSun className="text-blue-400 animate-pulse" size={32} />
              </div>
            </div>
            <p className="text-lg font-medium animate-pulse">Syncing with atmospheric data...</p>
          </div>
        )}

        {weatherData && (
          <div className="w-full flex flex-col items-center">
            <WeatherCard data={weatherData} unit={unit} />
            <SearchHistory 
              history={history} 
              onSelect={handleSearch} 
              onClear={() => { setHistory([]); localStorage.removeItem('skysense_history'); }}
              unit={unit}
            />
          </div>
        )}

        {!weatherData && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="glass p-8 rounded-full mb-6">
              <Sun size={64} className="opacity-20" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Welcome to SkySense AI</h3>
            <p className="max-w-xs opacity-60">Enter a city above to receive real-time weather analytics and AI-powered insights.</p>
          </div>
        )}
      </main>

      <footer className="w-full py-8 mt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs tracking-widest uppercase font-semibold opacity-40">
        <div>© 2024 SkySense Intelligence Engine</div>
        <div className="flex gap-6">
          <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
          <a href="#" className="hover:opacity-100 transition-opacity">API Status</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Grounding</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
