"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "next-themes";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Sun, 
  Moon, 
  Globe,
  Plus,
  X,
  Tag,
  Download,
  Upload,
  MessageCircle,
  Send,
  Loader2,
  Target,
  Sparkles,
  Edit2,
  CalendarClock,
  Settings,
  Trash2,
  RotateCcw
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import Papa from 'papaparse';

type Transaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  description: string;
  category?: {
    name: string;
  };
};

type Summary = {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
};

type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff7300', '#ef4444', '#10b981'];

export default function Dashboard() {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; type: string }[]>([]);
  const [insights, setInsights] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", targetAmount: "", deadline: "" });
  const [isAddFundModalOpen, setIsAddFundModalOpen] = useState<{isOpen: boolean, goalId: string, amount: string}>({ isOpen: false, goalId: "", amount: "" });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    type: "EXPENSE",
    description: "",
    date: new Date().toISOString().slice(0, 16),
    categoryId: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Settings dropdown
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const API_URL = `${API_BASE}/transactions`;

  // Device-based user ID — เก็บใน localStorage แต่ละเครื่อง
  const getDeviceId = (): string => {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem('fintrack-device-id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('fintrack-device-id', id);
    }
    return id;
  };

  // Fetch wrapper ที่ส่ง X-Device-ID header อัตโนมัติ
  const authFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
    const deviceId = getDeviceId();
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'X-Device-ID': deviceId,
      },
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, sumRes, catRes, goalsRes] = await Promise.all([
        authFetch(API_URL),
        authFetch(`${API_URL}/summary`),
        authFetch(`${API_URL}/categories`),
        authFetch(`${API_BASE}/goals`)
      ]);

      if (!transRes.ok || !sumRes.ok || !catRes.ok || !goalsRes.ok) throw new Error("Failed to fetch");

      const transData = await transRes.json();
      const sumData = await sumRes.json();
      const catData = await catRes.json();
      const goalsData = await goalsRes.json();

      setTransactions(transData);
      setSummary(sumData);
      setCategories(catData);
      setGoals(goalsData);
    } catch (err) {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await authFetch(`${API_BASE}/ai/insights`);
      if (res.ok) {
        const data = await res.json();
        setInsights(data.insights);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchInsights();
  }, [t]);

  const handleAddGoal = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch(`${API_BASE}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal)
      });
      if (res.ok) {
        setIsAddGoalModalOpen(false);
        setNewGoal({ title: "", targetAmount: "", deadline: "" });
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFund = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch(`${API_BASE}/goals/${isAddFundModalOpen.goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addAmount: isAddFundModalOpen.amount })
      });
      if (res.ok) {
        setIsAddFundModalOpen({ isOpen: false, goalId: "", amount: "" });
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await authFetch(`${API_BASE}/goals/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete single transaction
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm(language === 'th' ? 'ต้องการลบรายการนี้?' : 'Delete this transaction?')) return;
    try {
      await authFetch(`${API_URL}/${id}`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Reset all transactions
  const handleResetAll = async () => {
    const msg = language === 'th' ? 'ลบรายการทั้งหมด? การดำเนินการนี้ไม่สามารถย้อนกลับได้!' : 'Delete ALL transactions? This cannot be undone!';
    if (!confirm(msg)) return;
    try {
      await authFetch(`${API_URL}/reset`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(formData.amount),
          type: formData.type,
          description: formData.description,
          date: new Date(formData.date).toISOString(),
          categoryId: formData.categoryId || undefined
        })
      });

      if (!res.ok) throw new Error("Failed to add transaction");

      setFormData({
        amount: "",
        type: "EXPENSE",
        description: "",
        date: new Date().toISOString().slice(0, 16),
        categoryId: ""
      });
      setIsModalOpen(false);
      
      await fetchData();
    } catch (err) {
      console.error(err);
      alert(t("error"));
    } finally {
      setSubmitting(false);
    }
  };

  // CSV Export
  const handleExport = () => {
    const csvData = transactions.map(t => ({
      Date: new Date(t.date).toISOString().split('T')[0],
      Type: t.type,
      Amount: t.amount,
      Description: t.description || "",
      Category: t.category?.name || "Auto-tagged"
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const importData = results.data.map((row: any) => ({
          date: row.Date ? new Date(row.Date).toISOString() : new Date().toISOString(),
          type: (row.Type || "EXPENSE").toUpperCase() === "INCOME" ? "INCOME" : "EXPENSE",
          amount: parseFloat(row.Amount) || 0,
          description: row.Description || ""
        }));

        try {
          const res = await authFetch(`${API_URL}/import`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactions: importData })
          });
          if (!res.ok) throw new Error("Import failed");
          alert(t("importSuccess"));
          await fetchData();
        } catch (err) {
          console.error(err);
          alert(t("error"));
        }
      }
    });
  };

  // AI Chat Handler
  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const res = await authFetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          history: chatMessages 
        })
      });

      if (!res.ok) throw new Error("AI Chat failed");
      
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === "th" ? "th-TH" : "en-US", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  // Prepare Chart Data
  const pieData = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc: any[], curr) => {
      const cat = curr.category?.name || 'Other';
      const existing = acc.find(a => a.name === cat);
      if (existing) existing.value += curr.amount;
      else acc.push({ name: cat, value: curr.amount });
      return acc;
    }, []);

  // Prepare Bar Chart Data (Daily)
  const barDataObj: Record<string, { name: string, INCOME: number, EXPENSE: number }> = {};
  transactions.forEach(t => {
    const day = new Date(t.date).getDate().toString();
    if (!barDataObj[day]) {
      barDataObj[day] = { name: day, INCOME: 0, EXPENSE: 0 };
    }
    barDataObj[day][t.type] += t.amount;
  });
  const barData = Object.values(barDataObj).sort((a, b) => parseInt(a.name) - parseInt(b.name));

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-10 pb-24">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
          {t("dashboard")}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
          />

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors font-semibold shadow-lg shadow-indigo-500/30"
          >
            <Plus className="w-5 h-5" />
            {t("addTransaction")}
          </button>

          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold text-sm shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <Globe className="w-4 h-4 text-indigo-500" />
            {language === "en" ? "EN" : "ไทย"}
          </button>
          
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm border border-gray-200 dark:border-gray-700"
            aria-label="Toggle Dark Mode"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>

          {/* Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50">
                <button
                  onClick={() => { fileInputRef.current?.click(); setIsSettingsOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-gray-700 dark:text-gray-200"
                >
                  <Upload className="w-4 h-4 text-emerald-500" />
                  {t("import")}
                </button>
                <button
                  onClick={() => { handleExport(); setIsSettingsOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-gray-700 dark:text-gray-200"
                >
                  <Download className="w-4 h-4 text-blue-500" />
                  {t("export")}
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                <button
                  onClick={() => { handleResetAll(); setIsSettingsOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                >
                  <RotateCcw className="w-4 h-4" />
                  {language === 'th' ? 'รีเซ็ตรายการทั้งหมด' : 'Reset All Transactions'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* States */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6 text-center border border-red-200 dark:border-red-800/50 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/30 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-indigo-100 font-medium text-lg">{t("balance")}</h3>
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold tracking-tight">{formatCurrency(summary.netBalance)}</p>
            </div>

            <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-lg shadow-gray-200/40 dark:shadow-none transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-500 dark:text-gray-400 font-medium text-lg">{t("totalIncome")}</h3>
                <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-2xl">
                  <ArrowUpCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(summary.totalIncome)}</p>
            </div>

            <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-lg shadow-gray-200/40 dark:shadow-none transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-500 dark:text-gray-400 font-medium text-lg">{t("totalExpense")}</h3>
                <div className="bg-rose-100 dark:bg-rose-900/40 p-3 rounded-2xl">
                  <ArrowDownCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(summary.totalExpense)}</p>
            </div>
          </div>

          {/* Savings Goals Section */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-500" /> {t("savingsGoal")}
              </h2>
              <button onClick={() => setIsAddGoalModalOpen(true)} className="flex items-center gap-1 text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl hover:bg-blue-200 transition-colors font-bold">
                <Plus className="w-4 h-4" /> Add Goal
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map(goal => {
                const remaining = goal.targetAmount - goal.currentAmount;
                const isCompleted = remaining <= 0;
                let daysLeft = 0;
                let perDay = 0;
                if (goal.deadline && !isCompleted) {
                  const deadlineDate = new Date(goal.deadline);
                  const now = new Date();
                  daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                  perDay = daysLeft > 0 ? remaining / daysLeft : remaining;
                }
                const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

                return (
                  <div key={goal.id} className={`bg-white dark:bg-gray-800 border rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all ${isCompleted ? 'border-emerald-300 dark:border-emerald-700' : 'border-gray-100 dark:border-gray-700'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate pr-4">{goal.title}</h3>
                      <button onClick={() => handleDeleteGoal(goal.id)} className="text-gray-400 hover:text-red-500 shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">{formatCurrency(goal.currentAmount)}</span>
                        <span className="text-gray-500 dark:text-gray-400">{formatCurrency(goal.targetAmount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                      </div>
                      <p className="text-xs text-right mt-1 text-gray-400">{progress.toFixed(0)}%</p>
                    </div>

                    {/* Deadline Info */}
                    {goal.deadline && !isCompleted && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 mb-3 text-sm">
                        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium mb-1">
                          <CalendarClock className="w-4 h-4" />
                          {language === 'th' ? `เหลืออีก ${daysLeft} วัน` : `${daysLeft} days left`}
                        </div>
                        <p className="text-amber-600 dark:text-amber-300 text-xs">
                          {language === 'th'
                            ? `ต้องเก็บ ${formatCurrency(perDay)} / วัน`
                            : `Save ${formatCurrency(perDay)} / day`}
                        </p>
                      </div>
                    )}
                    {goal.deadline && daysLeft === 0 && !isCompleted && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-3 mb-3 text-sm text-red-600 dark:text-red-400 font-medium">
                        {language === 'th' ? '⚠️ เลยกำหนดแล้ว!' : '⚠️ Deadline passed!'}
                      </div>
                    )}
                    {isCompleted && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3 mb-3 text-sm text-emerald-600 dark:text-emerald-400 font-bold text-center">
                        🎉 {language === 'th' ? 'ถึงเป้าหมายแล้ว!' : 'Goal Completed!'}
                      </div>
                    )}

                    {!isCompleted && (
                      <button onClick={() => setIsAddFundModalOpen({ isOpen: true, goalId: goal.id, amount: "" })} className="w-full py-2.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm transition-colors">
                        {language === 'th' ? 'เติมเงิน' : 'Add Funds'}
                      </button>
                    )}
                  </div>
                );
              })}
              {goals.length === 0 && (
                <div className="col-span-full text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl text-gray-500">
                  {language === 'th' ? 'ยังไม่มีเป้าหมาย กดเพิ่มเป้าหมายเลย!' : 'No savings goals yet. Create one to start tracking!'}
                </div>
              )}
            </div>
          </div>



          {/* Charts Section */}
          {transactions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              {/* Pie Chart: Expense by Category */}
              <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{t("expenseByCategory")}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart: Income vs Expense Daily */}
              <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{t("incomeVsExpense")}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} tick={{fontSize: 12}} />
                      <Tooltip 
                        formatter={(value: any) => formatCurrency(Number(value))}
                        contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Legend />
                      <Bar dataKey="INCOME" name={t("income")} fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="EXPENSE" name={t("expense")} fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-lg shadow-gray-200/40 dark:shadow-none overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t("recentTransactions")}</h2>
            </div>
            
            <div className="overflow-x-auto">
              {transactions.length === 0 ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                  {t("noData")}
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50/80 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                      <th className="px-8 py-5 font-semibold">{t("description")}</th>
                      <th className="px-8 py-5 font-semibold">{t("category")}</th>
                      <th className="px-8 py-5 font-semibold">{t("date")}</th>
                      <th className="px-8 py-5 font-semibold">{t("type")}</th>
                      <th className="px-8 py-5 font-semibold text-right">{t("amount")}</th>
                      <th className="px-4 py-5 font-semibold text-center w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/80">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200 group">
                        <td className="px-8 py-5 text-gray-800 dark:text-gray-200 font-medium">
                          {tx.description || "-"}
                        </td>
                        <td className="px-8 py-5">
                          {tx.category ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                              <Tag className="w-3 h-3" />
                              {tx.category.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-gray-500 dark:text-gray-400 text-sm">
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            tx.type === "INCOME" 
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50" 
                              : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50"
                          }`}>
                            {tx.type === "INCOME" ? t("income") : t("expense")}
                          </span>
                        </td>
                        <td className={`px-8 py-5 text-right font-bold text-lg tracking-tight ${
                          tx.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-800 dark:text-gray-100"
                        }`}>
                          {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </td>
                        <td className="px-4 py-5 text-center">
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
                            title={language === 'th' ? 'ลบ' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("addTransaction")}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: "EXPENSE"})}
                  className={`py-3 rounded-2xl font-bold transition-all border-2 ${
                    formData.type === "EXPENSE" 
                      ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" 
                      : "border-transparent bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {t("expense")}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: "INCOME"})}
                  className={`py-3 rounded-2xl font-bold transition-all border-2 ${
                    formData.type === "INCOME" 
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" 
                      : "border-transparent bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {t("income")}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("amount")}</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t("description")}
                </label>
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder={language === "th" ? "เช่น กินข้าว, ซื้อกาแฟ, ค่าแท็กซี่..." : "e.g., Coffee, Taxi, Salary..."}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("date")}</label>
                <input 
                  type="datetime-local" 
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("category")}</label>
                <select 
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="">-- {t("autoTagged")} --</option>
                  {categories.filter(c => c.type === formData.type).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/30"
                >
                  {submitting ? "..." : t("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{language === 'th' ? 'เพิ่มเป้าหมายการออม' : 'New Savings Goal'}</h3>
              <button onClick={() => setIsAddGoalModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddGoal} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{language === 'th' ? 'ชื่อเป้าหมาย' : 'Goal Name'}</label>
                <input type="text" required value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 outline-none" placeholder={language === 'th' ? 'เช่น ซื้อรถใหม่' : 'e.g., New Car'} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{language === 'th' ? 'จำนวนเงินเป้าหมาย' : 'Target Amount'}</label>
                <input type="number" required value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 outline-none" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{language === 'th' ? 'วันสิ้นสุดเป้าหมาย' : 'Deadline'}</label>
                <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 outline-none" />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg">{language === 'th' ? 'สร้างเป้าหมาย' : 'Create Goal'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {isAddFundModalOpen.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Funds</h3>
              <button onClick={() => setIsAddFundModalOpen({isOpen: false, goalId: "", amount: ""})} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddFund} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Amount to Add</label>
                <input type="number" required value={isAddFundModalOpen.amount} onChange={e => setIsAddFundModalOpen({...isAddFundModalOpen, amount: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 outline-none" placeholder="0.00" />
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg">Save</button>
            </form>
          </div>
        </div>
      )}

      {/* Floating AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {isChatOpen && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-80 sm:w-96 h-[500px] shadow-2xl mb-4 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col transform transition-all">
            <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-bold">FinAI</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-indigo-100 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900/50">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-4">
                  {t("aiPlaceholder")}
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-sm' 
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm rounded-bl-sm border border-gray-100 dark:border-gray-700'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-1">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleChatSubmit} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder={t("aiPlaceholder")}
                className="flex-1 bg-gray-100 dark:bg-gray-900 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-gray-200"
              />
              <button 
                type="submit" 
                disabled={!chatInput.trim() || isTyping}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-1"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="font-bold hidden sm:block">{t("askAI")}</span>
          </button>
        )}
      </div>

    </div>
  );
}
