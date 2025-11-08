import React, { useState } from 'react';
import { Student } from '../../types';
import Modal from '../shared/Modal';
import Button from '../shared/Button';

interface StudentImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (students: Student[]) => void;
}

const StudentImportModal: React.FC<StudentImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setError('');
        setStudents([]);
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = (window as any).XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = (window as any).XLSX.utils.sheet_to_json(worksheet);

                if (json.length === 0) {
                    setError('File tidak memiliki data atau formatnya salah.');
                    return;
                }

                const parsedStudents: Student[] = json.map((row, index) => {
                    const nis = String(row.nis);
                    const name = String(row.name || row.nama);
                    const studentClass = String(row.class || row.kelas);
                    const room = String(row.room || row.ruang);
                    const password = String(row.password);

                    if (!nis || !name || !studentClass || !room || !password) {
                        throw new Error(`Baris ${index + 2}: Data tidak lengkap. Pastikan kolom nis, name, class, room, dan password terisi.`);
                    }

                    return { nis, name, class: studentClass, room, password };
                });
                setStudents(parsedStudents);
            } catch (err: any) {
                setError(`Gagal memproses file: ${err.message}`);
            } finally {
                setIsProcessing(false);
            }
        };
        reader.onerror = () => { setError("Gagal membaca file."); setIsProcessing(false); }
        reader.readAsBinaryString(file);
    };

    const handleImport = () => {
        if (students.length > 0) {
            onImport(students);
        }
    };

    const handleClose = () => {
        // Reset state when closing the modal
        setStudents([]);
        setError('');
        setFileName('');
        // FIX: 'setProcessing' is not defined. It should be 'setIsProcessing'.
        setIsProcessing(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Import Data Siswa" size="xl">
            <div className="space-y-4">
                <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md border">
                    <p className="font-semibold">Instruksi Impor:</p>
                    <ul className="list-disc list-inside mt-1">
                        <li>Gunakan file Excel (.xlsx).</li>
                        <li>Pastikan baris pertama adalah header kolom.</li>
                        <li>Kolom wajib: <strong>nis</strong>, <strong>name</strong>, <strong>class</strong>, <strong>room</strong>, <strong>password</strong>.</li>
                        <li>Nama header kolom tidak case-sensitive (misal: 'nama' atau 'Name' bisa digunakan).</li>
                    </ul>
                </div>
                <input type="file" accept=".xlsx" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {isProcessing && <p>Memproses file...</p>}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {students.length > 0 && (
                    <div>
                        <h4 className="font-semibold">{`Ditemukan ${students.length} siswa dari file "${fileName}"`}</h4>
                        <div className="mt-2 border rounded-lg max-h-60 overflow-y-auto p-2 bg-gray-50 text-sm">
                            <p className="font-bold">Preview (data pertama):</p>
                            <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(students[0], null, 2)}</pre>
                        </div>
                    </div>
                )}
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>Batal</Button>
                    <Button onClick={handleImport} disabled={students.length === 0 || isProcessing}>
                        Import {students.length > 0 ? ` ${students.length}` : ''} Siswa
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default StudentImportModal;