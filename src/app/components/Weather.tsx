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
    case "clear": return "from-[#2462c9] to-[#0d2745]";
    case "clouds": return "from-[#3a5370] to-[#1a2533]";
    case "rain": 
    case "drizzle": return "from-[#3a5a81] to-[#1a2432]";
    case "thunderstorm": return "from-[#354869] to-[#1a1f35]";
    case "snow": return "from-[#4179a0] to-[#1e3b50]";
    case "mist":
    case "fog":
    case "haze": return "from-[#4c6b8a] to-[#2c3e50]";
    default: return "from-[#2d5a8b] to-[#0d2235]";
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
        const apiKey = "925e4c3da154bfe1a58b892ff4fc1f7d";
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
      <div className="p-6 h-full flex flex-col items-center justify-center min-h-[220px] bg-gradient-to-br from-[#2d5a8b]/70 to-[#0d2235]/70 rounded-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#0d1117]/20 border-t-[#58a6ff] rounded-full"
          />
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg 
              className="w-6 h-6 text-[#58a6ff]" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" 
              />
            </svg>
          </motion.div>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-[#f0f6fc]"
        >
          날씨 정보를 불러오는 중...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-gradient-to-br from-[#762d1f]/80 to-[#2d1519]/80 rounded-lg overflow-hidden shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <svg className="w-12 h-12 text-[#f85149] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-[#f85149] font-medium">{error}</p>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "#30363d" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-[#21262d] text-[#58a6ff] rounded-md hover:bg-[#30363d] border border-[#30363d] transition-colors shadow-md inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
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
    <div className={`p-6 text-center bg-gradient-to-br ${weatherBg} rounded-lg overflow-hidden shadow-inner relative`}>
      {/* 반투명 오버레이 - 배경 패턴 대신 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-white/5 opacity-20 z-0"></div>
      
      <div className="relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg sm:text-xl font-bold mb-3 text-white"
        >
          서울 날씨
        </motion.h2>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center mb-4"
        >
          {weather.weather[0].icon && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-white/10 blur-md transform scale-75 -translate-y-2"></div>
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                alt={weather.weather[0].description}
                className="w-28 h-28 z-10 relative filter drop-shadow-lg"
              />
            </motion.div>
          )}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center sm:items-start sm:ml-4"
          >
            <div className="text-5xl font-bold text-white mb-1 flex items-start">
              {Math.round(weather.main.temp)}
              <span className="text-2xl ml-1">°C</span>
            </div>
            <div className="text-lg text-white/90 font-medium">
              {getKoreanWeatherDescription(weather.weather[0].description)}
            </div>
          </motion.div>
        </motion.div>
        
        {/* 구분선 */}
        <div className="border-t border-white/10 my-4"></div>
        
        {/* 추가 날씨 정보 */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3 text-sm"
        >
          {weather.main.feels_like && (
            <div className="bg-[#ffffff]/10 backdrop-blur-sm p-3 rounded-lg shadow-sm flex flex-col items-center">
              <svg className="w-5 h-5 text-white/80 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              </svg>
              <span className="text-white/80 text-xs">체감 온도</span>
              <span className="text-white font-semibold mt-1">{Math.round(weather.main.feels_like)}°C</span>
            </div>
          )}
          {weather.main.humidity && (
            <div className="bg-[#ffffff]/10 backdrop-blur-sm p-3 rounded-lg shadow-sm flex flex-col items-center">
              <svg className="w-5 h-5 text-white/80 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-white/80 text-xs">습도</span>
              <span className="text-white font-semibold mt-1">{weather.main.humidity}%</span>
            </div>
          )}
          {weather.wind?.speed && (
            <div className="bg-[#ffffff]/10 backdrop-blur-sm p-3 rounded-lg shadow-sm flex flex-col items-center">
              <svg className="w-5 h-5 text-white/80 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span className="text-white/80 text-xs">풍속</span>
              <span className="text-white font-semibold mt-1">{weather.wind.speed}m/s</span>
            </div>
          )}
        </motion.div>
        
        {/* 현재 시간 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 text-xs text-white/50"
        >
          마지막 업데이트: {new Date().toLocaleTimeString()}
        </motion.div>
      </div>
    </div>
  );
} 