import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { apiGetStudents, apiDeleteStudent, apiCreateStudent, apiUpdateStudent, apiBulkDeleteStudents } from '../../services/api';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import Card from '../shared/Card';
import StudentFormModal from './StudentFormModal';

const ITEMS_PER_PAGE = 10;

const StudentManagement: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [selectedNis, setSelectedNis] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const data = await apiGetStudents();
            setStudents(data);
        } catch (err) {
            setError('Gagal memuat data siswa.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleOpenModal = (student: Student | null) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleSaveStudent = async (studentData: Student) => {
        try {
            if (editingStudent) {
                await apiUpdateStudent(studentData);
            } else {
                await apiCreateStudent(studentData);
            }
            fetchStudents();
            setIsModalOpen(false);
        } catch (err: any) {
            alert(`Gagal menyimpan data siswa: ${err.message}`);
        }
    };

    const handleDelete = async (nis: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
            try {
                await apiDeleteStudent(nis);
                setStudents(students.filter(s => s.nis !== nis));
            } catch (err) {
                alert('Gagal menghapus siswa.');
            }
        }
    };

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentStudents = students.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    
    // --- SELECTION LOGIC (UPDATED FOR PAGINATION) ---
    const nisesOnCurrentPage = currentStudents.map(s => s.nis);
    const selectedOnPageCount = nisesOnCurrentPage.filter(nis => selectedNis.includes(nis)).length;

    const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            // Add all NISes from the current page to the selection, avoiding duplicates
            setSelectedNis(prev => [...new Set([...prev, ...nisesOnCurrentPage])]);
        } else {
            // Remove all NISes from the current page from the selection
            setSelectedNis(prev => prev.filter(nis => !nisesOnCurrentPage.includes(nis)));
        }
    };


    const handleSelectOne = (nis: string) => {
        setSelectedNis(prev => 
            prev.includes(nis) 
                ? prev.filter(id => id !== nis) 
                : [...prev, nis]
        );
    };
    
    const handleBulkDelete = async () => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedNis.length} siswa terpilih?`)) {
            try {
                await apiBulkDeleteStudents(selectedNis);
                fetchStudents();
                setSelectedNis([]);
            } catch (err) {
                alert('Gagal menghapus siswa yang dipilih.');
            }
        }
    };

    if (isLoading) return <LoadingSpinner text="Memuat data siswa..." />;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <>
            <Card title="Manajemen Data Siswa">
                <div className="mb-4 flex justify-between items-center">
                    <div>
                        {selectedNis.length > 0 && (
                             <Button variant="danger" onClick={handleBulkDelete}>
                                Hapus ({selectedNis.length}) Siswa
                            </Button>
                        )}
                    </div>
                    <Button onClick={() => handleOpenModal(null)}>
                        + Tambah Siswa
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    <input 
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        onChange={handleSelectAllOnPage}
                                        checked={currentStudents.length > 0 && selectedOnPageCount === currentStudents.length}
                                        indeterminate={selectedOnPageCount > 0 && selectedOnPageCount < currentStudents.length}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruang</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentStudents.map((student) => (
                                <tr key={student.nis} className={selectedNis.includes(student.nis) ? 'bg-blue-50' : ''}>
                                    <td className="px-6 py-4">
                                         <input 
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedNis.includes(student.nis)}
                                            onChange={() => handleSelectOne(student.nis)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.nis}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.room}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenModal(student)}>Edit</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(student.nis)}>Hapus</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- PAGINATION CONTROLS --- */}
                {totalPages > 1 && (
                     <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-gray-700">
                            Menampilkan <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(endIndex, students.length)}</span> dari <span className="font-semibold">{students.length}</span> siswa
                        </span>
                        <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Sebelumnya
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                                        currentPage === page 
                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Berikutnya
                            </button>
                        </nav>
                    </div>
                )}

            </Card>
            <StudentFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveStudent}
                student={editingStudent}
            />
        </>
    );
};

export default StudentManagement;