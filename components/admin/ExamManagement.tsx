import React, { useState, useEffect } from 'react';
import { Exam, AssessmentType } from '../../types';
import { apiGetExams, apiAddExam, apiDeleteExam } from '../../services/api';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import Button from '../shared/Button';
import Input from '../shared/Input';

const ExamManagement: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newExam, setNewExam] = useState({
        name: '',
        type: AssessmentType.LITERASI,
        duration: 60,
        questionCount: 20,
        token: ''
    });

    const fetchExams = async () => {
        setIsLoading(true);
        const data = await apiGetExams();
        setExams(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewExam(prev => ({
            ...prev,
            [name]: name === 'duration' || name === 'questionCount' ? parseInt(value, 10) || 0 : value
        }));
    };

    const handleAddExam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExam.name || newExam.duration <= 0 || newExam.questionCount <= 0) {
            alert("Harap isi semua kolom yang wajib diisi dengan benar.");
            return;
        }
        await apiAddExam({
            name: newExam.name,
            type: newExam.type,
            duration: newExam.duration,
            questionCount: newExam.questionCount,
            token: newExam.token || undefined,
        });
        setNewExam({
            name: '',
            type: AssessmentType.LITERASI,
            duration: 60,
            questionCount: 20,
            token: ''
        });
        setIsAdding(false);
        fetchExams();
    };

    const handleDeleteExam = async (examId: string, examName: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus ujian "${examName}"?`)) {
            await apiDeleteExam(examId);
            fetchExams(); // Refresh list after deletion
        }
    };

    return (
        <Card title="Manajemen Ujian">
            <div className="mb-4">
                <Button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Batal Tambah' : '+ Tambah Ujian Baru'}
                </Button>
            </div>

            {isAdding && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg transition-all duration-300">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Form Tambah Ujian</h3>
                    <form onSubmit={handleAddExam} className="space-y-4">
                        <Input
                            id="name"
                            name="name"
                            label="Nama Ujian"
                            type="text"
                            value={newExam.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Contoh: Literasi Sesi 1"
                        />
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Jenis Asesmen</label>
                            <select
                                id="type"
                                name="type"
                                value={newExam.type}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                            >
                                {Object.values(AssessmentType).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                id="duration"
                                name="duration"
                                label="Durasi (menit)"
                                type="number"
                                value={newExam.duration}
                                onChange={handleInputChange}
                                required
                                min="1"
                            />
                            <Input
                                id="questionCount"
                                name="questionCount"
                                label="Jumlah Soal"
                                type="number"
                                value={newExam.questionCount}
                                onChange={handleInputChange}
                                required
                                min="1"
                            />
                        </div>
                        <Input
                            id="token"
                            name="token"
                            label="Token (Opsional)"
                            type="text"
                            value={newExam.token}
                            onChange={handleInputChange}
                            placeholder="Biarkan kosong jika tidak pakai token"
                        />
                        <div className="flex justify-end space-x-3 pt-2">
                            <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Batal</Button>
                            <Button type="submit">Simpan Ujian</Button>
                        </div>
                    </form>
                </div>
            )}

            {isLoading ? <LoadingSpinner /> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Nama Ujian</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Jenis</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Durasi</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Jumlah Soal</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Token</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map(exam => (
                                <tr key={exam.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">{exam.name}</td>
                                    <td className="py-3 px-4">{exam.type}</td>
                                    <td className="py-3 px-4">{exam.duration} menit</td>
                                    <td className="py-3 px-4">{exam.questionCount}</td>
                                    <td className="py-3 px-4 font-mono text-blue-600">{exam.token || '-'}</td>
                                    <td className="py-3 px-4">
                                        <button className="text-blue-500 hover:underline text-sm">Edit</button>
                                        <button 
                                            onClick={() => handleDeleteExam(exam.id, exam.name)} 
                                            className="text-red-500 hover:underline text-sm ml-4"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default ExamManagement;