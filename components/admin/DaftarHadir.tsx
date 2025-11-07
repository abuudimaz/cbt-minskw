import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { apiGetStudents } from '../../services/api';
import Card from '../shared/Card';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import Input from '../shared/Input';
import { KemenagLogo } from '../../constants';

const DaftarHadir: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [paperSize, setPaperSize] = useState<'a4' | 'f4'>('a4');
    const [formData, setFormData] = useState({
        ujian: '',
        ruang: 'RUANG 1',
        hari: '',
        tanggal: new Date().toISOString().split('T')[0],
        sesi: '1',
        pengawas: '',
    });

    useEffect(() => {
        const fetchStudents = async () => {
            setIsLoading(true);
            try {
                const data = await apiGetStudents();
                // Sort students by name for a consistent list
                setStudents(data.sort((a, b) => a.name.localeCompare(b.name)));
            } catch (err) {
                console.error("Failed to fetch students", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudents();
    }, []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return <LoadingSpinner text="Memuat daftar siswa..." />;
    }

    return (
        <div>
            {/* --- FORM INPUT (NO-PRINT) --- */}
            <Card title="Data Daftar Hadir Peserta" className="no-print mb-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Mata Ujian" name="ujian" value={formData.ujian} onChange={handleInputChange} placeholder="Asesmen Numerasi Paket 1" />
                    <Input label="Ruang" name="ruang" value={formData.ruang} onChange={handleInputChange} />
                    <Input label="Hari" name="hari" value={formData.hari} onChange={handleInputChange} placeholder="Selasa" />
                    <Input label="Tanggal" name="tanggal" type="date" value={formData.tanggal} onChange={handleInputChange} />
                    <Input label="Sesi" name="sesi" value={formData.sesi} onChange={handleInputChange} />
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

            {/* --- PRINTABLE DOCUMENT --- */}
            <div className={`printable-content bg-white p-8 shadow-lg ${paperSize === 'a4' ? 'page-a4' : 'page-f4'}`}>
                {/* KOP SURAT */}
                <header className="text-center border-b-4 border-black pb-2">
                    <div className="flex items-center justify-center">
                        <KemenagLogo className="h-20 w-20 mr-4" />
                        <div>
                            <p className="text-lg font-semibold">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
                            <p className="text-lg font-semibold">KANTOR KEMENTERIAN AGAMA KOTA SINGKAWANG</p>
                            <p className="text-2xl font-bold">MADRASAH IBTIDAIYAH NEGERI SINGKAWANG</p>
                            <p className="text-sm">Jl. Marhaban, RT 55/RW 09, Kelurahan Sedau, Kec. Singkawang Selatan, Kota Singkawang</p>
                        </div>
                    </div>
                </header>
                
                {/* JUDUL & DETAIL */}
                <section className="text-center mt-8">
                    <p className="font-bold underline text-lg">DAFTAR HADIR PESERTA</p>
                    <p className="font-bold uppercase text-lg">ASESMEN MADRASAH BERBASIS KOMPUTER (AMBK)</p>
                </section>
                <table className="w-full mt-6 text-sm">
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
                
                {/* TABLE DAFTAR HADIR */}
                <main className="mt-6">
                    <table className="w-full border-collapse border border-black">
                        <thead className="bg-gray-200 text-center">
                            <tr>
                                <th className="px-2 py-2 text-sm font-semibold border border-black w-[5%]">No.</th>
                                <th className="px-2 py-2 text-sm font-semibold border border-black w-[15%]">NIS</th>
                                <th className="px-2 py-2 text-sm font-semibold border border-black">Nama Siswa</th>
                                <th className="px-2 py-2 text-sm font-semibold border border-black w-[30%]">Tanda Tangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student.nis}>
                                    <td className="px-2 py-3 text-center border border-black">{index + 1}</td>
                                    <td className="px-2 py-3 border border-black">{student.nis}</td>
                                    <td className="px-2 py-3 border border-black">{student.name}</td>
                                    <td className="px-2 py-3 border border-black">
                                        <span className="inline-block w-1/2">{index % 2 === 0 ? `${index + 1}.` : ''}</span>
                                        <span className="inline-block w-1/2 text-right">{index % 2 !== 0 ? `${index + 1}.` : ''}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>

                {/* TANDA TANGAN */}
                <footer className="mt-8 flex justify-end">
                    <div className="text-center w-1/3">
                        <p>Singkawang, {new Date(formData.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p>Pengawas,</p>
                        <div className="h-24"></div>
                        <p className="font-bold underline">{formData.pengawas || '(______________________)'}</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DaftarHadir;