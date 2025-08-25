// src/views/AppShell.jsx
import React from 'react';
import { Moon, Sun, Users, Key, FileText, Search, Shield, Home, GraduationCap } from 'lucide-react';
import { useDarkMode, DarkModeProvider } from '../hooks/useDarkMode';

export default function AppShell({
  activeTab, setActiveTab, tabs, userMode,
  children, onFindPlan, onToggleUserMode, onGoHome
}) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <DarkModeProvider>
      <div className="min-h-screen text-gray-900 dark:text-gray-100 flex flex-col">
        {/* Top nav */}
        <nav className="border-b border-gray-200 dark:border-gray-800 bg-surface-light/60 dark:bg-gray-900/60 backdrop-blur sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap size={30} className="text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold tracking-tight">Course Equivalency</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onGoHome}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Go to onboarding"
          >
            <Home className="w-5 h-5" />
          </button>
              {/* Dark mode */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Mode toggle */}
              <div className="flex items-center text-sm">
                <Users className="mr-1" size={16} />
                <span className="hidden sm:inline">
                  {userMode === 'advisor' ? 'Advisor Portal' : 'Student Portal'}
                </span>
                <span className="sm:hidden">{userMode === 'advisor' ? 'Advisor' : 'Student'}</span>
              </div>
              <button
                onClick={onToggleUserMode}
                className="px-2 py-1 border rounded-lg text-xs"
              >
                Switch
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map(t => {
                const Icon = {Search, FileText, Key, Users}[t.icon] || Search;
                const active = t.id === activeTab;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={[
                      "inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl whitespace-nowrap",
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
    </DarkModeProvider>
  );
}
