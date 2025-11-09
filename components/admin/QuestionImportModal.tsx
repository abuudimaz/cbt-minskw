import React, { useState } from 'react';
import { Exam, Question, QuestionType } from '../../types';
import Modal from '../shared/Modal';
import Button from '../shared/Button';

interface QuestionImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (examId: string, questions: Omit<Question, 'id' | 'examId'>[]) => void;
    exam: Exam;
}

const QuestionImportModal: React.FC<QuestionImportModalProps> = ({ isOpen, onClose, onImport, exam }) => {
    const [questions, setQuestions] = useState<Omit<Question, 'id' | 'examId'>[]>([]);
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setError('');
        setQuestions([]);
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = (window as any).XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                // Read data as an array of arrays, ignoring header text
                const rows: any[][] = (window as any).XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // The first row is the header, so we slice it off.
                const dataRows = rows.slice(1);

                if (dataRows.length === 0) {
                    setError('File tidak memiliki data atau formatnya salah.');
                    return;
                }

                const parsedQuestions = dataRows.map((row, index) => {
                    const questionText = row[0];
                    if (!questionText) {
                        throw new Error(`Baris ${index + 2}: Kolom A (Teks Pertanyaan) tidak boleh kosong.`);
                    }

                    const questionTypeStr = String(row[1] || QuestionType.SINGLE_CHOICE);
                    const questionType = Object.values(QuestionType).find(t => t.toLowerCase() === questionTypeStr.toLowerCase()) || QuestionType.SINGLE_CHOICE;
                    const questionImageUrl = row[2] || undefined;
                    
                    const optionA_Text = String(row[3] || '');
                    const optionA_Img = row[4] || undefined;
                    const optionB_Text = String(row[5] || '');
                    const optionB_Img = row[6] || undefined;
                    const optionC_Text = String(row[7] || '');
                    const optionC_Img = row[8] || undefined;
                    const optionD_Text = String(row[9] || '');
                    const optionD_Img = row[10] || undefined;

                    const correctKeyRaw = row[11];
                    const correctKeyTrimmed = String(correctKeyRaw || '').trim();

                    // --- VALIDATION ---
                    if ((questionType === QuestionType.SINGLE_CHOICE || questionType === QuestionType.MULTIPLE_CHOICE_COMPLEX || questionType === QuestionType.SHORT_ANSWER) && !correctKeyTrimmed) {
                        throw new Error(`Baris ${index + 2}: Kolom L (Kunci Jawaban) wajib diisi untuk tipe soal "${questionType}".`);
                    }

                    const options = [
                        { id: 'opt1', text: optionA_Text, optionImageUrl: optionA_Img },
                        { id: 'opt2', text: optionB_Text, optionImageUrl: optionB_Img },
                        { id: 'opt3', text: optionC_Text, optionImageUrl: optionC_Img },
                        { id: 'opt4', text: optionD_Text, optionImageUrl: optionD_Img },
                    ].filter(opt => opt.text);

                    let correctAnswer: string | string[] | undefined;

                    if (questionType === QuestionType.MULTIPLE_CHOICE_COMPLEX) {
                        correctAnswer = correctKeyTrimmed.toUpperCase().split(',').map(key => {
                            switch (key.trim()) {
                                case 'A': return 'opt1';
                                case 'B': return 'opt2';
                                case 'C': return 'opt3';
                                case 'D': return 'opt4';
                                default: return null;
                            }
                        }).filter(Boolean) as string[];
                         if (correctAnswer.length === 0) {
                            throw new Error(`Baris ${index + 2}: Kunci Jawaban "${correctKeyRaw}" tidak valid untuk PG Kompleks. Gunakan format 'A,C'.`);
                        }
                    } else if (questionType === QuestionType.SINGLE_CHOICE) {
                        switch (correctKeyTrimmed.toUpperCase()) {
                            case 'A': correctAnswer = 'opt1'; break;
                            case 'B': correctAnswer = 'opt2'; break;
                            case 'C': correctAnswer = 'opt3'; break;
                            case 'D': correctAnswer = 'opt4'; break;
                            default:
                                throw new Error(`Baris ${index + 2}: Kunci Jawaban "${correctKeyRaw}" tidak valid. Gunakan 'A', 'B', 'C', atau 'D'.`);
                        }
                    } else {
                        // For Short Answer, use the key directly.
                        correctAnswer = String(correctKeyRaw || '');
                    }
                    
                    return { questionText, questionImageUrl, type: questionType, options, correctAnswer };
                });
                setQuestions(parsedQuestions);
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
        if (questions.length > 0) {
            onImport(exam.id, questions);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Import Soal untuk ${exam.name}`} size="xl">
            <div className="space-y-4">
                <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md border">
                    <p className="font-semibold">Instruksi Impor:</p>
                    <p className="mt-1">Pastikan file Excel (.xlsx) Anda mengikuti urutan kolom yang benar. Baris pertama akan diabaikan (dianggap sebagai header).</p>
                    <ul className="list-none mt-2 space-y-1 font-mono text-xs">
                        <li><strong>Kolom A:</strong> Teks Pertanyaan (Wajib)</li>
                        <li><strong>Kolom B:</strong> Tipe Soal (Opsional, default: 'Pilihan Ganda')</li>
                        <li><strong>Kolom C:</strong> URL Gambar Pertanyaan (Opsional)</li>
                        <li><strong>Kolom D:</strong> Teks Opsi A</li>
                        <li><strong>Kolom E:</strong> URL Gambar Opsi A (Opsional)</li>
                        <li><strong>Kolom F:</strong> Teks Opsi B</li>
                        <li><strong>Kolom G:</strong> URL Gambar Opsi B (Opsional)</li>
                        <li><strong>Kolom H:</strong> Teks Opsi C</li>
                        <li><strong>Kolom I:</strong> URL Gambar Opsi C (Opsional)</li>
                        <li><strong>Kolom J:</strong> Teks Opsi D</li>
                        <li><strong>Kolom K:</strong> URL Gambar Opsi D (Opsional)</li>
                        <li><strong>Kolom L:</strong> Kunci Jawaban (Wajib untuk PG/PGK/Isian Singkat)</li>
    </ul>
                     <p className="mt-2 text-xs">
                        <strong>*Kunci Jawaban:</strong> Untuk PG, tulis 'A', 'B', 'C', atau 'D'. Untuk PG Kompleks, pisahkan dengan koma (misal: 'A,C'). Untuk Isian Singkat, tulis jawaban yang benar.
                    </p>
                </div>
                <input type="file" accept=".xlsx" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {isProcessing && <p>Memproses file...</p>}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {questions.length > 0 && (
                    <div>
                        <h4 className="font-semibold">{`Ditemukan ${questions.length} soal dari file "${fileName}"`}</h4>
                        <div className="mt-2 border rounded-lg max-h-60 overflow-y-auto p-2 bg-gray-50 text-sm">
                            <p className="font-bold">Preview (soal pertama):</p>
                            <p className="mt-1"><strong>Tipe:</strong> {questions[0].type}</p>
                            <p className="mt-1">{questions[0].questionText}</p>
                            <ul className="list-disc list-inside mt-1">
                                {questions[0].options?.map(opt => <li key={opt.id}>{opt.text}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                    <Button onClick={handleImport} disabled={questions.length === 0 || isProcessing}>
                        Import {questions.length > 0 ? questions.length : ''} Soal
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default QuestionImportModal;