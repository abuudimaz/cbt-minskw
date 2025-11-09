import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { apiGetStudents, apiCreateStudent, apiUpdateStudent, apiDeleteStudent, apiImportStudents, apiDeleteStudents } from '../../services/api';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import Card from '../shared/Card';
import StudentFormModal from './StudentFormModal';
import StudentImportModal from './StudentImportModal';
import ConfirmationModal from '../shared/ConfirmationModal';
import { toastSuccess, toastError, downloadCSV } from '../../utils/helpers';

interface StudentManagementProps {
    searchQuery?: string;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ searchQuery }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [classes, setClasses] = useState<string[]>([]);
    const [selectedClass, setSelectedClass] = useState('all');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
    
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmModalState, setConfirmModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => Promise<void>;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: async () => {},
    });


    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const data = await apiGetStudents();
            setStudents(data);
            const uniqueClasses = [...new Set(data.map(s => s.class))].sort();
            setClasses(uniqueClasses);
        } catch (err) {
            setError('Gagal memuat data siswa.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleOpenFormModal = (student: Student | null) => {
        setSelectedStudent(student);
        setIsFormModalOpen(true);
    };
    
    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setSelectedStudent(null);
    };

    const handleSaveStudent = async (studentData: Student) => {
        try {
            if (selectedStudent) { // If we were editing a student (selectedStudent is not null)
                await apiUpdateStudent(studentData);
            } else { // Otherwise, we are creating a new student
                await apiCreateStudent(studentData);
            }
            toastSuccess('Data siswa berhasil disimpan.');
            fetchStudents();
            handleCloseFormModal();
        } catch (err: any) {
            toastError(`Gagal menyimpan data siswa: ${err.message}`);
        }
    };

    const handleDeleteStudent = (nis: string, name: string) => {
        setConfirmModalState({
            isOpen: true,
            title: 'Konfirmasi Hapus Siswa',
            message: `Apakah Anda yakin ingin menghapus siswa "${name}" (NIS: ${nis})? Tindakan ini tidak dapat diurungkan.`,
            onConfirm: async () => {
                setIsDeleting(true);
                try {
                    await apiDeleteStudent(nis);
                    toastSuccess('Siswa berhasil dihapus.');
                    fetchStudents();
                } catch (err) {
                    toastError('Gagal menghapus siswa.');
                } finally {
                    setIsDeleting(false);
                    setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: async () => {} });
                }
            },
        });
    };
    
    const handleImportStudents = async (importedStudents: Student[]) => {
        try {
            const { added, skipped } = await apiImportStudents(importedStudents);
            let successMessage = '';
            if (added > 0) {
                successMessage += `${added} data siswa berhasil diimpor.`;
            }
            if (skipped > 0) {
                successMessage += `\n${skipped} data dilewati karena NIS sudah ada.`;
            }
            if (!successMessage) {
                successMessage = 'Tidak ada data siswa baru untuk diimpor.';
            }
            toastSuccess(successMessage.trim());
            fetchStudents();
            setIsImportModalOpen(false);
        } catch (err: any) {
            toastError(`Gagal mengimpor data siswa: ${err.message}`);
        }
    };

    const displayedStudents = students
        .filter(s => selectedClass === 'all' || s.class === selectedClass)
        .filter(s => 
            !searchQuery || 
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.nis.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const handleSelect = (nis: string) => {
        setSelectedStudents(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(nis)) {
                newSelection.delete(nis);
            } else {
                newSelection.add(nis);
            }
            return newSelection;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedStudents(new Set(displayedStudents.map(s => s.nis)));
        } else {
            setSelectedStudents(new Set());
        }
    };

    const handleDeleteSelected = () => {
        setConfirmModalState({
            isOpen: true,
            title: 'Konfirmasi Hapus Massal',
            message: `Apakah Anda yakin ingin menghapus ${selectedStudents.size} siswa terpilih? Tindakan ini tidak dapat diurungkan.`,
            onConfirm: async () => {
                setIsDeleting(true);
                try {
                    await apiDeleteStudents(Array.from(selectedStudents));
                    toastSuccess(`${selectedStudents.size} siswa berhasil dihapus.`);
                    setSelectedStudents(new Set());
                    fetchStudents();
                } catch (err) {
                    toastError('Gagal menghapus siswa terpilih.');
                } finally {
                    setIsDeleting(false);
                    setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: async () => {} });
                }
            },
        });
    };

    const handleExportSelected = () => {
        const dataToExport = students
            .filter(s => selectedStudents.has(s.nis))
            .map(({ nis, name, class: studentClass, room }) => ({ nis, name, class: studentClass, room })); 
        
        if (dataToExport.length > 0) {
            downloadCSV(dataToExport, `export_siswa_terpilih_${new Date().toISOString().split('T')[0]}.csv`);
        } else {
            toastError("Tidak ada siswa terpilih untuk diekspor.");
        }
    };
    
    if (isLoading) return <LoadingSpinner text="Memuat data siswa..." />;
    if (error) return <p className="text-red-500">{error}</p>;

    const isAllSelected = displayedStudents.length > 0 && selectedStudents.size === displayedStudents.length;

    return (
        <>
            <Card title="Manajemen Data Siswa">
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                     <div>
                        <label htmlFor="class-filter" className="sr-only">Filter Berdasarkan Kelas</label>
                        <select 
                            id="class-filter"
                            value={selectedClass} 
                            onChange={e => setSelectedClass(e.target.value)}
                            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="all">Semua Kelas</option>
                            {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                        </select>
                    </div>
                    <div className="flex space-x-2">
                        <Button onClick={() => setIsImportModalOpen(true)} variant="secondary">
                            Import Siswa
                        </Button>
                        <Button onClick={() => handleOpenFormModal(null)}>
                            + Tambah Siswa Baru
                        </Button>
                    </div>
                </div>
                <div className="w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                     <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        aria-label="Pilih semua siswa"
                                        disabled={searchQuery ? true : false}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Ruang</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedStudents.length > 0 ? displayedStudents.map((student) => (
                                <tr key={student.nis} className={selectedStudents.has(student.nis) ? 'bg-blue-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.has(student.nis)}
                                            onChange={() => handleSelect(student.nis)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            aria-label={`Pilih ${student.name}`}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-700">{student.nis}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{student.room}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenFormModal(student)}>Edit</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDeleteStudent(student.nis, student.name)}>Hapus</Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                        {searchQuery ? `Tidak ada siswa yang cocok dengan pencarian "${searchQuery}".` : "Tidak ada data siswa."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 border-t pt-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Aksi Massal</h3>
                    {selectedStudents.size > 0 ? (
                        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md">
                            <span className="text-sm font-semibold text-gray-700">{selectedStudents.size} siswa terpilih</span>
                            <Button onClick={handleDeleteSelected} variant="danger" size="sm">
                                Hapus Terpilih
                            </Button>
                            <Button onClick={handleExportSelected} variant="secondary" size="sm">
                                Export Terpilih (CSV)
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Pilih siswa menggunakan checkbox untuk melakukan aksi massal.</p>
                    )}
                </div>

            </Card>

            <StudentFormModal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                onSave={handleSaveStudent}
                student={selectedStudent}
            />

            <StudentImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportStudents}
            />

            <ConfirmationModal
                isOpen={confirmModalState.isOpen}
                onClose={() => setConfirmModalState({ ...confirmModalState, isOpen: false })}
                onConfirm={confirmModalState.onConfirm}
                title={confirmModalState.title}
                message={confirmModalState.message}
                isLoading={isDeleting}
                variant="danger"
                confirmText="Ya, Hapus"
                cancelText="Batal"
            />
        </>
    );
};

export default StudentManagement;