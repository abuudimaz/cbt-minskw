import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, AppView, Exam } from '../types';

interface AuthContextType {
  user: User | null;
  currentView: AppView;
  selectedExam: Exam | null;
  login: (user: User) => void;
  logout: () => void;
  setCurrentView: (view: AppView) => void;
  selectExam: (exam: Exam) => void;
  finishExam: () => void;
}

// FIX: Export AuthContext to be used in hooks/useAuth.ts
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN_SELECTOR);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    if (userData.role === 'admin') {
        setCurrentView(AppView.ADMIN_DASHBOARD);
    } else {
        setCurrentView(AppView.STUDENT_DASHBOARD);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentView(AppView.LOGIN_SELECTOR);
    setSelectedExam(null);
  };

  const selectExam = (exam: Exam) => {
    setSelectedExam(exam);
    setCurrentView(AppView.STUDENT_EXAM);
  };

    const finishExam = () => {
    setSelectedExam(null);
    setCurrentView(AppView.STUDENT_DASHBOARD);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, currentView, setCurrentView, selectedExam, selectExam, finishExam }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
