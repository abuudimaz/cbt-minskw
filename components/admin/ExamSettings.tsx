import React, { useState, useEffect } from 'react';
import { ExamSettings as ExamSettingsType } from '../../types';
import { apiGetExamSettings, apiSaveExamSettings } from '../../services/api';
import Card from '../shared/Card';
import Input from '../shared/Input';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';

const ExamSettings: React.FC = () => {
    const [settings, setSettings] = useState<ExamSettingsType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await apiGetExamSettings();
                setSettings(data);
            } catch (err) {
                setError('Gagal memuat pengaturan.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!settings) return;
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
        });
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!settings) return;
        const { name, value } = e.target;
        setSettings({
            ...settings,
            [name]: value as 'single' | 'all',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        
        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            await apiSaveExamSettings(settings);
            setSuccess('Pengaturan berhasil disimpan!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Gagal menyimpan pengaturan.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !settings) {
        return <LoadingSpinner text="Memuat Pengaturan..." />;
    }

    return (
        <Card title="Pengaturan Ujian Global">
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
                    {success && <p className="text-green-700 text-sm text-center bg-green-100 p-3 rounded-md">{success}</p>}

                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Pengaturan Umum & Dokumen</h3>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <div className="sm:col-span-2">
                                <Input
                                    label="Judul Penilaian Global"
                                    name="assessmentTitle"
                                    type="text"
                                    value={settings.assessmentTitle}
                                    onChange={handleChange}
                                    placeholder="e.g. ASESMEN MADRASAH"
                                />
                                <p className="mt-1 text-sm text-gray-500">Judul ini akan muncul di kop surat Berita Acara dan Daftar Hadir.</p>
                            </div>
                            <div>
                                <Input
                                    label="Tahun Ajaran"
                                    name="academicYear"
                                    type="text"
                                    value={settings.academicYear}
                                    onChange={handleChange}
                                    placeholder="e.g. 2023/2024"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Durasi Ujian Default (menit)"
                                    name="defaultDuration"
                                    type="number"
                                    value={settings.defaultDuration}
                                    onChange={handleChange}
                                />
                            </div>
                             <div>
                                <Input
                                    label="Nama Proktor Default"
                                    name="proctorName"
                                    type="text"
                                    value={settings.proctorName}
                                    onChange={handleChange}
                                />
                            </div>
                             <div>
                                <Input
                                    label="Nama Kepala Sekolah"
                                    name="headmasterName"
                                    type="text"
                                    value={settings.headmasterName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Input
                                    label="NIP Kepala Sekolah"
                                    name="headmasterNip"
                                    type="text"
                                    value={settings.headmasterNip}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t pt-8">
                        <h3 className="text-lg font-medium text-gray-900">Tampilan Soal</h3>
                        <fieldset className="mt-4">
                            <legend className="text-base font-medium text-gray-900 sr-only">Format Tampilan Soal</legend>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input id="single" name="questionDisplay" type="radio" value="single" checked={settings.questionDisplay === 'single'} onChange={handleRadioChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"/>
                                    <label htmlFor="single" className="ml-3 block text-sm font-medium text-gray-700">Satu Soal per Halaman</label>
                                </div>
                                <div className="flex items-center">
                                    <input id="all" name="questionDisplay" type="radio" value="all" checked={settings.questionDisplay === 'all'} onChange={handleRadioChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"/>
                                    <label htmlFor="all" className="ml-3 block text-sm font-medium text-gray-700">Semua Soal dalam Satu Halaman (Scroll)</label>
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    <div className="border-t pt-8">
                         <h3 className="text-lg font-medium text-gray-900">Fungsionalitas Ujian</h3>
                         <div className="mt-4 space-y-4">
                            <div className="relative flex items-start">
                                <div className="flex items-center h-5">
                                    <input id="allowNavigateBack" name="allowNavigateBack" type="checkbox" checked={settings.allowNavigateBack} onChange={handleChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="allowNavigateBack" className="font-medium text-gray-700">Izinkan Navigasi Mundur</label>
                                    <p className="text-gray-500">Jika aktif, siswa dapat kembali ke soal sebelumnya.</p>
                                </div>
                            </div>
                             <div className="relative flex items-start">
                                <div className="flex items-center h-5">
                                    <input id="requireToken" name="requireToken" type="checkbox" checked={settings.requireToken} onChange={handleChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="requireToken" className="font-medium text-gray-700">Wajibkan Token Ujian</label>
                                    <p className="text-gray-500">Jika aktif, semua ujian yang memiliki token akan mewajibkan siswa memasukkannya.</p>
                                </div>
                            </div>
                         </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <Button type="submit" isLoading={isSaving} disabled={isSaving}>
                            Simpan Pengaturan
                        </Button>
                    </div>
                </form>
            </div>
        </Card>
    );
};

export default ExamSettings;