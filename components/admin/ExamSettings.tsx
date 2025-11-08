import React, { useState, useEffect } from 'react';
import { ExamSettings as ExamSettingsType } from '../../types';
import { apiGetExamSettings, apiUpdateExamSettings } from '../../services/api';
import Card from '../shared/Card';
import Input from '../shared/Input';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import { toastSuccess, toastError } from '../../utils/helpers';

const ExamSettings: React.FC = () => {
    const [settings, setSettings] = useState<ExamSettingsType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const data = await apiGetExamSettings();
                setSettings(data);
            } catch (error) {
                toastError("Gagal memuat pengaturan.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!settings) return;
        const { name, value } = e.target;
        setSettings({ ...settings, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        
        setIsSaving(true);
        try {
            await apiUpdateExamSettings(settings);
            toastSuccess("Pengaturan berhasil disimpan.");
        } catch (error) {
            toastError("Gagal menyimpan pengaturan.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner text="Memuat pengaturan..." />;
    }

    if (!settings) {
        return <p className="text-red-500">Gagal memuat data pengaturan.</p>;
    }

    return (
        <Card title="Pengaturan Umum Ujian">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                <Input
                    label="Judul Asesmen (untuk Kop Surat)"
                    name="assessmentTitle"
                    value={settings.assessmentTitle}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Tahun Pelajaran"
                    name="academicYear"
                    value={settings.academicYear}
                    onChange={handleChange}
                    placeholder="Contoh: 2023/2024"
                    required
                />
                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900">Data Penanggung Jawab</h3>
                    <div className="mt-4 space-y-4">
                        <Input
                            label="Nama Kepala Madrasah"
                            name="headmasterName"
                            value={settings.headmasterName}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="NIP Kepala Madrasah"
                            name="headmasterNip"
                            value={settings.headmasterNip}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Nama Proktor Utama"
                            name="proctorName"
                            value={settings.proctorName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                 <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900">Tampilan Ujian Siswa</h3>
                    <fieldset className="mt-4">
                        <legend className="sr-only">Tipe Tampilan Soal</legend>
                        <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                            <div className="flex items-center">
                                <input
                                    id="single"
                                    name="questionDisplay"
                                    type="radio"
                                    value="single"
                                    checked={settings.questionDisplay === 'single'}
                                    onChange={handleChange}
                                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="single" className="ml-3 block text-sm font-medium text-gray-700">
                                    Satu Soal per Halaman
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="all"
                                    name="questionDisplay"
                                    type="radio"
                                    value="all"
                                    checked={settings.questionDisplay === 'all'}
                                    onChange={handleChange}
                                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="all" className="ml-3 block text-sm font-medium text-gray-700">
                                    Semua Soal dalam Satu Halaman
                                </label>
                            </div>
                        </div>
                    </fieldset>
                </div>
                 <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={isSaving} disabled={isSaving}>
                        Simpan Pengaturan
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default ExamSettings;