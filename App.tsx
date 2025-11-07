import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { AppView } from './types';
import Header from './components/shared/Header';
import LoginSelector from './components/auth/LoginSelector';
import StudentLogin from './components/auth/StudentLogin';
import AdminLogin from './components/auth/AdminLogin';
import StudentDashboard from './components/student/StudentDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import ExamInterface from './components/student/ExamInterface';
import { APP_TITLE } from './constants';

const ViewRenderer: React.FC = () => {
    const { currentView, selectedExam, user } = useAuth();

    const wrapInContainer = (component: React.ReactNode) => (
        <div className="container mx-auto p-4 sm:p-6">{component}</div>
    );

    switch (currentView) {
        case AppView.STUDENT_LOGIN:
            return wrapInContainer(<StudentLogin />);
        case AppView.ADMIN_LOGIN:
            return wrapInContainer(<AdminLogin />);
        case AppView.STUDENT_DASHBOARD:
            return wrapInContainer(<StudentDashboard />);
        case AppView.ADMIN_DASHBOARD:
            // AdminDashboard has its own full-page layout with a sidebar
            return <AdminDashboard />;
        case AppView.STUDENT_EXAM:
            if (selectedExam && user) {
                return wrapInContainer(<ExamInterface exam={selectedExam} />);
            }
            // Fallback if exam is not selected, redirect to dashboard
            return wrapInContainer(<StudentDashboard />);
        case AppView.LOGIN_SELECTOR:
        default:
            return wrapInContainer(<LoginSelector />);
    }
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
                <Header />
                <main className="flex-grow">
                    <ViewRenderer />
                </main>
                 <footer className="text-center py-4 text-gray-500 text-sm bg-gray-100">
                    <p>&copy; {new Date().getFullYear()} {APP_TITLE}. All rights reserved.</p>
                    <p className="mt-1">dev by Mahfud Sidik</p>
                </footer>
            </div>
        </AuthProvider>
    );
};

export default App;