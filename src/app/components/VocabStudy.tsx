"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// 단어 공부 컴포넌트
export default function VocabStudy() {
  const [word, setWord] = useState<{ english: string; korean: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // GPT-4o API를 통해 단어 가져오기
  const fetchRandomWord = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/vocab');
      
      if (!response.ok) {
        throw new Error('단어를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setWord(data);
    } catch (err) {
      console.error('Error fetching word:', err);
      setError("단어를 가져오는데 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 bg-[#161b22] rounded-lg border border-[#30363d] shadow-lg"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#f0f6fc]">유용한 영한 단어 공부</h2>
        </div>

        <div className="flex justify-center mb-6">
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
              <h3 className="text-sm text-[#8b949e] mb-1">영어</h3>
              <p className="text-xl text-[#58a6ff] font-medium">{word.english}</p>
            </div>

            <div>
              <h3 className="text-sm text-[#8b949e] mb-1">한글</h3>
              <p className="text-xl text-[#f0f6fc]">{word.korean}</p>
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
              단어 가져오기 버튼을 클릭하여 랜덤한 영어 단어를 확인하세요
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
} 