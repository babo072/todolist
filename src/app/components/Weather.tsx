"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface WeatherData {
  main: {
    temp: number;
    feels_like?: number;
    humidity?: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  name: string;
  wind?: {
    speed: number;
  };
}

// Korean weather description mapping
const weatherTranslations: Record<string, string> = {
  "clear sky": "맑음",
  "few clouds": "구름 조금",
  "scattered clouds": "구름 조금",
  "broken clouds": "구름 많음",
  "shower rain": "소나기",
  "rain": "비",
  "thunderstorm": "천둥번개",
  "snow": "눈",
  "mist": "안개",
  "overcast clouds": "흐림",
  "light rain": "약한 비",
  "moderate rain": "중간 비",
  "heavy intensity rain": "강한 비",
  "very heavy rain": "매우 강한 비",
  "extreme rain": "극심한 비",
  "freezing rain": "얼어붙는 비",
  "light snow": "약한 눈",
  "heavy snow": "강한 눈",
  "sleet": "진눈깨비",
  "light shower snow": "약한 눈 소나기",
  "heavy shower snow": "강한 눈 소나기",
  "fog": "안개",
  "haze": "실안개",
};

// 날씨 별 배경 색상 설정
const getWeatherBackground = (main: string) => {
  switch (main.toLowerCase()) {
    case "clear": return "bg-gradient-to-br from-[#1a4980] to-[#0d2745]";
    case "clouds": return "bg-gradient-to-br from-[#2c3e50] to-[#1a2533]";
    case "rain": 
    case "drizzle": return "bg-gradient-to-br from-[#2e4057] to-[#1a2432]";
    case "thunderstorm": return "bg-gradient-to-br from-[#2c3e50] to-[#1a1f35]";
    case "snow": return "bg-gradient-to-br from-[#2c3e50] to-[#1e3b50]";
    case "mist":
    case "fog":
    case "haze": return "bg-gradient-to-br from-[#34495e] to-[#2c3e50]";
    default: return "bg-gradient-to-br from-[#1e3b50] to-[#0d2235]";
  }
};

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // 새로운 API 키로 교체 필요 - OpenWeatherMap에서 발급 가능
        const apiKey = "1b5ee5c1a74487e8f5584916ca372081";
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${apiKey}&units=metric&lang=kr`,
          { cache: 'no-store' }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("날씨 API 오류:", errorData);
          throw new Error(`날씨 데이터를 가져오는데 실패했습니다: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("날씨 데이터 받음:", data);
        setWeather(data);
        setError(null);
      } catch (err) {
        console.error("날씨 데이터 가져오기 오류:", err);
        setError("날씨 정보를 불러올 수 없습니다. API 키를 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Refresh weather data every 30 minutes
    const intervalId = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Get Korean weather description
  const getKoreanWeatherDescription = (englishDescription: string): string => {
    return weatherTranslations[englishDescription.toLowerCase()] || englishDescription;
  };

  if (loading) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center min-h-[220px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-[#30363d] border-t-[#58a6ff] rounded-full"
        />
        <p className="mt-4 text-[#8b949e]">날씨 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[#f85149] mb-4">{error}</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#21262d] text-[#58a6ff] rounded hover:bg-[#30363d] border border-[#30363d]"
          >
            다시 시도
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const weatherMain = weather.weather[0].main;
  const weatherBg = getWeatherBackground(weatherMain);

  return (
    <div className={`p-6 text-center ${weatherBg} rounded-lg overflow-hidden`}>
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold mb-2 text-[#58a6ff]"
      >
        서울 날씨
      </motion.h2>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center mb-2"
      >
        {weather.weather[0].icon && (
          <motion.img
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
            className="w-20 h-20 filter drop-shadow-lg"
          />
        )}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-semibold text-white ml-2"
        >
          {Math.round(weather.main.temp)}°C
        </motion.div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-[#f0f6fc] mb-4"
      >
        {getKoreanWeatherDescription(weather.weather[0].description)}
      </motion.div>
      
      {/* 추가 날씨 정보 */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 gap-2 text-sm text-[#8b949e]"
      >
        {weather.main.feels_like && (
          <div className="bg-[#0d1117]/30 p-2 rounded-lg">
            <span>체감 온도: {Math.round(weather.main.feels_like)}°C</span>
          </div>
        )}
        {weather.main.humidity && (
          <div className="bg-[#0d1117]/30 p-2 rounded-lg">
            <span>습도: {weather.main.humidity}%</span>
          </div>
        )}
        {weather.wind?.speed && (
          <div className="bg-[#0d1117]/30 p-2 rounded-lg col-span-2">
            <span>풍속: {weather.wind.speed}m/s</span>
          </div>
        )}
      </motion.div>
    </div>
  );
} 