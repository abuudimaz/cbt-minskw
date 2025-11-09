import React, { useState, useEffect, useMemo } from 'react';
import { Student, ExamSettings, Exam } from '../../types';
import { apiGetStudents, apiGetExamSettings, apiGetExams } from '../../services/api';
import Card from '../shared/Card';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import Input from '../shared/Input';
import { KemenagLogo } from '../../constants';
import { toastError } from '../../utils/helpers';

const DaftarHadir: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [globalSettings, setGlobalSettings] = useState<ExamSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [paperSize, setPaperSize] = useState<'a4' | 'f4'>('a4');
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const [formData, setFormData] = useState({
        ujian: '',
        ruang: '',
        hari: '',
        tanggal: new Date().toISOString().split('T')[0],
        sesi: '1',
        pengawas: '',
    });
    
    const uniqueRooms = useMemo(() => {
        return [...new Set(students.map(s => s.room))].sort();
    }, [students]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [studentsData, settingsData, examsData] = await Promise.all([
                    apiGetStudents(),
                    apiGetExamSettings(),
                    apiGetExams()
                ]);
                setStudents(studentsData.sort((a, b) => a.name.localeCompare(b.name)));
                setGlobalSettings(settingsData);
                setExams(examsData);
                
                const rooms = [...new Set(studentsData.map(s => s.room))].sort();
                if (rooms.length > 0) {
                    setFormData(prev => ({ ...prev, ruang: rooms[0] }));
                }

            } catch (err) {
                toastError("Gagal memuat data.");
                console.error("Failed to fetch data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    
    useEffect(() => {
        const selectedExam = exams.find(e => e.id === selectedExamId);
        if (selectedExam) {
            setFormData(prev => ({
                ...prev,
                ujian: selectedExam.name,
                tanggal: selectedExam.startTime ? new Date(selectedExam.startTime).toISOString().split('T')[0] : prev.tanggal,
            }));
        }
    }, [selectedExamId, exams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePrint = () => {
        const styleId = 'printable-page-style';
        const oldStyle = document.getElementById(styleId);
        if (oldStyle) oldStyle.remove();

        const style = document.createElement('style');
        style.id = styleId;
        const pageStyle = paperSize === 'f4' ? 'size: 21.5cm 33cm; margin: 2cm;' : 'size: A4 portrait; margin: 2cm;';
        style.innerHTML = `@media print { @page { ${pageStyle} } }`;
        document.head.appendChild(style);
        window.print();
    };

    const filteredStudents = useMemo(() => {
        return students.filter(student => student.room === formData.ruang);
    }, [students, formData.ruang]);

    if (isLoading) {
        return <LoadingSpinner text="Memuat daftar siswa..." />;
    }

    return (
        <div>
            <Card title="Data Daftar Hadir Peserta" className="no-print mb-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="exam-select-hadir" className="block text-sm font-medium text-gray-700 mb-1">Pilih Ujian</label>
                        <select
                            id="exam-select-hadir"
                            value={selectedExamId}
                            onChange={e => setSelectedExamId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="">-- Pilih Ujian --</option>
                            {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
                        </select>
                    </div>
                    <Input label="Mata Ujian" name="ujian" value={formData.ujian} onChange={handleInputChange} placeholder="Terisi otomatis setelah memilih ujian" />
                    <div>
                         <label htmlFor="ruang" className="block text-sm font-medium text-gray-700 mb-1">Ruang</label>
                         <select id="ruang" name="ruang" value={formData.ruang} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            {uniqueRooms.map(room => <option key={room} value={room}>{room}</option>)}
                         </select>
                    </div>
                    <Input label="Sesi" name="sesi" value={formData.sesi} onChange={handleInputChange} />
                    <Input label="Hari" name="hari" value={formData.hari} onChange={handleInputChange} placeholder="Selasa" />
                    <Input label="Tanggal" name="tanggal" type="date" value={formData.tanggal} onChange={handleInputChange} />
                    <Input label="Nama Pengawas" name="pengawas" value={formData.pengawas} onChange={handleInputChange} />
                </div>
                <div className="mt-6 flex items-center justify-end gap-4">
                     <div>
                        <label htmlFor="paperSize" className="block text-sm font-medium text-gray-700 mb-1">Ukuran Kertas</label>
                        <select id="paperSize" value={paperSize} onChange={(e) => setPaperSize(e.target.value as 'a4' | 'f4')} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value="a4">A4</option>
                            <option value="f4">F4</option>
                        </select>
                    </div>
                    <Button onClick={handlePrint} className="self-end">Cetak Daftar Hadir</Button>
                </div>
            </Card>

            <div className="printable-content bg-white p-8 shadow-lg text-black print:p-0 print:shadow-none print:text-sm">
                <header className="text-center border-b-4 border-black pb-2">
                    <div className="flex items-center justify-center">
                        <KemenagLogo className="h-20 w-20 mr-4 print:h-16 print:w-16" />
                        <div>
                            <p className="text-lg font-semibold print:text-base">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
                            <p className="text-lg font-semibold print:text-base">KANTOR KEMENTERIAN AGAMA KOTA SINGKAWANG</p>
                            <p className="text-2xl font-bold print:text-xl">MADRASAH IBTIDAIYAH NEGERI SINGKAWANG</p>
                            <p className="text-sm print:text-xs">Jl. Marhaban, RT 55/RW 09, Kelurahan Sedau, Kec. Singkawang Selatan, Kota Singkawang</p>
                        </div>
                    </div>
                </header>
                
                <section className="text-center mt-8 print:mt-6">
                    <p className="font-bold underline text-lg print:text-base">DAFTAR HADIR PESERTA</p>
                    <p className="font-bold uppercase text-lg print:text-base">{globalSettings?.assessmentTitle || '...'}</p>
                </section>
                <table className="w-full mt-6 text-sm print:mt-4">
                    <tbody>
                        <tr>
                            <td className="w-1/4 py-1"><strong>Mata Ujian</strong></td>
                            <td>: {formData.ujian || '[..................................................]'}</td>
                            <td className="w-1/4 pl-8 py-1"><strong>Ruang</strong></td>
                            <td>: {formData.ruang}</td>
                        </tr>
                        <tr>
                            <td className="py-1"><strong>Hari/Tanggal</strong></td>
                            <td>: {formData.hari ? `${formData.hari}, ` : ''}{new Date(formData.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                            <td className="pl-8 py-1"><strong>Sesi</strong></td>
                            <td>: {formData.sesi}</td>
                        </tr>
                    </tbody>
                </table>
                
                <main className="mt-6 text-black print:mt-4">
                    <table className="w-full border-collapse border border-black">
                        <thead className="bg-gray-200 text-center">
                            <tr>
                                <th className="px-2 py-2 text-sm font-semibold border border-black w-[5%] print:py-1">No.</th>
                                <th className="px-2 py-2 text-sm font-semibold border border-black w-[15%] print:py-1">NIS</th>
                                <th className="px-2 py-2 text-sm font-semibold border border-black print:py-1">Nama Siswa</th>
                                <th className="px-2 py-2 text-sm font-semibold border border-black w-[30%] print:py-1">Tanda Tangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, index) => (
                                <tr key={student.nis}>
                                    <td className="px-2 py-3 text-center border border-black print:py-1.5">{index + 1}</td>
                                    <td className="px-2 py-3 border border-black print:py-1.5">{student.nis}</td>
                                    <td className="px-2 py-3 border border-black print:py-1.5">{student.name}</td>
                                    <td className="px-2 py-3 border border-black print:py-1.5">
                                        <span className="inline-block w-1/2">{index % 2 === 0 ? `${index + 1}.` : ''}</span>
                                        <span className="inline-block w-1/2 text-right">{index % 2 !== 0 ? `${index + 1}.` : ''}</span>
                                    </td>
                                </tr>
                            ))}
                             {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 border border-black">Tidak ada siswa di ruang ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </main>

                <footer className="mt-8 flex justify-end print:mt-4">
                    <div className="text-center w-1/3">
                        <p>Singkawang, {new Date(formData.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p>Pengawas,</p>
                        <div className="h-24 print:h-16"></div>
                        <p className="font-bold underline">{formData.pengawas || '(______________________)'}</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DaftarHadir;
