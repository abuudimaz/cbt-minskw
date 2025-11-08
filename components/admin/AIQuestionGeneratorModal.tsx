import React, { useState } from 'react';
import { Exam, Question, QuestionType, QuestionOption } from '../../types';
import { apiImportQuestions } from '../../services/api';
import { GoogleGenerativeAI } from "@google/genai";
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import Input from '../shared/Input';

interface AIQuestionGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    exam: Exam;
    onQuestionsGenerated: () => void;
}

// Ensure API_KEY is available (it's set by the environment)
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("API_KEY is not set in environment variables.");
}
const ai = new GoogleGenerativeAI({ apiKey: API_KEY! });

const AIQuestionGeneratorModal: React.FC<AIQuestionGeneratorModalProps> = ({ isOpen, onClose, exam, onQuestionsGenerated }) => {
    const [topic, setTopic] = useState('');
    const [numQuestions, setNumQuestions] = useState(5);
    const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.SINGLE_CHOICE);
    const [generatedQuestions, setGeneratedQuestions] = useState<Omit<Question, 'id' | 'examId'>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!topic || numQuestions <= 0) {
            setError('Topik dan jumlah soal (harus > 0) wajib diisi.');
            return;
        }

        setIsLoading(true);
        setError('');
        setGeneratedQuestions([]);

        const basePrompt = `Buat ${numQuestions} soal ujian tentang "${topic}" untuk siswa Madrasah Ibtidaiyah (kelas 4-6).`;
        let specificPrompt = '';
        let schema: any;

        if (questionType === QuestionType.SINGLE_CHOICE) {
            specificPrompt = 'Setiap soal harus berupa Pilihan Ganda dengan 4 opsi jawaban (A, B, C, D) dan satu jawaban yang benar.';
            schema = {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        questionText: { type: "STRING" },
                        options: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    id: { type: "STRING" },
                                    text: { type: "STRING" },
                                }
                            }
                        },
                        correctAnswer: { type: "STRING" },
                    }
                }
            };
        } else if (questionType === QuestionType.ESSAY) {
            specificPrompt = 'Setiap soal harus berupa pertanyaan esai yang membutuhkan jawaban penjelasan singkat.';
            schema = {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        questionText: { type: "STRING" },
                    }
                }
            };
        }

        const fullPrompt = `${basePrompt} ${specificPrompt} Pastikan output hanya berupa JSON yang sesuai dengan skema yang diberikan. Opsi jawaban untuk pilihan ganda harus memiliki id 'opt1', 'opt2', 'opt3', 'opt4'. correctAnswer harus berisi id dari opsi yang benar.`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: fullPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                }
            });
            
            const jsonText = response.text;
            const parsedJson = JSON.parse(jsonText);

            const formattedQuestions = parsedJson.map((q: any) => ({
                ...q,
                type: questionType,
            }));
            setGeneratedQuestions(formattedQuestions);

        } catch (err) {
            console.error("AI Generation Error:", err);
            setError("Gagal membuat soal. Model AI mungkin memberikan respons yang tidak valid. Coba lagi dengan topik yang lebih spesifik.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddQuestions = async () => {
        if (generatedQuestions.length === 0) return;
        setIsLoading(true);
        try {
            await apiImportQuestions(exam.id, generatedQuestions);
            alert(`${generatedQuestions.length} soal berhasil ditambahkan.`);
            onQuestionsGenerated();
            handleClose();
        } catch (err: any) {
            setError(`Gagal menambahkan soal ke ujian: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    const handleClose = () => {
        setTopic('');
        setNumQuestions(5);
        setQuestionType(QuestionType.SINGLE_CHOICE);
        setGeneratedQuestions([]);
        setError('');
        setIsLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="✨ Generate Soal dengan AI" size="xl">
            <div className="space-y-4">
                <div className="p-4 border rounded-md bg-gray-50 space-y-3">
                     <Input
                        label="Topik Soal"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Contoh: Sejarah Kemerdekaan Indonesia, Pecahan Matematika"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Jumlah Soal"
                            type="number"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                        />
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Soal</label>
                            <select value={questionType} onChange={(e) => setQuestionType(e.target.value as QuestionType)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                                <option value={QuestionType.SINGLE_CHOICE}>Pilihan Ganda</option>
                                <option value={QuestionType.ESSAY}>Esai</option>
                            </select>
                        </div>
                    </div>
                     <Button onClick={handleGenerate} isLoading={isLoading} disabled={isLoading || !topic}>
                        Generate Soal
                    </Button>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                {generatedQuestions.length > 0 && (
                     <div className="space-y-3">
                        <h3 className="font-semibold">Hasil Generate (Tinjau Sebelum Ditambahkan):</h3>
                        <div className="border rounded-lg max-h-64 overflow-y-auto p-3 bg-white space-y-4">
                            {generatedQuestions.map((q, index) => (
                                <div key={index} className="text-sm border-b pb-2">
                                    <p><strong>{index + 1}.</strong> {q.questionText}</p>
                                    {q.type === QuestionType.SINGLE_CHOICE && (
                                        <ul className="list-disc list-inside pl-4 mt-1">
                                            {q.options?.map((opt: QuestionOption) => (
                                                <li key={opt.id} className={q.correctAnswer === opt.id ? 'font-bold text-green-700' : ''}>
                                                    {opt.text}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                     </div>
                )}


                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>Batal</Button>
                    <Button onClick={handleAddQuestions} disabled={generatedQuestions.length === 0 || isLoading}>
                        Tambahkan Soal ke Ujian
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AIQuestionGeneratorModal;