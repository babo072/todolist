"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// 단어 공부 컴포넌트
export default function VocabStudy() {
  const [word, setWord] = useState<{ primary: string; translation: string; languageCode: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [primaryLanguage, setPrimaryLanguage] = useState<"english" | "thai">("english");
  
  // 이전 단어 기록 (중복 방지)
  const [wordHistory, setWordHistory] = useState<string[]>([]);

  // 언어별 이름 표시
  const languageNames = {
    english: "영어",
    thai: "태국어"
  };

  // 컴포넌트 초기 마운트 시 localStorage에서 이전 기록과 언어 설정 불러오기
  useEffect(() => {
    const savedHistory = localStorage.getItem('wordHistory');
    if (savedHistory) {
      try {
        setWordHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('단어 기록 로드 오류:', e);
      }
    }
    
    const savedLanguage = localStorage.getItem('vocabPrimaryLanguage');
    if (savedLanguage && (savedLanguage === 'english' || savedLanguage === 'thai')) {
      setPrimaryLanguage(savedLanguage);
    }
  }, []);

  // 단어 기록 저장
  useEffect(() => {
    if (wordHistory.length > 0) {
      localStorage.setItem('wordHistory', JSON.stringify(wordHistory));
    }
  }, [wordHistory]);
  
  // 언어 설정 저장
  useEffect(() => {
    localStorage.setItem('vocabPrimaryLanguage', primaryLanguage);
  }, [primaryLanguage]);

  // 언어 변경 핸들러
  const handleLanguageChange = (newLanguage: "english" | "thai") => {
    setPrimaryLanguage(newLanguage);
    setWord(null); // 언어 변경 시 이전 단어 제거
  };

  // GPT-4o API를 통해 단어 가져오기
  const fetchRandomWord = async () => {
    setLoading(true);
    setError("");
    
    try {
      // 캐시 방지를 위한 타임스탬프 추가
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/vocab?t=${timestamp}&primary=${primaryLanguage}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('단어를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      
      // 중복 확인
      if (wordHistory.includes(data.primary)) {
        console.log('중복된 단어를 발견했습니다. 다시 가져옵니다.');
        setLoading(false);
        fetchRandomWord(); // 재귀적으로 다시 호출
        return;
      }
      
      // 새 단어 추가
      setWord(data);
      
      // 기록에 추가 (최대 20개 유지)
      const updatedHistory = [data.primary, ...wordHistory].slice(0, 20);
      setWordHistory(updatedHistory);
    } catch (err) {
      console.error('Error fetching word:', err);
      setError("단어를 가져오는데 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 텍스트를 음성으로 변환하여 재생
  const speakText = async () => {
    if (!word || typeof window === 'undefined') return;
    
    setSpeaking(true);
    
    try {
      if (primaryLanguage === 'english') {
        // 영어는 Web Speech API 사용
        playWithWebSpeechAPI(word.primary, 'en-US');
      } else {
        // 태국어는 서버 API 통해 Google TTS 사용 시도
        try {
          await playWithServerAPI(word.primary, 'th');
        } catch (error) {
          console.error('Server TTS failed, fallback to Web Speech API:', error);
          // 서버 API 실패시 Web Speech API로 폴백
          playWithWebSpeechAPI(word.primary, 'th-TH');
        }
      }
    } catch (error) {
      console.error('Speech playback error:', error);
      setSpeaking(false);
      setError("음성 재생에 실패했습니다. 다시 시도해주세요.");
    }
  };
  
  // Web Speech API를 사용하여 텍스트 음성 변환
  const playWithWebSpeechAPI = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    // 언어에 맞는 음성 찾기
    const voices = window.speechSynthesis.getVoices();
    const isEnglish = lang.startsWith('en');
    
    const selectedVoice = voices.find(voice => 
      voice.lang === lang && voice.localService
    ) || voices.find(voice => 
      voice.lang.includes(isEnglish ? 'en' : 'th')
    );
    
    if (selectedVoice) {
      console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
      utterance.voice = selectedVoice;
    }
    
    // 발음 속도 조정
    utterance.rate = isEnglish ? 0.9 : 0.8;
    
    // 이벤트 핸들러
    utterance.onend = () => {
      setSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setSpeaking(false);
      setError("음성 재생에 실패했습니다.");
    };
    
    // 음성 합성 시작
    window.speechSynthesis.cancel(); // 이전 음성 취소
    window.speechSynthesis.speak(utterance);
    
    // 음성 합성이 시작되지 않는 경우를 대비한 타임아웃
    setTimeout(() => {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
      }
    }, 5000);
  };
  
  // 서버 API를 통해 음성 재생
  const playWithServerAPI = (text: string, lang: string) => {
    return new Promise<void>((resolve, reject) => {
      // 타임스탬프로 캐시 방지
      const timestamp = new Date().getTime();
      const encodedText = encodeURIComponent(text);
      const audio = new Audio(`/api/speech?text=${encodedText}&lang=${lang}&t=${timestamp}`);
      
      audio.onended = () => {
        setSpeaking(false);
        resolve();
      };
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        reject(error);
      };
      
      audio.oncanplaythrough = () => {
        audio.play().catch(error => {
          console.error('Audio play error:', error);
          reject(error);
        });
      };
      
      audio.load();
    });
  };

  // 컴포넌트 초기 마운트 시 음성 목록 로드
  useEffect(() => {
    // 음성 목록이 비동기적으로 로드되므로 이벤트 리스너 추가
    if (typeof window !== 'undefined') {
      const loadVoices = () => {
        // 음성 목록 로드 완료 시 이벤트 처리
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          // 사용 가능한 음성 목록 로깅
          console.log('Available voices:');
          availableVoices.forEach(voice => {
            console.log(`- ${voice.name} (${voice.lang}) ${voice.localService ? 'local' : 'remote'}`);
          });
          
          // 태국어 음성 확인
          const thaiVoices = availableVoices.filter(voice => voice.lang.includes('th'));
          if (thaiVoices.length === 0) {
            console.warn('경고: 태국어 음성이 시스템에 없습니다.');
          } else {
            console.log(`태국어 음성 ${thaiVoices.length}개 발견`);
          }
        }
      };
      
      // 초기 상태 확인
      loadVoices();
      
      // 음성 목록 변경 이벤트 리스너
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 bg-[#161b22] rounded-lg border border-[#30363d] shadow-lg"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#f0f6fc]">외국어 단어 공부</h2>
          
          <div className="flex space-x-1 bg-[#0d1117] p-1 rounded-md border border-[#30363d]">
            <button
              onClick={() => handleLanguageChange("english")}
              className={`px-3 py-1 text-sm rounded ${
                primaryLanguage === "english"
                  ? "bg-[#238636] text-white"
                  : "bg-transparent text-[#8b949e] hover:bg-[#21262d]"
              }`}
            >
              영어-한국어
            </button>
            <button
              onClick={() => handleLanguageChange("thai")}
              className={`px-3 py-1 text-sm rounded ${
                primaryLanguage === "thai"
                  ? "bg-[#238636] text-white"
                  : "bg-transparent text-[#8b949e] hover:bg-[#21262d]"
              }`}
            >
              태국어-한국어
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchRandomWord}
            disabled={loading}
            className="px-6 py-3 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                로딩 중...
              </div>
            ) : "단어 가져오기"}
          </motion.button>
          
          {word && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={speakText}
              disabled={speaking}
              className="px-6 py-3 bg-[#0d419d] text-white rounded-md hover:bg-[#1158c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {speaking ? (
                <div className="flex items-center">
                  <svg className="animate-pulse mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  재생 중...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  보이스
                </div>
              )}
            </motion.button>
          )}
        </div>

        {error && (
          <div className="bg-[#f85149] bg-opacity-20 border border-[#f85149] text-[#f85149] p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        {word && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-[#0d1117] p-6 rounded-lg border border-[#30363d]"
          >
            <div className="mb-6">
              <h3 className="text-sm text-[#8b949e] mb-1">{languageNames[primaryLanguage]}</h3>
              <div className="flex items-center">
                <p className="text-xl text-[#58a6ff] font-medium">{word.primary}</p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={speakText}
                  disabled={speaking}
                  className="ml-2 text-[#8b949e] hover:text-[#58a6ff] disabled:opacity-50"
                >
                  <svg className={`h-5 w-5 ${speaking ? 'animate-pulse text-[#58a6ff]' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </motion.button>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-[#8b949e] mb-1">한국어</h3>
              <div className="flex">
                <p className="text-xl text-[#f0f6fc]">{word.translation}</p>
              </div>
            </div>
          </motion.div>
        )}

        {!word && !error && !loading && (
          <div className="text-center py-10 bg-[#0d1117] rounded-lg border border-[#30363d]">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 mx-auto text-[#8b949e] mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
              />
            </svg>
            <p className="text-[#8b949e]">
              단어 가져오기 버튼을 클릭하여 랜덤한 {primaryLanguage === "english" ? "영어" : "태국어"} 단어를 확인하세요
            </p>
            <p className="text-[#58a6ff] mt-2 text-sm">
              현재 선택된 학습: {primaryLanguage === "english" ? "영어-한국어" : "태국어-한국어"}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
} 