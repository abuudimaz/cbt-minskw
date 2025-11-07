import React, { createContext, useState, ReactNode } from 'react';
import { User, AppView, Exam, Role } from '../types';

interface AuthContextType {
  user: User | null;
  currentView: AppView;
  selectedExam: Exam | null;
  login: (user: User) => void;
  logout: () => void;
  setCurrentView: (view: AppView) => void;
  selectExam: (exam: Exam) => void;
  finishExam: () => void;
  updateUser: (user: User) => void;
}

// FIX: Export AuthContext to be used in hooks/useAuth.ts
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'cbt_user';

const getInitialUser = (): User | null => {
    try {
        const storedUserString = localStorage.getItem(USER_STORAGE_KEY);
        return storedUserString ? JSON.parse(storedUserString) : null;
    } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
    }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);

  const [currentView, setCurrentView] = useState<AppView>(() => {
      const initialUser = getInitialUser();
      if (initialUser) {
          return initialUser.role === Role.ADMIN ? AppView.ADMIN_DASHBOARD : AppView.STUDENT_DASHBOARD;
      }
      return AppView.LOGIN_SELECTOR;
  });

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const login = (userData: User) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    if (userData.role === 'admin') {
        setCurrentView(AppView.ADMIN_DASHBOARD);
    } else {
        setCurrentView(AppView.STUDENT_DASHBOARD);
    }
  };

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
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

  const updateUser = (newUserData: User) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUserData));
    setUser(newUserData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, currentView, setCurrentView, selectedExam, selectExam, finishExam, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
