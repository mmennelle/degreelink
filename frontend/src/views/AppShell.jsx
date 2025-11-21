// src/views/AppShell.jsx
import React from 'react';
import { Moon, Sun, Key, FileText, Search, Shield, Home, GraduationCap, Settings, LogIn, UserCircle } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

export default function AppShell({
  activeTab, setActiveTab, tabs, userMode,
  children, onFindPlan, onOpenAdvisorSettings, onGoHome
}) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    
      <div className="min-h-screen text-gray-900 dark:text-gray-100 flex flex-col">
        {/* Top nav */}
        <nav className="border-b-4 boarder-solid border-gray-300 dark:border-gray-800 bg-surface-light dark:bg-gray-900/60 backdrop-blur sticky top-0 z-40">
          <div className="max-w-7x1 mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap size={30} className="text-indigo-600 dark:text-indigo-400" />
              <div className="flex flex-col">
                <span className="font-semibold tracking-tight">Degree Link</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Your Path. Your Progress. Your Degree</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onGoHome}
            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            title="Go to onboarding"
            aria-label="Go to onboarding"
          >
            <Home className="w-5 h-5" />
          </button>
              {/* Dark mode */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Advisor Settings / Portal Switcher */}
              <button
                onClick={onOpenAdvisorSettings}
                className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                title={userMode === 'advisor' ? 'Advisor Settings' : 'Switch to Advisor Portal'}
                aria-label={userMode === 'advisor' ? 'Advisor Settings' : 'Switch to Advisor Portal'}
              >
                {userMode === 'advisor' ? <UserCircle className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {tabs.map(t => {
                // Map the string name from tab.icon to an imported Lucide icon.
                // Shield is included here to support the audit tab.
                const Icon = {Search, FileText, Key, Shield, Settings}[t.icon] || Search;
                const active = t.id === activeTab;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={[
                      "snap-start inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl whitespace-nowrap flex-shrink-0",
                      active ? "bg-indigo-600 text-white" :
                        "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    ].join(' ')}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{t.label}</span>
                    <span className="sm:hidden">{t.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-600 dark:text-gray-300 text-xs">
            <p>
              Developed by Mitchell Mennelle under a joint grant between Delgado Community College and The University of New Orleans
            </p>
            <p className="mt-1">© 2025 All rights reserved</p>
          </div>
        </footer>
      </div>
  );
}
