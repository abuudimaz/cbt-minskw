import React from 'react';
import { UserGroupIcon, BookOpenIcon, ComputerDesktopIcon, ChartBarIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, UserCircleIcon, DocumentTextIcon, ClipboardDocumentListIcon, Cog6ToothIcon } from './AdminIcons';
import { AdminTab } from './AdminDashboard';

interface AdminSidebarProps {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
}

const tabs: { id: AdminTab; label: string; icon: React.ReactElement }[] = [
    { id: 'monitoring', label: 'Status Ujian', icon: <ComputerDesktopIcon /> },
    { id: 'exams', label: 'Manajemen Soal', icon: <BookOpenIcon /> },
    { id: 'students', label: 'Manajemen Siswa', icon: <UserGroupIcon /> },
    { id: 'results', label: 'Hasil Ujian', icon: <ChartBarIcon /> },
    { id: 'beritaAcara', label: 'Berita Acara', icon: <DocumentTextIcon /> },
    { id: 'daftarHadir', label: 'Daftar Hadir', icon: <ClipboardDocumentListIcon /> },
    { id: 'settings', label: 'Pengaturan Ujian', icon: <Cog6ToothIcon /> },
    { id: 'profile', label: 'Profil Admin', icon: <UserCircleIcon /> },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
    return (
        <div className={`fixed top-0 left-0 h-full bg-white shadow-lg flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex items-center justify-center h-16 border-b">
                 <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Kementerian_Agama_new_logo.png/535px-Kementerian_Agama_new_logo.png" 
                    alt="Logo Kemenag"
                    className="h-10 w-auto"
                  />
                {!isCollapsed && <span className="ml-2 font-bold text-lg text-gray-800">Admin Panel</span>}
            </div>

            <nav className="flex-grow mt-5">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group relative flex items-center w-full py-4 text-left transition-colors duration-200 ${
                            isCollapsed ? 'justify-center' : 'px-6'
                        } ${
                            activeTab === tab.id
                                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {tab.icon}
                        {!isCollapsed && <span className="ml-4 font-medium">{tab.label}</span>}
                        
                        {/* Custom Tooltip for collapsed state */}
                        {isCollapsed && (
                            <span className="absolute left-full ml-4 items-center rounded-md bg-gray-800 px-2 py-1 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none">
                                {tab.label}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            <div className="border-t p-2">
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)} 
                    className="w-full flex items-center justify-center p-3 rounded-lg text-gray-600 hover:bg-gray-100"
                    title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                    {isCollapsed ? <ChevronDoubleRightIcon /> : <ChevronDoubleLeftIcon />}
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
