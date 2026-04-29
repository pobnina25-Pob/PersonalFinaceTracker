"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "th";

type Translations = {
  [key in Language]: {
    dashboard: string;
    totalIncome: string;
    totalExpense: string;
    balance: string;
    recentTransactions: string;
    amount: string;
    type: string;
    date: string;
    description: string;
    income: string;
    expense: string;
    loading: string;
    error: string;
    noData: string;
    addTransaction: string;
    save: string;
    cancel: string;
    category: string;
    autoTagged: string;
    successAdd: string;
    import: string;
    export: string;
    expenseByCategory: string;
    incomeVsExpense: string;
    importSuccess: string;
    askAI: string;
    aiPlaceholder: string;
    send: string;
    savingsGoal: string;
    editGoal: string;
    insightsTitle: string;
    loadingInsights: string;
    goalProgress: string;
  };
};

const translations: Translations = {
  en: {
    dashboard: "Dashboard",
    totalIncome: "Total Income",
    totalExpense: "Total Expense",
    balance: "Net Balance",
    recentTransactions: "Recent Transactions",
    amount: "Amount",
    type: "Type",
    date: "Date",
    description: "Description",
    income: "Income",
    expense: "Expense",
    loading: "Loading data...",
    error: "Failed to load data.",
    noData: "No transactions found.",
    addTransaction: "Add Transaction",
    save: "Save",
    cancel: "Cancel",
    category: "Category",
    autoTagged: "Auto-tagged",
    successAdd: "Transaction added successfully!",
    import: "Import CSV/JSON",
    export: "Export CSV",
    expenseByCategory: "Expense by Category",
    incomeVsExpense: "Income vs Expense",
    importSuccess: "Imported transactions successfully!",
    askAI: "Ask FinAI",
    aiPlaceholder: "Ask me about your expenses...",
    send: "Send",
    savingsGoal: "Savings Goal",
    editGoal: "Edit Goal",
    insightsTitle: "FinAI Insights",
    loadingInsights: "Analyzing your data...",
    goalProgress: "Savings Progress",
  },
  th: {
    dashboard: "แผงควบคุม",
    totalIncome: "รายรับรวม",
    totalExpense: "รายจ่ายรวม",
    balance: "ยอดคงเหลือ",
    recentTransactions: "รายการล่าสุด",
    amount: "จำนวนเงิน",
    type: "ประเภท",
    date: "วันที่",
    description: "รายละเอียด",
    income: "รายรับ",
    expense: "รายจ่าย",
    loading: "กำลังโหลดข้อมูล...",
    error: "ไม่สามารถโหลดข้อมูลได้",
    noData: "ไม่พบรายการบัญชี",
    addTransaction: "เพิ่มรายการ",
    save: "บันทึก",
    cancel: "ยกเลิก",
    category: "หมวดหมู่",
    autoTagged: "ติดแท็กอัตโนมัติ",
    successAdd: "เพิ่มรายการสำเร็จ!",
    import: "นำเข้า CSV/JSON",
    export: "ส่งออก CSV",
    expenseByCategory: "สัดส่วนรายจ่ายตามหมวดหมู่",
    incomeVsExpense: "รายรับเทียบรายจ่าย (รายวัน)",
    importSuccess: "นำเข้าข้อมูลสำเร็จ!",
    askAI: "ถาม FinAI",
    aiPlaceholder: "ถามผมเกี่ยวกับรายจ่ายของคุณได้เลย...",
    send: "ส่ง",
    savingsGoal: "เป้าหมายการออม",
    editGoal: "แก้ไขเป้าหมาย",
    insightsTitle: "บทวิเคราะห์จาก FinAI",
    loadingInsights: "กำลังวิเคราะห์ข้อมูล...",
    goalProgress: "ความคืบหน้าการออม",
  },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof Translations["en"]) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "th" : "en"));
  };

  const t = (key: keyof Translations["en"]) => {
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
