import React, { useState, useEffect } from "react";
import { INTERNSHIP_TASKS_INFO } from "./data";
import { InternshipTask } from "./types";
import DashboardHome from "./components/DashboardHome";
import FlashcardQuiz from "./components/FlashcardQuiz";
import QuoteGenerator from "./components/QuoteGenerator";
import FitnessTracker from "./components/FitnessTracker";
import LanguageLearning from "./components/LanguageLearning";
import { LayoutDashboard, Layers, Quote, HeartPulse, Languages, Menu, X, Award, ChevronRight, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { safeStorage } from "./utils/storage";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    return safeStorage.getItem("codealpha_active_tab") || "dashboard";
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tasks, setTasks] = useState<InternshipTask[]>(INTERNSHIP_TASKS_INFO);
  const userEmail = "siddhi29cse127@satiengg.in";

  useEffect(() => {
    safeStorage.setItem("codealpha_active_tab", activeTab);
  }, [activeTab]);

  const navItems = [
    { id: "dashboard", label: "Internship Dashboard", icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
    { id: "flashcards", label: "Flashcards (Task 1)", icon: <Layers className="w-4.5 h-4.5" /> },
    { id: "quotes", label: "Quote Generator (Task 2)", icon: <Quote className="w-4.5 h-4.5" /> },
    { id: "fitness", label: "Fitness Tracker (Task 3)", icon: <HeartPulse className="w-4.5 h-4.5" /> },
    { id: "language", label: "Language Learn (Task 4)", icon: <Languages className="w-4.5 h-4.5" /> },
  ];

  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardHome tasks={tasks} onNavigate={handleNavigate} userEmail={userEmail} />;
      case "flashcards":
        return <FlashcardQuiz />;
      case "quotes":
        return <QuoteGenerator />;
      case "fitness":
        return <FitnessTracker />;
      case "language":
        return <LanguageLearning />;
      default:
        return <DashboardHome tasks={tasks} onNavigate={handleNavigate} userEmail={userEmail} />;
    }
  };

  const getTabTitle = () => {
    const item = navItems.find(n => n.id === activeTab);
    return item ? item.label : "Dashboard";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans antialiased">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-white text-slate-800 border-r border-slate-200 shrink-0 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-lg tracking-tight font-sans text-slate-900">
              Code<span className="text-indigo-600">Alpha</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">
            Intern Workstation
          </p>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-grow p-4 space-y-1 pt-6">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100/30"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span className={isActive ? "text-indigo-600" : "text-slate-400"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/50">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200/50 flex items-center justify-center text-xs font-bold text-indigo-700">
              ID
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">Intern Developer</p>
              <p className="text-[9px] text-slate-400 truncate font-mono">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER BAR */}
      <div className="flex flex-col flex-grow min-w-0">
        <header className="lg:hidden bg-white text-slate-800 border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            <span className="font-extrabold text-sm tracking-tight text-slate-950">
              Code<span className="text-indigo-600">Alpha</span>
            </span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
          </button>
        </header>

        {/* MOBILE NAVIGATION DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-slate-200 sticky top-[53px] z-30 shadow-sm"
            >
              <div className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span className={isActive ? "text-indigo-600" : "text-slate-400"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DYNAMIC VIEW CONTAINER AREA */}
        <main className="flex-grow p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Internal Header Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-medium border-b border-slate-200/50 pb-3">
            <span>Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-600 font-semibold">{getTabTitle()}</span>
          </div>

          {/* Core Page Content with Staggered Fade Transition */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderActiveComponent()}
          </motion.div>
        </main>

        {/* Unified Application Footer */}
        <footer className="py-6 px-8 border-t border-slate-200/60 bg-white text-center text-[10px] font-medium text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CodeAlpha Internship Workspace. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Workspace Support</span>
            <span>&bull;</span>
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Program Guidelines</span>
          </div>
        </footer>
      </div>

    </div>
  );
}
