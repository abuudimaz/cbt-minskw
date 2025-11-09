import React, { useState, useEffect, useMemo } from 'react';
import { Student, Exam, ExamResult } from '../../types';
import { apiGetStudents, apiGetExams, apiGetExamResults } from '../../services/api';
import Card from '../shared/Card';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import { KemenagLogo } from '../../constants';

interface AttendanceRecord {
    student: Student;
    isPresent: boolean;
}

const StudentAttendance: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [results, setResults] = useState<ExamResult[]>([]);
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [studentsData, examsData, resultsData] = await Promise.all([
                    apiGetStudents(),
                    apiGetExams(),
                    apiGetExamResults()
                ]);
                setStudents(studentsData);
                setExams(examsData);
                setResults(resultsData);
                if (examsData.length > 0) {
                    setSelectedExamId(examsData[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch attendance data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const attendanceList: AttendanceRecord[] = useMemo(() => {
        if (!selectedExamId) return [];

        const studentsForExam = students; // Assuming all students are eligible for all exams for now
        const resultsForExam = new Set(
            results.filter(r => r.examId === selectedExamId).map(r => r.nis)
        );

        return studentsForExam.map(student => ({
            student,
            isPresent: resultsForExam.has(student.nis),
        })).sort((a, b) => a.student.name.localeCompare(b.student.name));
    }, [selectedExamId, students, results]);
    
    const presentCount = useMemo(() => attendanceList.filter(item => item.isPresent).length, [attendanceList]);
    const absentCount = useMemo(() => attendanceList.filter(item => !item.isPresent).length, [attendanceList]);
    const selectedExam = useMemo(() => exams.find(e => e.id === selectedExamId), [exams, selectedExamId]);

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return <LoadingSpinner text="Memuat data absensi..." />;
    }

    return (
        <div>
            {/* --- FORM INPUT (NO-PRINT) --- */}
            <Card title="Absensi Siswa per Ujian" className="no-print mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <label htmlFor="exam-select" className="block text-sm font-medium text-gray-700 mb-1">Pilih Ujian</label>
                        <select
                            id="exam-select"
                            value={selectedExamId}
                            onChange={e => setSelectedExamId(e.target.value)}
                            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            disabled={exams.length === 0}
                        >
                            {exams.length > 0 ? (
                                exams.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)
                            ) : (
                                <option>Tidak ada ujian tersedia</option>
                            )}
                        </select>
                    </div>
                    <Button onClick={handlePrint} disabled={!selectedExamId}>
                        Cetak Absensi
                    </Button>
                </div>
            </Card>

            {/* --- PRINTABLE DOCUMENT --- */}
            {selectedExam && (
                <div className="printable-content bg-white p-8 shadow-lg text-black print:p-0 print:shadow-none print:text-sm">
                    {/* KOP SURAT */}
                    <header className="text-center border-b-4 border-black pb-2">
                        <div className="flex items-center justify-center">
                            <KemenagLogo className="h-20 w-20 mr-4 print:h-16 print:w-16" />
                            <div>
                                <p className="text-lg font-semibold print:text-base">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
                                <p className="text-2xl font-bold print:text-xl">MADRASAH IBTIDAIYAH NEGERI SINGKAWANG</p>
                            </div>
                        </div>
                    </header>
                    
                    {/* JUDUL & DETAIL */}
                    <section className="text-center mt-8 print:mt-6">
                        <p className="font-bold underline text-lg print:text-base">DAFTAR ABSENSI PESERTA</p>
                        <p className="font-bold uppercase text-lg print:text-base">{selectedExam.name}</p>
                    </section>
                    
                    <div className="mt-4 text-sm font-semibold flex justify-around">
                        <span>Total Peserta: {attendanceList.length}</span>
                        <span>Hadir: {presentCount}</span>
                        <span>Tidak Hadir: {absentCount}</span>
                    </div>

                    {/* TABLE DAFTAR ABSENSI */}
                    <main className="mt-6 text-black print:mt-4">
                        <table className="w-full border-collapse border border-black">
                            <thead className="bg-gray-200 text-center">
                                <tr>
                                    <th className="px-2 py-2 text-sm font-semibold border border-black w-[5%] print:py-1">No.</th>
                                    <th className="px-2 py-2 text-sm font-semibold border border-black w-[15%] print:py-1">NIS</th>
                                    <th className="px-2 py-2 text-sm font-semibold border border-black print:py-1">Nama Siswa</th>
                                    <th className="px-2 py-2 text-sm font-semibold border border-black w-[20%] print:py-1">Kelas</th>
                                    <th className="px-2 py-2 text-sm font-semibold border border-black w-[20%] print:py-1">Status Kehadiran</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceList.map(({ student, isPresent }, index) => (
                                    <tr key={student.nis}>
                                        <td className="px-2 py-2 text-center border border-black print:py-1.5">{index + 1}</td>
                                        <td className="px-2 py-2 border border-black print:py-1.5">{student.nis}</td>
                                        <td className="px-2 py-2 border border-black print:py-1.5">{student.name}</td>
                                        <td className="px-2 py-2 text-center border border-black print:py-1.5">{student.class}</td>
                                        <td className="px-2 py-2 text-center border border-black print:py-1.5">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isPresent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {isPresent ? 'Hadir' : 'Tidak Hadir'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </main>
                </div>
            )}
        </div>
    );
};

export default StudentAttendance;
