"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ClockProps {
  use24Hour?: boolean;
}

export default function Clock({ use24Hour = true }: ClockProps) {
  const [time, setTime] = useState<Date>(new Date());
  const [is24Hour, setIs24Hour] = useState<boolean>(use24Hour);
  const [secondsKey, setSecondsKey] = useState<number>(0);
  const [minutesKey, setMinutesKey] = useState<number>(0);
  const [hoursKey, setHoursKey] = useState<number>(0);

  // 매 초마다 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      const newDate = new Date();
      const oldDate = time;
      
      // 초가 바뀔 때 초 키 변경
      if (newDate.getSeconds() !== oldDate.getSeconds()) {
        setSecondsKey(prev => prev + 1);
      }
      
      // 분이 바뀔 때 분 키 변경
      if (newDate.getMinutes() !== oldDate.getMinutes()) {
        setMinutesKey(prev => prev + 1);
      }
      
      // 시간이 바뀔 때 시간 키 변경
      if (newDate.getHours() !== oldDate.getHours()) {
        setHoursKey(prev => prev + 1);
      }
      
      setTime(newDate);
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, [time]);
  
  // 시간 포맷팅
  const getTimeValues = () => {
    let hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    let period = "";
    
    if (!is24Hour) {
      period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12; // 12시간제로 변환 (0은 12로)
    }
    
    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
      period
    };
  };

  const toggleTimeFormat = () => {
    setIs24Hour(prev => !prev);
    // 시간 형식이 바뀌면 시간 부분도 업데이트
    setHoursKey(prev => prev + 1);
  };

  const { hours, minutes, seconds, period } = getTimeValues();
  
  // 시간 블록 애니메이션 변수
  const blockVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 20 : -20,
      opacity: 0
    }),
    center: {
      y: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      y: direction < 0 ? 20 : -20,
      opacity: 0
    })
  };

  // 시간 블록 렌더링 함수
  const renderTimeBlock = (value: string, type: string) => {
    // 타입에 따라 적절한 키 값 선택
    const animationKey = type === "seconds" ? secondsKey : 
                         type === "minutes" ? minutesKey : hoursKey;
    
    return (
      <AnimatePresence mode="popLayout" custom={1}>
        <motion.div
          key={`${type}-${value}-${animationKey}`}
          custom={1}
          variants={blockVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          className="w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center bg-[#0d1117] rounded-lg border border-[#30363d] text-[#f0f6fc] overflow-hidden"
        >
          <span className="text-3xl sm:text-4xl font-mono">{value}</span>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="p-6 text-center">
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg sm:text-xl font-semibold mb-4 text-[#58a6ff]"
      >
        현재 시간
      </motion.h2>

      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center">
            {/* 시간 블록 */}
            {renderTimeBlock(hours, "hours")}

            {/* 콜론 */}
            <motion.span 
              animate={{ 
                opacity: [1, 0.3, 1]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                repeatDelay: 0 
              }}
              className="mx-1 sm:mx-2 text-xl sm:text-3xl text-[#8b949e] font-mono"
            >
              :
            </motion.span>

            {/* 분 블록 */}
            {renderTimeBlock(minutes, "minutes")}

            {/* 콜론 */}
            <motion.span 
              animate={{ 
                opacity: [1, 0.3, 1]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                repeatDelay: 0 
              }}
              className="mx-1 sm:mx-2 text-xl sm:text-3xl text-[#8b949e] font-mono"
            >
              :
            </motion.span>

            {/* 초 블록 */}
            {renderTimeBlock(seconds, "seconds")}

            {/* AM/PM 표시 */}
            <AnimatePresence mode="popLayout">
              {!is24Hour && (
                <motion.div 
                  key={`period-${period}`}
                  initial={{ opacity: 0, x: -10, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className={`ml-3 text-sm rounded-full py-1 px-3 font-medium ${
                    period === "AM" 
                      ? "bg-[#0d419d] text-[#79c0ff]" 
                      : "bg-[#762d1f] text-[#f85149]"
                  }`}
                >
                  {period}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTimeFormat}
          className="px-4 py-2 text-sm bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] rounded-full transition-colors border border-[#30363d]"
        >
          {is24Hour ? '12시간제 (AM/PM)' : '24시간제'}
        </motion.button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-[#f0f6fc] text-sm py-2 px-4 rounded-md bg-gradient-to-r from-[#0d419d]/30 to-[#0d1117]/30 border border-[#30363d]/50"
      >
        {new Date().toLocaleDateString('ko-KR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </motion.div>
    </div>
  );
} 