"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 할일 아이템 타입 정의
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  category: string;
  dueDate: string | null;
}

export default function TodoNew() {
  // 상태 관리
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [newCategory, setNewCategory] = useState("일반");
  const [newDueDate, setNewDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [isClient, setIsClient] = useState(false);
  
  // 클라이언트 사이드 체크
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTodos = localStorage.getItem('todos');
      if (savedTodos) {
        try {
          setTodos(JSON.parse(savedTodos));
        } catch (error) {
          console.error('Failed to parse todos:', error);
        }
      }
    }
  }, []);

  // 데이터 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && todos.length > 0) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos]);

  // Todo 아이템 추가
  const addTodo = () => {
    if (newTodoText.trim() === "") return;
    
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText,
      completed: false,
      priority: newPriority,
      category: newCategory,
      dueDate: newDueDate || null
    };
    
    setTodos(prev => [newTodo, ...prev]);
    setNewTodoText("");
    setNewDueDate("");
  };

  // Todo 완료 토글
  const toggleComplete = (id: string) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Todo 삭제
  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // 우선순위 변경
  const changePriority = (id: string, priority: "high" | "medium" | "low") => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, priority } : todo
      )
    );
  };

  // 필터링된 Todo 목록 가져오기
  const getFilteredTodos = () => {
    return todos
      .filter(todo => {
        // 검색 필터
        if (searchText && !todo.text.toLowerCase().includes(searchText.toLowerCase())) {
          return false;
        }
        
        // 상태 필터
        if (filter === 'active' && todo.completed) {
          return false;
        }
        if (filter === 'completed' && !todo.completed) {
          return false;
        }
        
        return true;
      });
  };

  const filteredTodos = getFilteredTodos();
  const completedCount = todos.filter(todo => todo.completed).length;

  // 우선순위별 색상
  const priorityColors = {
    high: { bg: "#f85149", text: "white", border: "#da3633" },
    medium: { bg: "#fba94c", text: "#22272e", border: "#d29922" },
    low: { bg: "#3fb950", text: "white", border: "#2ea043" }
  };

  // 로딩 중 표시
  if (!isClient) {
    return (
      <div className="w-full max-w-4xl p-6 bg-[#161b22] rounded-lg border border-[#30363d]">
        <h2 className="text-2xl font-bold text-[#f0f6fc] mb-4">할일 목록</h2>
        <p className="text-[#8b949e]">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#f0f6fc]">할일 목록</h2>
          <div className="bg-[#0d1117] text-[#8b949e] text-sm px-3 py-1 rounded-full">
            {completedCount}/{todos.length} 완료
          </div>
        </div>

        {/* 새 할일 입력 */}
        <div className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d] mb-6">
          <h3 className="text-[#58a6ff] font-medium mb-3">새 할일 추가</h3>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="새 할일을 입력하세요"
            className="w-full mb-4 px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-md text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">카테고리</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-md text-[#f0f6fc] focus:outline-none"
              >
                <option value="일반">일반</option>
                <option value="업무">업무</option>
                <option value="개인">개인</option>
                <option value="중요">중요</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">우선순위</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as "high" | "medium" | "low")}
                className="w-full px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-md text-[#f0f6fc] focus:outline-none"
              >
                <option value="high">높음</option>
                <option value="medium">중간</option>
                <option value="low">낮음</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">마감일</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-md text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] [color-scheme:dark]"
                style={{ 
                  colorScheme: 'dark',
                  opacity: 1
                }}
              />
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={addTodo}
            disabled={!newTodoText.trim()}
            className="w-full px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            할일 추가
          </motion.button>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d] mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[#58a6ff] font-medium">목록 검색/필터</h3>
            {searchText && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchText("")}
                className="text-xs px-2 py-1 bg-[#21262d] text-[#8b949e] hover:text-[#f85149] rounded-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                검색 초기화
              </motion.button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="할일 검색..."
                className="w-full pl-10 px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-md text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-md text-[#f0f6fc] focus:outline-none"
            >
              <option value="all">모두 보기</option>
              <option value="active">진행 중</option>
              <option value="completed">완료됨</option>
            </select>
          </div>
          {filteredTodos.length > 0 && (
            <div className="mt-3 text-xs text-[#8b949e]">
              검색 결과: {filteredTodos.length}개 항목
            </div>
          )}
        </div>

        {/* 할일 목록 */}
        {filteredTodos.length === 0 ? (
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
              />
            </svg>
            <p className="text-[#8b949e]">
              {searchText ? '검색 결과가 없습니다' : '할일이 없습니다'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence>
              {filteredTodos.map(todo => (
                <motion.li
                  key={todo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`relative p-4 rounded-lg border border-[#30363d] ${
                    todo.completed ? 'bg-[#161b22]' : 'bg-[#0d1117]'
                  }`}
                  style={{ 
                    borderLeftWidth: '4px',
                    borderLeftColor: priorityColors[todo.priority].border
                  }}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo.id)}
                      className="mt-1 mr-3 h-5 w-5 rounded text-[#58a6ff] focus:ring-[#58a6ff] bg-[#0d1117] border-[#30363d]"
                    />
                    
                    <div className="flex-1">
                      <div className={`text-lg ${todo.completed ? 'line-through text-[#8b949e]' : 'text-[#f0f6fc]'}`}>
                        {todo.text}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-[#30363d] text-[#8b949e] rounded-full">
                          {todo.category}
                        </span>
                        
                        <span 
                          className="text-xs px-2 py-1 rounded-full" 
                          style={{ 
                            backgroundColor: priorityColors[todo.priority].bg,
                            color: priorityColors[todo.priority].text
                          }}
                        >
                          {todo.priority === 'high' ? '높음' : 
                           todo.priority === 'medium' ? '중간' : '낮음'}
                        </span>
                        
                        {todo.dueDate && (
                          <span className="text-xs px-2 py-1 bg-[#0d419d] text-[#79c0ff] rounded-full">
                            마감일: {todo.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex rounded overflow-hidden border border-[#30363d]">
                        <button
                          onClick={() => changePriority(todo.id, 'low')}
                          className={`px-2 py-1 text-xs ${
                            todo.priority === 'low' 
                              ? 'bg-[#3fb950] text-white' 
                              : 'bg-[#0d1117] text-[#8b949e] hover:bg-[#161b22]'
                          }`}
                        >
                          낮음
                        </button>
                        <button
                          onClick={() => changePriority(todo.id, 'medium')}
                          className={`px-2 py-1 text-xs ${
                            todo.priority === 'medium' 
                              ? 'bg-[#fba94c] text-[#22272e]' 
                              : 'bg-[#0d1117] text-[#8b949e] hover:bg-[#161b22]'
                          }`}
                        >
                          중간
                        </button>
                        <button
                          onClick={() => changePriority(todo.id, 'high')}
                          className={`px-2 py-1 text-xs ${
                            todo.priority === 'high' 
                              ? 'bg-[#f85149] text-white' 
                              : 'bg-[#0d1117] text-[#8b949e] hover:bg-[#161b22]'
                          }`}
                        >
                          높음
                        </button>
                      </div>
                      
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-1 text-[#8b949e] hover:text-[#f85149] hover:bg-[#21262d] rounded-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {/* 완료된 항목 삭제 버튼 */}
        {completedCount > 0 && (
          <div className="mt-6 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTodos(prev => prev.filter(todo => !todo.completed))}
              className="px-4 py-2 bg-[#21262d] text-[#8b949e] hover:text-[#f85149] rounded-md"
            >
              완료된 항목 모두 삭제
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
} 