
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
                const json: any[] = (window as any).XLSX.utils.sheet_to_json(worksheet);

                if (json.length === 0) {
                    setError('File tidak memiliki data atau formatnya salah.');
                    return;
                }

                const parsedQuestions = json.map((row, index) => {
                    const questionText = row.questionText || row.pertanyaan;
                    if (!questionText) throw new Error(`Baris ${index + 2}: Kolom 'questionText' tidak ditemukan.`);

                    // FIX: Ensure questionTypeStr is a string before calling toLowerCase
                    const questionTypeStr = String(row.questionType || QuestionType.SINGLE_CHOICE);
                    const questionType = Object.values(QuestionType).find(t => t.toLowerCase() === questionTypeStr.toLowerCase()) || QuestionType.SINGLE_CHOICE;

                    const questionImageUrl = row.questionImageUrl || undefined;

                    const options = [
                        { id: 'opt1', text: String(row.optionA || row.opsi_a || ''), optionImageUrl: row.optionAImageUrl },
                        { id: 'opt2', text: String(row.optionB || row.opsi_b || ''), optionImageUrl: row.optionBImageUrl },
                        { id: 'opt3', text: String(row.optionC || row.opsi_c || ''), optionImageUrl: row.optionCImageUrl },
                        { id: 'opt4', text: String(row.optionD || row.opsi_d || ''), optionImageUrl: row.optionDImageUrl },
                    ].filter(opt => opt.text);

                    const correctKey = String(row.correctAnswer || row.jawaban_benar || '').toUpperCase();
                    let correctAnswer: string | string[] | undefined;

                    if (questionType === QuestionType.MULTIPLE_CHOICE_COMPLEX) {
                        correctAnswer = correctKey.split(',').map(key => {
                            switch (key.trim()) {
                                case 'A': return 'opt1';
                                case 'B': return 'opt2';
                                case 'C': return 'opt3';
                                case 'D': return 'opt4';
                                default: return null;
                            }
                        }).filter(Boolean) as string[];
                    } else if (questionType === QuestionType.SINGLE_CHOICE) {
                        switch (correctKey) {
                            case 'A': correctAnswer = 'opt1'; break;
                            case 'B': correctAnswer = 'opt2'; break;
                            case 'C': correctAnswer = 'opt3'; break;
                            case 'D': correctAnswer = 'opt4'; break;
                        }
                    } else {
                        correctAnswer = correctKey;
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
                    <ul className="list-disc list-inside mt-1">
                        <li>Kolom wajib: <strong>questionText</strong>.</li>
                        <li>Kolom opsi: <strong>optionA</strong>, <strong>optionB</strong>, dst.</li>
                        <li>Kolom opsional: <strong>questionType</strong> (Default: 'Pilihan Ganda'), <strong>questionImageUrl</strong>, <strong>optionAImageUrl</strong>.</li>
                        <li>Kolom <strong>correctAnswer</strong>:
                            <ul className="list-['-_'] list-inside ml-4">
                                <li>Untuk Pilihan Ganda: isi A, B, C, atau D.</li>
                                <li>Untuk Pilihan Ganda Kompleks: isi jawaban dipisah koma, misal: A,C.</li>
                                <li>Untuk Isian Singkat: isi jawaban yang benar.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <input type="file" accept=".xlsx, .csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
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