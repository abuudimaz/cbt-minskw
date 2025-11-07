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

export type AdminTab = 'monitoring' | 'exams' | 'students' | 'results' | 'beritaAcara' | 'daftarHadir' | 'settings' | 'profile';

const componentMap: { [key in AdminTab]: React.ReactElement } = {
    monitoring: <MonitoringDashboard />,
    exams: <ExamManagement />,
    students: <StudentManagement />,
    results: <ResultsDashboard />,
    beritaAcara: <BeritaAcara />,
    daftarHadir: <DaftarHadir />,
    settings: <ExamSettings />,
    profile: <AdminProfile />,
};

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('exams');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
                {ActiveComponent}
            </div>
        </div>
    );
};

export default AdminDashboard;