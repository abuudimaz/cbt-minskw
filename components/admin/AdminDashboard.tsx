
import React, { useState } from 'react';
import Card from '../shared/Card';
import ExamManagement from './ExamManagement';
import StudentManagement from './StudentManagement';
import MonitoringDashboard from './MonitoringDashboard';
import ResultsDashboard from './ResultsDashboard';
import { BookOpenIcon, UserGroupIcon, ChartBarIcon, ComputerDesktopIcon } from './AdminIcons';

type AdminTab = 'exams' | 'students' | 'monitoring' | 'results';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('monitoring');

    const renderContent = () => {
        switch (activeTab) {
            case 'exams':
                return <ExamManagement />;
            case 'students':
                return <StudentManagement />;
            case 'monitoring':
                return <MonitoringDashboard />;
            case 'results':
                return <ResultsDashboard />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ tabName: AdminTab; icon: React.ReactNode; label: string }> = ({ tabName, icon, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeTab === tabName
                    ? 'bg-brand-green text-white shadow'
                    : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {icon}
            <span className="ml-3">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <nav className="md:w-64 flex-shrink-0">
                 <Card className="p-0">
                    <div className="p-4 space-y-2">
                        <TabButton tabName="monitoring" icon={<ComputerDesktopIcon />} label="Monitoring Ujian" />
                        <TabButton tabName="results" icon={<ChartBarIcon />} label="Hasil Ujian" />
                        <TabButton tabName="exams" icon={<BookOpenIcon />} label="Manajemen Ujian" />
                        <TabButton tabName="students" icon={<UserGroupIcon />} label="Manajemen Siswa" />
                    </div>
                 </Card>
            </nav>
            <main className="flex-1">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;
