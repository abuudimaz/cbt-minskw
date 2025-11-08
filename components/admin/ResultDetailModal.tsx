import React, { useState, useEffect } from 'react';
import { ExamResult, Submission, Question, QuestionType, Answer } from '../../types';
import { apiGetSubmission, apiGetQuestionsForExam, apiUpdateExamResult } from '../../services/api';
import { GoogleGenerativeAI } from "@google/genai";
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import Input from '../shared/Input';
import LoadingSpinner from '../shared/LoadingSpinner';

interface ResultDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: ExamResult;
    onScoreUpdate: () => void;
}

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("API_KEY is not set in environment variables.");
}
const ai = new GoogleGenerativeAI({ apiKey: API_KEY! });

type AIGrade = {
    score: number;
    feedback: string;
    isLoading: boolean;
};

const ResultDetailModal: React.FC<ResultDetailModalProps> = ({ isOpen, onClose, result, onScoreUpdate }) => {
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [aiGrades, setAIGrades] = useState<Map<string, AIGrade>>(new Map());
    const [finalScore, setFinalScore] = useState<number>(result.score);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const [submissionData, questionsData] = await Promise.all([
                        apiGetSubmission(result.nis, result.examId),
                        apiGetQuestionsForExam(result.examId)
                    ]);
                    if (!submissionData) {
                        throw new Error("Data jawaban siswa tidak ditemukan.");
                    }
                    setSubmission(submissionData);
                    setQuestions(questionsData);
                    setFinalScore(result.score); // Reset final score on open
                } catch (err: any) {
                    setError(err.message || 'Gagal memuat data detail.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen, result]);

    const handleGradeEssay = async (question: Question, answer: Answer) => {
        const questionId = question.id;
        setAIGrades(prev => new Map(prev).set(questionId, { score: 0, feedback: '', isLoading: true }));

        const prompt = `Anda adalah seorang guru yang memeriksa jawaban esai siswa. Berikan penilaian untuk jawaban siswa berdasarkan pertanyaan yang diberikan.
        
        Pertanyaan: "${question.questionText}"
        Jawaban Siswa: "${answer.value}"

        Beri nilai dari 0 hingga 100 dan berikan umpan balik singkat (maksimal 2 kalimat) sebagai justifikasi. Respons harus dalam format JSON.`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            score: { type: "NUMBER" },
                            feedback: { type: "STRING" },
                        }
                    }
                }
            });
            const grade = JSON.parse(response.text);
            setAIGrades(prev => new Map(prev).set(questionId, { ...grade, isLoading: false }));
        } catch (err) {
            console.error(err);
            setAIGrades(prev => new Map(prev).set(questionId, { score: 0, feedback: 'Gagal menilai.', isLoading: false }));
        }
    };
    
    const handleSaveFinalScore = async () => {
        setIsLoading(true);
        try {
            await apiUpdateExamResult(result.id, finalScore);
            onScoreUpdate();
        } catch(err) {
            alert('Gagal menyimpan nilai akhir.');
        } finally {
            setIsLoading(false);
        }
    };

    const findAnswer = (questionId: string): Answer | undefined => {
        return submission?.answers.find(a => a.questionId === questionId);
    };

    const renderAnswer = (question: Question) => {
        const answer = findAnswer(question.id);
        if (!answer) return <p className="text-gray-500 italic">Tidak dijawab</p>;

        const aiGrade = aiGrades.get(question.id);

        if (question.type === QuestionType.ESSAY) {
            return (
                <div>
                    <p className="p-2 bg-gray-50 border rounded-md">{answer.value}</p>
                    <div className="mt-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleGradeEssay(question, answer)}
                            isLoading={aiGrade?.isLoading}
                            disabled={aiGrade?.isLoading}
                        >
                            ✨ Nilai dengan AI
                        </Button>
                        {aiGrade && !aiGrade.isLoading && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-sm">
                                <p><strong>Saran Nilai AI:</strong> <span className="font-bold text-blue-700 text-lg">{aiGrade.score}</span></p>
                                <p className="mt-1"><strong>Umpan Balik:</strong> {aiGrade.feedback}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        
        // Render logic for other question types can be added here
        return <p className="text-gray-700">{JSON.stringify(answer.value)}</p>;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Detail Jawaban - ${result.name}`} size="xl">
            {isLoading && <LoadingSpinner />}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && submission && (
                <div className="space-y-6">
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {questions.map((q, index) => (
                            <div key={q.id} className="pb-4 border-b">
                                <p className="font-semibold text-gray-800">{index + 1}. {q.questionText}</p>
                                <div className="mt-2 pl-4">
                                    {renderAnswer(q)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-end gap-4 bg-gray-50 -m-6 p-6 rounded-b-lg">
                        <div className="flex items-center gap-2">
                            <label htmlFor="finalScore" className="font-semibold text-gray-700">Nilai Akhir:</label>
                            <Input
                                id="finalScore"
                                type="number"
                                value={finalScore}
                                onChange={(e) => setFinalScore(parseInt(e.target.value))}
                                className="w-24 font-bold text-lg"
                            />
                        </div>
                        <Button onClick={handleSaveFinalScore} isLoading={isLoading}>
                            Simpan Nilai Akhir
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ResultDetailModal;