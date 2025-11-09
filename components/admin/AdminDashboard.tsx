import React, { useState } from 'react';
import StudentManagement from './StudentManagement';
import ExamManagement from './ExamManagement';
import MonitoringDashboard from './MonitoringDashboard';
import ResultsDashboard from './ResultsDashboard';
import AdminSidebar from './AdminSidebar';
import AdminProfile from './AdminProfile';
import BeritaAcara from './BeritaAcara';
import DaftarHadir from './DaftarHadir';
import ExamSettings from './ExamSettings';
import ExamSchedule from './ExamSchedule';
import GlobalSearch from './GlobalSearch';
import { Student, Exam, ExamResult } from '../../types';

export type AdminTab = 'monitoring' | 'exams' | 'examSchedule' | 'students' | 'results' | 'beritaAcara' | 'daftarHadir' | 'settings' | 'profile';

interface AdminComponentProps {
    searchQuery?: string;
    initialResultToShow?: ExamResult | null;
    clearInitialResult?: () => void;
}

const componentMap: { [key in AdminTab]: React.ComponentType<AdminComponentProps> } = {
    monitoring: MonitoringDashboard,
    exams: ExamManagement,
    examSchedule: ExamSchedule,
    students: StudentManagement,
    results: ResultsDashboard,
    beritaAcara: BeritaAcara,
    daftarHadir: DaftarHadir,
    settings: ExamSettings,
    profile: AdminProfile,
};

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTabState] = useState<AdminTab>('exams');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [searchFilter, setSearchFilter] = useState<{ tab: AdminTab; query: string } | null>(null);
    const [resultToView, setResultToView] = useState<ExamResult | null>(null);

    const setActiveTab = (tab: AdminTab) => {
        setActiveTabState(tab);
        setSearchFilter(null); // Hapus filter pencarian saat berganti tab secara manual
        setResultToView(null); // Hapus hasil yang akan ditampilkan saat berganti tab secara manual
    };

    const handleStudentSelect = (student: Student) => {
        setActiveTabState('students');
        setSearchFilter({ tab: 'students', query: student.name });
        setResultToView(null);
    };

    const handleExamSelect = (exam: Exam) => {
        setActiveTabState('exams');
        setSearchFilter({ tab: 'exams', query: exam.name });
        setResultToView(null);
    };

    const handleResultSelect = (result: ExamResult) => {
        setActiveTabState('results');
        setResultToView(result);
        setSearchFilter(null);
    };

    const ActiveComponent = componentMap[activeTab];

    return (
        <div className="relative flex h-full bg-gray-100">
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />
            <div className={`flex-1 p-4 sm:p-6 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <div className="mb-6">
                    <GlobalSearch
                        onStudentSelect={handleStudentSelect}
                        onExamSelect={handleExamSelect}
                        onResultSelect={handleResultSelect}
                    />
                </div>
                <ActiveComponent
                    searchQuery={searchFilter?.tab === activeTab ? searchFilter.query : undefined}
                    initialResultToShow={resultToView}
                    clearInitialResult={() => setResultToView(null)}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;