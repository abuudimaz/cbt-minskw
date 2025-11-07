import React, { useState, useEffect, useMemo } from 'react';
import { Exam, Student } from '../../types';
import { apiGetExams, apiGetStudents } from '../../services/api';
import Card from '../shared/Card';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';

const DaftarHadir: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [filterType, setFilterType] = useState<'class' | 'room'>('class');
    const [filterValue, setFilterValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [paperSize, setPaperSize] = useState<'a4' | 'f4'>('a4');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examData, studentData] = await Promise.all([apiGetExams(), apiGetStudents()]);
                setExams(examData);
                setStudents(studentData);
                if (examData.length > 0) {
                    setSelectedExamId(examData[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const uniqueClasses = useMemo(() => [...new Set(students.map(s => s.class))].sort(), [students]);
    const uniqueRooms = useMemo(() => [...new Set(students.map(s => s.room))].sort(), [students]);

    useEffect(() => {
        if (filterType === 'class' && uniqueClasses.length > 0) {
            setFilterValue(uniqueClasses[0]);
        } else if (filterType === 'room' && uniqueRooms.length > 0) {
            setFilterValue(uniqueRooms[0]);
        }
    }, [filterType, uniqueClasses, uniqueRooms]);

    const filteredStudents = useMemo(() => {
        if (!filterValue) return [];
        return students.filter(student => student[filterType] === filterValue);
    }, [students, filterType, filterValue]);

    const handlePrint = () => {
        const selectedExam = exams.find(e => e.id === selectedExamId);
        if (!selectedExam) return;
        
        const printContent = `
            <html>
            <head>
                <title>Daftar Hadir Peserta</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { font-family: 'Times New Roman', serif; font-size: 11pt; }
                    .header-table, .content-table { width: 100%; border-collapse: collapse; }
                    .content-table th, .content-table td { border: 1px solid black; padding: 6px; }
                    .content-table th { text-align: center; }
                    .kop-surat { text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px; }
                    .kop-surat h3, .kop-surat h4 { margin: 0; }
                    .signature-section { margin-top: 40px; }
                    .signature-box { display: inline-block; width: 45%; text-align: center; }
                </style>
            </head>
            <body class="p-4 ${paperSize === 'a4' ? 'a4-portrait' : 'f4-portrait'}">
                <div class="kop-surat">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Kementerian_Agama_new_logo.png/535px-Kementerian_Agama_new_logo.png" alt="Logo" class="h-20 mx-auto mb-2"/>
                    <h3 class="font-bold text-xl">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
                    <h4 class="font-bold text-lg">KANTOR KEMENTERIAN AGAMA KOTA SINGKAWANG</h4>
                    <h4 class="font-bold text-lg">MADRASAH IBTIDAIYAH NEGERI SINGKAWANG</h4>
                    <p class="text-sm">Jl. Marhaban, RT 55/RW 09, Kelurahan Sedau, Kec. Singkawang Selatan, Kota Singkawang</p>
                </div>

                <div class="text-center my-6">
                    <h3 class="text-lg font-bold underline">DAFTAR HADIR PESERTA</h3>
                    <p>ASESMEN NASIONAL BERBASIS KOMPUTER (ANBK)</p>
                </div>
                
                <table class="my-4 text-sm">
                    <tr><td class="pr-4">Mata Pelajaran</td><td>: ${selectedExam.name}</td></tr>
                    <tr><td>${filterType === 'class' ? 'Kelas' : 'Ruang'}</td><td>: ${filterValue}</td></tr>
                    <tr><td>Hari, Tanggal</td><td>: ...............................................</td></tr>
                </table>

                <table class="content-table my-4">
                    <thead>
                        <tr>
                            <th style="width: 5%;">No.</th>
                            <th style="width: 15%;">NIS</th>
                            <th>Nama Siswa</th>
                            <th style="width: 15%;">Kelas</th>
                            <th style="width: 25%;">Tanda Tangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredStudents.map((student, index) => `
                            <tr>
                                <td class="text-center">${index + 1}</td>
                                <td class="text-center">${student.nis}</td>
                                <td>${student.name}</td>
                                <td class="text-center">${student.class}</td>
                                <td class="p-2">${index % 2 === 0 ? `${index + 1}. ...............` : `&nbsp;`}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                 <div class="signature-section flex justify-between mt-12">
                     <div class="signature-box text-center">
                        <p>Proktor,</p>
                        <div class="h-20"></div>
                        <p class="name underline font-bold">..............................</p>
                        <p>NIP. -</p>
                    </div>
                    <div class="signature-box text-center">
                        <p>Pengawas,</p>
                        <div class="h-20"></div>
                        <p class="name underline font-bold">..............................</p>
                        <p>NIP. -</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 500);
        }
    };

    if (isLoading) return <LoadingSpinner text="Memuat data..." />;

    const filterOptions = filterType === 'class' ? uniqueClasses : uniqueRooms;

    return (
        <Card title="Cetak Daftar Hadir Peserta">
            <div className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-gray-50">
                     <div>
                        <label htmlFor="exam" className="block text-sm font-medium text-gray-700 mb-1">Pilih Ujian</label>
                        <select id="exam" value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-1">Filter Berdasarkan</label>
                        <select id="filterType" value={filterType} onChange={e => setFilterType(e.target.value as 'class' | 'room')} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="class">Kelas</option>
                            <option value="room">Ruang</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="filterValue" className="block text-sm font-medium text-gray-700 mb-1">{filterType === 'class' ? 'Pilih Kelas' : 'Pilih Ruang'}</label>
                        <select id="filterValue" value={filterValue} onChange={e => setFilterValue(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                             {filterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                {/* Print Options */}
                <div className="flex justify-end items-center space-x-4 p-4">
                    <div className="flex items-center space-x-4">
                        <label className="block text-sm font-medium text-gray-700">Ukuran Kertas:</label>
                        <div className="flex items-center">
                            <input type="radio" id="a4-hadir" name="paperSize-hadir" value="a4" checked={paperSize === 'a4'} onChange={() => setPaperSize('a4')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"/>
                            <label htmlFor="a4-hadir" className="ml-2 block text-sm text-gray-900">A4</label>
                        </div>
                         <div className="flex items-center">
                            <input type="radio" id="f4-hadir" name="paperSize-hadir" value="f4" checked={paperSize === 'f4'} onChange={() => setPaperSize('f4')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"/>
                            <label htmlFor="f4-hadir" className="ml-2 block text-sm text-gray-900">F4</label>
                        </div>
                    </div>
                    <Button onClick={handlePrint} disabled={filteredStudents.length === 0}>
                        Cetak Daftar Hadir
                    </Button>
                </div>

                {/* Preview Table */}
                <div className="overflow-x-auto">
                    <h3 className="font-semibold text-lg mb-2">Preview Daftar Hadir ({filteredStudents.length} siswa)</h3>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruang</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStudents.map((student, index) => (
                                <tr key={student.nis}>
                                    <td className="px-6 py-4">{index + 1}</td>
                                    <td className="px-6 py-4">{student.nis}</td>
                                    <td className="px-6 py-4">{student.name}</td>
                                    <td className="px-6 py-4">{student.class}</td>
                                    <td className="px-6 py-4">{student.room}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredStudents.length === 0 && (
                        <p className="text-center py-4 text-gray-500">Tidak ada siswa yang cocok dengan filter yang dipilih.</p>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default DaftarHadir;