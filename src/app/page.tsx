"use client";

import Clock from "./components/Clock";
import Weather from "./components/Weather";
import TodoNew from "./components/TodoNew";
import VocabStudy from "./components/VocabStudy";
import { motion } from "framer-motion";

export default function Home() {
  // 컨테이너 애니메이션 변수
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.5
      }
    }
  };

  // 항목 애니메이션 변수
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#0d1117] to-[#0a0c10]"
    >
      <div className="max-w-5xl mx-auto">
        <motion.header 
          variants={itemVariants}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-[#f0f6fc]">다기능 웹 애플리케이션</h1>
          <p className="text-[#8b949e] mt-2">시계, 날씨 및 할 일 목록</p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 시계 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="card overflow-hidden shadow-lg bg-[#161b22] border border-[#30363d] rounded-lg"
          >
            <Clock />
          </motion.div>

          {/* 날씨 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="card overflow-hidden shadow-lg bg-[#161b22] border border-[#30363d] rounded-lg"
          >
            <Weather />
          </motion.div>
        </div>

        {/* Todo 리스트 */}
        <motion.div 
          variants={itemVariants}
          className="mt-6 card overflow-hidden shadow-lg bg-[#161b22] border border-[#30363d] rounded-lg"
        >
          <TodoNew />
        </motion.div>
        
        {/* 영한 단어 공부 */}
        <motion.div 
          variants={itemVariants}
          className="mt-6 card overflow-hidden shadow-lg bg-[#161b22] border border-[#30363d] rounded-lg"
        >
          <VocabStudy />
        </motion.div>

        <motion.footer 
          variants={itemVariants}
          className="mt-8 text-center text-sm text-[#8b949e]"
        >
          <p>Next.js + Framer Motion으로 만든 다기능 웹 애플리케이션</p>
        </motion.footer>
      </div>
    </motion.div>
  );
}
