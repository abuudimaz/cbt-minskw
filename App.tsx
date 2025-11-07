
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginSelector from './components/auth/LoginSelector';
import StudentDashboard from './components/student/StudentDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import Header from './components/shared/Header';
import { AppView } from './types';
import StudentLogin from './components/auth/StudentLogin';
import AdminLogin from './components/auth/AdminLogin';
import ExamInterface from './components/student/ExamInterface';

const AppContent: React.FC = () => {
  const { user, currentView, selectedExam, setCurrentView } = useAuth();

  const renderContent = () => {
    if (!user) {
      switch (currentView) {
        case AppView.STUDENT_LOGIN:
          return <StudentLogin />;
        case AppView.ADMIN_LOGIN:
          return <AdminLogin />;
        default:
          return <LoginSelector />;
      }
    }

    if (user.role === 'student') {
        if (currentView === AppView.STUDENT_EXAM && selectedExam) {
            return <ExamInterface exam={selectedExam} />;
        }
        return <StudentDashboard />;
    }

    if (user.role === 'admin') {
      return <AdminDashboard />;
    }

    return <LoginSelector />;
  };

  return (
    <div className="min-h-screen bg-brand-gray-100 font-sans">
        <Header />
        <main className="p-4 sm:p-6 md:p-8">
            {renderContent()}
        </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
