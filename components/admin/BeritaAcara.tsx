import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Input from '../shared/Input';
import { KemenagLogo } from '../../constants';
import { apiGetExamSettings } from '../../services/api';
import { ExamSettings } from '../../types';
import LoadingSpinner from '../shared/LoadingSpinner';

const BeritaAcara: React.FC = () => {
    const [globalSettings, setGlobalSettings] = useState<ExamSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        hari: '',
        tanggal: new Date().toISOString().split('T')[0],
        ujian: '',
        waktuMulai: '07:30',
        waktuSelesai: '09:30',
        ruang: 'RUANG 1',
        sesi: '1',
        totalPeserta: 0,
        hadir: 0,
        catatan: 'Pelaksanaan asesmen berjalan dengan lancar dan tertib. Tidak ada kendala teknis yang berarti.',
        pengawas: '',
    });
    const [paperSize, setPaperSize] = useState<'a4' | 'f4'>('a4');
    
    useEffect(() => {
        apiGetExamSettings().then(settings => {
            setGlobalSettings(settings);
            setIsLoading(false);
        });
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value,
        }));
    };
    
    const handlePrint = () => {
        const styleId = 'printable-page-style';
        
        // Remove any old style tag first to avoid conflicts if user changes paper size
        const oldStyle = document.getElementById(styleId);
        if (oldStyle) {
            oldStyle.remove();
        }

        // Create the new style tag
        const style = document.createElement('style');
        style.id = styleId;
        
        // Define the @page rule based on the selected paper size
        const pageStyle = paperSize === 'f4' 
            ? 'size: 21.5cm 33cm; margin: 2cm;' 
            : 'size: A4 portrait; margin: 2cm;';
            
        style.innerHTML = `@media print { @page { ${pageStyle} } }`;

        // Add the new style to the document's head
        document.head.appendChild(style);
        
        // Trigger the browser's print dialog. The style is not removed prematurely.
        window.print();
    };

    if (isLoading) {
        return <LoadingSpinner text="Memuat pengaturan..." />;
    }

    const tidakHadir = formData.totalPeserta - formData.hadir;

    return (
        <div>
            {/* --- FORM INPUT (HIDDEN ON PRINT) --- */}
            <Card title="Data Berita Acara Pelaksanaan" className="no-print mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Hari" name="hari" value={formData.hari} onChange={handleInputChange} placeholder="Senin" />
                    <Input label="Tanggal" name="tanggal" type="date" value={formData.tanggal} onChange={handleInputChange} />
                    <Input label="Nama Ujian/Asesmen" name="ujian" value={formData.ujian} onChange={handleInputChange} placeholder="Asesmen Literasi Paket 1" />
                    <Input label="Ruang" name="ruang" value={formData.ruang} onChange={handleInputChange} />
                    <Input label="Sesi" name="sesi" value={formData.sesi} onChange={handleInputChange} />
                    <div className="flex gap-4">
                        <Input label="Waktu Mulai" name="waktuMulai" type="time" value={formData.waktuMulai} onChange={handleInputChange} />
                        <Input label="Waktu Selesai" name="waktuSelesai" type="time" value={formData.waktuSelesai} onChange={handleInputChange} />
                    </div>
                    <div className="flex gap-4">
                        <Input label="Total Peserta" name="totalPeserta" type="number" value={formData.totalPeserta} onChange={handleInputChange} />
                        <Input label="Jumlah Hadir" name="hadir" type="number" value={formData.hadir} onChange={handleInputChange} />
                        <Input label="Tidak Hadir" name="tidakHadir" type="number" value={tidakHadir} readOnly disabled className="bg-gray-100" />
                    </div>
                     <div>
                        <label htmlFor="catatan" className="block text-sm font-medium text-gray-700 mb-1">Catatan Selama Pelaksanaan</label>
                        <textarea id="catatan" name="catatan" rows={4} value={formData.catatan} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <Input label="Nama Pengawas" name="pengawas" value={formData.pengawas} onChange={handleInputChange} placeholder="Nama Lengkap Pengawas" />
                </div>
                 <div className="mt-6 flex items-center justify-end gap-4">
                     <div>
                        <label htmlFor="paperSize" className="block text-sm font-medium text-gray-700 mb-1">Ukuran Kertas</label>
                        <select id="paperSize" value={paperSize} onChange={(e) => setPaperSize(e.target.value as 'a4' | 'f4')} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value="a4">A4</option>
                            <option value="f4">F4</option>
                        </select>
                    </div>
                    <Button onClick={handlePrint} className="self-end">Cetak Berita Acara</Button>
                </div>
            </Card>

            {/* --- PRINTABLE DOCUMENT --- */}
            <div className="printable-content bg-white p-8 shadow-lg text-black print:p-0 print:shadow-none print:text-sm">
                {/* KOP SURAT */}
                <header className="border-b-4 border-black pb-2 w-full">
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="w-[15%] text-center align-middle">
                                    <KemenagLogo className="h-20 w-auto inline-block print:h-16" />
                                </td>
                                <td className="w-[85%] text-center align-middle">
                                    <p className="text-lg font-semibold leading-tight print:text-base">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
                                    <p className="text-lg font-semibold leading-tight print:text-base">KANTOR KEMENTERIAN AGAMA KOTA SINGKAWANG</p>
                                    <p className="text-2xl font-bold leading-tight print:text-xl">MADRASAH IBTIDAIYAH NEGERI SINGKAWANG</p>
                                    <p className="text-sm leading-tight print:text-xs">Jl. Marhaban, RT 55/RW 09, Kelurahan Sedau, Kec. Singkawang Selatan, Kota Singkawang</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </header>

                {/* JUDUL */}
                <section className="text-center mt-8 print:mt-6">
                    <p className="font-bold underline text-lg print:text-base">BERITA ACARA PELAKSANAAN</p>
                    <p className="font-bold uppercase text-lg print:text-base">{globalSettings?.assessmentTitle || '...'}</p>
                    <p className="font-bold uppercase text-lg print:text-base">TAHUN PELAJARAN {globalSettings?.academicYear}</p>
                </section>

                {/* ISI */}
                <main className="mt-8 text-justify leading-relaxed print:mt-4 print:leading-normal">
                    <p>Pada hari ini, {formData.hari || '[Hari]'}, tanggal {new Date(formData.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, telah diselenggarakan Asesmen Madrasah Berbasis Komputer untuk mata ujian <strong>{formData.ujian || '[Nama Ujian]'}</strong> dari pukul {formData.waktuMulai} sampai dengan pukul {formData.waktuSelesai} WIB.</p>
                    
                    <table className="mt-4 print:mt-2 w-full">
                        <tbody>
                            <tr><td className="pr-4 py-1 w-1/4">Lokasi</td><td>: MIN SINGKAWANG</td></tr>
                            <tr><td className="pr-4 py-1">Ruang</td><td>: {formData.ruang}</td></tr>
                            <tr><td className="pr-4 py-1">Sesi</td><td>: {formData.sesi}</td></tr>
                        </tbody>
                    </table>

                    <p className="mt-4 print:mt-2">Jumlah Peserta:</p>
                    <table className="ml-8">
                        <tbody>
                            <tr><td className="pr-4 py-1 w-1/4">Total Peserta</td><td>: {formData.totalPeserta} siswa</td></tr>
                            <tr><td className="pr-4 py-1">Hadir</td><td>: {formData.hadir} siswa</td></tr>
                            <tr><td className="pr-4 py-1">Tidak Hadir</td><td>: {tidakHadir} siswa</td></tr>
                        </tbody>
                    </table>

                    <p className="mt-4 print:mt-2">Catatan Selama Pelaksanaan:</p>
                    <p className="border p-2 min-h-[5rem] mt-1 print:min-h-[3rem]">{formData.catatan}</p>

                    <p className="mt-6 print:mt-4">Demikian berita acara ini dibuat dengan sesungguhnya untuk dapat dipergunakan sebagaimana mestinya.</p>
                </main>

                {/* TANDA TANGAN */}
                <footer className="mt-12 print:mt-6">
                     <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="w-1/2 text-center">
                                    <p>Proktor,</p>
                                    <div className="h-24 print:h-16"></div>
                                    <p className="font-bold underline">{globalSettings?.proctorName || '(______________________)'}</p>
                                </td>
                                <td className="w-1/2 text-center">
                                    <p>Pengawas,</p>
                                    <div className="h-24 print:h-16"></div>
                                    <p className="font-bold underline">{formData.pengawas || '(______________________)'}</p>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="text-center pt-12 print:pt-6">
                                     <p>Mengetahui,</p>
                                     <p>Kepala MIN Singkawang</p>
                                     <div className="h-24 print:h-16"></div>
                                     <p className="font-bold underline">{globalSettings?.headmasterName}</p>
                                     <p>NIP. {globalSettings?.headmasterNip}</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </footer>

            </div>
        </div>
    );
};

export default BeritaAcara;