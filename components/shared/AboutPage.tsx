import React from 'react';
import Card from './Card';
import { KemenagLogo, APP_TITLE } from '../../constants';

const FeatureItem: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
);

const AboutPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <div className="text-center">
                    <KemenagLogo className="h-20 w-auto mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900">{APP_TITLE}</h1>
                    <p className="mt-2 text-lg text-gray-600">Aplikasi Simulasi Asesmen Nasional Berbasis Komputer (ANBK)</p>
                </div>

                <div className="mt-8 text-left space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Tentang Aplikasi</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Aplikasi ini adalah sebuah kloning dari platform Asesmen Nasional Berbasis Komputer (ANBK) yang dirancang khusus untuk lingkungan Madrasah Ibtidaiyah Negeri (MIN) Singkawang. Tujuannya adalah untuk menyediakan sarana latihan dan simulasi bagi siswa agar terbiasa dengan format dan antarmuka ujian berbasis komputer, serta mempermudah guru dan proktor dalam mengelola data siswa, soal, dan pelaksanaan asesmen.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Fitur Utama</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FeatureItem 
                                title="Manajemen Siswa"
                                description="Admin dapat menambah, mengedit, menghapus, dan mengimpor data siswa dari file Excel (.xlsx)."
                            />
                             <FeatureItem 
                                title="Manajemen Ujian & Soal"
                                description="Membuat dan mengelola ujian dengan berbagai tipe soal, termasuk Pilihan Ganda, PG Kompleks, Menjodohkan, dan Isian Singkat."
                            />
                             <FeatureItem 
                                title="Impor Soal"
                                description="Mempercepat pembuatan bank soal dengan mengimpor puluhan soal sekaligus dari template Excel."
                            />
                             <FeatureItem 
                                title="Antarmuka Ujian Realistis"
                                description="Siswa mengerjakan ujian dalam antarmuka yang dirancang semirip mungkin dengan ANBK asli, lengkap dengan timer dan navigasi soal."
                            />
                              <FeatureItem 
                                title="Monitoring Real-time"
                                description="Proktor dapat memantau status setiap siswa secara langsung, apakah 'Belum Mulai', 'Mengerjakan', atau 'Selesai'."
                            />
                             <FeatureItem 
                                title="Rekapitulasi & Detail Hasil"
                                description="Melihat rekap nilai, mengekspor hasil ke CSV, dan meninjau detail jawaban per siswa untuk analisis atau koreksi manual."
                            />
                             <FeatureItem 
                                title="Cetak Dokumen Administrasi"
                                description="Menghasilkan dokumen penting seperti Daftar Hadir dan Berita Acara Pelaksanaan secara otomatis dengan data yang telah diisi."
                            />
                             <FeatureItem 
                                title="Jadwal Ujian Fleksibel"
                                description="Atur waktu mulai dan selesai untuk setiap ujian, sistem akan secara otomatis mengontrol akses siswa ke ujian tersebut."
                            />
                        </div>
                    </div>
                    
                     <div>
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Teknologi yang Digunakan</h3>
                        <p className="text-gray-700">
                            Aplikasi ini dibangun menggunakan tumpukan teknologi modern untuk memastikan pengalaman pengguna yang responsif dan andal:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                            <li><strong>Frontend:</strong> React & TypeScript</li>
                            <li><strong>Styling:</strong> Tailwind CSS</li>
                            <li><strong>Database (Simulasi):</strong> LocalStorage API peramban, meniru interaksi dengan backend atau Google Sheets.</li>
                             <li><strong>Navigasi:</strong> React Router</li>
                        </ul>
                    </div>

                    <div className="text-center pt-4 border-t">
                        <p className="text-gray-600">Dikembangkan oleh:</p>
                        <p className="font-semibold text-lg text-gray-800 mt-1">Mahfud Sidik</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AboutPage;