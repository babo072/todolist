"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  category: string;
  dueDate: string | null;
}

type FilterOption = "all" | "active" | "completed";
type SortOption = "newest" | "oldest" | "priority";

export default function Todo() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [newCategory, setNewCategory] = useState<string>("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [newDueDate, setNewDueDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categories, setCategories] = useState<string[]>(["일반", "업무", "개인"]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [isAddFormOpen, setIsAddFormOpen] = useState<boolean>(false);

  // 애니메이션 변수
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Check if code is running on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load todos from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTodos = localStorage.getItem("todos");
      if (storedTodos) {
        try {
          setTodos(JSON.parse(storedTodos));
        } catch (error) {
          console.error("Failed to parse todos from localStorage:", error);
          setTodos([]);
        }
      }

      const storedCategories = localStorage.getItem("todoCategories");
      if (storedCategories) {
        try {
          setCategories(JSON.parse(storedCategories));
        } catch (error) {
          console.error("Failed to parse categories from localStorage:", error);
        }
      }
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos]);

  // Save categories to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("todoCategories", JSON.stringify(categories));
    }
  }, [categories]);

  const addTodo = () => {
    if (newTodo.trim() === "") return;
    
    const newItem: TodoItem = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      priority: newPriority,
      category: newCategory || "일반",
      dueDate: newDueDate || null
    };
    
    setTodos(prevTodos => [newItem, ...prevTodos]);
    setNewTodo("");
    setNewDueDate("");
    // 추가 후 입력 폼 닫기
    if (isAddFormOpen) {
      setIsAddFormOpen(false);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  const updateTodoPriority = (id: string, priority: "high" | "medium" | "low") => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, priority } : todo
      )
    );
  };

  const addCategory = () => {
    if (!newCategory.trim() || categories.includes(newCategory)) return;
    setCategories(prev => [...prev, newCategory]);
    setNewCategory("");
  };

  const handleEnterKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const handleCategoryEnterKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addCategory();
    }
  };

  const getFilteredAndSortedTodos = () => {
    let result = [...todos];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(todo => 
        todo.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      result = result.filter(todo => todo.category === selectedCategory);
    }

    // Apply completed filter
    if (!showCompleted) {
      result = result.filter(todo => !todo.completed);
    }

    // Apply filter
    switch (filter) {
      case "active":
        result = result.filter(todo => !todo.completed);
        break;
      case "completed":
        result = result.filter(todo => todo.completed);
        break;
      // "all" shows everything
    }

    // Apply sort
    switch (sort) {
      case "newest":
        result = result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case "oldest":
        result = result.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        break;
      case "priority":
        const priorityValues = { high: 3, medium: 2, low: 1 };
        result = result.sort((a, b) => 
          priorityValues[b.priority] - priorityValues[a.priority]
        );
        break;
    }

    return result;
  };

  const filteredTodos = getFilteredAndSortedTodos();
  const totalTasks = todos.length;
  const completedTasks = todos.filter(todo => todo.completed).length;

  const clearCompletedTasks = () => {
    setTodos(prevTodos => prevTodos.filter(todo => !todo.completed));
  };

  // If not client-side, show a simple placeholder
  if (!isClient) {
    return (
      <div className="todo p-6 w-full max-w-4xl">
        <h2 className="text-xl font-bold text-[#58a6ff]">할 일 목록</h2>
        <p className="text-[#8b949e] mt-2">로딩 중...</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-[#f85149] text-white";
      case "medium": return "bg-[#f7b955] text-[#24292f]";
      case "low": return "bg-[#3fb950] text-white";
      default: return "bg-[#8b949e] text-white";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high": return "높음";
      case "medium": return "중간";
      case "low": return "낮음";
      default: return "없음";
    }
  };

  const getBorderColor = (priority: string) => {
    switch (priority) {
      case "high": return "#f85149";
      case "medium": return "#f7b955";
      case "low": return "#3fb950";
      default: return "#8b949e";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="todo p-6 w-full max-w-4xl"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6"
      >
        <h2 className="text-xl font-bold text-[#58a6ff]">할 일 목록</h2>
        <div className="text-sm text-[#8b949e] bg-[#0d1117] px-3 py-1 rounded-full border border-[#30363d]">
          <span>{completedTasks}/{totalTasks} 완료</span>
        </div>
      </motion.div>

      {/* 검색 및 필터 영역 */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="mb-6 space-y-3"
      >
        <motion.div variants={item} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="할 일 검색..."
            className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded focus:outline-none focus:border-[#58a6ff] text-[#f0f6fc] transition-all"
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as FilterOption)}
            className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded focus:outline-none text-[#f0f6fc]"
          >
            <option value="all">모두 보기</option>
            <option value="active">진행중</option>
            <option value="completed">완료됨</option>
          </select>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded focus:outline-none text-[#f0f6fc]"
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="priority">우선순위순</option>
          </select>
        </motion.div>

        <motion.div variants={item} className="flex gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 text-sm rounded-full transition-all ${!selectedCategory 
              ? 'bg-[#58a6ff] text-white' 
              : 'bg-[#21262d] text-[#8b949e] hover:bg-[#30363d]'}`}
          >
            모든 카테고리
          </motion.button>
          {categories.map(cat => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`px-3 py-1 text-sm rounded-full transition-all ${cat === selectedCategory 
                ? 'bg-[#58a6ff] text-white' 
                : 'bg-[#21262d] text-[#8b949e] hover:bg-[#30363d]'}`}
            >
              {cat}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-3 py-1 text-sm rounded-full transition-all ${!showCompleted
              ? 'bg-[#6e7681] text-white'
              : 'bg-[#21262d] text-[#8b949e] hover:bg-[#30363d]'}`}
          >
            {showCompleted ? '완료된 항목 표시' : '완료된 항목 숨김'}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* 새 할일 추가 버튼 및 폼 */}
      <motion.div variants={item} className="mb-6">
        {!isAddFormOpen ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddFormOpen(true)}
            className="w-full py-3 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            새 할 일 추가하기
          </motion.button>
        ) : (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d] shadow-lg"
            >
              <div className="mb-3">
                <input
                  type="text"
                  value={newTodo}
                  onChange={e => setNewTodo(e.target.value)}
                  onKeyDown={handleEnterKey}
                  placeholder="새 할 일을 입력하세요"
                  className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-md focus:outline-none focus:border-[#58a6ff] text-[#f0f6fc]"
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded focus:outline-none text-[#f0f6fc]"
                >
                  <option value="">카테고리 선택</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory === "" || categories.includes(newCategory) ? "" : newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    onKeyDown={handleCategoryEnterKey}
                    placeholder="새 카테고리"
                    className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded focus:outline-none text-[#f0f6fc]"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addCategory}
                    disabled={!newCategory || categories.includes(newCategory)}
                    className="px-3 py-1 bg-[#21262d] text-[#8b949e] rounded hover:bg-[#30363d] disabled:opacity-50"
                  >
                    추가
                  </motion.button>
                </div>
                
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as "high" | "medium" | "low")}
                  className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded focus:outline-none text-[#f0f6fc]"
                >
                  <option value="high">우선순위: 높음</option>
                  <option value="medium">우선순위: 중간</option>
                  <option value="low">우선순위: 낮음</option>
                </select>
              </div>
              
              <div className="flex justify-between items-center">
                <input
                  type="date"
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded focus:outline-none text-[#f0f6fc]"
                />
                
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddFormOpen(false)}
                    className="px-4 py-2 bg-[#21262d] text-[#8b949e] rounded-md hover:bg-[#30363d] transition-colors"
                  >
                    취소
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addTodo}
                    disabled={!newTodo.trim()}
                    className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50 disabled:hover:bg-[#238636]"
                  >
                    할 일 추가
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
      
      {/* 할 일 목록 */}
      {filteredTodos.length === 0 ? (
        <motion.div 
          variants={item}
          className="text-center py-12 bg-[#0d1117] rounded-lg border border-[#30363d]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-[#8b949e] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-[#8b949e]">{searchQuery ? '검색 결과가 없습니다' : '할 일이 없습니다'}</p>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.ul className="space-y-3">
            <AnimatePresence>
              {filteredTodos.map(todo => (
                <motion.li 
                  key={todo.id}
                  variants={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  layout
                  className={`relative flex flex-col sm:flex-row sm:items-center p-4 rounded-lg transition-all border border-[#30363d] ${
                    todo.completed 
                      ? 'bg-[#161b22]' 
                      : 'bg-[#0d1117]'
                  }`}
                  style={{ borderLeftWidth: '4px', borderLeftColor: getBorderColor(todo.priority) }}
                >
                  <div className="flex items-center flex-1 mb-2 sm:mb-0">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-5 h-5 mr-3 rounded text-[#58a6ff] focus:ring-[#58a6ff] bg-[#0d1117] border-[#30363d]"
                    />
                    <div className="flex-1">
                      <p className={`${todo.completed ? 'line-through text-[#8b949e]' : 'text-[#f0f6fc]'}`}>
                        {todo.text}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="inline-block text-xs px-2 py-0.5 bg-[#30363d] text-[#8b949e] rounded-full">
                          {todo.category || '일반'}
                        </span>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${getPriorityColor(todo.priority)}`}>
                          {getPriorityLabel(todo.priority)}
                        </span>
                        {todo.dueDate && (
                          <span className="inline-block text-xs px-2 py-0.5 bg-[#0d419d] text-[#79c0ff] rounded-full">
                            마감일: {todo.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 justify-end">
                    <div className="flex rounded overflow-hidden border border-[#30363d]">
                      <motion.button
                        whileHover={{ backgroundColor: "#2ea043" }}
                        onClick={() => updateTodoPriority(todo.id, "low")}
                        className={`px-2 py-1 text-xs ${todo.priority === "low" ? "bg-[#3fb950] text-white" : "bg-[#0d1117] text-[#8b949e]"}`}
                      >
                        낮음
                      </motion.button>
                      <motion.button
                        whileHover={{ backgroundColor: "#d29922" }}
                        onClick={() => updateTodoPriority(todo.id, "medium")}
                        className={`px-2 py-1 text-xs ${todo.priority === "medium" ? "bg-[#f7b955] text-[#24292f]" : "bg-[#0d1117] text-[#8b949e]"}`}
                      >
                        중간
                      </motion.button>
                      <motion.button
                        whileHover={{ backgroundColor: "#da3633" }}
                        onClick={() => updateTodoPriority(todo.id, "high")}
                        className={`px-2 py-1 text-xs ${todo.priority === "high" ? "bg-[#f85149] text-white" : "bg-[#0d1117] text-[#8b949e]"}`}
                      >
                        높음
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, color: "#f85149" }}
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1 text-[#8b949e] rounded-full hover:bg-[#21262d]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
          
          {completedTasks > 0 && (
            <motion.div 
              variants={item}
              className="flex justify-end mt-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, color: "#f85149" }}
                whileTap={{ scale: 0.95 }}
                onClick={clearCompletedTasks}
                className="px-3 py-2 text-sm text-[#8b949e] hover:text-[#f85149] bg-[#21262d] rounded-md transition-colors"
              >
                완료된 항목 모두 삭제
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
} 