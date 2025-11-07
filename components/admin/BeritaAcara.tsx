import React, { useState, useEffect } from 'react';
import { Exam } from '../../types';
import { apiGetExams } from '../../services/api';
import Card from '../shared/Card';
import Input from '../shared/Input';
import Button from '../shared/Button';

const BeritaAcara: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [selectedExamName, setSelectedExamName] = useState('');
    const [formData, setFormData] = useState({
        hariTanggal: new Date().toISOString().split('T')[0],
        sesi: '1',
        waktu: '07:30 - 09:30',
        ruang: '1',
        jmlPeserta: '',
        jmlHadir: '',
        jmlTidakHadir: '',
        pesertaTidakHadir: '',
        catatan: '',
        proktorNama: '',
        proktorNip: '',
        pengawasNama: '',
        pengawasNip: '',
        kepsekNama: '',
        kepsekNip: '',
    });
    const [paperSize, setPaperSize] = useState<'a4' | 'f4'>('a4');

    useEffect(() => {
        const fetchExams = async () => {
            const examData = await apiGetExams();
            setExams(examData);
            if (examData.length > 0) {
                setSelectedExamName(examData[0].name);
            }
        };
        fetchExams();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePrint = () => {
        const printContent = `
            <html>
            <head>
                <title>Berita Acara Pelaksanaan ANBK</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { font-family: 'Times New Roman', serif; font-size: 12pt; }
                    .header-table, .content-table { width: 100%; border-collapse: collapse; }
                    .header-table td { padding: 5px; vertical-align: middle; }
                    .content-table td { padding: 4px 8px; vertical-align: top; }
                    .kop-surat { text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px; }
                    .kop-surat h3, .kop-surat h4 { margin: 0; }
                    .signature-section { margin-top: 50px; }
                    .signature-box { display: inline-block; width: 45%; text-align: center; }
                    .signature-box .name { margin-top: 60px; text-decoration: underline; font-weight: bold; }
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
                    <h3 class="text-lg font-bold underline">BERITA ACARA PELAKSANAAN</h3>
                    <p>ASESMEN NASIONAL BERBASIS KOMPUTER (ANBK)</p>
                    <p>TAHUN PELAJARAN 2023/2024</p>
                </div>

                <p>Pada hari ini, ${new Date(formData.hariTanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, telah dilaksanakan Asesmen Nasional Berbasis Komputer (ANBK) untuk mata pelajaran/asesmen:</p>
                
                <table class="content-table my-4">
                    <tr><td style="width: 200px;">Mata Pelajaran</td><td>: ${selectedExamName}</td></tr>
                    <tr><td>Sesi</td><td>: ${formData.sesi}</td></tr>
                    <tr><td>Waktu</td><td>: ${formData.waktu}</td></tr>
                    <tr><td>Ruang</td><td>: ${formData.ruang}</td></tr>
                    <tr><td>Jumlah Peserta Seharusnya</td><td>: ${formData.jmlPeserta} orang</td></tr>
                    <tr><td>Jumlah Peserta Hadir</td><td>: ${formData.jmlHadir} orang</td></tr>
                    <tr><td>Jumlah Peserta Tidak Hadir</td><td>: ${formData.jmlTidakHadir} orang</td></tr>
                    <tr><td style="vertical-align: top;">Nama Peserta Tidak Hadir</td><td>: ${formData.pesertaTidakHadir.replace(/\n/g, '<br/>') || '-'}</td></tr>
                </table>

                <p class="mt-4">Catatan selama pelaksanaan ANBK:</p>
                <div class="border p-2 min-h-[80px]">${formData.catatan.replace(/\n/g, '<br/>') || '-'}</div>

                <div class="signature-section flex justify-between mt-12">
                     <div class="signature-box text-center">
                        <p>Proktor,</p>
                        <div class="h-20"></div>
                        <p class="name">${formData.proktorNama || '..............................'}</p>
                        <p>NIP. ${formData.proktorNip || '-'}</p>
                    </div>
                    <div class="signature-box text-center">
                        <p>Pengawas,</p>
                        <div class="h-20"></div>
                        <p class="name">${formData.pengawasNama || '..............................'}</p>
                        <p>NIP. ${formData.pengawasNip || '-'}</p>
                    </div>
                </div>

                 <div class="flex justify-center mt-12">
                     <div class="signature-box text-center">
                        <p>Mengetahui,</p>
                        <p>Kepala MIN Singkawang</p>
                        <div class="h-20"></div>
                        <p class="name">${formData.kepsekNama || '..............................'}</p>
                        <p>NIP. ${formData.kepsekNip || '-'}</p>
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
    

    return (
        <Card title="Cetak Berita Acara Pelaksanaan">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Left Column */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Informasi Sesi</h3>
                    <div>
                        <label htmlFor="exam" className="block text-sm font-medium text-gray-700 mb-1">Pilih Ujian</label>
                        <select id="exam" value={selectedExamName} onChange={e => setSelectedExamName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            {exams.map(exam => <option key={exam.id} value={exam.name}>{exam.name}</option>)}
                        </select>
                    </div>
                    <Input label="Hari / Tanggal" name="hariTanggal" type="date" value={formData.hariTanggal} onChange={handleChange} />
                    <Input label="Sesi" name="sesi" value={formData.sesi} onChange={handleChange} />
                    <Input label="Waktu Pelaksanaan" name="waktu" value={formData.waktu} onChange={handleChange} placeholder="Contoh: 07:30 - 09:30"/>
                    <Input label="Ruang" name="ruang" value={formData.ruang} onChange={handleChange} />

                    <h3 className="font-semibold text-lg border-b pb-2 pt-4">Kehadiran Peserta</h3>
                    <Input label="Jumlah Peserta Seharusnya" name="jmlPeserta" type="number" value={formData.jmlPeserta} onChange={handleChange} />
                    <Input label="Jumlah Hadir" name="jmlHadir" type="number" value={formData.jmlHadir} onChange={handleChange} />
                    <Input label="Jumlah Tidak Hadir" name="jmlTidakHadir" type="number" value={formData.jmlTidakHadir} onChange={handleChange} />
                    <div>
                        <label htmlFor="pesertaTidakHadir" className="block text-sm font-medium text-gray-700 mb-1">Nama Peserta Tidak Hadir (jika ada)</label>
                        <textarea name="pesertaTidakHadir" id="pesertaTidakHadir" rows={3} value={formData.pesertaTidakHadir} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Satu nama per baris"></textarea>
                    </div>
                     <div>
                        <label htmlFor="catatan" className="block text-sm font-medium text-gray-700 mb-1">Catatan Selama Pelaksanaan</label>
                        <textarea name="catatan" id="catatan" rows={4} value={formData.catatan} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Penanggung Jawab</h3>
                    <Input label="Nama Proktor" name="proktorNama" value={formData.proktorNama} onChange={handleChange} />
                    <Input label="NIP Proktor" name="proktorNip" value={formData.proktorNip} onChange={handleChange} />
                    <Input label="Nama Pengawas" name="pengawasNama" value={formData.pengawasNama} onChange={handleChange} />
                    <Input label="NIP Pengawas" name="pengawasNip" value={formData.pengawasNip} onChange={handleChange} />
                    <Input label="Nama Kepala Sekolah" name="kepsekNama" value={formData.kepsekNama} onChange={handleChange} />
                    <Input label="NIP Kepala Sekolah" name="kepsekNip" value={formData.kepsekNip} onChange={handleChange} />
                    
                    <div className="pt-6">
                         <h3 className="font-semibold text-lg border-b pb-2">Opsi Cetak</h3>
                         <div className="flex items-center space-x-4 mt-2">
                            <label className="block text-sm font-medium text-gray-700">Ukuran Kertas:</label>
                            <div className="flex items-center">
                                <input type="radio" id="a4" name="paperSize" value="a4" checked={paperSize === 'a4'} onChange={() => setPaperSize('a4')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"/>
                                <label htmlFor="a4" className="ml-2 block text-sm text-gray-900">A4</label>
                            </div>
                             <div className="flex items-center">
                                <input type="radio" id="f4" name="paperSize" value="f4" checked={paperSize === 'f4'} onChange={() => setPaperSize('f4')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"/>
                                <label htmlFor="f4" className="ml-2 block text-sm text-gray-900">F4</label>
                            </div>
                         </div>
                         <div className="mt-6 text-right">
                             <Button onClick={handlePrint}>Cetak Berita Acara</Button>
                         </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default BeritaAcara;