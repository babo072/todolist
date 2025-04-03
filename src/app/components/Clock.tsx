"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ClockProps {
  use24Hour?: boolean;
}

export default function Clock({ use24Hour = true }: ClockProps) {
  const [time, setTime] = useState<Date>(new Date());
  const [is24Hour, setIs24Hour] = useState<boolean>(use24Hour);
  const [animateKey, setAnimateKey] = useState<number>(0);

  // 매 초마다 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setAnimateKey(prev => prev + 1); // 애니메이션 키 변경
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  const formatTime = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: !is24Hour,
      timeZone: "Asia/Seoul"
    };
    
    return new Intl.DateTimeFormat("ko-KR", options).format(date);
  };

  const toggleTimeFormat = () => {
    setIs24Hour(prev => !prev);
  };

  const timeSegments = formatTime(time).split(':');
  const hours = timeSegments[0];
  const minutes = timeSegments[1];
  const seconds = timeSegments[2]?.split(' ')[0] || "00";
  const ampm = !is24Hour ? timeSegments[2]?.split(' ')[1] || "" : "";
  
  // 숫자 애니메이션 변수
  const digitVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  };

  return (
    <div className="p-6 text-center">
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg font-semibold mb-4 text-[#58a6ff]"
      >
        현재 시간
      </motion.h2>

      <div className="flex justify-center items-center space-x-2 mb-4">
        <div className="flex items-end">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`hours-${animateKey}`}
              variants={digitVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-4xl font-mono w-16 h-16 flex items-center justify-center bg-[#0d1117] rounded-lg border border-[#30363d] text-[#f0f6fc]"
            >
              {hours}
            </motion.div>
          </AnimatePresence>

          <motion.span 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              repeatDelay: 0 
            }}
            className="mx-1 text-3xl text-[#8b949e]"
          >
            :
          </motion.span>

          <AnimatePresence mode="popLayout">
            <motion.div
              key={`minutes-${animateKey}`}
              variants={digitVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-4xl font-mono w-16 h-16 flex items-center justify-center bg-[#0d1117] rounded-lg border border-[#30363d] text-[#f0f6fc]"
            >
              {minutes}
            </motion.div>
          </AnimatePresence>

          <motion.span 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              repeatDelay: 0 
            }}
            className="mx-1 text-3xl text-[#8b949e]"
          >
            :
          </motion.span>

          <AnimatePresence mode="popLayout">
            <motion.div
              key={`seconds-${animateKey}`}
              variants={digitVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-4xl font-mono w-16 h-16 flex items-center justify-center bg-[#0d1117] rounded-lg border border-[#30363d] text-[#f0f6fc]"
            >
              {seconds}
            </motion.div>
          </AnimatePresence>

          {!is24Hour && (
            <div className="ml-2 text-lg text-[#8b949e] font-semibold">
              {ampm}
            </div>
          )}
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTimeFormat}
        className="px-4 py-2 text-sm bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] rounded-full transition-colors border border-[#30363d]"
      >
        {is24Hour ? '12시간제로 보기' : '24시간제로 보기'}
      </motion.button>
    </div>
  );
} 